# FinBoard API Specification

## Overview

FinBoard provides a RESTful API that is implemented identically across three different Python web frameworks:
- **FastAPI** (Port 8001) - Modern async framework with automatic documentation
- **Flask** (Port 8002) - Lightweight and flexible micro-framework  
- **Django** (Port 8003) - Full-featured framework with admin interface

All implementations provide the same API endpoints and response formats.

## Base URLs

- FastAPI: `http://localhost:8001/api/v1`
- Flask: `http://localhost:8002/api/v1`
- Django: `http://localhost:8003/api/v1`

## Authentication

FinBoard uses JWT (JSON Web Tokens) for authentication with access and refresh tokens.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "nickname": "string (optional)",
  "bio": "string (optional)",
  "avatar_url": "string (optional)"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "nickname": "Test User",
  "avatar_url": null,
  "bio": null,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "string"
}
```

## Posts Endpoints

### List Posts
```http
GET /posts?page=1&limit=20&category_id=1&search=bitcoin&sort_by=created_at&order=desc
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `category_id` (integer): Filter by category
- `search` (string): Search in title and content
- `sort_by` (string): Sort field (created_at, view_count, like_count)
- `order` (string): Sort order (asc, desc)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Bitcoin Analysis",
      "content": "Market analysis...",
      "category_id": 2,
      "user_id": 1,
      "view_count": 150,
      "like_count": 25,
      "is_published": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "author": {
        "id": 1,
        "username": "analyst",
        "nickname": "Crypto Analyst",
        "avatar_url": null
      },
      "category": {
        "id": 2,
        "name": "암호화폐",
        "color": "#FF9800"
      },
      "tags": ["#BTC", "#analysis"],
      "is_liked": false,
      "is_bookmarked": false,
      "comment_count": 5
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "pages": 5
}
```

### Get Post
```http
GET /posts/{id}
```

**Response:**
Same as individual post object in list, but with full content.

### Create Post
```http
POST /posts
```

**Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "category_id": 1,
  "tags": ["#tag1", "#tag2"]
}
```

### Update Post
```http
PUT /posts/{id}
```

**Request Body:**
```json
{
  "title": "string (optional)",
  "content": "string (optional)",
  "category_id": 1,
  "tags": ["#tag1", "#tag2"]
}
```

### Delete Post
```http
DELETE /posts/{id}
```

### Like/Unlike Post
```http
POST /posts/{id}/like
```

**Response:**
```json
{
  "message": "Post liked",
  "like_count": 26
}
```

### Bookmark/Unbookmark Post
```http
POST /posts/{id}/bookmark
```

**Response:**
```json
{
  "message": "Post bookmarked"
}
```

## Comments Endpoints

### Get Post Comments
```http
GET /comments/posts/{post_id}/comments
```

**Response:**
```json
[
  {
    "id": 1,
    "content": "Great analysis!",
    "post_id": 1,
    "user_id": 2,
    "parent_id": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "author": {
      "id": 2,
      "username": "reader",
      "nickname": "Reader",
      "avatar_url": null
    },
    "replies": [
      {
        "id": 2,
        "content": "Thanks!",
        "post_id": 1,
        "user_id": 1,
        "parent_id": 1,
        "created_at": "2024-01-01T01:00:00.000Z",
        "updated_at": "2024-01-01T01:00:00.000Z",
        "author": {
          "id": 1,
          "username": "analyst",
          "nickname": "Crypto Analyst",
          "avatar_url": null
        },
        "replies": []
      }
    ]
  }
]
```

### Create Comment
```http
POST /comments
```

**Request Body:**
```json
{
  "content": "string",
  "post_id": 1,
  "parent_id": 1  // optional for replies
}
```

### Update Comment
```http
PUT /comments/{id}
```

### Delete Comment
```http
DELETE /comments/{id}
```

## Categories Endpoints

### List Categories
```http
GET /categories
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "주식",
    "description": "국내외 주식 관련 토론",
    "color": "#4CAF50",
    "post_count": 45
  }
]
```

### Get All Tags
```http
GET /categories/tags
```

**Response:**
```json
["#AAPL", "#BTC", "#ETH", "#투자전략"]
```

### Get Trending Tags
```http
GET /categories/tags/trending?limit=10
```

**Response:**
```json
[
  {
    "name": "#BTC",
    "post_count": 15
  }
]
```

## Users Endpoints

### Get Current User
```http
GET /users/me
```

**Response:**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "nickname": "Test User",
  "bio": "Crypto enthusiast",
  "avatar_url": null,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "post_count": 10,
  "comment_count": 25,
  "like_count": 150
}
```

### Get User Profile
```http
GET /users/{username}
```

### Update Profile
```http
PUT /users/me
```

**Request Body:**
```json
{
  "nickname": "string",
  "bio": "string",
  "avatar_url": "string"
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": "Error message",
  "detail": "Detailed error description",
  "status_code": 400
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **Post creation**: 10 posts per hour
- **Comments**: 30 comments per hour
- **General API**: 1000 requests per hour

## Pagination

All list endpoints support pagination:

**Request:**
```http
GET /posts?page=1&limit=20
```

**Response:**
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "pages": 5
}
```

## Framework-Specific Features

### FastAPI
- Automatic OpenAPI documentation at `/docs`
- Interactive API explorer at `/redoc`
- Async/await support for better performance

### Flask
- Modular blueprint structure
- Flask-specific extensions
- Flexible middleware system

### Django
- Django Admin interface at `/admin`
- Django REST Framework browsable API
- Built-in permission system

All three implementations maintain API compatibility while showcasing each framework's unique features.