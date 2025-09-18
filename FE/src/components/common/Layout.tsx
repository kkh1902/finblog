import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '6xl' | '7xl' | 'full';
  padding?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

const Layout: React.FC<LayoutProps> = ({
  children,
  className,
  showHeader = true,
  showFooter = true,
  maxWidth = '7xl',
  padding = true,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showHeader && <Header />}
      
      <main className={cn('flex-1', className)}>
        <div className={cn(
          'mx-auto',
          maxWidthClasses[maxWidth],
          padding && 'px-4 sm:px-6 lg:px-8'
        )}>
          {children}
        </div>
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

// Specialized layout components
export const AuthLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Layout showHeader={false} showFooter={false} maxWidth="sm" className="flex items-center justify-center py-12">
      <div className="w-full">
        {children}
      </div>
    </Layout>
  );
};

export const DashboardLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Layout className="py-8">
      {children}
    </Layout>
  );
};

export const PostLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Layout maxWidth="6xl" className="py-8">
      {children}
    </Layout>
  );
};

export const ProfileLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Layout className="py-8">
      {children}
    </Layout>
  );
};

export const SettingsLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Layout maxWidth="6xl" className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <nav className="space-y-1">
            <a
              href="/settings/profile"
              className="bg-accent text-accent-foreground group rounded-md px-3 py-2 flex items-center text-sm font-medium"
            >
              Profile Settings
            </a>
            <a
              href="/settings/account"
              className="text-muted-foreground hover:text-foreground hover:bg-accent group rounded-md px-3 py-2 flex items-center text-sm font-medium"
            >
              Account Settings
            </a>
            <a
              href="/settings/notifications"
              className="text-muted-foreground hover:text-foreground hover:bg-accent group rounded-md px-3 py-2 flex items-center text-sm font-medium"
            >
              Notifications
            </a>
            <a
              href="/settings/privacy"
              className="text-muted-foreground hover:text-foreground hover:bg-accent group rounded-md px-3 py-2 flex items-center text-sm font-medium"
            >
              Privacy & Security
            </a>
          </nav>
        </aside>
        <main className="lg:col-span-3">
          {children}
        </main>
      </div>
    </Layout>
  );
};

export default Layout;