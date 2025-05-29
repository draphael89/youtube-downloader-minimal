import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }
    
    try {
      // Get video info with minimal options to avoid timeout
      const info = await ytdl.getBasicInfo(url);
      
      // Get available formats
      const formats = info.formats
        .filter(format => format.hasVideo && format.hasAudio)
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
      
      return NextResponse.json({
        title: info.videoDetails.title,
        duration: info.videoDetails.lengthSeconds,
        thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]?.url,
        author: info.videoDetails.author.name,
        formats: formats,
        videoId: info.videoDetails.videoId
      });
      
    } catch (error: any) {
      console.error('ytdl-core error:', error);
      
      if (error.message?.includes('Status code: 410')) {
        return NextResponse.json(
          { error: 'This video is no longer available' },
          { status: 410 }
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