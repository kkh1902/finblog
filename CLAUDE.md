# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinBoard Comparison - A financial discussion board implemented with three different Python web frameworks (FastAPI, Flask, Django) sharing the same Next.js frontend and PostgreSQL database. This project is designed to compare performance, development experience, and architectural patterns across frameworks.

## Project Structure

```
finblog/
├── BE/              # Backend implementations
│   ├── fastapi/     # FastAPI implementation (async, type hints, auto docs)
│   ├── flask/       # Flask implementation (blueprints, extensions)
│   └── django/      # Django implementation (DRF, admin panel)
├── FE/              # Frontend - Next.js 14 with TypeScript, Tailwind CSS
├── database/        # PostgreSQL schemas and seed data
└── deployment/      # Docker, Nginx configurations
```

## Common Development Commands

### Database Setup
```bash
# Create database
createdb finboard

# Apply schema
psql -d finboard -f database/schema.sql

# Load seed data
psql -d finboard -f database/seed.sql
```

### FastAPI Backend
```bash
cd BE/fastapi
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001

# Run tests
pytest

# Database migrations
alembic upgrade head
alembic revision --autogenerate -m "description"
```

### Flask Backend
```bash
cd BE/flask
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask run --port 8002

# Run tests
pytest

# Database migrations
flask db migrate -m "description"
flask db upgrade
```

### Django Backend
```bash
cd BE/django
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver 8003

# Run tests
python manage.py test

# Database migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Frontend (Next.js)
```bash
cd FE
npm install
npm run dev        # Development server
npm run build      # Production build
npm run test       # Run tests
npm run lint       # Lint code
```

### Docker Compose (All services)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service_name]

# Stop all services
docker-compose down

# Rebuild specific service
docker-compose build [service_name]
```

## Architecture Overview

### Database Schema
- **users**: User accounts with authentication
- **posts**: Main content with markdown support
- **comments**: Nested comment system
- **categories**: Post categorization (주식, 암호화폐, etc.)
- **tags**: Flexible tagging system
- **likes/bookmarks**: User interactions

### API Endpoints (Common across all backends)
```
POST   /api/v1/auth/register      # User registration
POST   /api/v1/auth/login         # User login
POST   /api/v1/auth/refresh       # Refresh JWT token

GET    /api/v1/posts              # List posts (paginated, filtered)
GET    /api/v1/posts/{id}         # Get post details
POST   /api/v1/posts              # Create post (auth required)
PUT    /api/v1/posts/{id}         # Update post (owner only)
DELETE /api/v1/posts/{id}         # Delete post (owner only)

POST   /api/v1/posts/{id}/like    # Toggle like
POST   /api/v1/posts/{id}/bookmark # Toggle bookmark

GET    /api/v1/comments/posts/{id}/comments # Get comments
POST   /api/v1/comments           # Create comment
PUT    /api/v1/comments/{id}      # Update comment
DELETE /api/v1/comments/{id}      # Delete comment

GET    /api/v1/categories         # List categories
GET    /api/v1/categories/tags    # List all tags
```

### Framework-Specific Features

**FastAPI:**
- Async/await throughout
- Pydantic models for validation
- Auto-generated OpenAPI docs at /docs
- SQLAlchemy 2.0 with async support
- Type hints for better IDE support

**Flask:**
- Blueprint-based modular structure
- Flask extensions ecosystem
- Application factory pattern
- Flexible middleware system

**Django:**
- Django REST Framework for APIs
- Built-in admin panel
- Django ORM with migrations
- Robust permission system
- Apps-based architecture

## Testing Strategy

### Unit Tests
- Test individual functions and methods
- Mock external dependencies
- Focus on business logic

### Integration Tests
- Test API endpoints
- Database interactions
- Authentication flow

### Performance Tests
- Response time benchmarks
- Concurrent user handling
- Memory usage profiling

## Environment Variables

Required `.env` file in each backend:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/finboard
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
```

## Code Style Guidelines

- Python: Black formatter, isort, flake8
- TypeScript: ESLint + Prettier
- SQL: Uppercase keywords, snake_case names
- Git: Conventional commits (feat:, fix:, docs:, etc.)

## Performance Optimization Tips

1. **Database**: Use indexes on frequently queried columns
2. **Caching**: Redis for session storage and frequent queries
3. **Pagination**: Limit/offset for large datasets
4. **Async**: Use async operations in FastAPI
5. **Frontend**: SWR for client-side caching

## Troubleshooting

### Database Connection Issues
- Check PostgreSQL service is running
- Verify DATABASE_URL format
- Ensure database exists and migrations are applied

### CORS Errors
- Check BACKEND_CORS_ORIGINS in backend configs
- Ensure frontend URL is whitelisted

### Authentication Issues
- Verify JWT_SECRET_KEY matches across services
- Check token expiration settings
- Ensure Redis is running for session storage

## Security Considerations

- Passwords hashed with bcrypt
- JWT tokens for stateless authentication
- CORS properly configured
- SQL injection prevention via ORMs
- XSS prevention in frontend
- Rate limiting on API endpoints