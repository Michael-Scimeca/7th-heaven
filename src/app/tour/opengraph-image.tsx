import { ImageResponse } from 'next/og';
import { sanityFetch } from "@/sanity/live";
import { queries, SanityTourDate } from "@/lib/sanity";

export const runtime = 'edge';

// Image metadata
export const alt = '7th Heaven Tour Dates';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  let nextShow: SanityTourDate | null = null;
  
  try {
    const { data } = await sanityFetch({ query: queries.allTourDates });
    const shows = data as SanityTourDate[];
    
    // Find the next upcoming show
    const now = new Date();
    const upcoming = shows.filter(s => {
      if (!s.date) return false;
      return new Date(s.date) >= now;
    });
    
    if (upcoming.length > 0) {
      nextShow = upcoming[0];
    }
  } catch (e) {
    console.error(e);
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #0a0a10, #1a1025)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
          color: 'white',
        }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: -200,
          left: -200,
          width: 800,
          height: 800,
          background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <h1 style={{
            fontSize: 100,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            margin: 0,
            background: 'linear-gradient(to right, #fff, #a855f7)',
            backgroundClip: 'text',
            color: 'transparent',
          }}>
            7TH HEAVEN
          </h1>
          <p style={{
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
            margin: '20px 0 60px 0',
          }}>
            Official Tour
          </p>

          {nextShow ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: '2px solid rgba(168,85,247,0.3)',
              borderRadius: 24,
              padding: '40px 60px',
            }}>
              <span style={{ fontSize: 24, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a855f7', marginBottom: 10 }}>Next Show</span>
              <span style={{ fontSize: 60, fontWeight: 800, textAlign: 'center', maxWidth: 800 }}>{nextShow.venue}</span>
              <span style={{ fontSize: 30, color: 'rgba(255,255,255,0.7)', marginTop: 15 }}>
                {new Date(nextShow.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} — {nextShow.city}, {nextShow.state}
              </span>
            </div>
          ) : (
            <div style={{ fontSize: 40, color: 'rgba(255,255,255,0.8)', borderTop: '2px solid rgba(255,255,255,0.1)', paddingTop: 40 }}>
              Live in Concert
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
