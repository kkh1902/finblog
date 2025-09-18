from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.extensions import db, migrate, jwt, ma


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)
    CORS(app)
    
    # Register blueprints
    from app.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    
    from app.posts import bp as posts_bp
    app.register_blueprint(posts_bp, url_prefix='/api/v1/posts')
    
    from app.comments import bp as comments_bp
    app.register_blueprint(comments_bp, url_prefix='/api/v1/comments')
    
    from app.categories import bp as categories_bp
    app.register_blueprint(categories_bp, url_prefix='/api/v1/categories')
    
    from app.users import bp as users_bp
    app.register_blueprint(users_bp, url_prefix='/api/v1/users')
    
    @app.route('/')
    def index():
        return {
            'message': 'FinBoard API - Flask Implementation',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/v1/auth',
                'posts': '/api/v1/posts',
                'users': '/api/v1/users'
            }
        }
    
    @app.route('/health')
    def health():
        return {'status': 'healthy'}
    
    return app