"use client";

import { useState, useEffect, useRef } from 'react';
import { useMember } from '@/context/MemberContext';

export default function FeaturedTrack({ mini = false }: { mini?: boolean }) {
  const { isLoggedIn, openModal } = useMember();
  const [track, setTrack] = useState<any>(null);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const prevVolumeRef = useRef(0.8);
  const [isCompressorActive, setIsCompressorActive] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const compressorNodeRef = useRef<DynamicsCompressorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const currentSongIndexRef = useRef(currentSongIndex);
  const trackRef = useRef<any>(null);

  useEffect(() => {
    currentSongIndexRef.current = currentSongIndex;
  }, [currentSongIndex]);

  useEffect(() => {
    trackRef.current = track;
  }, [track]);

  useEffect(() => {
    setCurrentSongIndex(0);
  }, [track?.id]);

  const fetchTrack = async () => {
    try {
      const res = await fetch('/api/featured-track');
      const data = await res.json();
      if (data.track) {
        setTrack(data.track);
        setLocked(false);
      } else if (data.locked) {
        setTrack(null);
        setLocked(true);
      } else {
        setTrack(null);
        setLocked(false);
      }
    } catch (err) {
      console.error("Error fetching featured track:", err);
    } finally {
      setLoading(false);
    }
  };

  const initWebAudio = () => {
    if (!audioRef.current || audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const source = ctx.createMediaElementSource(audioRef.current);

      const compressor = ctx.createDynamicsCompressor();
      const gain = ctx.createGain();

      // Configure compressor with standard mastering settings
      compressor.threshold.setValueAtTime(-18, ctx.currentTime);
      compressor.knee.setValueAtTime(30, ctx.currentTime);
      compressor.ratio.setValueAtTime(isCompressorActive ? 12 : 1, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      // Gain boost: if active, give it a nice mastering makeup gain of +6dB (about 2.0x gain)
      gain.gain.setValueAtTime(isCompressorActive ? 2.0 : 1.0, ctx.currentTime);

      source.connect(compressor);
      compressor.connect(gain);
      gain.connect(ctx.destination);

      audioCtxRef.current = ctx;
      compressorNodeRef.current = compressor;
      gainNodeRef.current = gain;
    } catch (err) {
      console.warn("Web Audio API not fully supported or blocked:", err);
    }
  };

  const toggleCompressor = async () => {
    initWebAudio();

    const nextState = !isCompressorActive;
    setIsCompressorActive(nextState);

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume().catch(e => console.warn(e));
    }

    const ctx = audioCtxRef.current;
    const compressor = compressorNodeRef.current;
    const gain = gainNodeRef.current;

    if (ctx && compressor && gain) {
      const time = ctx.currentTime;
      if (nextState) {
        compressor.ratio.setValueAtTime(12, time);
        gain.gain.linearRampToValueAtTime(2.0, time + 0.05);
      } else {
        compressor.ratio.setValueAtTime(1, time);
        gain.gain.linearRampToValueAtTime(1.0, time + 0.05);
      }
    }
  };

  useEffect(() => {
    fetchTrack();
    // Poll for changes or expiration every 30 seconds
    const interval = setInterval(fetchTrack, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Handle play/pause, volume, seek, listeners
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const setAudioEnd = () => {
      const songs = trackRef.current?.songs || [];
      const nextIndex = currentSongIndexRef.current + 1;
      if (nextIndex < songs.length) {
        setCurrentSongIndex(nextIndex);
        setIsPlaying(true);
      } else {
        setCurrentSongIndex(0);
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          setCurrentTime(0);
        }
      }
    };

    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", setAudioEnd);

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", setAudioEnd);
      audio.pause();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(e => console.warn("Error closing AudioContext:", e));
      }
    };
  }, []);

  // Update source when current song URL changes
  const currentSong = track?.songs?.[currentSongIndex] || null;

  useEffect(() => {
    if (audioRef.current && currentSong?.audio_url) {
      const wasPlaying = isPlaying;
      audioRef.current.src = currentSong.audio_url;
      audioRef.current.load();
      setCurrentTime(0);
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended' && wasPlaying) {
        audioCtxRef.current.resume().catch(e => console.warn(e));
      }
      if (wasPlaying) {
        audioRef.current.play().catch(e => console.log("Play prevented:", e));
      }
    }
  }, [currentSong?.audio_url]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = async () => {
    if (!audioRef.current || !track) return;

    // Init Web Audio on first user interaction to comply with autoplay policy
    initWebAudio();
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume().catch(e => console.warn(e));
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.warn("Audio play error:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      prevVolumeRef.current = volume;
      setVolume(0);
    } else {
      setVolume(prevVolumeRef.current > 0 ? prevVolumeRef.current : 0.8);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) return null; // Wait for fetch

  if (!track && !locked) return null; // No active drop

  // ─── Mini variant for hero embedding ───
  if (mini) {
    return (
      <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-lg p-3 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.7)] h-full">
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[var(--font-size-4xs)] font-black uppercase tracking-[0.2em] text-cyan-400">Now Playing</span>
        </div>

        {locked ? (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center text-sm shrink-0">🔒</div>
            <div className="flex-1 min-w-0">
              <p className="text-[var(--font-size-3xs)] font-bold text-white/60 truncate">Exclusive Fan Drop</p>
              <button type="button" onClick={() => openModal('login')} className="text-[var(--font-size-4xs)] font-bold  text-[var(--color-accent)] hover:text-white uppercase tracking-widest transition-colors cursor-pointer mt-0.5">Login to unlock</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              {/* Mini vinyl */}
              <button type="button" onClick={togglePlay} className="relative w-10 h-10 shrink-0 rounded-full border border-white/15 bg-black flex items-center justify-center cursor-pointer group overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-tr from-[var(--color-accent)]/40 to-cyan-500/20 ${isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''}`} />
                <div className="relative z-10 w-4 h-4 rounded-full bg-black/80 flex items-center justify-center">
                  {isPlaying ? (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                  ) : (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="white" className="ml-[1px]"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  )}
                </div>
              </button>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-white truncate leading-tight uppercase italic" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                  {track.title}
                </h4>
                {currentSong && (
                  <p className="text-[var(--font-size-4xs)] text-white/30 truncate mt-0.5">{currentSong.title}</p>
                )}
              </div>

              {/* Mini EQ bars */}
              <div className="flex items-end gap-1 h-[16px] shrink-0">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-[2px] rounded-full bg-[var(--color-accent)]/80"
                    style={{
                      animationName: isPlaying ? 'eqBarShort' : 'none',
                      animationDuration: `${0.6 + Math.random() * 0.6}s`,
                      animationTimingFunction: 'ease-in-out',
                      animationIterationCount: 'infinite',
                      animationDirection: 'alternate',
                      animationDelay: `${i * 0.05}s`,
                      height: isPlaying ? '14px' : '4px',
                      transformOrigin: 'bottom',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Mini progress bar */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[var(--font-size-5xs)] font-mono font-bold text-white/30 min-w-[22px]">{formatTime(currentTime)}</span>
              <div className="relative flex-1 h-[2px] bg-white/10 rounded-full">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--color-accent)] to-cyan-400 rounded-full pointer-events-none"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[var(--font-size-5xs)] font-mono font-bold text-white/30 min-w-[22px] text-right">{duration ? formatTime(duration) : '0:00'}</span>
            </div>

            {/* Mini playlist list */}
            {track.songs && track.songs.length > 1 && (
              <div className="mt-2.5 pt-2.5 border-t border-white/5 space-y-1 max-h-[110px] overflow-y-auto pr-1 select-none">
                {track.songs.map((song: any, idx: number) => {
                  const isActive = idx === currentSongIndex;
                  return (
                    <button
                      key={song.id || idx}
                      type="button"
                      onClick={() => {
                        setCurrentSongIndex(idx);
                        setIsPlaying(true);
                      }}
                      className={`w-full flex items-center justify-between p-1.5 rounded text-left transition-colors cursor-pointer ${isActive
                          ? 'bg-[var(--color-accent)]/15 text-white'
                          : 'text-white/40 hover:bg-white/[0.02] hover:text-white/70'
                        }`}
                    >
                      <span className="text-[var(--font-size-4xs)] font-bold truncate pr-2">
                        {String(idx + 1).padStart(2, '0')}. {song.title}
                      </span>
                      {isActive && isPlaying ? (
                        <span className="text-[var(--font-size-5xs)]  text-[var(--color-accent)] font-bold animate-pulse uppercase shrink-0">Playing</span>
                      ) : (
                        <span className="text-[var(--font-size-5xs)] text-white/25 uppercase font-medium shrink-0">MP3</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        <style jsx>{`
          @keyframes eqBarShort {
            0% { transform: scaleY(0.2); }
            100% { transform: scaleY(1); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <section className="relative py-16 bg-[var(--color-bg-primary)] border-y border-white/5 overflow-hidden">
      {/* Visual background lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-[0.08] blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--color-accent), #3b82f6, transparent)' }}
      />

      <div className="site-container relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 justify-center">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-ping" />
            <span className="text-xs font-black uppercase tracking-[0.25em]  text-[var(--color-accent)]">Latest Track Drop</span>
          </div>

          {locked ? (
            /* Locked Panel (Fans Only, logged out) */
            <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 sm:p-12 text-center transition-colors duration-300 hover:border-white/20">
              <div className="w-16 h-16 mx-auto mb-6 bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center text-2xl shadow-inner  text-[var(--color-accent)] animate-pulse">
                🔒
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                Exclusive Fan Release
              </h3>
              <p className="text-white/45 text-sm leading-relaxed max-w-md mx-auto mb-8">
                The band dropped an exclusive new song or soundtrack just for our registered fans. Sign in or sign up free to unlock listening!
              </p>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => openModal('login')}
                  className="px-8 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors hover:scale-[1.02] active:scale-[0.98] shadow-[var(--color-accent)]/20 cursor-pointer"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => openModal('signup')}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Join Fan Club
                </button>
              </div>
            </div>
          ) : (
            /* Active Player Widget */
            <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6 justify-between">

                {/* Visual Cover/Vinyl */}
                <div className="relative w-20 h-20 shrink-0 rounded-full border-2 border-white/15 bg-black flex items-center justify-center overflow-hidden group">
                  <div className={`absolute inset-0 bg-gradient-to-tr from-[var(--color-accent)]/40 to-cyan-500/20 ${isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''}`} />
                  <div className="relative z-10 w-6 h-6 rounded-full bg-[var(--color-bg-primary)] border border-white/10 flex items-center justify-center text-xs">
                    💿
                  </div>
                </div>

                {/* Track Details */}
                <div className="flex-1 text-center md:text-left min-w-0">
                  <span className="text-[0.6rem] uppercase tracking-widest bg-[var(--color-accent)]/20  text-[var(--color-accent)] border border-[var(--color-accent)]/30 px-2 py-0.5 rounded-full font-bold">
                    {track.visibility === 'fans' ? 'Exclusive Fan Drop 🔒' : 'Public Release 🔓'}
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-white mt-2 truncate leading-tight tracking-tight uppercase italic" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                    {track.title}
                  </h4>
                  {currentSong && (
                    <p className="text-xs font-semibold  text-[var(--color-accent)] mt-1.5 flex items-center gap-1.5 justify-center md:justify-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      Now Playing: <span className="text-white/80">{currentSong.title}</span>
                    </p>
                  )}
                </div>

                {/* Animated EQ Visualizer Bars (Only visible when playing) */}
                <div className="flex items-end gap-[3px] h-[30px] shrink-0">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-[3px] rounded-full transition-colors duration-300 ${isCompressorActive
                          ? 'bg-gradient-to-t from-[var(--color-accent)] to-cyan-400 shadow-[0_0_8px_rgba(255,10,61,0.8)]'
                          : 'bg-[var(--color-accent)]/80'
                        }`}
                      style={{
                        animationName: isPlaying ? 'eqBarShort' : 'none',
                        animationDuration: `${(isCompressorActive ? 0.35 : 0.6) + Math.random() * (isCompressorActive ? 0.35 : 0.6)}s`,
                        animationTimingFunction: 'ease-in-out',
                        animationIterationCount: 'infinite',
                        animationDirection: 'alternate',
                        animationDelay: `${i * 0.05}s`,
                        height: isPlaying ? '24px' : '6px',
                        transformOrigin: 'bottom',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Progress Bar & Seek */}
              <div className="mt-8 flex items-center gap-4">
                <span className="text-xs font-mono font-bold tracking-widest text-white/45 min-w-[32px]">
                  {formatTime(currentTime)}
                </span>

                <div className="relative flex-1 h-[4px] bg-white/10 rounded-full group">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--color-accent)] to-cyan-400 rounded-full pointer-events-none"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  >
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.6)] scale-0 group-hover:scale-100 transition-transform" />
                  </div>
                </div>

                <span className="text-xs font-mono font-bold tracking-widest text-white/45 min-w-[32px] text-right">
                  {duration ? formatTime(duration) : '0:00'}
                </span>
              </div>

              {/* Player Controls Strips */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-white/5">
                {/* Play, Prev, Next */}
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-colors shadow-xl cursor-pointer"
                  >
                    {isPlaying ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    )}
                  </button>

                  {/* Close timer (if temporary) */}
                  {track.expires_at && (
                    <div className="text-xs text-white/30 uppercase font-bold tracking-wider flex items-center gap-1.5 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-lg">
                      🕒 Drop Expires: {new Date(track.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}

                  {/* Real-time Dynamic Mastering Compressor */}
                  <button
                    type="button"
                    onClick={toggleCompressor}
                    className={`text-[0.65rem] uppercase font-bold tracking-widest flex items-center gap-1.5 px-3.5 py-2 rounded-lg border transition-colors duration-300 cursor-pointer select-none ${isCompressorActive
                        ? 'bg-[var(--color-purple-glow)] text-white border-[var(--color-border-purple)] shadow-[0_0_15px_var(--color-purple-glow)]'
                        : 'bg-white/[0.02] border-white/5 text-white/40 hover:text-white/70 hover:border-white/10'
                      }`}
                    title="Toggle Dynamic Mastering: boosts warmth, loudness, and transient response"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isCompressorActive ? 'bg-cyan-400 animate-pulse' : 'bg-white/20'}`} />
                    Mastering Compressor {isCompressorActive ? 'ON ⚡' : 'OFF'}
                  </button>
                </div>

                {/* Volume bar */}
                <div className="flex items-center gap-3 w-36">
                  <button type="button" onClick={toggleMute} className="text-white/45 hover:text-white transition-colors cursor-pointer">
                    {volume === 0 ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                    ) : volume < 0.5 ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    )}
                  </button>

                  <div className="relative flex-1 h-[3px] bg-white/10 rounded-full">
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
                      className="absolute top-0 left-0 h-full bg-[var(--color-accent)] rounded-full"
                      style={{ width: `${volume * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* EP / Album Playlist tracks */}
              {track.songs && track.songs.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
                  <span className="block text-[0.65rem] font-bold uppercase tracking-widest text-white/35">Drop Playlist</span>
                  <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1">
                    {track.songs.map((song: any, idx: number) => {
                      const isActive = idx === currentSongIndex;
                      return (
                        <div
                          key={song.id || idx}
                          onClick={() => {
                            setCurrentSongIndex(idx);
                            setIsPlaying(true);
                          }}
                          className={`flex items-center justify-between p-3  border cursor-pointer select-none transition-colors duration-300 ${isActive
                              ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/20 text-white shadow-[0_0_15px_rgba(255,10,61,0.08)]'
                              : 'bg-transparent border-transparent text-white/45 hover:bg-white/[0.02] hover:text-white/80 hover:border-white/5'
                            }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span className={`text-xs font-mono font-bold w-5 shrink-0 ${isActive ? ' text-[var(--color-accent)]' : 'text-white/20'}`}>
                              {isActive ? '▶' : String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className={`text-xs font-medium truncate ${isActive ? 'font-bold' : ''}`}>{song.title}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {isActive && isPlaying && (
                              <span className="text-[0.55rem] uppercase tracking-widest bg-[var(--color-accent)]/20  text-[var(--color-accent)] px-2 py-0.5 rounded-full font-black animate-pulse border border-[var(--color-accent)]/30">Playing</span>
                            )}
                            <span className="text-[0.55rem] text-white/25 uppercase font-bold tracking-widest">MP3</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes eqBarShort {
          0% { transform: scaleY(0.2); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </section>
  );
}
