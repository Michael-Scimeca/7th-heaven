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
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

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
   {isPublisher ? <PublisherView /> : <ViewerView />}
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
function ViewerView() {
 const participants = useParticipants();
 const tracks = useTracks([
  { source: Track.Source.Camera, withPlaceholder: false },
 ]);

 // Only show remote camera tracks (no screen share, no local viewer)
 const remoteTracks = tracks.filter(
  t => !t.participant.isLocal && t.source === Track.Source.Camera
 );
 const remoteParticipants = participants.filter(p => !p.isLocal);

 if (remoteTracks.length === 0) {
  return (
   <div className="h-full flex items-center justify-center">
    <div className="text-center">
     <p className="text-white/50 text-base font-medium">Waiting for stream...</p>
     <p className="text-white/20 text-sm mt-1">Crew members will appear when they go live</p>
    </div>
   </div>
  );
 }

 return (
  <div className="h-full relative">
   <GridLayout
    tracks={remoteTracks}
    style={{ height: '100%' }}
   >
    <ParticipantTile />
   </GridLayout>
   {/* Default Viewer overlay removed to prevent duplicating the custom dashboard overlay */}
  </div>
 );
}
