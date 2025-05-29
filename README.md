# 🚀 YouTube Downloader - Minimal Vercel Deployment

The most parsimonious YouTube downloader for Vercel with minimal complexity, zero external dependencies, and free hosting.

## ✨ Features

- **Direct streaming** - No server-side downloads
- **Zero storage costs** - Files stream directly to users
- **Minimal code** - Only 5 essential files
- **Free hosting** - Runs on Vercel free tier
- **Fast deployment** - Under 5 minutes
- **No external services** - Everything runs on Vercel

## 🏗️ Architecture

```
User → Vercel API (extracts stream URL) → Client downloads from YouTube CDN
```

## 📦 Quick Deploy

### Option 1: Deploy Button (Fastest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/youtube-downloader-minimal)

### Option 2: Command Line

```bash
# Clone this folder
cd youtube-downloader/vercel-minimal

# Install dependencies
npm install

# Deploy to Vercel
npx vercel --prod
```

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📁 Project Structure

```
vercel-minimal/
├── app/
│   ├── api/
│   │   └── stream/route.ts    # Stream URL extraction
│   ├── globals.css            # Tailwind styles
│   ├── layout.tsx             # App layout
│   └── page.tsx               # Main UI
├── package.json               # Dependencies
├── vercel.json               # Vercel config
└── README.md                 # This file
```

## 💰 Cost Analysis

**Monthly Cost: $0**

- Vercel Free Tier includes:
  - 100GB bandwidth
  - 100,000 function invocations
  - Automatic HTTPS
  - Global CDN

For personal use, you'll never exceed the free tier.

## ⚡ How It Works

1. **User enters YouTube URL**
2. **API extracts direct stream URL** (no download)
3. **Client downloads directly** from YouTube's CDN
4. **No server storage** or processing needed

## 🔧 Configuration

### Quality Options

Edit `app/page.tsx` to add/remove quality options:

```typescript
<option value="4k">4K</option>
<option value="1080p">1080p HD</option>
<option value="720p">720p HD</option>
```

### Timeout Settings

Edit `vercel.json` to adjust timeout (max 10s on free tier):

```json
{
  "functions": {
    "app/api/stream/route.ts": {
      "maxDuration": 10
    }
  }
}
```

## 🚨 Important Notes

### Limitations

- **10-second timeout** - Works for video info extraction
- **Direct downloads only** - No server-side processing
- **Browser compatibility** - Modern browsers required

### Legal

- Personal use only
- Respect YouTube ToS
- Don't use for piracy

## 🐛 Troubleshooting

### "Invalid YouTube URL" error
- Ensure URL is a valid YouTube video link
- Try different video URLs

### Download doesn't start
- Right-click the opened tab and select "Save as..."
- Try a different browser

### Timeout errors
- Video might be restricted or private
- Try a different video

## 📈 Scaling Options

If you need more features:

1. **Vercel Pro** ($20/mo)
   - 60-second timeout
   - More bandwidth
   - Team features

2. **Add External Processing**
   - See `vercel-deployment-guide.md` for full architecture
   - Adds complexity but enables all features

## 🎯 Perfect For

- ✅ Personal use
- ✅ Quick deployments
- ✅ Learning projects
- ✅ Minimal maintenance
- ✅ Zero cost hosting

## 🚀 Deploy Now

Ready to deploy? It takes less than 5 minutes:

```bash
npx vercel --prod
```

Your app will be live at `https://your-app.vercel.app`

---

**That's it!** The simplest YouTube downloader that actually works. No complexity, no costs, just downloads.