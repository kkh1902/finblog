import { Metadata } from 'next';
import { Suspense } from 'react';
import Layout from '@/components/common/Layout';
import { PostList } from '@/components/posts/PostList';
import { PageLoading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { 
  PlusIcon, 
  FilterIcon, 
  SearchIcon, 
  TrendingUpIcon,
  ClockIcon,
  HeartIcon,
  EyeIcon
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Posts',
  description: 'Browse the latest financial insights, market analysis, and investment strategies from our community.',
};

// Mock data for filters - in a real app, this would come from API
const categories = [
  { id: 1, name: 'Market Analysis', count: 45 },
  { id: 2, name: 'Trading Strategies', count: 32 },
  { id: 3, name: 'Investment Tips', count: 28 },
  { id: 4, name: 'Crypto', count: 24 },
  { id: 5, name: 'Economics', count: 19 },
];

const popularTags = [
  { id: 1, name: 'stocks', count: 156 },
  { id: 2, name: 'bitcoin', count: 89 },
  { id: 3, name: 'forex', count: 67 },
  { id: 4, name: 'options', count: 45 },
  { id: 5, name: 'portfolio', count: 38 },
];

export default function PostsPage() {
  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Latest Posts
            </h1>
            <p className="text-muted-foreground">
              Discover insights from our community of finance professionals
            </p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm">
              <FilterIcon className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button asChild size="sm">
              <Link href="/posts/create">
                <PlusIcon className="h-4 w-4 mr-2" />
                Write Post
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Button variant="ghost" size="sm" className="text-primary">
                <ClockIcon className="h-4 w-4 mr-1" />
                Latest
              </Button>
              <Button variant="ghost" size="sm">
                <TrendingUpIcon className="h-4 w-4 mr-1" />
                Trending
              </Button>
              <Button variant="ghost" size="sm">
                <HeartIcon className="h-4 w-4 mr-1" />
                Most Liked
              </Button>
              <Button variant="ghost" size="sm">
                <EyeIcon className="h-4 w-4 mr-1" />
                Most Viewed
              </Button>
            </div>

            {/* Posts List */}
            <Suspense fallback={<PageLoading text="Loading posts..." />}>
              <PostList />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/posts?category=${category.id}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <span className="text-sm">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/posts?tag=${tag.name}`}
                    >
                      <Badge variant="outline" className="hover:bg-accent cursor-pointer">
                        #{tag.name} ({tag.count})
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Posts</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="font-semibold">567</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Posts Today</span>
                  <span className="font-semibold">23</span>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Share Your Insights</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join thousands of finance professionals sharing knowledge
                </p>
                <Button asChild className="w-full">
                  <Link href="/posts/create">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Write Your First Post
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}