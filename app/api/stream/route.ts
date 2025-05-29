import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';

export async function POST(request: NextRequest) {
  try {
    const { url, quality = '720p' } = await request.json();
    
    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }
    
    // Get video info with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout
    
    try {
      const info = await ytdl.getInfo(url, {
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          signal: controller.signal
        }
      });
      
      clearTimeout(timeout);
      
      // Map quality to itag
      const qualityMap: Record<string, string> = {
        '1080p': '137',
        '720p': '136',
        '480p': '135',
        '360p': '134',
        'audio': '140'
      };
      
      // Get the format
      let format = info.formats.find(f => f.itag === parseInt(qualityMap[quality] || '136'));
      
      // Fallback to best available if requested quality not found
      if (!format) {
        format = info.formats
          .filter(f => f.hasVideo && f.container === 'mp4')
          .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
      }
      
      if (!format) {
        return NextResponse.json(
          { error: 'No suitable format found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        streamUrl: format.url,
        title: info.videoDetails.title,
        duration: info.videoDetails.lengthSeconds,
        thumbnail: info.videoDetails.thumbnails[0]?.url,
        quality: format.qualityLabel || format.quality,
        container: format.container,
        size: format.contentLength ? parseInt(format.contentLength) : null
      });
      
    } catch (error: any) {
      clearTimeout(timeout);
      
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 408 }
        );
      }
      
      throw error;
    }
    
  } catch (error: any) {
    console.error('Stream API error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to process video' },
      { status: 500 }
    );
  }
}