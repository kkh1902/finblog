'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/common/Layout';
import { PostList } from '@/components/posts/PostList';
import { PageLoading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useUserByUsername } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { 
  UserIcon, 
  MapPinIcon, 
  LinkIcon, 
  CalendarIcon,
  MailIcon,
  EditIcon,
  UsersIcon,
  FileTextIcon,
  HeartIcon,
  MessageSquareIcon
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function ProfilePage() {
  const params = useParams();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'liked' | 'bookmarks'>('posts');
  
  const username = params.username as string;
  const { 
    data: user, 
    isLoading, 
    error 
  } = useUserByUsername(username);

  // Update document title when user loads
  useEffect(() => {
    if (user) {
      const displayName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.username;
      document.title = `${displayName} | FinBoard`;
    }
    
    return () => {
      document.title = 'FinBoard';
    };
  }, [user]);

  if (isLoading) {
    return (
      <Layout>
        <div className="py-8">
          <PageLoading text="Loading profile..." />
        </div>
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout>
        <div className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              User Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The user you're looking for doesn't exist.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;
  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.username;

  const tabs = [
    { id: 'posts', label: 'Posts', count: user.postsCount || 0, icon: FileTextIcon },
    { id: 'liked', label: 'Liked', count: 0, icon: HeartIcon },
    { id: 'bookmarks', label: 'Bookmarks', count: 0, icon: MessageSquareIcon },
  ];

  return (
    <Layout>
      <div className="py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={displayName}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-12 w-12 text-primary-foreground" />
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">
                      {displayName}
                    </h1>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>
                  
                  {isOwnProfile && (
                    <Button asChild variant="outline">
                      <Link href="/settings/profile">
                        <EditIcon className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Link>
                    </Button>
                  )}
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-foreground mb-4 max-w-2xl">
                    {user.bio}
                  </p>
                )}

                {/* Profile Details */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  {user.location && (
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {user.location}
                    </div>
                  )}
                  
                  {user.website && (
                    <div className="flex items-center">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      <a 
                        href={user.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        {user.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Joined {formatDate(user.dateJoined, 'MMM yyyy')}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="font-semibold mr-1">{user.followersCount || 0}</span>
                    <span className="text-muted-foreground">followers</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold mr-1">{user.followingCount || 0}</span>
                    <span className="text-muted-foreground">following</span>
                  </div>
                  <div className="flex items-center">
                    <FileTextIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="font-semibold mr-1">{user.postsCount || 0}</span>
                    <span className="text-muted-foreground">posts</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="border-b border-border mb-6">
              <nav className="flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {tab.count}
                      </Badge>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'posts' && (
              <PostList
                filters={{ author: user.username }}
                emptyMessage="No posts yet"
                emptyDescription={
                  isOwnProfile 
                    ? "You haven't written any posts yet. Share your insights with the community!"
                    : `${displayName} hasn't written any posts yet.`
                }
              />
            )}

            {activeTab === 'liked' && (
              <div className="text-center py-12">
                <HeartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No liked posts</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile 
                    ? "Posts you like will appear here."
                    : `${displayName} hasn't liked any posts yet.`}
                </p>
              </div>
            )}

            {activeTab === 'bookmarks' && (
              <div className="text-center py-12">
                <MessageSquareIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookmarks</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile 
                    ? "Posts you bookmark will appear here."
                    : "Bookmarks are private."}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact */}
            {isOwnProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <MailIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Posts written</span>
                  <span className="font-semibold">{user.postsCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Joined</span>
                  <span className="font-semibold">
                    {formatDate(user.dateJoined, 'MMM yyyy')}
                  </span>
                </div>
                {user.lastLogin && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last seen</span>
                    <span className="font-semibold">
                      {formatDate(user.lastLogin, 'MMM dd')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {!isOwnProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" disabled>
                    Follow
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    <MailIcon className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}