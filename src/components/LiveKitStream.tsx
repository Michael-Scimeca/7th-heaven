'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import React from 'react';
import { AlertTriangle, Mic } from 'lucide-react';

interface LiveKitStreamProps {
  room: string;
  username: string;
  isPublisher: boolean;
  onConnected?: () => void;
  onDisconnected?: () => void;
  className?: string;
}

// Error boundary to catch LiveKit SDK internal errors without crashing the page
class LiveKitErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error) {
    console.warn('[LiveKit] Component error caught:', error.message);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="h-full flex items-center justify-center bg-black/40">
          <div className="text-center">
            <p className="text-white/40 text-sm">Stream connection interrupted</p>
            <button aria-label="Action button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-2 text-xs text-[var(--color-accent)] underline hover:text-[var(--color-accent)]"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function LiveKitStream({
  room,
  username,
  isPublisher,
  onConnected,
  onDisconnected,
  className = '',
}: LiveKitStreamProps) {
  const [token, setToken] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [lk, setLk] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      import('@livekit/components-react'),
      import('livekit-client'),
    ]).then(([reactMod, clientMod]) => {
      if (mounted) {
        // @ts-ignore
        import('@livekit/components-styles/prefabs').catch(() => { });
        setLk({
          LiveKitRoom: reactMod.LiveKitRoom,
          GridLayout: reactMod.GridLayout,
          ParticipantTile: reactMod.ParticipantTile,
          RoomAudioRenderer: reactMod.RoomAudioRenderer,
          ControlBar: reactMod.ControlBar,
          useTracks: reactMod.useTracks,
          useParticipants: reactMod.useParticipants,
          useRoomContext: reactMod.useRoomContext,
          Track: clientMod.Track,
          Room: clientMod.Room,
        });
      }
    }).catch((err) => {
      console.warn('[LiveKit] Dynamic import unavailable:', err);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function getToken() {
      try {
        setError('');
        const identity = isPublisher
          ? `crew-${Math.random().toString(36).substring(2, 6)}`
          : `fan-${Math.random().toString(36).substring(2, 6)}`;
        const name = username || (isPublisher ? "Crew Member" : "Fan Viewer");
        const res = await fetch(`/api/livekit/token?room=${encodeURIComponent(room)}&identity=${encodeURIComponent(identity)}&name=${encodeURIComponent(name)}&publisher=${isPublisher}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) {
          setToken(data.token);
          setUrl(data.wsUrl);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("LiveKit token fetch failed:", err);
          setError(err.message || "Failed to join live stream");
        }
      }
    }
    getToken();
    return () => { cancelled = true; };
  }, [room, username, isPublisher]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-black/40 p-8 ${className}`}>
        <div className="text-center">
          <p className="text-red-400 text-sm font-medium mb-2 flex items-center justify-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Stream Error</p>
          <p className="text-white/30 text-xs max-w-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!token || !url || !lk) {
    return (
      <div className={`flex items-center justify-center bg-black/40 ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent  rounded-lg  animate-spin mx-auto mb-3" />
          <p className="text-white/40 text-sm">Connecting to stream...</p>
        </div>
      </div>
    );
  }

  const { LiveKitRoom, RoomAudioRenderer } = lk;

  return (
    <LiveKitRoom
      key={token}
      token={token}
      serverUrl={url}
      connect={true}
      video={isPublisher}
      audio={isPublisher}
      onConnected={onConnected}
      onDisconnected={onDisconnected}
      className={className}
      data-lk-theme="default"
      style={{ height: '100%' }}
    >
      <RoomAudioRenderer />
      <LiveKitErrorBoundary>
        {isPublisher ? <PublisherView lk={lk} /> : <ViewerView lk={lk} room={room} />}
      </LiveKitErrorBoundary>
    </LiveKitRoom>
  );
}

// Crew member view — shows ONLY their own camera + controls
function PublisherView({ lk }: { lk: any }) {
  const { useTracks, ParticipantTile, ControlBar, useRoomContext, Track, Room } = lk;
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
  ]);

  const localCameraTrack = tracks.filter(
    (t: any) => t.participant.isLocal && t.source === Track.Source.Camera
  );

  const room = useRoomContext();

  useEffect(() => {
    const selectDefaultMic = async () => {
      try {
        const devices = await Room.getLocalDevices('audioinput');
        const builtIn = devices.find((d: any) =>
          d.label.toLowerCase().includes('built-in') ||
          d.label.toLowerCase().includes('macbook') ||
          d.label.toLowerCase().includes('internal')
        );
        if (builtIn && room) {
          await room.switchActiveDevice('audioinput', builtIn.deviceId);
        }
      } catch (e) {
        console.warn("Failed to auto-select built-in mic:", e);
      }
    };
    if (room) selectDefaultMic();
  }, [room, Room]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        {localCameraTrack.length > 0 ? (
          <div style={{ height: '100%', position: 'relative' }}>
            <ParticipantTile trackRef={localCameraTrack[0]} style={{ height: '100%', width: '100%' }} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent  rounded-lg  animate-spin" />
          </div>
        )}
      </div>
      <ControlBar
        variation="minimal"
        controls={{ screenShare: false, chat: false, microphone: true, camera: true }}
        className="!bg-black/60 !border-t !border-white/10"
      />
    </div>
  );
}

// Fan viewer — watches only remote camera feeds (not their own)
function ViewerView({ lk, room }: { lk: any; room: string }) {
  const { useParticipants, useTracks, ParticipantTile, GridLayout, Track } = lk;
  const participants = useParticipants();
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
    { source: Track.Source.Microphone, withPlaceholder: false },
  ]);

  const remoteCameraTracks = tracks.filter(
    (t: any) => !t.participant.isLocal && t.source === Track.Source.Camera
  );
  const remoteParticipants = participants.filter((p: any) => !p.isLocal);

  if (remoteCameraTracks.length === 0) {
    if (remoteParticipants.length > 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4  rounded-lg   bg-[#00000029]    border border-white/10 flex items-center justify-center">
              <Mic className="w-8 h-8 text-cyan-400" />
            </div>
            <p className=" text-white  text-base font-bold">{remoteParticipants[0]?.name || 'Crew'} is Live</p>
            <p className="text-white/30 text-sm mt-1">Camera is warming up or in audio-only mode</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent  rounded-lg  animate-spin mx-auto mb-3" />
          <p className="text-white/50 text-base font-medium">Connecting to stream...</p>
          <p className="text-white/20 text-xs font-mono mt-1 opacity-40">Room ID: {room}</p>
          <p className="text-white/20 text-sm mt-1">Crew members will appear when they go live</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <GridLayout
        tracks={remoteCameraTracks}
        style={{ height: '100%' }}
      >
        <ParticipantTile />
      </GridLayout>
    </div>
  );
}
