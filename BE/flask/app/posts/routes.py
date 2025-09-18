from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import or_, desc, asc
from app.posts import bp
from app.extensions import db
from app.models.user import User
from app.models.post import Post, Category, Tag, Like, Bookmark

def get_current_user():
    username = get_jwt_identity()
    if username:
        return User.query.filter_by(username=username).first()
    return None

@bp.route('/', methods=['GET'])
def get_posts():
    page = request.args.get('page', 1, type=int)
    limit = min(request.args.get('limit', 20, type=int), 100)
    category_id = request.args.get('category_id', type=int)
    search = request.args.get('search')
    sort_by = request.args.get('sort_by', 'created_at')
    order = request.args.get('order', 'desc')
    
    # Build query
    query = Post.query.filter_by(is_published=True)
    
    # Apply filters
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if search:
        search_filter = or_(
            Post.title.ilike(f'%{search}%'),
            Post.content.ilike(f'%{search}%')
        )
        query = query.filter(search_filter)
    
    # Apply sorting
    if hasattr(Post, sort_by):
        order_column = getattr(Post, sort_by)
        if order == 'desc':
            query = query.order_by(desc(order_column))
        else:
            query = query.order_by(asc(order_column))
    
    # Paginate
    posts_pagination = query.paginate(
        page=page,
        per_page=limit,
        error_out=False
    )
    
    # Get current user for like/bookmark status
    current_user = None
    try:
        current_user = get_current_user()
    except:
        pass
    
    posts_data = []
    for post in posts_pagination.items:
        posts_data.append(post.to_dict(current_user=current_user))
    
    return jsonify({
        'items': posts_data,
        'total': posts_pagination.total,
        'page': page,
        'limit': limit,
        'pages': posts_pagination.pages
    })

@bp.route('/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = Post.query.get_or_404(post_id)
    
    # Increment view count
    post.view_count += 1
    db.session.commit()
    
    # Get current user for like/bookmark status
    current_user = None
    try:
        current_user = get_current_user()
    except:
        pass
    
    return jsonify(post.to_dict(current_user=current_user))

@bp.route('/', methods=['POST'])
@jwt_required()
def create_post():
    current_user = get_current_user()
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
    
    # Validate required fields
    if not data.get('title') or not data.get('content'):
        return jsonify({'error': 'Title and content are required'}), 400
    
    # Create post
    post = Post(
        title=data['title'],
        content=data['content'],
        category_id=data.get('category_id'),
        user_id=current_user.id
    )
    
    # Handle tags
    tags = data.get('tags', [])
    for tag_name in tags:
        tag = Tag.query.filter_by(name=tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.session.add(tag)
        post.tags.append(tag)
    
    db.session.add(post)
    db.session.commit()
    
    return jsonify(post.to_dict(current_user=current_user)), 201

@bp.route('/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    post = Post.query.get_or_404(post_id)
    
    if post.user_id != current_user.id:
        return jsonify({'error': 'Not authorized to edit this post'}), 403
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
    
    # Update fields
    if 'title' in data:
        post.title = data['title']
    if 'content' in data:
        post.content = data['content']
    if 'category_id' in data:
        post.category_id = data['category_id']
    
    # Update tags if provided
    if 'tags' in data:
        post.tags = []
        for tag_name in data['tags']:
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)
            post.tags.append(tag)
    
    db.session.commit()
    
    return jsonify(post.to_dict(current_user=current_user))

@bp.route('/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    post = Post.query.get_or_404(post_id)
    
    if post.user_id != current_user.id:
        return jsonify({'error': 'Not authorized to delete this post'}), 403
    
    db.session.delete(post)
    db.session.commit()
    
    return jsonify({'message': 'Post deleted successfully'})

@bp.route('/<int:post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    post = Post.query.get_or_404(post_id)
    
    # Check if already liked
    existing_like = Like.query.filter_by(user_id=current_user.id, post_id=post_id).first()
    
    if existing_like:
        # Unlike
        db.session.delete(existing_like)
        post.like_count = max(0, post.like_count - 1)
        message = 'Post unliked'
    else:
        # Like
        new_like = Like(user_id=current_user.id, post_id=post_id)
        db.session.add(new_like)
        post.like_count += 1
        message = 'Post liked'
    
    db.session.commit()
    
    return jsonify({'message': message, 'like_count': post.like_count})

@bp.route('/<int:post_id>/bookmark', methods=['POST'])
@jwt_required()
def bookmark_post(post_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    post = Post.query.get_or_404(post_id)
    
    # Check if already bookmarked
    existing_bookmark = Bookmark.query.filter_by(user_id=current_user.id, post_id=post_id).first()
    
    if existing_bookmark:
        # Remove bookmark
        db.session.delete(existing_bookmark)
        message = 'Bookmark removed'
    else:
        # Add bookmark
        new_bookmark = Bookmark(user_id=current_user.id, post_id=post_id)
        db.session.add(new_bookmark)
        message = 'Post bookmarked'
    
    db.session.commit()
    
    return jsonify({'message': message})