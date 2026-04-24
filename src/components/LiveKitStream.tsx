'use client';

import { useEffect, useState } from 'react';
import {
 LiveKitRoom,
 GridLayout,
 ParticipantTile,
 RoomAudioRenderer,
 useTracks,
 useParticipants,
 ControlBar,
 useRoomContext,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track, Room } from 'livekit-client';

interface LiveKitStreamProps {
 room: string;
 username: string;
 isPublisher: boolean;
 onConnected?: () => void;
 onDisconnected?: () => void;
 className?: string;
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

 useEffect(() => {
  const fetchToken = async () => {
   try {
    const res = await fetch(
     `/api/livekit?room=${encodeURIComponent(room)}&username=${encodeURIComponent(username)}&publish=${isPublisher}`
    );
    const data = await res.json();
    if (data.error) {
     setError(data.error);
     return;
    }
    setToken(data.token);
    setUrl(data.url);
   } catch {
    setError('Failed to connect to stream server');
   }
  };
  fetchToken();
 }, [room, username, isPublisher]);

 if (error) {
  return (
   <div className={`flex items-center justify-center bg-black/40 rounded-xl p-8 ${className}`}>
    <div className="text-center">
     <p className="text-red-400 text-sm font-medium mb-2">⚠️ Stream Error</p>
     <p className="text-white/30 text-xs max-w-sm">{error}</p>
    </div>
   </div>
  );
 }

 if (!token || !url) {
  return (
   <div className={`flex items-center justify-center bg-black/40 rounded-xl ${className}`}>
    <div className="text-center">
     <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
     <p className="text-white/40 text-sm">Connecting to stream...</p>
    </div>
   </div>
  );
 }

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
   {isPublisher ? <PublisherView /> : <ViewerView room={room} />}
  </LiveKitRoom>
 );
}

// Crew member view — shows ONLY their own camera + controls
function PublisherView() {
 const participants = useParticipants();
 const tracks = useTracks([
  { source: Track.Source.Camera, withPlaceholder: true },
 ]);

 // Only show local camera track — exclude screen share and remote viewers
 const localCameraTrack = tracks.filter(
  t => t.participant.isLocal && t.source === Track.Source.Camera
 );
 
 const room = useRoomContext();

 // Automatically switch to Built-in Microphone on mount if available
 useEffect(() => {
  const selectDefaultMic = async () => {
   try {
    const devices = await Room.getLocalDevices('audioinput');
    const builtIn = devices.find(d => 
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
 }, [room]);

 return (
  <div className="h-full flex flex-col">
   <div className="flex-1 relative">
    {localCameraTrack.length > 0 ? (
     <GridLayout
      tracks={localCameraTrack}
      style={{ height: '100%' }}
     >
      <ParticipantTile />
     </GridLayout>
    ) : (
     <div className="h-full flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
     </div>
    )}
    {/* Default Live indicator removed to prevent duplicating the custom dashboard overlay */}
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
function ViewerView({ room }: { room: string }) {
 const participants = useParticipants();
 const tracks = useTracks([
  { source: Track.Source.Camera, withPlaceholder: false },
  { source: Track.Source.Microphone, withPlaceholder: false },
 ]);

 // Only show remote camera tracks (no screen share, no local viewer)
 const remoteCameraTracks = tracks.filter(
  t => !t.participant.isLocal && t.source === Track.Source.Camera
 );
 const remoteParticipants = participants.filter(p => !p.isLocal);

 if (remoteCameraTracks.length === 0) {
  // Check if there ARE remote participants (crew is connected but camera off/denied)
  if (remoteParticipants.length > 0) {
   return (
    <div className="h-full flex items-center justify-center">
     <div className="text-center">
      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
       <span className="text-3xl">🎤</span>
      </div>
      <p className="text-white/60 text-base font-bold">{remoteParticipants[0]?.name || 'Crew'} is Live</p>
      <p className="text-white/30 text-sm mt-1">Camera is warming up or in audio-only mode</p>
     </div>
    </div>
   );
  }

  return (
   <div className="h-full flex items-center justify-center">
    <div className="text-center">
     <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
     <p className="text-white/50 text-base font-medium">Connecting to stream...</p>
     <p className="text-white/20 text-[0.6rem] font-mono mt-1 opacity-40">Room ID: {room}</p>
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
