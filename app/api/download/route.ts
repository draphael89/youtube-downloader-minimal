import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const itag = searchParams.get('itag');
    
    if (!url || !ytdl.validateURL(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }
    
    try {
      // Get video info to get the title
      const info = await ytdl.getBasicInfo(url);
      const title = info.videoDetails.title.replace(/[^\w\s-]/g, ''); // Sanitize filename
      
      // Create a stream with the specified quality
      const options: ytdl.downloadOptions = itag ? { quality: parseInt(itag) } : { quality: 'highest' };
      
      // For Vercel, we need to be careful about memory usage
      // Instead of downloading the whole file, we'll return the direct URL
      const format = ytdl.chooseFormat(info.formats, options);
      
      if (!format || !format.url) {
        return NextResponse.json(
          { error: 'No suitable format found' },
          { status: 404 }
        );
      }
      
      // Redirect to the actual video URL
      // This lets the browser handle the download directly
      return NextResponse.redirect(format.url);
      
    } catch (error: any) {
      console.error('Download error:', error);
      
      return NextResponse.json(
        { error: 'Failed to process download' },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Download API error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}