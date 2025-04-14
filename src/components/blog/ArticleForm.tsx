
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Eye
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ArticleImageUpload from './ArticleImageUpload';

interface ArticleFormValues {
  title: string;
  subtitle: string;
  content: string;
  category: string;
  author: string;
  imageFile?: File | null;
}

interface ArticleFormProps {
  isSubmitting: boolean;
  onSubmit: (values: ArticleFormValues) => void;
  onCancel: () => void;
  initialValues?: ArticleFormValues;
  imageUrl?: string;
  isEditing?: boolean;
}

const ArticleForm: React.FC<ArticleFormProps> = ({
  isSubmitting,
  onSubmit,
  onCancel,
  initialValues,
  imageUrl,
  isEditing = false
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(imageUrl || null);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  const form = useForm<ArticleFormValues>({
    defaultValues: initialValues || {
      title: "",
      subtitle: "",
      content: "",
      category: "Fashion",
      author: "",
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (values: ArticleFormValues) => {
    onSubmit({
      ...values,
      imageFile,
    });
  };

  // Text formatting functions
  const insertFormatting = (format: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.getValues('content');
    
    let newText = text;
    let newSelectionStart = start;
    let newSelectionEnd = end;
    
    switch (format) {
      case 'bold':
        newText = text.substring(0, start) + '**' + text.substring(start, end) + '**' + text.substring(end);
        newSelectionEnd = end + 4;
        break;
      case 'italic':
        newText = text.substring(0, start) + '*' + text.substring(start, end) + '*' + text.substring(end);
        newSelectionEnd = end + 2;
        break;
      case 'link':
        newText = text.substring(0, start) + '[' + text.substring(start, end) + '](url)' + text.substring(end);
        newSelectionEnd = end + 6;
        break;
      case 'image':
        newText = text.substring(0, start) + '![image description](image_url)' + text.substring(end);
        newSelectionEnd = start + 32;
        break;
      case 'alignLeft':
        newText = text.substring(0, start) + '<div style="text-align: left;">' + text.substring(start, end) + '</div>' + text.substring(end);
        newSelectionEnd = end + 35;
        break;
      case 'alignCenter':
        newText = text.substring(0, start) + '<div style="text-align: center;">' + text.substring(start, end) + '</div>' + text.substring(end);
        newSelectionEnd = end + 37;
        break;
      case 'alignRight':
        newText = text.substring(0, start) + '<div style="text-align: right;">' + text.substring(start, end) + '</div>' + text.substring(end);
        newSelectionEnd = end + 36;
        break;
      case 'list':
        // Split the selected text into lines
        const selectedText = text.substring(start, end);
        const lines = selectedText.split('\n');
        const bulletLines = lines.map(line => `- ${line}`).join('\n');
        newText = text.substring(0, start) + bulletLines + text.substring(end);
        newSelectionEnd = start + bulletLines.length;
        break;
    }
    
    form.setValue('content', newText);
    
    // Set cursor position after formatting
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newSelectionStart, newSelectionEnd);
      }
    }, 0);
  };

  // Parse markdown-like formatting for preview
  const renderFormattedContent = (content: string) => {
    let formatted = content
      // Handle bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Handle italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Handle links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-orange-500 underline">$1</a>')
      // Handle images
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full my-2 rounded" />')
      // Handle text alignment
      .replace(/<div style="text-align: (left|center|right);">(.*?)<\/div>/g, '<div style="text-align: $1;">$2</div>')
      // Handle lists
      .replace(/- (.*?)(?:\n|$)/g, '<li>$1</li>')
      // Add line breaks
      .replace(/\n/g, '<br />');
    
    // Wrap lists in ul tags
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/<li>(.*?)(?:<br \/>|$)/g, '<li>$1</li>');
      formatted = '<ul class="list-disc pl-5 my-2">' + formatted + '</ul>';
    }
    
    return formatted;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <ArticleImageUpload 
          imagePreview={imagePreview} 
          handleFileChange={handleImageChange} 
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Article Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter an attention-grabbing title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Subtitle</FormLabel>
              <FormControl>
                <Input placeholder="Add a subtitle or brief description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel className="text-sm font-medium">Article Content</FormLabel>
          
          <div className="flex items-center gap-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md border border-input mb-1">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Bold"
              onClick={() => insertFormatting('bold')}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Italic"
              onClick={() => insertFormatting('italic')}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Add Link"
              onClick={() => insertFormatting('link')}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Insert Image"
              onClick={() => insertFormatting('image')}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <div className="h-5 border-r border-zinc-300 dark:border-zinc-600 mx-1"></div>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Align Left"
              onClick={() => insertFormatting('alignLeft')}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Align Center"
              onClick={() => insertFormatting('alignCenter')}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Align Right"
              onClick={() => insertFormatting('alignRight')}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Bullet List"
              onClick={() => insertFormatting('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <div className="ml-auto">
              <Button
                type="button"
                variant={showPreview ? "default" : "ghost"}
                size="sm"
                title="Toggle Preview"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="edit" value={showPreview ? "preview" : "edit"}>
            <TabsContent value="edit" className="mt-0">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Write your article content here... Use the formatting tools above to style your text. Add links and images."
                        className="min-h-[300px] resize-y font-mono"
                        {...field}
                        ref={(e) => {
                          field.ref(e);
                          textareaRef.current = e;
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-0">
              <div className="border border-input rounded-md p-4 min-h-[300px] bg-white dark:bg-zinc-900 overflow-auto">
                {form.getValues('content') ? (
                  <div 
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderFormattedContent(form.getValues('content')) }}
                  />
                ) : (
                  <p className="text-zinc-400 italic">No content to preview. Start writing to see a preview.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Fashion, Lifestyle, Travel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Author</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your name" 
                    {...field} 
                    disabled={isEditing} // Disable author field when editing
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Article' : 'Create Article')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ArticleForm;
