import { NextRequest, NextResponse } from 'next/server';
import { getVideoInfo, validateURL } from '@/lib/ytdl-wrapper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    // Validate YouTube URL
    if (!validateURL(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }
    
    try {
      // Get video info
      const info = await getVideoInfo(url);
      
      // Get available formats - focus on formats with both video and audio
      const formats = info.formats
        .filter(format => format.hasVideo && format.hasAudio && format.container === 'mp4')
        .map(format => ({
          quality: format.qualityLabel || format.quality || 'unknown',
          container: format.container,
          size: format.contentLength ? parseInt(format.contentLength) : null,
          itag: format.itag
        }))
        .filter((v, i, a) => a.findIndex(t => t.quality === v.quality) === i); // Remove duplicates
      
      // Sort by quality
      const qualityOrder = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p', '144p'];
      formats.sort((a, b) => {
        const aIndex = qualityOrder.indexOf(a.quality);
        const bIndex = qualityOrder.indexOf(b.quality);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });
      
      // Ensure we have at least some formats
      if (formats.length === 0) {
        // Fallback to any video format
        const anyVideoFormat = info.formats
          .filter(f => f.hasVideo)
          .map(f => ({
            quality: f.qualityLabel || f.quality || 'video only',
            container: f.container,
            size: f.contentLength ? parseInt(f.contentLength) : null,
            itag: f.itag
          }));
        formats.push(...anyVideoFormat.slice(0, 3)); // Add top 3 video-only formats as fallback
      }
      
      return NextResponse.json({
        title: info.videoDetails.title,
        duration: info.videoDetails.lengthSeconds,
        thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]?.url,
        author: info.videoDetails.author.name,
        formats: formats,
        videoId: info.videoDetails.videoId
      });
      
    } catch (error: any) {
      console.error('Video info error:', error.message);
      
      if (error.message?.includes('Status code: 410')) {
        return NextResponse.json(
          { error: 'This video is no longer available' },
          { status: 410 }
        );
      }
      
      if (error.message?.includes('age-restricted')) {
        return NextResponse.json(
          { error: 'This video is age-restricted and cannot be downloaded' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch video information. Please try again.' },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Info API error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}