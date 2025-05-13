import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Facebook, Twitter, Linkedin, Instagram, Share2, Edit, Image, Trash2 } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import TopNav from '@/components/navigation/TopNav';
import { BlogArticle, BlogComment } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';
import EditArticleDialog from '@/components/blog/EditArticleDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ArticleImageUpload from '@/components/blog/ArticleImageUpload';
import { uploadImageFile, fileToBase64 } from '@/utils/fileUpload';
import { deleteBlogArticle } from '@/utils/blogUtils';
import { useQueryClient } from '@tanstack/react-query';
import { Spinner } from "@/components/ui/spinner";

const ADMIN_EMAILS = [
  "wjparker@outlook.com",
  "ghodgett59@gmail.com"
];

const BlogPost = () => {
  const [selectedTab] = useState('Blogs');
  const { id } = useParams<{ id: string }>();
  const [blogPost, setBlogPost] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentUsername, setCommentUsername] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email ?? "");
  const queryClient = useQueryClient();

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

      console.log('Fetched blog post:', data);
      setBlogPost(data as BlogArticle);
      
      // Set image preview if image exists
      if (data?.image_url) {
        setImagePreview(data.image_url);
      }
      
      // Fetch comments for this post
      fetchComments();
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
  
  const fetchComments = async () => {
    if (!id) return;
    
    try {
      // Using the RPC function to get comments
      const { data, error } = await supabase
        .rpc('get_comments_for_article', { article_id_param: id });
      
      if (error) {
        throw error;
      }
      
      // Cast the returned JSON data to BlogComment[] type
      setComments(data as unknown as BlogComment[]);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (id) {
      fetchBlogPost();
    }
  }, [id]);

  const formattedDate = blogPost?.published_at 
    ? formatDistanceToNow(new Date(blogPost.published_at), { addSuffix: true }) 
    : '';

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
        navigator.clipboard.writeText(`${title} ${url}`);
        toast({
          title: "Link Copied!",
          description: "Share this link on Instagram",
        });
        return;
      default:
        navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied!",
          description: "Link copied to clipboard",
        });
        return;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const renderFormattedContent = (content: string) => {
    if (!content) return '';
    
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-orange-700 underline">$1</a>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full my-4 rounded-md" />')
      .replace(/<div style="text-align: (left|center|right);">(.*?)<\/div>/g, '<div style="text-align: $1;">$2</div>')
      .replace(/- (.*?)(?:\n|$)/g, '<li>$1</li>')
      .replace(/\n/g, '<br />');
    
    // YouTube URL regex
    const youtubeRegex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|shorts\/|playlist\?list=|channel\/)?([a-zA-Z0-9_-]{11})(\S*)?/g;
    formatted = formatted.replace(youtubeRegex, (match) => {
      return `<div class="aspect-w-16 aspect-h-9 my-4">
        <iframe src="https://www.youtube.com/embed/${match.match(/([a-zA-Z0-9_-]{11})/)?.[0]}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
          class="w-full h-64 rounded-md"
        ></iframe>
      </div>`;
    });
    
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/<li>(.*?)(?:<br \/>|$)/g, '<li>$1</li>');
      formatted = '<ul class="list-disc pl-5 my-4">' + formatted + '</ul>';
    }
    
    return formatted;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        console.log('File selected for replacement:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: "Please select an image file",
            variant: "destructive"
          });
          return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Image must be smaller than 5MB",
            variant: "destructive"
          });
          return;
        }
        
        setImageFile(file);
        
        // Generate preview
        const base64 = await fileToBase64(file);
        setImagePreview(base64);
        
        console.log('Image preview generated successfully');
      } catch (error) {
        console.error('Error handling file selection:', error);
        toast({
          title: "Error",
          description: "Failed to process the selected image",
          variant: "destructive"
        });
      }
    }
  };

  const handleReplaceImage = async () => {
    if (!imageFile || !blogPost) {
      console.error('No image file selected or blog post not loaded');
      return;
    }
    
    try {
      setIsReplacing(true);
      
      console.log('Replacing image with file:', imageFile.name, 'Size:', imageFile.size, 'Type:', imageFile.type);
      
      // Upload the new image to Supabase storage
      const imageUrl = await uploadImageFile(imageFile, 'blog');
      console.log('New image uploaded successfully to:', imageUrl);
      
      if (!imageUrl) {
        throw new Error('Failed to upload image');
      }
      
      // Update the blog post with the new image URL
      const { data, error } = await supabase
        .from('blog_articles')
        .update({ image_url: imageUrl })
        .eq('id', blogPost.id)
        .select();
        
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Database updated with new image URL:', imageUrl);
      console.log('Update response:', data);
      
      // Update local state with the new image URL
      setBlogPost({
        ...blogPost,
        image_url: imageUrl
      });

      // Invalidate queries to refresh data across the app
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['sidebar-blogs'] });
      
      toast({
        title: "Success!",
        description: "Image has been replaced.",
      });
      
      // Close the dialog
      setOpenImageDialog(false);
      
      // Reset the image file and preview
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error replacing image:', error);
      toast({
        title: "Error",
        description: "Failed to replace image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsReplacing(false);
    }
  };
  
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !commentUsername.trim() || !id) return;
    
    try {
      setIsPostingComment(true);
      
      // Using rpc to add a comment
      const { data, error } = await supabase
        .rpc('add_blog_comment', {
          article_id_param: id,
          user_name_param: commentUsername,
          content_param: newComment
        });
        
      if (error) throw error;
      
      // Refresh comments after adding
      fetchComments();
      
      setNewComment('');
      setCommentUsername('');
      
      toast({
        title: "Comment posted!",
        description: "Your comment has been added successfully.",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPostingComment(false);
    }
  };

  // Handle article update callback
  const handleArticleUpdated = () => {
    console.log("Article updated, refreshing data...");
    fetchBlogPost();
    queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    queryClient.invalidateQueries({ queryKey: ['sidebar-blogs'] });
    
    toast({
      title: "Article updated",
      description: "The article has been successfully updated"
    });
  };

  // Modified delete handler without confirmation that doesn't use window.location.reload()
  const handleDeleteArticle = async () => {
    if (!blogPost?.id || isDeleting) return;

    console.log("Delete button clicked for blog post:", blogPost.id);
    setIsDeleting(true);
    
    toast({
      title: "Deleting article...",
      description: "Please wait while we delete this article"
    });
    
    const success = await deleteBlogArticle(
      blogPost.id, 
      blogPost.image_url, 
      () => {
        // Invalidate both queries to refresh sidebar and blog list
        queryClient.invalidateQueries({ queryKey: ['sidebar-blogs'] });
        queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
        
        // Navigate back to the blog page
        console.log("Delete success callback triggered in BlogPost");
        navigate('/blog', { replace: true });
      }
    );
    
    if (!success) {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 overflow-hidden w-full pb-24 bg-background dark:bg-black">
      <TopNav 
        selectedTab={selectedTab} 
        setSelectedTab={() => {}}
      />
      
      <ScrollArea className="h-[calc(100vh-140px)] w-full">
        <div className="max-w-[600px] mx-auto bg-white dark:bg-gray-900 shadow-sm p-4 sm:p-8">
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
                
                {isAdmin && (
                  <div className="flex gap-2">
                    <Dialog open={openImageDialog} onOpenChange={setOpenImageDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-1"
                        >
                          <Image size={16} /> Replace Image
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Replace Featured Image</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <ArticleImageUpload 
                            imagePreview={imagePreview || blogPost.image_url} 
                            handleFileChange={handleFileChange} 
                          />
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setOpenImageDialog(false);
                                setImageFile(null);
                                setImagePreview(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleReplaceImage}
                              disabled={!imageFile || isReplacing}
                            >
                              {isReplacing ? (
                                <>
                                  <Spinner size="sm" className="mr-2" />
                                  Updating...
                                </>
                              ) : 'Update Image'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <EditArticleDialog 
                      article={blogPost}
                      onArticleUpdated={handleArticleUpdated}
                    >
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-1"
                      >
                        <Edit size={16} /> Edit Post
                      </Button>
                    </EditArticleDialog>

                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="flex items-center gap-1"
                      onClick={handleDeleteArticle}
                      disabled={isDeleting}
                    >
                      <Trash2 size={16} /> Delete
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="text-center mb-8">
                <div className="inline-block bg-theme-color text-white text-xs px-3 py-1 rounded-full mb-3">
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
              
              <div className="mb-8 relative group">
                {blogPost.image_url && (
                  <img 
                    src={blogPost.image_url} 
                    alt={blogPost.title} 
                    className="w-full h-auto rounded-md object-cover max-h-[500px]" 
                    onError={(e) => {
                      console.error("Error loading image:", blogPost.image_url);
                      (e.target as HTMLImageElement).src = '/lovable-uploads/90dc4b4f-9007-42c3-9243-928954690a7b.png';
                    }}
                  />
                )}
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
                  
                  {/* Comment form */}
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Your Name</label>
                          <input
                            type="text"
                            value={commentUsername}
                            onChange={(e) => setCommentUsername(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Enter your name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Comment</label>
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[100px]"
                            placeholder="Write your comment here..."
                          ></textarea>
                        </div>
                        <div className="text-right">
                          <Button 
                            onClick={handleSubmitComment} 
                            disabled={isPostingComment || !newComment.trim() || !commentUsername.trim()}
                          >
                            {isPostingComment ? 'Posting...' : 'Post Comment'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Comments list */}
                  {comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <Card key={comment.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start">
                              <Avatar className="h-8 w-8 mr-3">
                                <div className="bg-gray-300 h-full w-full flex items-center justify-center text-gray-600 text-xs">
                                  {comment.user_name.charAt(0).toUpperCase()}
                                </div>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                  <p className="font-semibold">{comment.user_name}</p>
                                  <p className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                  </p>
                                </div>
                                <p className="text-gray-700">{comment.content}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                      </CardContent>
                    </Card>
                  )}
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
