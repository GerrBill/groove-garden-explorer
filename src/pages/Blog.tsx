
import React, { useState } from 'react';
import TopNav from '@/components/navigation/TopNav';
import { ScrollArea } from "@/components/ui/scroll-area";
import CreateArticleDialog from '@/components/blog/CreateArticleDialog';
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BlogCard from '@/components/blog/BlogCard';
import FeaturedBlogPost from '@/components/blog/FeaturedBlogPost';
import { BlogArticle } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';

// Array containing admin email addresses
const ADMIN_EMAILS = ["wjparker@outlook.com", "ghodgett59@gmail.com"];

const Blog = () => {
  const { user } = useAuth();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || "");
  
  // Fetch blog posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      console.log('Fetching blog posts...');
      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching blog posts:', error);
        throw error;
      }
      
      console.log('Blog posts fetched:', data?.length);
      return data as BlogArticle[];
    }
  });

  const featuredPost = posts && posts.length > 0 ? posts[0] : null;
  const regularPosts = posts && posts.length > 1 ? posts.slice(1) : [];

  return (
    <div className="flex-1 overflow-hidden w-full pb-24 bg-black">
      <TopNav />
      
      <ScrollArea className="h-[calc(100vh-140px)] w-full bg-black">
        <div className="px-4 py-4 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Blog</h2>
            {isAdmin && (
              <CreateArticleDialog>
                <Button size="sm" className="flex items-center gap-1">
                  <Plus size={16} />
                  New Post
                </Button>
              </CreateArticleDialog>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-theme-color mb-4" />
              <p className="text-muted-foreground">Loading blog posts...</p>
            </div>
          ) : posts && posts.length > 0 ? (
            <>
              {featuredPost && (
                <div className="mb-8">
                  <FeaturedBlogPost article={featuredPost} />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map(post => (
                  <BlogCard key={post.id} article={post} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No blog posts found. Click "New Post" to create your first blog post.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Blog;
