import ytdl from 'ytdl-core';

// Wrapper to handle ytdl-core with better error handling
export async function getVideoInfo(url: string) {
  try {
    // Use simpler options to avoid timeouts
    const info = await ytdl.getBasicInfo(url, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
    });
    
    return info;
  } catch (error: any) {
    console.error('ytdl-core error:', error.message);
    throw error;
  }
}

export function validateURL(url: string): boolean {
  return ytdl.validateURL(url);
}

export function chooseFormat(formats: ytdl.videoFormat[], options: ytdl.downloadOptions) {
  return ytdl.chooseFormat(formats, options);
}