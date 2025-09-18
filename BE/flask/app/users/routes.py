from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from email_validator import validate_email, EmailNotValidError
from app.users import bp
from app.extensions import db
from app.models.user import User
from app.models.post import Post, Like, Bookmark

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user profile"""
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user_data = user.to_dict()
    
    # Add additional stats
    user_data['stats'] = {
        'posts_count': user.posts.filter_by(is_published=True).count(),
        'comments_count': user.comments.count(),
        'likes_count': user.likes.count(),
        'bookmarks_count': user.bookmarks.count()
    }
    
    return jsonify(user_data)

@bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    """Update current user profile"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
    
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Update email
    email = data.get('email')
    if email is not None:
        try:
            validate_email(email)
        except EmailNotValidError:
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Check if email is already taken by another user
        existing_user = User.query.filter(
            User.email == email, 
            User.id != user.id
        ).first()
        if existing_user:
            return jsonify({'error': 'Email already taken'}), 400
        
        user.email = email
    
    # Update nickname
    nickname = data.get('nickname')
    if nickname is not None:
        if len(nickname) > 50:
            return jsonify({'error': 'Nickname too long (max 50 characters)'}), 400
        user.nickname = nickname.strip() if nickname else user.username
    
    # Update bio
    bio = data.get('bio')
    if bio is not None:
        if len(bio) > 500:
            return jsonify({'error': 'Bio too long (max 500 characters)'}), 400
        user.bio = bio.strip() if bio else None
    
    # Update avatar URL
    avatar_url = data.get('avatar_url')
    if avatar_url is not None:
        if len(avatar_url) > 500:
            return jsonify({'error': 'Avatar URL too long (max 500 characters)'}), 400
        user.avatar_url = avatar_url.strip() if avatar_url else None
    
    db.session.commit()
    
    return jsonify(user.to_dict())

@bp.route('/me/password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change user password"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
    
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({'error': 'Current password and new password are required'}), 400
    
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Verify current password
    if not user.check_password(current_password):
        return jsonify({'error': 'Current password is incorrect'}), 400
    
    # Validate new password
    if len(new_password) < 8:
        return jsonify({'error': 'New password must be at least 8 characters long'}), 400
    
    user.set_password(new_password)
    db.session.commit()
    
    return jsonify({'message': 'Password updated successfully'})

@bp.route('/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    """Get public user profile"""
    user = User.query.get(user_id)
    
    if not user or not user.is_active:
        return jsonify({'error': 'User not found'}), 404
    
    # Return public profile data only
    user_data = {
        'id': user.id,
        'username': user.username,
        'nickname': user.nickname,
        'avatar_url': user.avatar_url,
        'bio': user.bio,
        'created_at': user.created_at.isoformat() if user.created_at else None
    }
    
    # Add public stats
    user_data['stats'] = {
        'posts_count': user.posts.filter_by(is_published=True).count(),
        'comments_count': user.comments.count()
    }
    
    return jsonify(user_data)

@bp.route('/<int:user_id>/posts', methods=['GET'])
def get_user_posts(user_id):
    """Get user's published posts"""
    user = User.query.get(user_id)
    
    if not user or not user.is_active:
        return jsonify({'error': 'User not found'}), 404
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Limit per_page to prevent abuse
    per_page = min(per_page, 100)
    
    posts = user.posts.filter_by(is_published=True).order_by(
        Post.created_at.desc()
    ).paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    return jsonify({
        'user': {
            'id': user.id,
            'username': user.username,
            'nickname': user.nickname,
            'avatar_url': user.avatar_url
        },
        'posts': [post.to_dict() for post in posts.items],
        'pagination': {
            'page': posts.page,
            'pages': posts.pages,
            'per_page': posts.per_page,
            'total': posts.total,
            'has_next': posts.has_next,
            'has_prev': posts.has_prev
        }
    })

@bp.route('/me/posts', methods=['GET'])
@jwt_required()
def get_my_posts():
    """Get current user's posts (including unpublished)"""
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')  # 'published', 'draft', or 'all'
    
    # Limit per_page to prevent abuse
    per_page = min(per_page, 100)
    
    query = user.posts
    
    if status == 'published':
        query = query.filter_by(is_published=True)
    elif status == 'draft':
        query = query.filter_by(is_published=False)
    # 'all' or no status filter shows everything
    
    posts = query.order_by(Post.created_at.desc()).paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    return jsonify({
        'posts': [post.to_dict() for post in posts.items],
        'pagination': {
            'page': posts.page,
            'pages': posts.pages,
            'per_page': posts.per_page,
            'total': posts.total,
            'has_next': posts.has_next,
            'has_prev': posts.has_prev
        }
    })

@bp.route('/me/bookmarks', methods=['GET'])
@jwt_required()
def get_my_bookmarks():
    """Get current user's bookmarked posts"""
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Limit per_page to prevent abuse
    per_page = min(per_page, 100)
    
    # Get bookmarked posts
    bookmarks = user.bookmarks.join(Post).filter(
        Post.is_published == True
    ).order_by(Bookmark.created_at.desc()).paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    return jsonify({
        'bookmarks': [
            {
                'bookmarked_at': bookmark.created_at.isoformat(),
                'post': bookmark.post.to_dict(current_user=user)
            }
            for bookmark in bookmarks.items
        ],
        'pagination': {
            'page': bookmarks.page,
            'pages': bookmarks.pages,
            'per_page': bookmarks.per_page,
            'total': bookmarks.total,
            'has_next': bookmarks.has_next,
            'has_prev': bookmarks.has_prev
        }
    })

@bp.route('/me/likes', methods=['GET'])
@jwt_required()
def get_my_likes():
    """Get current user's liked posts"""
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Limit per_page to prevent abuse
    per_page = min(per_page, 100)
    
    # Get liked posts
    likes = user.likes.join(Post).filter(
        Post.is_published == True
    ).order_by(Like.created_at.desc()).paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    return jsonify({
        'likes': [
            {
                'liked_at': like.created_at.isoformat(),
                'post': like.post.to_dict(current_user=user)
            }
            for like in likes.items
        ],
        'pagination': {
            'page': likes.page,
            'pages': likes.pages,
            'per_page': likes.per_page,
            'total': likes.total,
            'has_next': likes.has_next,
            'has_prev': likes.has_prev
        }
    })