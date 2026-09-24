/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { useMember } from "@/context/MemberContext";

const MINI_EQ_DURATIONS = [0.8, 1.0, 0.7, 1.1, 0.9];
const MAIN_EQ_NORMAL = [0.8, 1.0, 0.7, 1.1, 0.9, 0.85, 1.05, 0.75];
const MAIN_EQ_ACTIVE = [0.45, 0.6, 0.4, 0.65, 0.5, 0.55, 0.6, 0.45];

const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

function FeaturedTrackComponent({ mini = false }: { mini?: boolean }) {
  const { isLoggedIn, openModal } = useMember();
  const [track, setTrack] = useState<any>(null);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.4);
  const prevVolumeRef = useRef(0.4);
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

  const fetchTrack = useCallback(async () => {
    try {
      const res = await fetch("/api/featured-track");
      if (res.ok) {
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
      }
    } catch (err) {
      console.error("Error fetching featured track:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const initWebAudio = () => {
    if (!audioRef.current || audioCtxRef.current) return;

    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const source = ctx.createMediaElementSource(audioRef.current);

      const compressor = ctx.createDynamicsCompressor();
      const gain = ctx.createGain();

      // Configure compressor with standard mastering settings
      compressor.threshold.setValueAtTime(-18, ctx.currentTime);
      compressor.knee.setValueAtTime(30, ctx.currentTime);
      compressor.ratio.setValueAtTime(
        isCompressorActive ? 12 : 1,
        ctx.currentTime,
      );
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

    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume().catch((e) => console.warn(e));
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
  }, [fetchTrack, isLoggedIn]);

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
        audioCtxRef.current
          .close()
          .catch((e) => console.warn("Error closing AudioContext:", e));
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
      if (
        audioCtxRef.current &&
        audioCtxRef.current.state === "suspended" &&
        wasPlaying
      ) {
        audioCtxRef.current.resume().catch((e) => console.warn(e));
      }
      if (wasPlaying) {
        audioRef.current.play().catch((e) => console.log("Play prevented:", e));
      }
    }
  }, [currentSong?.audio_url, isPlaying]);

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
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume().catch((e) => console.warn(e));
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .catch((e) => console.warn("Audio play error:", e));
    }
    setIsPlaying((prev) => !prev);
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

  if (loading) return null; // Wait for fetch

  if (!track && !locked) return null; // No active drop

  // ─── Mini variant for hero embedding ───
  if (mini) {
    return (
      <div className="h-full rounded-lg border border-white/10 bg-black/70 p-3 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        {/* Header */}
        <div className="mb-2 flex items-center gap-1.5">
          <span className="h-1 w-1 animate-pulse rounded-lg bg-cyan-400" />
          <span>Now Playing</span>
        </div>

        {locked ? (
          <div className="flex items-center gap-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[var(--color-accent)]/15">
              🔒
            </div>
            <div className="min-w-0 flex-1">
              <p>Exclusive Fan Drop</p>
              <button
                type="button"
                onClick={() => openModal("login")}
                className="mt-0.5 cursor-pointer text-[var(--color-accent)] hover:text-white"
              >
                Login to unlock
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              {/* Mini vinyl */}
              <button
                type="button"
                onClick={togglePlay}
                className="group relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-white/10"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-tr from-[var(--color-accent)]/40 to-cyan-500/20 ${isPlaying ? "animate-[spin_6s_linear_infinite]" : ""}`}
                />
                <div className="relative z-10 flex h-4 w-4 items-center justify-center rounded-lg bg-black/80">
                  {isPlaying ? (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 24 24"
                      fill="white"
                      className="ml-[1px]"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Track info */}
              <div className="min-w-0 flex-1">
                <h4>{track.title}</h4>
                {currentSong && <p className="mt-0.5">{currentSong.title}</p>}
              </div>

              {/* Mini EQ bars */}
              <div className="flex h-[16px] shrink-0 items-end gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-[2px] rounded-lg bg-[var(--color-accent)]/80"
                    style={{
                      animationName: isPlaying ? "eqBarShort" : "none",
                      animationDuration: `${MINI_EQ_DURATIONS[i % MINI_EQ_DURATIONS.length]}s`,
                      animationTimingFunction: "ease-in-out",
                      animationIterationCount: "infinite",
                      animationDirection: "alternate",
                      animationDelay: `${i * 0.05}s`,
                      height: isPlaying ? "14px" : "4px",
                      transformOrigin: "bottom",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Mini progress bar */}
            <div className="mt-2 flex items-center gap-2">
              <span className="min-w-[22px] text-[var(--font-size-5xs)] text-white/30">
                {formatTime(currentTime)}
              </span>
              <div className="relative h-[2px] flex-1 rounded-lg bg-white/10">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                />
                <div
                  className="pointer-events-none absolute top-0 left-0 h-full rounded-lg bg-gradient-to-r from-[var(--color-accent)] to-cyan-400"
                  style={{
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="min-w-[22px] text-right text-[var(--font-size-5xs)] text-white/30">
                {duration ? formatTime(duration) : "0:00"}
              </span>
            </div>

            {/* Mini playlist list */}
            {track.songs && track.songs.length > 1 && (
              <div className="mt-2.5 max-h-[110px] space-y-1 overflow-y-auto border-t border-white/10 pt-2.5 pr-1 select-none">
                {Array.from(track.songs, (song: any, idx: number) => ({
                  song,
                  idx,
                })).map(({ song, idx }) => {
                  const isActive = idx === currentSongIndex;
                  return (
                    <button
                      key={song.id || song.title}
                      type="button"
                      onClick={() => {
                        setCurrentSongIndex(idx);
                        setIsPlaying(true);
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between rounded p-1.5 text-left ${isActive ? "bg-[var(--color-accent)]/15" : "text-white/40 hover:bg-white/[0.02] hover:text-white"}`}
                    >
                      <span className="pr-2">
                        {String(idx + 1).padStart(2, "0")}. {song.title}
                      </span>
                      {isActive && isPlaying ? (
                        <span className="shrink-0 animate-pulse text-[var(--font-size-5xs)]">
                          Playing
                        </span>
                      ) : (
                        <span className="shrink-0 text-[var(--font-size-5xs)]">
                          MP3
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-[var(--color-bg-primary)] py-16">
      {/* Visual background lights */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-lg opacity-[0.08] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-accent), #3b82f6, transparent)",
        }}
      />

      <div className="site-container relative z-10">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-2 w-2 animate-ping rounded-lg bg-[var(--color-accent)]" />
            <span className="text-[var(--color-accent)]">
              Latest Track Drop
            </span>
          </div>

          {locked ? (
            /* Locked Panel (Fans Only, logged out) */
            <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-8 text-center backdrop-blur-xl sm:p-12">
              <div className="mx-auto mb-6 flex h-16 w-16 animate-pulse items-center justify-center border border-white/10 bg-[var(--color-accent)]/15 text-2xl shadow-inner">
                🔒
              </div>
              <h3 className="er mb-2">Exclusive Fan Release</h3>
              <p className="mx-auto mb-8 max-w-md">
                The band dropped an exclusive new song or soundtrack just for
                our registered fans. Sign in or sign up free to unlock
                listening!
              </p>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => openModal("login")}
                  className="cursor-pointer rounded-lg bg-[var(--color-accent)] px-8 py-3 hover:bg-[var(--color-accent)]/80"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => openModal("signup")}
                  className="cursor-pointer rounded-lg border border-white/10 bg-[#00000029] px-8 py-3 hover:bg-white/10"
                >
                  Join Fan Club
                </button>
              </div>
            </div>
          ) : (
            /* Active Player Widget */
            <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl sm:p-8">
              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                {/* Visual Cover/Vinyl */}
                <div className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-white/10">
                  <div
                    className={`absolute inset-0 bg-gradient-to-tr from-[var(--color-accent)]/40 to-cyan-500/20 ${isPlaying ? "animate-[spin_6s_linear_infinite]" : ""}`}
                  />
                  <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-[var(--color-bg-primary)]">
                    💿
                  </div>
                </div>

                {/* Track Details */}
                <div className="min-w-0 flex-1 text-center md:text-left">
                  <span className="rounded-lg border border-white/10 bg-[var(--color-accent)]/20 px-2 py-0.5 text-[0.9rem]">
                    {track.visibility === "fans"
                      ? "Exclusive Fan Drop 🔒"
                      : "Public Release 🔓"}
                  </span>
                  <h4 className="mt-2">{track.title}</h4>
                  {currentSong && (
                    <p className=".5 flex items-center justify-center gap-1.5 md:justify-start">
                      <span className="h-1.5 w-1.5 animate-ping rounded-lg bg-cyan-400" />
                      Now Playing: <span>{currentSong.title}</span>
                    </p>
                  )}
                </div>

                {/* Animated EQ Visualizer Bars (Only visible when playing) */}
                <div className="flex h-[30px] shrink-0 items-end gap-[3px]">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-[3px] rounded-lg ${isCompressorActive ? "bg-gradient-to-t from-[var(--color-accent)] to-cyan-400 shadow-[0_0_8px_rgba(255,10,61,0.8)]" : "bg-[var(--color-accent)]/80"}`}
                      style={{
                        animationName: isPlaying ? "eqBarShort" : "none",
                        animationDuration: `${isCompressorActive ? MAIN_EQ_ACTIVE[i % MAIN_EQ_ACTIVE.length] : MAIN_EQ_NORMAL[i % MAIN_EQ_NORMAL.length]}s`,
                        animationTimingFunction: "ease-in-out",
                        animationIterationCount: "infinite",
                        animationDirection: "alternate",
                        animationDelay: `${i * 0.05}s`,
                        height: isPlaying ? "24px" : "6px",
                        transformOrigin: "bottom",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Progress Bar & Seek */}
              <div className="mt-8 flex items-center gap-4">
                <span className="/45 min-w-[32px]">
                  {formatTime(currentTime)}
                </span>

                <div className="group relative h-[4px] flex-1 rounded-lg bg-white/10">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  />
                  <div
                    className="pointer-events-none absolute top-0 left-0 h-full rounded-lg bg-gradient-to-r from-[var(--color-accent)] to-cyan-400"
                    style={{
                      width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                    }}
                  >
                    <div className="absolute top-1/2 right-0 h-3 w-3 translate-x-1/2 -translate-y-1/2 rounded-lg bg-white opacity-0 shadow-[0_0_10px_rgba(255,255,255,0.6)] group-hover:opacity-100" />
                  </div>
                </div>

                <span className="/45 min-w-[32px] text-right">
                  {duration ? formatTime(duration) : "0:00"}
                </span>
              </div>

              {/* Player Controls Strips */}
              <div className="mt-6 flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-4 sm:flex-row">
                {/* Play, Prev, Next */}
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg bg-white active:scale-95"
                  >
                    {isPlaying ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="ml-1"
                      >
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    )}
                  </button>

                  {/* Close timer (if temporary) */}
                  {track.expires_at && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-white/30">
                      🕒 Drop Expires:{" "}
                      {new Date(track.expires_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}

                  {/* Real-time Dynamic Mastering Compressor */}
                  <button
                    type="button"
                    onClick={toggleCompressor}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3.5 py-2 text-[0.65rem] select-none ${isCompressorActive ? "border-[var(--color-border-purple)] bg-[var(--color-purple-glow)] shadow-[0_0_15px_var(--color-purple-glow)]" : "border-white/10 bg-white/[0.02] hover:border-white/10"}`}
                    title="Toggle Dynamic Mastering: boosts warmth, loudness, and transient response"
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-lg ${isCompressorActive ? "animate-pulse bg-cyan-400" : "bg-white/20"}`}
                    />
                    Mastering Compressor {isCompressorActive ? "ON ⚡" : "OFF"}
                  </button>
                </div>

                {/* Volume bar */}
                <div className="flex w-36 items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="/45 cursor-pointer hover:text-white"
                  >
                    {volume === 0 ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <line x1="23" y1="9" x2="17" y2="15"></line>
                        <line x1="17" y1="9" x2="23" y2="15"></line>
                      </svg>
                    ) : volume < 0.5 ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      </svg>
                    )}
                  </button>

                  <div className="relative h-[3px] flex-1 rounded-lg bg-white/10">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    />
                    <div
                      className="absolute top-0 left-0 h-full rounded-lg bg-[var(--color-accent)]"
                      style={{ width: `${volume * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* EP / Album Playlist tracks */}
              {track.songs && track.songs.length > 0 && (
                <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
                  <span className="/35 block text-[0.65rem]">
                    Drop Playlist
                  </span>
                  <div className="max-h-[180px] space-y-1 overflow-y-auto pr-1">
                    {Array.from(track.songs, (song: any, idx: number) => ({
                      song,
                      idx,
                    })).map(({ song, idx }) => {
                      const isActive = idx === currentSongIndex;
                      return (
                        <button
                          type="button"
                          key={song.id || song.title}
                          onClick={() => {
                            setCurrentSongIndex(idx);
                            setIsPlaying(true);
                          }}
                          className={`flex w-full cursor-pointer items-center justify-between border p-3 text-left select-none ${isActive ? "border-[var(--color-accent)]/20 bg-[var(--color-accent)]/10 shadow-[0_0_15px_rgba(255,10,61,0.08)]" : "/45 border-transparent hover:border-white/5 hover:bg-white/[0.02] hover:text-white"}`}
                        >
                          <div className="flex min-w-0 items-center gap-3.5">
                            <span
                              className={`w-5 shrink-0 ${isActive ? "text-[var(--color-accent)]" : "text-white/20"}`}
                            >
                              {isActive
                                ? "▶"
                                : String(idx + 1).padStart(2, "0")}
                            </span>
                            <span className={` ${isActive ? " " : ""}`}>
                              {song.title}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            {isActive && isPlaying && (
                              <span className="animate-pulse rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/20 px-2 py-0.5 text-[0.55rem]">
                                Playing
                              </span>
                            )}
                            <span className="text-[0.55rem]">MP3</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const FeaturedTrack = memo(FeaturedTrackComponent);
export default FeaturedTrack;
