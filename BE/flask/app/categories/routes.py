from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.categories import bp
from app.extensions import db
from app.models.post import Category
from app.models.user import User

@bp.route('', methods=['GET'])
def get_categories():
    """Get all categories"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    # Limit per_page to prevent abuse
    per_page = min(per_page, 100)
    
    categories = Category.query.order_by(Category.name).paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    return jsonify({
        'categories': [category.to_dict() for category in categories.items],
        'pagination': {
            'page': categories.page,
            'pages': categories.pages,
            'per_page': categories.per_page,
            'total': categories.total,
            'has_next': categories.has_next,
            'has_prev': categories.has_prev
        }
    })

@bp.route('', methods=['POST'])
@jwt_required()
def create_category():
    """Create a new category"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
    
    # Validate required fields
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Name is required'}), 400
    
    # Validate name length and format
    name = name.strip()
    if len(name) == 0:
        return jsonify({'error': 'Name cannot be empty'}), 400
    
    if len(name) > 50:
        return jsonify({'error': 'Name too long (max 50 characters)'}), 400
    
    # Check if category already exists
    existing_category = Category.query.filter_by(name=name).first()
    if existing_category:
        return jsonify({'error': 'Category with this name already exists'}), 400
    
    # Validate color if provided
    color = data.get('color')
    if color:
        import re
        if not re.match(r'^#[0-9A-Fa-f]{6}$', color):
            return jsonify({'error': 'Color must be a valid hex color (e.g., #FF0000)'}), 400
    
    # Validate description length
    description = data.get('description', '')
    if len(description) > 500:
        return jsonify({'error': 'Description too long (max 500 characters)'}), 400
    
    # Create category
    category = Category(
        name=name,
        description=description.strip() if description else None,
        color=color
    )
    
    db.session.add(category)
    db.session.commit()
    
    return jsonify(category.to_dict()), 201

@bp.route('/<int:category_id>', methods=['GET'])
def get_category(category_id):
    """Get a specific category"""
    category = Category.query.get(category_id)
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    # Include post count
    category_data = category.to_dict()
    category_data['post_count'] = category.posts.count()
    
    return jsonify(category_data)

@bp.route('/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    """Update a category"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
    
    # Get current user (you might want to add admin role checking here)
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get category
    category = Category.query.get(category_id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    # Update fields
    name = data.get('name')
    if name is not None:
        name = name.strip()
        if len(name) == 0:
            return jsonify({'error': 'Name cannot be empty'}), 400
        
        if len(name) > 50:
            return jsonify({'error': 'Name too long (max 50 characters)'}), 400
        
        # Check if another category has this name
        existing_category = Category.query.filter(
            Category.name == name, 
            Category.id != category_id
        ).first()
        if existing_category:
            return jsonify({'error': 'Category with this name already exists'}), 400
        
        category.name = name
    
    description = data.get('description')
    if description is not None:
        if len(description) > 500:
            return jsonify({'error': 'Description too long (max 500 characters)'}), 400
        category.description = description.strip() if description else None
    
    color = data.get('color')
    if color is not None:
        if color:  # If not empty string
            import re
            if not re.match(r'^#[0-9A-Fa-f]{6}$', color):
                return jsonify({'error': 'Color must be a valid hex color (e.g., #FF0000)'}), 400
        category.color = color if color else None
    
    db.session.commit()
    
    return jsonify(category.to_dict())

@bp.route('/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    """Delete a category"""
    # Get current user (you might want to add admin role checking here)
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get category
    category = Category.query.get(category_id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    # Check if category has posts
    post_count = category.posts.count()
    if post_count > 0:
        return jsonify({
            'error': f'Cannot delete category with {post_count} posts. Move or delete posts first.'
        }), 400
    
    db.session.delete(category)
    db.session.commit()
    
    return jsonify({'message': 'Category deleted successfully'})

@bp.route('/<int:category_id>/posts', methods=['GET'])
def get_category_posts(category_id):
    """Get all posts in a specific category"""
    category = Category.query.get(category_id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Limit per_page to prevent abuse
    per_page = min(per_page, 100)
    
    posts = category.posts.filter_by(is_published=True).order_by(
        category.posts.property.mapper.class_.created_at.desc()
    ).paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    return jsonify({
        'category': category.to_dict(),
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