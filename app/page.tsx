'use client';

import { useState } from 'react';

interface VideoFormat {
  quality: string;
  container: string;
  size: number | null;
  itag: number;
}

interface VideoInfo {
  title: string;
  duration: string;
  thumbnail: string;
  author: string;
  formats: VideoFormat[];
  videoId: string;
}

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  const handleGetInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVideoInfo(null);
    setSelectedFormat('');
    
    try {
      const response = await fetch('/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get video info');
      }
      
      setVideoInfo(data);
      // Auto-select first format
      if (data.formats.length > 0) {
        setSelectedFormat(data.formats[0].itag.toString());
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to get video information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo || !selectedFormat) return;
    
    setDownloading(true);
    try {
      // Create download link
      const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&itag=${selectedFormat}`;
      
      // Create a temporary anchor element to trigger download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${videoInfo.title}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Note: The actual download is handled by browser following the redirect
      
    } catch (err: any) {
      setError('Failed to start download');
    } finally {
      setDownloading(false);
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (seconds: string) => {
    const s = parseInt(seconds);
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          YouTube Downloader
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleGetInfo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={loading || downloading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || downloading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Getting video info...' : 'Get Video Info'}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {videoInfo && (
            <div className="mt-6 space-y-4">
              <div className="border-t pt-4">
                <div className="flex items-start space-x-4">
                  {videoInfo.thumbnail && (
                    <img 
                      src={videoInfo.thumbnail} 
                      alt={videoInfo.title}
                      className="w-32 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{videoInfo.title}</h3>
                    <p className="text-sm text-gray-600">by {videoInfo.author}</p>
                    <p className="text-sm text-gray-500">Duration: {formatDuration(videoInfo.duration)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Quality
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={downloading}
                >
                  {videoInfo.formats.map((format) => (
                    <option key={format.itag} value={format.itag}>
                      {format.quality} ({format.container}) - {formatSize(format.size)}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleDownload}
                disabled={downloading || !selectedFormat}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? 'Starting download...' : 'Download Video'}
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>✨ Select quality and download directly to your device</p>
          <p className="mt-2">
            Downloads are handled by your browser
          </p>
        </div>
      </div>
    </div>
  );
}