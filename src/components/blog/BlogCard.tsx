import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { BlogCardProps } from './types';

const BlogCard = ({ article }: BlogCardProps) => {
  const { title, subtitle, image_url, excerpt } = article;
  
  return (
    <Card className="overflow-hidden bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer">
      <Link to={`/blog/${article.id}`}>
        <div className="relative">
          <img
            src={image_url || '/placeholder.svg'}
            alt={title}
            className="aspect-video w-full object-cover rounded-md"
            style={{ height: '140px' }}
          />
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {subtitle || excerpt}
            </p>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
};

export default BlogCard;
