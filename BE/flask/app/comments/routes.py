from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.comments import bp
from app.extensions import db
from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User

@bp.route('', methods=['GET'])
def get_comments():
    """Get comments with optional filtering by post_id"""
    post_id = request.args.get('post_id', type=int)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Limit per_page to prevent abuse
    per_page = min(per_page, 100)
    
    query = Comment.query
    
    if post_id:
        query = query.filter_by(post_id=post_id)
    
    # Only show top-level comments initially (no parent_id)
    query = query.filter_by(parent_id=None)
    
    # Order by created_at descending
    query = query.order_by(Comment.created_at.desc())
    
    comments = query.paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    return jsonify({
        'comments': [comment.to_dict(include_replies=True) for comment in comments.items],
        'pagination': {
            'page': comments.page,
            'pages': comments.pages,
            'per_page': comments.per_page,
            'total': comments.total,
            'has_next': comments.has_next,
            'has_prev': comments.has_prev
        }
    })

@bp.route('', methods=['POST'])
@jwt_required()
def create_comment():
    """Create a new comment"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
    
    # Validate required fields
    content = data.get('content')
    post_id = data.get('post_id')
    
    if not content:
        return jsonify({'error': 'Content is required'}), 400
    
    if not post_id:
        return jsonify({'error': 'Post ID is required'}), 400
    
    # Validate content length
    if len(content.strip()) == 0:
        return jsonify({'error': 'Content cannot be empty'}), 400
    
    if len(content) > 2000:
        return jsonify({'error': 'Content too long (max 2000 characters)'}), 400
    
    # Get current user
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Verify post exists
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    # Verify parent comment exists if provided
    parent_id = data.get('parent_id')
    if parent_id:
        parent_comment = Comment.query.get(parent_id)
        if not parent_comment:
            return jsonify({'error': 'Parent comment not found'}), 404
        if parent_comment.post_id != post_id:
            return jsonify({'error': 'Parent comment must be from the same post'}), 400
    
    # Create comment
    comment = Comment(
        content=content.strip(),
        post_id=post_id,
        user_id=user.id,
        parent_id=parent_id
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify(comment.to_dict()), 201

@bp.route('/<int:comment_id>', methods=['GET'])
def get_comment(comment_id):
    """Get a specific comment"""
    comment = Comment.query.get(comment_id)
    
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404
    
    return jsonify(comment.to_dict(include_replies=True))

@bp.route('/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    """Update a comment"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
    
    # Get current user
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get comment
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404
    
    # Check if user owns the comment
    if comment.user_id != user.id:
        return jsonify({'error': 'You can only edit your own comments'}), 403
    
    # Validate content
    content = data.get('content')
    if content is not None:
        if len(content.strip()) == 0:
            return jsonify({'error': 'Content cannot be empty'}), 400
        
        if len(content) > 2000:
            return jsonify({'error': 'Content too long (max 2000 characters)'}), 400
        
        comment.content = content.strip()
    
    db.session.commit()
    
    return jsonify(comment.to_dict())

@bp.route('/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    """Delete a comment"""
    # Get current user
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get comment
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404
    
    # Check if user owns the comment
    if comment.user_id != user.id:
        return jsonify({'error': 'You can only delete your own comments'}), 403
    
    db.session.delete(comment)
    db.session.commit()
    
    return jsonify({'message': 'Comment deleted successfully'})

@bp.route('/post/<int:post_id>', methods=['GET'])
def get_post_comments(post_id):
    """Get all comments for a specific post"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Limit per_page to prevent abuse
    per_page = min(per_page, 100)
    
    # Verify post exists
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    # Get top-level comments (no parent)
    comments = Comment.query.filter_by(
        post_id=post_id, 
        parent_id=None
    ).order_by(Comment.created_at.desc()).paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    return jsonify({
        'comments': [comment.to_dict(include_replies=True) for comment in comments.items],
        'pagination': {
            'page': comments.page,
            'pages': comments.pages,
            'per_page': comments.per_page,
            'total': comments.total,
            'has_next': comments.has_next,
            'has_prev': comments.has_prev
        }
    })