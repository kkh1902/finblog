import { Metadata } from 'next';
import { Suspense } from 'react';
import Layout from '@/components/common/Layout';
import PostList from '@/components/posts/PostList';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { PlusIcon, TrendingUpIcon, UsersIcon, BookOpenIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Discover the latest financial insights, market analysis, and investment strategies on FinBoard.',
};

export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Welcome to{' '}
            <span className="text-primary">FinBoard</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Your premier destination for financial insights, market analysis, and investment strategies. 
            Join our community of finance professionals and enthusiasts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="btn-hover">
              <Link href="/posts">
                <BookOpenIcon className="mr-2 h-5 w-5" />
                Browse Posts
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="btn-hover">
              <Link href="/posts/create">
                <PlusIcon className="mr-2 h-5 w-5" />
                Write Post
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <TrendingUpIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">10K+</h3>
              <p className="text-muted-foreground">Market Insights</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <UsersIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">5K+</h3>
              <p className="text-muted-foreground">Active Members</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <BookOpenIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">1K+</h3>
              <p className="text-muted-foreground">Published Articles</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Latest Posts
              </h2>
              <p className="text-muted-foreground">
                Stay updated with the latest financial insights and market analysis
              </p>
            </div>
            <Button asChild variant="outline" className="btn-hover">
              <Link href="/posts">
                View All Posts
              </Link>
            </Button>
          </div>
          
          <Suspense 
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-3 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            }
          >
            <PostList limit={6} showPagination={false} />
          </Suspense>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-muted/50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Share Your Insights?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of finance professionals sharing knowledge and building the future of financial literacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="btn-hover">
              <Link href="/auth/signup">
                Get Started
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="btn-hover">
              <Link href="/posts">
                Explore Content
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}