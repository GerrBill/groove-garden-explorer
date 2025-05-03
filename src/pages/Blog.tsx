
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import TopNav from '@/components/navigation/TopNav';
import HomeSection from '@/components/home/HomeSection';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import BlogCard from '@/components/blog/BlogCard';
import FeaturedBlogPost from '@/components/blog/FeaturedBlogPost';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import CreateArticleDialog from '@/components/blog/CreateArticleDialog';
import { BlogArticle } from '@/types/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const ADMIN_EMAILS = ["wjparker@outlook.com", "ghodgett59@gmail.com"];

const Blog = () => {
  const [selectedTab, setSelectedTab] = useState('Blogs');
  const { toast } = useToast();
  const isMobileView = useIsMobile(700);
  const { user } = useAuth();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email ?? "");
  const location = useLocation();
  const queryClient = useQueryClient();

  // Use Tanstack Query for blog posts
  const {
    data: blogPosts = [],
    isLoading: loading,
    refetch
  } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('blog_articles')
          .select('id, title, excerpt, image_url, author, published_at, category, created_at')
          .order('published_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        console.log('Loaded blog posts:', data);
        return data as BlogArticle[];
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        toast({
          title: "Error",
          description: "Failed to load blog posts.",
          variant: "destructive"
        });
        return [];
      }
    }
  });

  // Handle article deletion locally without page reload
  const handleArticleDeleted = useCallback(() => {
    console.log("handleArticleDeleted called - refreshing blog posts");
    // Invalidate both queries
    queryClient.invalidateQueries({
      queryKey: ['blog-posts']
    });
    queryClient.invalidateQueries({
      queryKey: ['sidebar-blogs']
    });
    // Then refetch
    refetch();
  }, [refetch, queryClient]);

  const gridClass = isMobileView ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";

  return <div className="flex-1 overflow-hidden w-full pb-24 bg-slate-950">
      <TopNav selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      
      <ScrollArea className="h-[calc(100vh-140px)] w-full">
        <div className="px-4 py-4 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4 bg-slate-950">
            <h2 className="text-2xl font-bold">Latest Articles</h2>
            {isAdmin && <div className="ml-6">
                <CreateArticleDialog>
                  <Button size="sm" className="flex items-center gap-1 rounded-full">
                    <Plus size={16} />
                    Add Article
                  </Button>
                </CreateArticleDialog>
              </div>}
          </div>

          <HomeSection title="Latest Articles">
            {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(5)].map((_, i) => <div key={i} className="w-full p-1 rounded-md">
                    <div className="aspect-video bg-zinc-800 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-zinc-800 rounded animate-pulse mb-2 w-3/4"></div>
                    <div className="h-3 bg-zinc-800 rounded animate-pulse w-1/2"></div>
                  </div>)}
              </div> : <div className={`grid ${gridClass} gap-6`}>
                {blogPosts.length > 0 ? blogPosts.map(post => <BlogCard key={post.id} id={post.id} image={post.image_url} title={post.title} excerpt={post.excerpt} author={post.author} date={post.published_at} category={post.category} onDeleted={handleArticleDeleted} />) : <div className="col-span-full text-center py-8 text-zinc-400">
                    No articles found.
                  </div>}
              </div>}
          </HomeSection>
        </div>
      </ScrollArea>
    </div>;
};

export default Blog;
