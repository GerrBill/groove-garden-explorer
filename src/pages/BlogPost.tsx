
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Facebook, Twitter, Linkedin, Instagram, Share2, Edit } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import TopNav from '@/components/navigation/TopNav';
import { BlogArticle } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';
import EditArticleDialog from '@/components/blog/EditArticleDialog';

const BlogPost = () => {
  const [selectedTab] = useState('Blogs');
  const { id } = useParams<{ id: string }>();
  const [blogPost, setBlogPost] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchBlogPost = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      setBlogPost(data as BlogArticle);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      toast({
        title: "Error",
        description: "Failed to load the blog post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBlogPost();
    }
  }, [id, toast]);

  const formattedDate = blogPost?.published_at 
    ? formatDistanceToNow(new Date(blogPost.published_at), { addSuffix: true }) 
    : '';

  // Function to share on social media
  const shareOnSocial = (platform: string) => {
    const url = window.location.href;
    const title = blogPost?.title || 'Blog Post';
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'instagram':
        // Instagram doesn't have a direct sharing URL, so just copy to clipboard
        navigator.clipboard.writeText(`${title} ${url}`);
        toast({
          title: "Link Copied!",
          description: "Share this link on Instagram",
        });
        return;
      default:
        // Copy link to clipboard
        navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied!",
          description: "Link copied to clipboard",
        });
        return;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  // Function to format content with markdown-like syntax
  const renderFormattedContent = (content: string) => {
    if (!content) return '';
    
    let formatted = content
      // Handle bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Handle italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Handle links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-orange-700 underline">$1</a>')
      // Handle images
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full my-4 rounded-md" />')
      // Handle text alignment
      .replace(/<div style="text-align: (left|center|right);">(.*?)<\/div>/g, '<div style="text-align: $1;">$2</div>')
      // Handle lists
      .replace(/- (.*?)(?:\n|$)/g, '<li>$1</li>')
      // Add line breaks
      .replace(/\n/g, '<br />');
    
    // Wrap lists in ul tags
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/<li>(.*?)(?:<br \/>|$)/g, '<li>$1</li>');
      formatted = '<ul class="list-disc pl-5 my-4">' + formatted + '</ul>';
    }
    
    return formatted;
  };

  // Check if current user is the post creator (by matching author name)
  const isPostCreator = user && blogPost?.author === user.email;

  return (
    <div className="flex-1 overflow-hidden w-full pb-24 bg-gray-100">
      <TopNav 
        selectedTab={selectedTab} 
        setSelectedTab={() => {}}
      />
      
      <ScrollArea className="h-[calc(100vh-140px)] w-full">
        <div className="max-w-4xl mx-auto bg-white shadow-sm p-4 sm:p-8">
          {loading ? (
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
              <div className="h-60 bg-gray-200 rounded animate-pulse my-6"></div>
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : blogPost ? (
            <>
              <div className="mb-6 flex justify-between items-center">
                <Link 
                  to="/blog" 
                  className="inline-flex items-center text-orange-700 hover:text-orange-800"
                >
                  <ArrowLeft size={16} className="mr-1" /> Back to Blogs
                </Link>
                
                {isPostCreator && blogPost && (
                  <EditArticleDialog 
                    article={blogPost}
                    onArticleUpdated={fetchBlogPost}
                  >
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1"
                    >
                      <Edit size={16} /> Edit Post
                    </Button>
                  </EditArticleDialog>
                )}
              </div>
              
              <div className="text-center mb-8">
                <div className="inline-block bg-orange-700 text-white text-xs px-3 py-1 rounded-full mb-3">
                  {blogPost.category}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">{blogPost.title}</h1>
                {blogPost.subtitle && (
                  <p className="text-lg text-gray-600 mb-3">{blogPost.subtitle}</p>
                )}
                
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <span>{blogPost.author}</span>
                  <span>•</span>
                  <span>{formattedDate}</span>
                </div>
              </div>
              
              <div className="mb-8">
                <img 
                  src={blogPost.image_url} 
                  alt={blogPost.title} 
                  className="w-full h-auto rounded-md object-cover max-h-[500px]" 
                  onError={(e) => {
                    // Fallback to default image if loading fails
                    (e.target as HTMLImageElement).src = '/lovable-uploads/90dc4b4f-9007-42c3-9243-928954690a7b.png';
                  }}
                />
              </div>
              
              <div className="article-content prose max-w-none mb-8">
                <div dangerouslySetInnerHTML={{ __html: renderFormattedContent(blogPost.content) }} />
              </div>
              
              <Separator className="my-8" />
              
              <div className="flex flex-wrap justify-between items-center">
                <div className="flex items-center mb-4 md:mb-0">
                  <Avatar className="h-10 w-10 mr-3">
                    <div className="bg-gray-300 h-full w-full flex items-center justify-center text-gray-600">
                      {blogPost.author.charAt(0).toUpperCase()}
                    </div>
                  </Avatar>
                  <div>
                    <p className="font-medium">{blogPost.author}</p>
                    <p className="text-sm text-gray-500">Author</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="icon" variant="outline" className="rounded-full" onClick={() => shareOnSocial('facebook')}>
                    <Facebook size={18} />
                  </Button>
                  <Button size="icon" variant="outline" className="rounded-full" onClick={() => shareOnSocial('twitter')}>
                    <Twitter size={18} />
                  </Button>
                  <Button size="icon" variant="outline" className="rounded-full" onClick={() => shareOnSocial('linkedin')}>
                    <Linkedin size={18} />
                  </Button>
                  <Button size="icon" variant="outline" className="rounded-full" onClick={() => shareOnSocial('instagram')}>
                    <Instagram size={18} />
                  </Button>
                  <Button size="icon" variant="outline" className="rounded-full" onClick={() => shareOnSocial('copy')}>
                    <Share2 size={18} />
                  </Button>
                </div>
              </div>
              
              <Separator className="my-8" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-xl font-bold mb-4">Comments</h3>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-4">About Author</h3>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 mb-4">
                          <div className="bg-gray-300 h-full w-full flex items-center justify-center text-gray-600 text-xl">
                            {blogPost.author.charAt(0).toUpperCase()}
                          </div>
                        </Avatar>
                        <h4 className="font-bold mb-2">{blogPost.author}</h4>
                        <p className="text-sm text-gray-600 mb-4">Fashion Writer & Editor</p>
                        <p className="text-sm">Passionate about exploring the intersection of fashion, art, and culture.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-2">Blog Post Not Found</h2>
              <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
              <Button asChild>
                <Link to="/blog">Back to Blog</Link>
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default BlogPost;
