import { NextResponse } from 'next/server';

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const trimmedUrl = url.trim();
    const ytId = extractYouTubeId(trimmedUrl);

    if (ytId) {
      // 1. Fetch YouTube oEmbed metadata for real title & channel name
      let title = 'YouTube Meeting Recording';
      let channel = 'YouTube Channel';
      let thumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      let description = '';

      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          title = oembedData.title || title;
          channel = oembedData.author_name || channel;
          if (oembedData.thumbnail_url) {
            thumbnailUrl = oembedData.thumbnail_url;
          }
        }
      } catch (e) {
        console.warn('YouTube oEmbed fetch failed, using default video info:', e);
      }

      // 2. Fetch YouTube HTML page to extract detailed videoDetails and captions
      let rawCaptionsText = '';
      let timedCaptions: Array<{ startSec: number; startTime: string; text: string }> = [];

      try {
        const pageRes = await fetch(`https://www.youtube.com/watch?v=${ytId}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        });
        if (pageRes.ok) {
          const pageHtml = await pageRes.text();

          // Extract title, author, description from ytInitialPlayerResponse
          const match = pageHtml.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
          if (match) {
            try {
              const data = JSON.parse(match[1]);
              const details = data?.videoDetails;
              if (details) {
                title = details.title || title;
                channel = details.author || channel;
                description = details.shortDescription || description;
              }
              const captionTracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
              if (captionTracks.length > 0) {
                const englishTrack = captionTracks.find((t: any) => t.languageCode === 'en' || t.vssId?.includes('en')) || captionTracks[0];
                if (englishTrack && englishTrack.baseUrl) {
                  // Try JSON3 format first
                  const jsonUrl = englishTrack.baseUrl.includes('fmt=') ? englishTrack.baseUrl : `${englishTrack.baseUrl}&fmt=json3`;
                  try {
                    const capRes = await fetch(jsonUrl, {
                      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                    });
                    if (capRes.ok) {
                      const capData = await capRes.json().catch(() => null);
                      if (capData && capData.events) {
                        for (const ev of capData.events) {
                          if (ev.segs && ev.segs.length > 0) {
                            const segText = ev.segs.map((s: any) => s.utf8 || '').join('').replace(/\n/g, ' ').trim();
                            if (segText && segText !== '\n') {
                              const startSec = Math.floor((ev.tStartMs || 0) / 1000);
                              const min = String(Math.floor(startSec / 60)).padStart(2, '0');
                              const sec = String(startSec % 60).padStart(2, '0');
                              timedCaptions.push({ startSec, startTime: `${min}:${sec}`, text: segText });
                            }
                          }
                        }
                      }
                    }
                  } catch (e) {}

                  // Fallback to XML parsing if JSON3 yielded no lines
                  if (timedCaptions.length === 0) {
                    const xmlRes = await fetch(englishTrack.baseUrl, {
                      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                    });
                    if (xmlRes.ok) {
                      const xmlText = await xmlRes.text();
                      const textRegex = /<text start="([\d\.]+)"[^>]*>([^<]+)<\/text>/g;
                      let m;
                      while ((m = textRegex.exec(xmlText)) !== null) {
                        const startSec = Math.floor(parseFloat(m[1]));
                        const textContent = m[2]
                          .replace(/&amp;/g, '&')
                          .replace(/&lt;/g, '<')
                          .replace(/&gt;/g, '>')
                          .replace(/&quot;/g, '"')
                          .replace(/&#39;/g, "'")
                          .trim();
                        if (textContent) {
                          const min = String(Math.floor(startSec / 60)).padStart(2, '0');
                          const sec = String(startSec % 60).padStart(2, '0');
                          timedCaptions.push({ startSec, startTime: `${min}:${sec}`, text: textContent });
                        }
                      }
                    }
                  }

                  if (timedCaptions.length > 0) {
                    rawCaptionsText = timedCaptions.map((l) => l.text).join(' ');
                  }
                }
              }
            } catch (e) {}
          }

          if (!description) {
            const descMatch = pageHtml.match(/<meta\s+name="description"\s+content="([^"]+)"/i) ||
                              pageHtml.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
            if (descMatch) description = descMatch[1].trim();
          }
        }
      } catch (e) {
        console.warn('Direct YouTube metadata/caption extraction attempt ended:', e);
      }

      return NextResponse.json({
        success: true,
        type: 'youtube',
        videoId: ytId,
        url: `https://www.youtube.com/watch?v=${ytId}`,
        embedUrl: `https://www.youtube.com/embed/${ytId}`,
        title,
        channel,
        description,
        thumbnailUrl,
        rawCaptionsText: rawCaptionsText || undefined,
        timedCaptions: timedCaptions.length > 0 ? timedCaptions : undefined,
      });
    }

    // Generic Web / Zoom / Google Meet / Loom URL
    let domain = 'Web Link';
    let extractedTitle = '';
    try {
      const targetUrl = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;
      const parsedUrl = new URL(targetUrl);
      domain = parsedUrl.hostname.replace('www.', '');

      const fetchRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(3500),
      }).catch(() => null);

      if (fetchRes && fetchRes.ok) {
        const html = await fetchRes.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          extractedTitle = titleMatch[1].trim().replace(/\s+/g, ' ');
        }
      }
    } catch (e) {}

    if (!extractedTitle) {
      if (trimmedUrl.includes('zoom.')) extractedTitle = 'Zoom Cloud Recording & Strategy Meeting';
      else if (trimmedUrl.includes('meet.google.')) extractedTitle = 'Google Meet Operational Sync';
      else if (trimmedUrl.includes('loom.com')) extractedTitle = 'Loom Video Briefing & Code Architecture Review';
      else if (trimmedUrl.includes('vimeo.com')) extractedTitle = 'Vimeo Executive Presentation Recording';
      else extractedTitle = `${domain.toUpperCase()} Operational Meeting Session`;
    }

    return NextResponse.json({
      success: true,
      type: 'web_link',
      url: trimmedUrl,
      title: extractedTitle,
      domain,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transcript from URL' },
      { status: 500 }
    );
  }
}
