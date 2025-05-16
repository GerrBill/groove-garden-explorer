
import React from 'react';
import { extractYouTubeVideoId } from './youtubeUtils';
import YouTubeEmbed from '@/components/blog/YouTubeEmbed';

/**
 * Process HTML content to replace YouTube embeds with proper component renderings
 * Works in both development and production environments
 */
export const processYouTubeEmbeds = (content: string): React.ReactNode[] => {
  if (!content) return [];
  
  // Split content by YouTube embed placeholders
  const parts = content.split(/<div class="youtube-embed" data-youtube-id="([^"]+)"><\/div>/);
  
  if (parts.length <= 1) {
    // No YouTube embeds found, just return the content as HTML
    return [<div dangerouslySetInnerHTML={{ __html: content }} />];
  }
  
  const result: React.ReactNode[] = [];
  
  // Process each part
  for (let i = 0; i < parts.length; i++) {
    // Even indices are regular content
    if (parts[i].trim()) {
      result.push(
        <div key={`content-${i}`} dangerouslySetInnerHTML={{ __html: parts[i] }} />
      );
    }
    
    // Odd indices (except the last one) are YouTube video IDs
    if (i < parts.length - 1 && (i % 2 === 1)) {
      const videoId = parts[i];
      if (videoId) {
        result.push(
          <YouTubeEmbed key={`youtube-${i}`} videoId={videoId} className="my-4" />
        );
      }
    }
  }
  
  return result;
};

/**
 * Hide standalone YouTube URLs in content
 * This is useful for cleaning up content where the URL is shown separately from the embed
 */
export const hideYouTubeUrls = (content: string): string => {
  if (!content) return content;
  
  // Regular expression to match links containing YouTube URLs
  const youtubeLinksRegex = /<a[^>]*href=["'](?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)[^"']*["'][^>]*>.*?<\/a>/g;
  
  // Replace YouTube links with empty strings
  return content.replace(youtubeLinksRegex, '');
};
