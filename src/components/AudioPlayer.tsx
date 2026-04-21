"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import data from "../../public/data/albums.json";
import beHereLyrics from "../../public/data/lyrics/be-here.json";
import colorInMotionLyrics from "../../public/data/lyrics/color-in-motion.json";
import luminousLyrics from "../../public/data/lyrics/luminous.json";

const lyricsMap: Record<string, any> = {
  "01-be-here": beHereLyrics,
  "07-color-in-motion": colorInMotionLyrics,
  "09-luminous": luminousLyrics,
};

export default function AudioPlayerSection() {
 const [albums, setAlbums] = useState(data);
 const [activeAlbumIndex, setActiveAlbumIndex] = useState(() => Math.max(0, data.findIndex(a => a.id.includes('be-here'))));
 const [activeTrackIndex, setActiveTrackIndex] = useState(0);
 
 const [isPlaying, setIsPlaying] = useState(false);
 const [currentTime, setCurrentTime] = useState(0);
 const [duration, setDuration] = useState(0);
 const [volume, setVolume] = useState(0.8);
 const [prevVolume, setPrevVolume] = useState(0.8);
  const [showLyrics, setShowLyrics] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const originalCds = albums.filter(a => {
    const isMedley = a.title.toLowerCase().includes('medley');
    const isCover = a.title.toLowerCase().includes('cover') || a.title.toLowerCase() === 'unplugged';
    const isHoliday = a.title.toLowerCase().includes('christmas') || a.title.toLowerCase().includes('holiday');
    return !isMedley && !isCover && !isHoliday;
  }).sort((a, b) => parseInt(b.year) - parseInt(a.year));
  const medleyCds = albums.filter(a => a.title.toLowerCase().includes('medley')).sort((a, b) => parseInt(b.year) - parseInt(a.year));
  const coverCds = albums.filter(a => a.title.toLowerCase().includes('cover') || a.title.toLowerCase() === 'unplugged').sort((a, b) => parseInt(b.year) - parseInt(a.year));
  const holidayCds = albums.filter(a => a.title.toLowerCase().includes('christmas') || a.title.toLowerCase().includes('holiday')).sort((a, b) => parseInt(b.year) - parseInt(a.year));

  const renderAlbumList = (categoryAlbums: typeof albums, title: string) => (
    <div className="mb-10">
      <h3 className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-white/50 mb-6">{title}</h3>
      <ul className="flex flex-col gap-4">
      {categoryAlbums.map((album) => {
        const originalIdx = albums.findIndex(a => a.id === album.id);
        return (
          <li key={album.id}>
           <button 
           onClick={() => { setActiveAlbumIndex(originalIdx); setActiveTrackIndex(0); setIsPlaying(false); sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
           className={`w-full flex items-center justify-between text-left group transition-all gap-3 overflow-hidden`}
           >
           <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
           {album.image && (
           <div className="relative w-8 h-8 shrink-0 bg-white/5 border border-white/5 shadow-md">
           <Image src={album.image} alt={album.title} fill style={{ objectFit: 'cover' }} />
           </div>
           )}
           <span className={`text-[0.75rem] font-bold uppercase tracking-widest leading-normal ${originalIdx === activeAlbumIndex ? 'text-[var(--color-accent)]' : 'text-[#a0a0b8] group-hover:text-white'}`}>
           {album.title.replace(/&apos;/gi, "'").replace(/&amp;/gi, "&")}
           </span>
           </div>
           
           </button>
          </li>
        );
      })}
      </ul>
    </div>
  );

 const toggleMute = () => {
   if (volume > 0) {
     setPrevVolume(volume);
     setVolume(0);
   } else {
     setVolume(prevVolume > 0 ? prevVolume : 0.8);
   }
 };

 const activeAlbum = albums[activeAlbumIndex];
 const activeTrack = activeAlbum?.tracks[activeTrackIndex];

 // Initialize audio element
 useEffect(() => {
 if (!audioRef.current) {
 audioRef.current = new Audio();
 }
 const audio = audioRef.current;
 
 const setAudioData = () => setDuration(audio.duration);
 const setAudioTime = () => setCurrentTime(audio.currentTime);
 const setAudioEnd = () => handleNext();

 audio.addEventListener("loadeddata", setAudioData);
 audio.addEventListener("timeupdate", setAudioTime);
 audio.addEventListener("ended", setAudioEnd);
 
 return () => {
 audio.removeEventListener("loadeddata", setAudioData);
 audio.removeEventListener("timeupdate", setAudioTime);
 audio.removeEventListener("ended", setAudioEnd);
 audio.pause();
 if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
 };
 }, []);

 // Update audio source when track changes — uses blob URL for protection
 const blobUrlRef = useRef<string | null>(null);

 useEffect(() => {
 if (!audioRef.current || !activeTrack) return;

 const wasPlaying = !audioRef.current.paused || isPlaying;
 
 // Revoke previous blob URL to free memory
 if (blobUrlRef.current) {
   URL.revokeObjectURL(blobUrlRef.current);
   blobUrlRef.current = null;
 }

 // Pause current playback while loading
 audioRef.current.pause();

 const controller = new AbortController();

 fetch(`/api/audio?t=${btoa(activeTrack.file)}`, { signal: controller.signal })
   .then(res => res.blob())
   .then(blob => {
     if (controller.signal.aborted) return;
     const blobUrl = URL.createObjectURL(blob);
     blobUrlRef.current = blobUrl;
     if (audioRef.current) {
       audioRef.current.src = blobUrl;
       audioRef.current.load();
       if (wasPlaying) {
         audioRef.current.play().catch(e => console.log("Autoplay prevented:", e));
         setIsPlaying(true);
       }
     }
   })
   .catch(err => {
     if (err.name !== 'AbortError') {
       console.error("Failed to load track:", err);
     }
   });

 return () => controller.abort();
 }, [activeTrackIndex, activeAlbumIndex]);

 useEffect(() => {
 if (audioRef.current) {
 audioRef.current.volume = volume;
 }
 }, [volume]);

 const togglePlay = () => {
 if (!audioRef.current || !activeTrack) return;
 if (isPlaying) {
 audioRef.current.pause();
 } else {
 audioRef.current.play().catch(e => console.log("Play prevented:", e));
 }
 setIsPlaying(!isPlaying);
 };

 const handleNext = () => {
 if (!activeAlbum) return;
 if (activeTrackIndex < activeAlbum.tracks.length - 1) {
 setActiveTrackIndex(activeTrackIndex + 1);
 } else {
 setActiveTrackIndex(0); // Loop back or stop
 }
 };

 const handlePrev = () => {
 if (currentTime > 3) {
 if (audioRef.current) audioRef.current.currentTime = 0;
 } else if (activeTrackIndex > 0) {
 setActiveTrackIndex(activeTrackIndex - 1);
 }
 };

 const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
 const time = Number(e.target.value);
 if (audioRef.current) {
 audioRef.current.currentTime = time;
 setCurrentTime(time);
 }
 };

 const formatTime = (time: number) => {
 if (isNaN(time)) return "0:00";
 const minutes = Math.floor(time / 60);
 const seconds = Math.floor(time % 60);
 return `${minutes}:${seconds.toString().padStart(2, '0')}`;
 };

  const cleanTitle = (str: string) => str.replace(/^\d+\s*/, '').replace(/\.mp3$/i, '').replace(/&apos;/gi, "'").replace(/&amp;/gi, "&");

 const getDummyDuration = (title: string, idx: number) => {
    // Generate a consistent dummy duration between 3:00 and 5:20 based on track name
    const totalSeconds = 180 + ((title.length * 13 + idx * 37) % 140);
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

 return (
 <section ref={sectionRef} className="bg-[var(--color-bg-primary)]" id="music-player-section">
 <div className="flex flex-col lg:flex-row lg:items-start border-y border-[var(--color-border)]">
 
 {/* --- SIDEBAR --- */}
 <div className="w-full lg:w-[320px] bg-[#0a0a0f] border-r border-[#1a1a24] p-8 flex flex-col shrink-0 relative z-10 hidden lg:flex">
 
  <div className="flex-1 pr-4">
    {renderAlbumList(originalCds, "Original CD's")}
    {renderAlbumList(medleyCds, "Medley CD's")}
    {renderAlbumList(coverCds, "Cover CD's")}
    {renderAlbumList(holidayCds, "Holiday CD's")}
  </div>
 </div>

 {/* --- MAIN AREA --- */}
 <div className="flex-1 relative flex flex-col bg-[#0b0b10] lg:sticky lg:top-[72px] lg:self-start lg:max-h-[calc(100vh-72px)]">
 
   {/* Player Panel Frame */}
   <div className="flex-1 min-h-0 flex flex-col w-full">
   
   {/* Panel Header */}
   <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#0b0b10]">
   <div className="flex gap-8 max-sm:gap-4 overflow-x-auto">
      <div className="text-[0.65rem] font-bold text-white/40 uppercase tracking-[0.2em] whitespace-nowrap flex items-center">
        <span>AVAILABLE ON </span>
        {activeAlbum?.spotifyUrl ? (
          <a href={activeAlbum.spotifyUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:text-white transition-colors cursor-pointer ml-2">SPOTIFY</a>
        ) : (
          <span className="ml-2">SPOTIFY</span>
        )}
        <span className="mx-2">OR</span>
        {activeAlbum?.appleMusicUrl ? (
          <a href={activeAlbum.appleMusicUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:text-white transition-colors cursor-pointer">APPLE MUSIC</a>
        ) : (
          <span>APPLE MUSIC</span>
        )}
      </div>
   </div>
 </div>

  {/* Tracklist & Credits Wrapper */}
  <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
    
    {/* Tracklist */}
    <div className="flex-1 overflow-y-auto px-0 pt-0 custom-scrollbar">
    {activeAlbum?.tracks.map((track, idx) => {
    const isActive = idx === activeTrackIndex;
    const trackNumber = String(idx + 1).padStart(2, '0');
    const cleanName = cleanTitle(track.title);
    
    return (
    <div 
    key={idx}
    className={`group flex items-center justify-between px-8 py-5 cursor-pointer transition-all select-none ${isActive ? 'bg-[var(--color-accent)]/15 border-l-2 border-[var(--color-accent)]' : 'border-l-2 border-transparent hover:bg-white/5'}`}
    onClick={() => {
    if (isActive) togglePlay();
    else {
    setActiveTrackIndex(idx);
    setIsPlaying(true);
    }
    }}
    >
    <div className="flex items-center gap-6">
    <span className={`text-[0.7rem] font-bold tracking-widest w-6 text-left ${isActive ? 'text-[var(--color-accent)]' : 'text-white/30'}`}>
    {trackNumber}
    </span>
       <span className={`text-[0.85rem] font-semibold tracking-wide truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] ${isActive ? 'text-[var(--color-accent)] drop-shadow-[0_0_8px_rgba(133,29,239,0.5)]' : 'text-white/80 group-hover:text-white transition-colors'}`}>
         {cleanName}
       </span>
    </div>
    
    {/* Display duration */}
    <span className={`text-[0.7rem] font-bold tracking-widest mr-4 ${isActive ? 'text-[var(--color-accent)]' : 'text-white/30'}`}>
      {isActive && duration ? formatTime(duration) : getDummyDuration(track.title, idx)}
    </span>
  
    </div>
    );
    })}
    </div>

    {/* Credits Sidebar */}
    {(activeAlbum?.lineup?.length > 0 || activeAlbum?.credits?.length > 0) ? (
      <div className="w-full lg:w-[350px] bg-black p-8 shrink-0 overflow-y-auto scrollbar-hide border-l border-white/5 hidden lg:flex lg:flex-col">
        <div>
          {activeAlbum?.lineup?.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-bold text-white mb-3">Line-Up</h3>
              <ul className="flex flex-col gap-1.5 text-[0.85rem] text-white/50">
                {activeAlbum.lineup.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          {activeAlbum?.credits?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-3">Credits</h3>
              <ul className="flex flex-col gap-1.5 text-[0.85rem] text-white/50">
                {activeAlbum.credits.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Lyrics Button */}
          {lyricsMap[activeAlbum?.id] && (
            <button
              onClick={() => setShowLyrics(true)}
              className="text-[var(--color-accent)] hover:text-white text-[0.9rem] font-bold transition-colors cursor-pointer text-left mt-2"
            >
              Lyrics
            </button>
          )}

        {/* Buy / Stream Buttons */}
        <div className="pt-4 border-t border-white/10 mt-6 flex flex-col gap-2">
          {(activeAlbum?.paypalButtonId || activeAlbum?.storeUrl) && (
            <a
              href={activeAlbum?.paypalButtonId 
                ? `https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=${activeAlbum.paypalButtonId}` 
                : activeAlbum?.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-[0.7rem] uppercase tracking-widest py-2 px-4 rounded transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Buy CD
            </a>
          )}
          <div className="flex gap-2">
            {activeAlbum?.spotifyUrl && (
              <a
                href={activeAlbum.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#1DB954]/10 hover:bg-[#1DB954]/25 border border-[#1DB954]/20 text-[#1DB954] font-bold text-[0.65rem] uppercase tracking-widest py-1.5 px-3 rounded transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                Spotify
              </a>
            )}
            {activeAlbum?.appleMusicUrl && (
              <a
                href={activeAlbum.appleMusicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#FC3C44]/10 hover:bg-[#FC3C44]/25 border border-[#FC3C44]/20 text-[#FC3C44] font-bold text-[0.65rem] uppercase tracking-widest py-1.5 px-3 rounded transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.802.42.127.856.187 1.297.228.56.053 1.122.07 1.684.077.55.006 1.1.008 1.65.006h7.7c.51 0 1.02-.006 1.53-.022.62-.02 1.24-.05 1.85-.17.93-.18 1.77-.545 2.468-1.188.71-.654 1.18-1.454 1.434-2.38.167-.604.234-1.224.27-1.848.03-.503.04-1.008.047-1.512V6.124zm-6.772 8.89v3.63c0 .27-.04.533-.15.78a1.57 1.57 0 01-.967.876c-.383.14-.78.2-1.18.228-.5.03-1.003.003-1.48-.177a1.6 1.6 0 01-1.028-.975c-.167-.44-.103-.87.098-1.288.26-.545.718-.87 1.272-1.06.44-.15.9-.213 1.36-.287.31-.05.62-.098.92-.183.2-.06.32-.18.37-.39.01-.03.01-.06.01-.09V9.43c0-.09-.023-.16-.1-.21-.06-.04-.13-.03-.2-.02l-4.87 1.06c-.04.01-.07.02-.1.03-.1.04-.15.11-.16.22v6.24c.005.07.003.14 0 .21-.03.56-.07 1.12-.38 1.62-.29.48-.7.79-1.22.96-.37.12-.76.16-1.15.18-.47.02-.94-.02-1.39-.18-.61-.22-1.03-.62-1.19-1.26-.12-.47-.06-.93.16-1.37.27-.54.71-.87 1.27-1.06.44-.15.9-.21 1.36-.29.3-.05.6-.09.9-.18.19-.06.32-.18.37-.39.01-.03.01-.06.01-.09V7.54c0-.2.06-.36.22-.47.09-.06.18-.1.28-.12l6.2-1.35c.17-.04.34-.07.51-.08.26-.01.42.13.45.39.01.06.01.12.01.18v8.94z"/></svg>
                Apple
              </a>
            )}
          </div>
        </div>
        </div>
      </div>
    ) : (
      <div className="w-full lg:w-[350px] bg-black shrink-0 border-l border-white/5 hidden lg:flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated gradient orb */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[300px] h-[300px] rounded-full opacity-20 blur-[80px] animate-[orbPulse_8s_ease-in-out_infinite]"
            style={{ background: 'radial-gradient(circle, var(--color-accent), #3b82f6, transparent)' }}
          />
        </div>

        {/* Equalizer bars */}
        <div className="relative z-[2] flex items-end gap-[3px] h-[80px] mb-8">
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="w-[4px] rounded-full bg-gradient-to-t from-[var(--color-accent)]/60 to-[var(--color-accent)]/20"
              style={{
                animationName: 'eqBar',
                animationDuration: `${0.8 + Math.random() * 0.8}s`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDirection: 'alternate',
                animationDelay: `${i * 0.05}s`,
                height: `${15 + Math.random() * 50}px`,
              }}
            />
          ))}
        </div>

        {/* Album art silhouette */}
        <div className="relative z-[2] w-[120px] h-[120px] border border-white/5 rounded-sm mb-6 flex items-center justify-center bg-white/[0.02]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white/10">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>

        <span className="relative z-[2] text-[0.6rem] uppercase tracking-[0.2em] text-white/20 text-center font-bold">
          Select an album<br/>with credits
        </span>

      </div>
    )}
  </div>
 </div>

 {/* Lyrics Modal */}
 {showLyrics && (() => {
   const lyricsData = lyricsMap[activeAlbum?.id];
   const activeTrack = activeAlbum?.tracks?.[activeTrackIndex];
   const trackTitle = activeTrack?.title?.replace(/^\d+\s*/, '');
   const songLyrics = lyricsData?.songs?.find((s: any) => {
     const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
     return clean(s.title) === clean(trackTitle || '');
   });
   return (
     <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md" onClick={() => setShowLyrics(false)}>
       <div className="relative w-full max-w-[600px] max-h-[85vh] bg-[#0d0d14] border border-white/10 rounded-xl overflow-hidden flex flex-col mx-4" onClick={e => e.stopPropagation()}>
         {/* Modal Header */}
         <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-[#0a0a10] shrink-0">
           <div className="min-w-0">
             <h3 className="text-lg font-bold text-white truncate">{trackTitle}</h3>
             <p className="text-xs text-white/40 uppercase tracking-widest mt-1">{activeAlbum?.title?.replace(/&apos;/gi, "'").replace(/&amp;/gi, "&")}</p>
           </div>
           <button onClick={() => setShowLyrics(false)} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors shrink-0 ml-4">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
           </button>
         </div>
         {/* Modal Body */}
         <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
           {songLyrics?.lyrics && Object.keys(songLyrics.lyrics).length > 0 ? (
             Object.entries(songLyrics.lyrics).map(([section, text]: [string, any]) => (
               <div key={section} className="mb-6">
                 <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]/60 mb-2 block">{section.replace(/_/g, ' ').replace(/\d+$/, '')}</span>
                 <p className="text-[0.9rem] text-white/70 leading-relaxed whitespace-pre-line">{text}</p>
               </div>
             ))
           ) : null}
         </div>
       </div>
     </div>
   );
 })()}

 {/* --- PLAY CONTROLS STRIP --- */}
 <div className="bg-[#0b0b0f] border-t border-[var(--color-border)] h-[80px] flex items-center pr-4 md:pr-8 pl-0 gap-6 sticky bottom-0 left-0 right-0 z-[50]">
 
   {/* Album Cover & Play Button Overlay */}
   <div 
     className="relative w-[80px] h-full shrink-0 cursor-pointer group shadow-[4px_0_15px_rgba(0,0,0,0.5)] z-20"
     onClick={togglePlay}
   >
     {activeAlbum?.image ? (
       <Image src={activeAlbum.image} alt="Cover" fill style={{ objectFit: 'cover' }} className="transition-transform group-hover:scale-105" />
     ) : (
       <div className="w-full h-full bg-[#111]" />
     )}
     <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
       <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center bg-black/20 backdrop-blur-sm shadow-lg transform group-hover:scale-110 transition-transform">
         {isPlaying ? (
           <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
         ) : (
           <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white ml-[2px]"><path d="M8 5v14l11-7z"/></svg>
         )}
       </div>
     </div>
    </div>

    {/* Song Title */}
    <div className="min-w-0 max-w-[150px] shrink-0 hidden md:block">
      <p className="text-sm font-bold text-white truncate">{activeTrack?.title?.replace(/^\d+\s*/, '').replace(/&apos;/g, "'").replace(/&amp;/g, "&")}</p>
      <p className="text-[0.65rem] text-white/40 truncate">{activeAlbum?.title?.replace(/&apos;/g, "'").replace(/&amp;/g, "&")}</p>
    </div>

   {/* Prev / Next Controls */}
   <div className="flex items-center gap-4 shrink-0 ml-4">
     <button className="text-white/50 hover:text-white transition-colors" onClick={handlePrev}>
       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
     </button>
     
     {/* Play / Pause */}
     <button className="text-white hover:scale-110 transition-transform" onClick={togglePlay}>
       {isPlaying ? (
         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
       ) : (
         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-[2px]"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
       )}
     </button>

     <button className="text-white/50 hover:text-white transition-colors" onClick={handleNext}>
       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
     </button>
   </div>

    {/* Current Time */}
    <div className="text-[0.75rem] font-bold tracking-widest text-white ml-2 hidden sm:block">
      {formatTime(currentTime)}
    </div>

   {/* Progress Bar */}
    <div className="relative flex-1 h-[4px] bg-white/10 group mx-4 hidden sm:block max-w-[800px]">
      <input 
        type="range" 
        min="0" 
        max={duration || 100} 
        value={currentTime} 
        onChange={handleSeek}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div 
        className="absolute top-0 left-0 h-full bg-[var(--color-accent)] pointer-events-none transition-colors"
        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
      >
        {/* Indicator Dot */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
      </div>
    </div>
    
    {/* Full Time */}
    <div className="text-[0.75rem] font-bold tracking-widest text-white mr-2 hidden sm:block">
      {duration ? formatTime(duration) : getDummyDuration(activeTrack?.title || '', activeTrackIndex)}
    </div>

   {/* Right Controls (Shuffle & Volume) */}
   <div className="flex items-center gap-6 shrink-0 ml-auto">
 
     {/* Volume */}
     <div className="flex items-center gap-3 w-[100px] hidden md:flex">
       <svg 
         width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
         className="text-white/50 shrink-0 cursor-pointer hover:text-white transition-colors"
         onClick={toggleMute}
       >
         {volume === 0 ? (
           <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></>
         ) : volume < 0.5 ? (
           <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></>
         ) : (
           <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></>
         )}
       </svg>
       <div className="relative flex-1 h-1 bg-white/20 ">
         <input 
           type="range" 
           min="0" 
           max="1" 
           step="0.05"
           value={volume} 
           onChange={(e) => setVolume(Number(e.target.value))}
           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
         />
         <div 
           className="absolute top-0 left-0 h-full bg-[var(--color-accent)] pointer-events-none"
           style={{ width: `${volume * 100}%` }}
         />
       </div>
     </div>
   </div>
 </div>
 
 </div>
 </div>

 <style jsx global>{`
 .custom-scrollbar::-webkit-scrollbar {
 width: 4px;
 }
 .custom-scrollbar::-webkit-scrollbar-track {
 background: transparent;
 }
 .custom-scrollbar::-webkit-scrollbar-thumb {
 background: #851DEF;
 }
 .custom-scrollbar:hover::-webkit-scrollbar-thumb {
 background: #7c3aed;
 }
 @keyframes eqBar {
  0% { transform: scaleY(0.3); opacity: 0.4; }
  100% { transform: scaleY(1); opacity: 1; }
 }
 @keyframes orbPulse {
  0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.15; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 0.3; }
 }
 `}</style>
 </section>
 );
}
