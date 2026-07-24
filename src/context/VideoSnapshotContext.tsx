"use client";
import { createContext, useContext } from "react";

/**
 * Holds the two most-recent canvas captures from the hero background video.
 * Updated every 30 seconds by HeroVideoPlayer and consumed by HeroLiveThumbs.
 */
export interface VideoSnapshotContextValue {
  snapshots: string[]; // array of data: URLs (jpeg), most-recent first
}

export const VideoSnapshotContext = createContext<VideoSnapshotContextValue>({
  snapshots: [],
});

export const useVideoSnapshots = () => useContext(VideoSnapshotContext);
