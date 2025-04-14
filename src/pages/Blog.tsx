import { useState, useEffect } from 'react';
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

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image_url: string;
  author: string;
  published_at: string;
  category: string;
}

const Blog = () => {
  const [selectedTab, setSelectedTab] = useState('Blogs');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobileView = useIsMobile(700);
  const { user } = useAuth();
  const location = useLocation();

  const sampleBlogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Beauty is personal and imperfectly perfect',
      excerpt: 'Discover how embracing imperfections can lead to a more authentic style and self-expression.',
      image_url: '/lovable-uploads/90dc4b4f-9007-42c3-9243-928954690a7b.png',
      author: 'Jane Smith',
      published_at: '2025-04-10',
      category: 'Fashion'
    },
    {
      id: '2',
      title: 'Summer Fashion Trends for 2025',
      excerpt: 'Get ahead of the curve with these upcoming summer styles that will dominate this year.',
      image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&q=80',
      author: 'Alex Johnson',
      published_at: '2025-04-08',
      category: 'Fashion'
    },
    {
      id: '3',
      title: 'Sustainable Clothing: A Guide to Eco-Friendly Fashion',
      excerpt: "Learn how to build a wardrobe that's both stylish and environmentally conscious.",
      image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&q=80',
      author: 'Marie Chen',
      published_at: '2025-04-05',
      category: 'Sustainability'
    },
    {
      id: '4',
      title: 'The Art of Accessorizing: Less is More',
      excerpt: 'Discover the power of minimalist accessories and how they can transform your outfit.',
      image_url: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&q=80',
      author: 'Thomas Wright',
      published_at: '2025-04-01',
      category: 'Style'
    },
    {
      id: '5',
      title: 'Vintage Shopping: Finding Hidden Gems',
      excerpt: 'Tips and tricks for hunting down unique vintage pieces to add character to your wardrobe.',
      image_url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&q=80',
      author: 'Sophia Lee',
      published_at: '2025-03-28',
      category: 'Fashion'
    },
    {
      id: '6',
      title: 'Fashion Week Highlights: What You Missed',
      excerpt: "A roundup of the most exciting moments and trends from this year's fashion weeks around the globe.",
      image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&q=80',
      author: 'Marcus Rivera',
      published_at: '2025-03-25',
      category: 'Events'
    }
  ];

  const fetchBlogPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(location.search);
      if (params.has('refresh')) {
        const newPost = {
          id: Date.now().toString(),
          title: 'Your New Article',
          excerpt: 'This is the article you just created. In a real app, this would be saved to the database.',
          image_url: '/lovable-uploads/90dc4b4f-9007-42c3-9243-928954690a7b.png',
          author: user?.email?.split('@')[0] || 'Anonymous',
          published_at: new Date().toISOString().split('T')[0],
          category: 'New'
        };
        
        const updatedPosts = [newPost, ...sampleBlogPosts];
        setBlogPosts(updatedPosts);
      } else {
        setBlogPosts(sampleBlogPosts);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: "Error",
        description: "Failed to load blog posts. Please try again later.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, [location.search]);

  const gridClass = isMobileView 
    ? "grid-cols-1"
    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";

  const featuredPost = blogPosts.length > 0 ? blogPosts[0] : null;
  const remainingPosts = blogPosts.length > 0 ? blogPosts.slice(1) : [];

  return (
    <div className="flex-1 overflow-hidden w-full pb-24">
      <TopNav 
        selectedTab={selectedTab} 
        setSelectedTab={setSelectedTab}
      />
      
      <ScrollArea className="h-[calc(100vh-140px)] w-full">
        <div className="px-4 py-4 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Latest Articles</h2>
            {user && (
              <div className="ml-6">
                <CreateArticleDialog>
                  <Button size="sm" className="flex items-center gap-1 rounded-full">
                    <Plus size={16} />
                    Add Article
                  </Button>
                </CreateArticleDialog>
              </div>
            )}
          </div>
          <div className="h-[60px]"></div>
          
          {featuredPost && (
            <HomeSection title="Featured Article">
              <FeaturedBlogPost
                id={featuredPost.id}
                image={featuredPost.image_url}
                title={featuredPost.title}
                excerpt={featuredPost.excerpt}
                author={featuredPost.author}
                date={featuredPost.published_at}
                category={featuredPost.category}
              />
            </HomeSection>
          )}

          <HomeSection title="Latest Articles">
            {loading ? (
              <div className={`grid ${gridClass} gap-6`}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-full p-1 rounded-md">
                    <div className="aspect-video bg-zinc-800 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-zinc-800 rounded animate-pulse mb-2 w-3/4"></div>
                    <div className="h-3 bg-zinc-800 rounded animate-pulse w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`grid ${gridClass} gap-6`}>
                {remainingPosts.length > 0 ? (
                  remainingPosts.map((post) => (
                    <BlogCard 
                      key={post.id}
                      id={post.id}
                      image={post.image_url}
                      title={post.title}
                      excerpt={post.excerpt}
                      author={post.author}
                      date={post.published_at}
                      category={post.category}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-zinc-400">
                    No articles found.
                  </div>
                )}
              </div>
            )}
          </HomeSection>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Blog;
