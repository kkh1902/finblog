# FinBoard Frontend

A modern, responsive frontend for the FinBoard financial blog platform built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Authentication**: JWT-based authentication with automatic token refresh
- **Post Management**: Create, edit, delete, and view blog posts with Markdown support
- **Interactive Features**: Like, bookmark, and comment on posts
- **Multi-Backend Support**: Works with FastAPI, Flask, or Django backends
- **Real-time Updates**: SWR for optimistic updates and real-time data fetching
- **Responsive Design**: Mobile-first approach with excellent mobile experience
- **SEO Optimized**: Built-in SEO with Next.js App Router
- **TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: SWR + React Context
- **Form Handling**: React Hook Form with Zod validation
- **Markdown**: React Markdown with syntax highlighting
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Animation**: Framer Motion

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── posts/             # Post-related pages
│   ├── profile/           # User profile pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── common/           # Common/layout components
│   ├── posts/            # Post-related components
│   └── ui/               # Reusable UI components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
│   ├── api.ts           # API client
│   ├── auth.ts          # Authentication utilities
│   ├── types.ts         # TypeScript type definitions
│   └── utils.ts         # Utility functions
└── types/                # Additional type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FE
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Configure Environment Variables**
   
   Edit `.env.local` to match your backend configuration:
   
   ```env
   # Backend Configuration
   NEXT_PUBLIC_API_URL=http://localhost:8001  # FastAPI: 8001, Flask: 8002, Django: 8003
   NEXT_PUBLIC_BACKEND_TYPE=fastapi           # fastapi, flask, or django
   NEXT_PUBLIC_JWT_SECRET=your-jwt-secret-key
   NEXT_PUBLIC_APP_NAME=FinBoard
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Feature Flags
   NEXT_PUBLIC_ENABLE_COMMENTS=true
   NEXT_PUBLIC_ENABLE_BOOKMARKS=true
   NEXT_PUBLIC_ENABLE_LIKES=true
   NEXT_PUBLIC_ENABLE_TAGS=true
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Backend Configuration

The frontend is designed to work with any of the three backend implementations:

### FastAPI Backend (Port 8001)
```env
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_BACKEND_TYPE=fastapi
```

### Flask Backend (Port 8002)
```env
NEXT_PUBLIC_API_URL=http://localhost:8002
NEXT_PUBLIC_BACKEND_TYPE=flask
```

### Django Backend (Port 8003)
```env
NEXT_PUBLIC_API_URL=http://localhost:8003
NEXT_PUBLIC_BACKEND_TYPE=django
```

## 📚 Key Components

### Authentication
- **AuthContext**: Global authentication state management
- **LoginForm/SignupForm**: User authentication forms
- **withAuth/withGuest**: HOCs for route protection

### Posts
- **PostCard**: Individual post display component
- **PostList**: Paginated list of posts with filtering
- **PostForm**: Create/edit post form with Markdown editor
- **PostDetail**: Full post view with comments
- **CommentSection**: Nested comment system

### UI Components
- **Button**: Versatile button component with variants
- **Input/Textarea**: Form input components with validation
- **Modal**: Flexible modal system
- **Card**: Content container component
- **Loading**: Various loading states and skeletons

## 🎨 Styling

The application uses Tailwind CSS with a custom design system:

- **Color Scheme**: Supports light/dark themes
- **Typography**: Consistent text hierarchy
- **Spacing**: Standardized spacing scale
- **Components**: Reusable component classes
- **Responsive**: Mobile-first responsive design

## 🔌 API Integration

The frontend uses a flexible API client that adapts to different backend implementations:

```typescript
// API client automatically handles different backend formats
const apiClient = new ApiClient();

// Usage examples
const posts = await apiClient.getPosts();
const post = await apiClient.getPost(id);
const newPost = await apiClient.createPost(postData);
```

### Authentication Flow
1. User logs in through LoginForm
2. JWT tokens stored securely in cookies
3. Automatic token refresh before expiration
4. API client includes tokens in requests
5. Automatic logout on token expiration

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (configured in package.json)

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Variables for Production

Ensure all environment variables are properly set for your production environment:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_BACKEND_TYPE=fastapi
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the backend is running and accessible
2. Verify environment variables are correctly set
3. Check browser console for error messages
4. Ensure CORS is properly configured on the backend

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced search and filtering
- [ ] User following system
- [ ] Rich text editor improvements
- [ ] Mobile app (React Native)
- [ ] Progressive Web App (PWA) features
- [ ] Dark mode toggle
- [ ] Internationalization (i18n)