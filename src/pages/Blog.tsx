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
import { BlogArticle } from '@/types/supabase';

const ADMIN_EMAILS = [
  "wjparker@outlook.com",
  "ghodgett59@gmail.com"
];

const Blog = () => {
  const [selectedTab, setSelectedTab] = useState('Blogs');
  const [blogPosts, setBlogPosts] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobileView = useIsMobile(700);
  const { user } = useAuth();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email ?? "");
  const location = useLocation();

  const sampleBlogPosts: BlogArticle[] = [
    {
      id: '1',
      title: 'Beauty is personal and imperfectly perfect',
      excerpt: 'Discover how embracing imperfections can lead to a more authentic style and self-expression.',
      content: 'Discover how embracing imperfections can lead to a more authentic style and self-expression. In a world obsessed with perfection, there is beauty in the flaws and unique characteristics that make us who we are.',
      image_url: '/lovable-uploads/90dc4b4f-9007-42c3-9243-928954690a7b.png',
      author: 'Jane Smith',
      published_at: '2025-04-10',
      category: 'Fashion',
      created_at: '2025-04-10T00:00:00Z'
    },
    {
      id: '2',
      title: 'Summer Fashion Trends for 2025',
      excerpt: 'Get ahead of the curve with these upcoming summer styles that will dominate this year.',
      content: 'Get ahead of the curve with these upcoming summer styles that will dominate this year. From vibrant colors to sustainable materials, discover what the fashion world has in store for the summer season.',
      image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&q=80',
      author: 'Alex Johnson',
      published_at: '2025-04-08',
      category: 'Fashion',
      created_at: '2025-04-08T00:00:00Z'
    },
    {
      id: '3',
      title: 'Sustainable Clothing: A Guide to Eco-Friendly Fashion',
      excerpt: "Learn how to build a wardrobe that's both stylish and environmentally conscious.",
      content: "Learn how to build a wardrobe that's both stylish and environmentally conscious. This comprehensive guide explores sustainable materials, ethical brands, and practical tips for reducing your fashion footprint.",
      image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&q=80',
      author: 'Marie Chen',
      published_at: '2025-04-05',
      category: 'Sustainability',
      created_at: '2025-04-05T00:00:00Z'
    },
    {
      id: '4',
      title: 'The Art of Accessorizing: Less is More',
      excerpt: 'Discover the power of minimalist accessories and how they can transform your outfit.',
      content: 'Discover the power of minimalist accessories and how they can transform your outfit. This article explores how carefully selected, quality pieces can make a stronger statement than an abundance of jewelry and accessories.',
      image_url: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&q=80',
      author: 'Thomas Wright',
      published_at: '2025-04-01',
      category: 'Style',
      created_at: '2025-04-01T00:00:00Z'
    },
    {
      id: '5',
      title: 'Vintage Shopping: Finding Hidden Gems',
      excerpt: 'Tips and tricks for hunting down unique vintage pieces to add character to your wardrobe.',
      content: 'Tips and tricks for hunting down unique vintage pieces to add character to your wardrobe. From identifying quality items to negotiating prices, this guide will help you navigate the exciting world of vintage fashion.',
      image_url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&q=80',
      author: 'Sophia Lee',
      published_at: '2025-03-28',
      category: 'Fashion',
      created_at: '2025-03-28T00:00:00Z'
    },
    {
      id: '6',
      title: 'Fashion Week Highlights: What You Missed',
      excerpt: "A roundup of the most exciting moments and trends from this year's fashion weeks around the globe.",
      content: "A roundup of the most exciting moments and trends from this year's fashion weeks around the globe. From breakthrough designers to innovative collections, get caught up on all the major fashion week moments.",
      image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&q=80',
      author: 'Marcus Rivera',
      published_at: '2025-03-25',
      category: 'Events',
      created_at: '2025-03-25T00:00:00Z'
    }
  ];

  const fetchBlogPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('id, title, excerpt, image_url, author, published_at, category, created_at')
        .order('published_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        console.log('Loaded blog posts:', data);
        setBlogPosts(data as BlogArticle[]);
      } else {
        console.log('No blog posts found, using sample data');
        setBlogPosts(sampleBlogPosts);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: "Error",
        description: "Failed to load blog posts. Using sample data instead.",
        variant: "destructive"
      });
      setBlogPosts(sampleBlogPosts);
      setLoading(false);
    }
  };

  // Handle article deletion locally without page reload
  const handleArticleDeleted = () => {
    fetchBlogPosts();
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
            {isAdmin && (
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
          
         {/* {featuredPost && (
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
          )} */}

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
                {blogPosts.length > 0 ? (
                  blogPosts.map((post) => (
                    <BlogCard 
                      key={post.id}
                      id={post.id}
                      image={post.image_url}
                      title={post.title}
                      excerpt={post.excerpt}
                      author={post.author}
                      date={post.published_at}
                      category={post.category}
                      onDeleted={handleArticleDeleted}
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
