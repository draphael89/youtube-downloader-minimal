import { NextRequest, NextResponse } from 'next/server';
import { getVideoInfo, validateURL, chooseFormat } from '@/lib/ytdl-wrapper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const itag = searchParams.get('itag');
    
    if (!url || !validateURL(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }
    
    try {
      // Get video info
      const info = await getVideoInfo(url);
      const title = info.videoDetails.title.replace(/[^\w\s-]/g, '').substring(0, 100); // Sanitize filename
      
      // Get the specific format
      let format;
      if (itag) {
        format = info.formats.find(f => f.itag === parseInt(itag));
      }
      
      // Fallback to best quality if specific format not found
      if (!format) {
        format = chooseFormat(info.formats, { quality: 'highest' });
      }
      
      if (!format || !format.url) {
        return NextResponse.json(
          { error: 'No suitable format found' },
          { status: 404 }
        );
      }
      
      // Create response headers for download
      const headers = new Headers();
      headers.set('Content-Disposition', `attachment; filename="${title}.${format.container || 'mp4'}"`);
      
      // Redirect to the actual video URL with download headers
      // This lets the browser handle the download directly
      return NextResponse.redirect(format.url, {
        headers: headers,
        status: 302
      });
      
    } catch (error: any) {
      console.error('Download error:', error.message);
      
      return NextResponse.json(
        { error: 'Failed to process download. The video might be protected or unavailable.' },
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