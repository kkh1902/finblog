# FinBoard Django Backend

This is the Django REST Framework implementation of the FinBoard API.

## Features

- User authentication with JWT tokens
- Post creation, editing, and management
- Commenting system with nested replies
- Category and tag management
- Like and bookmark functionality
- User profiles and statistics
- Comprehensive API documentation with Swagger/OpenAPI
- Django admin interface
- Pagination and filtering
- Search functionality

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database setup:**
   ```bash
   # Make sure PostgreSQL is running
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```

5. **Run the server:**
   ```bash
   python manage.py runserver
   ```

## API Endpoints

The Django implementation provides the same API endpoints as the FastAPI and Flask versions:

### Authentication
- `POST /api/v1/auth/register/` - Register a new user
- `POST /api/v1/auth/login/` - Login and get JWT tokens
- `POST /api/v1/auth/refresh/` - Refresh JWT token
- `GET /api/v1/auth/me/` - Get current user profile

### Users
- `GET /api/v1/users/me/` - Get current user profile with stats
- `PUT /api/v1/users/update_me/` - Update current user profile
- `PUT /api/v1/users/change_password/` - Change password
- `GET /api/v1/users/{id}/` - Get public user profile
- `GET /api/v1/users/{id}/posts/` - Get user's published posts
- `GET /api/v1/users/my_posts/` - Get current user's posts (including drafts)
- `GET /api/v1/users/my_bookmarks/` - Get current user's bookmarked posts
- `GET /api/v1/users/my_likes/` - Get current user's liked posts

### Posts
- `GET /api/v1/posts/` - List published posts (with pagination and filtering)
- `POST /api/v1/posts/` - Create a new post
- `GET /api/v1/posts/{id}/` - Get specific post (increments view count)
- `PUT /api/v1/posts/{id}/` - Update post (author only)
- `DELETE /api/v1/posts/{id}/` - Delete post (author only)
- `POST /api/v1/posts/{id}/like/` - Like a post
- `DELETE /api/v1/posts/{id}/like/` - Unlike a post
- `POST /api/v1/posts/{id}/bookmark/` - Bookmark a post
- `DELETE /api/v1/posts/{id}/bookmark/` - Remove bookmark

### Comments
- `GET /api/v1/comments/` - List comments (with filtering)
- `POST /api/v1/comments/` - Create a new comment
- `GET /api/v1/comments/{id}/` - Get specific comment
- `PUT /api/v1/comments/{id}/` - Update comment (author only)
- `DELETE /api/v1/comments/{id}/` - Delete comment (author only)
- `GET /api/v1/comments/post/{post_id}/` - Get comments for a specific post

### Categories
- `GET /api/v1/categories/` - List all categories
- `POST /api/v1/categories/` - Create a new category (authenticated users)
- `GET /api/v1/categories/{id}/` - Get specific category with post count
- `PUT /api/v1/categories/{id}/` - Update category (authenticated users)
- `DELETE /api/v1/categories/{id}/` - Delete category (if no posts)
- `GET /api/v1/categories/{id}/posts/` - Get posts in a specific category

### Tags
- `GET /api/v1/posts/tags/` - List all tags
- `GET /api/v1/posts/tags/{id}/` - Get specific tag
- `GET /api/v1/posts/tags/{id}/posts/` - Get posts with a specific tag

## Query Parameters

### Posts List
- `page` - Page number
- `per_page` - Items per page (max 100)
- `category` - Filter by category ID
- `author` - Filter by author ID
- `tags` - Filter by tag names (comma-separated)
- `search` - Search in title and content
- `ordering` - Order by fields (created_at, updated_at, view_count, like_count)
- `created_after` - Filter posts created after date
- `created_before` - Filter posts created before date

## API Documentation

- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`

## Admin Interface

Access the Django admin at `http://localhost:8000/admin/` with your superuser credentials.

## Database Schema

The Django implementation uses the same PostgreSQL schema as defined in `/database/schema.sql`. The Django models automatically create the appropriate database tables.

## Key Features

### Django REST Framework
- ViewSets with proper CRUD operations
- Serializers for data validation and transformation
- Permission classes for access control
- Pagination and filtering
- Automatic API documentation

### Authentication
- JWT token authentication with access and refresh tokens
- User registration and login
- Password validation and change functionality

### Advanced Features
- Nested comment replies
- Post like and bookmark system
- Category and tag management
- User statistics and profiles
- Search and filtering
- View count tracking

### Performance
- Database query optimization with select_related and prefetch_related
- Proper indexing on database models
- Redis caching support
- Pagination for large datasets

## Development

### Management Commands
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files (production)
python manage.py collectstatic

# Run development server
python manage.py runserver
```

### Testing
```bash
# Run tests
python manage.py test

# Run specific app tests
python manage.py test apps.posts
```

## Deployment

For production deployment:

1. Set `DEBUG=False` in your environment
2. Configure proper `ALLOWED_HOSTS`
3. Set up SSL with `SECURE_SSL_REDIRECT=True`
4. Use a production database
5. Configure static file serving with WhiteNoise
6. Set up Celery for background tasks
7. Configure proper logging