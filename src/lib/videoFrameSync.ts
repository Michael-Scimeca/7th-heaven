export type SyncedVideoRole = "hero" | "card" | "blob";

interface SyncedVideoEntry {
  readonly el: HTMLVideoElement;
  readonly key: string;
  readonly role: SyncedVideoRole;
  lastHardSeekAt: number;
}

const syncGroups = new Map<string, Set<SyncedVideoEntry>>();
let rafId: number | null = null;
let lastTickAt = 0;

const TICK_INTERVAL_MS = 33;
const TIGHT_LOCK_SEC = 0.018;
const SOFT_PLL_MAX_SEC = 0.38;
const HARD_SEEK_COOLDOWN_MS = 240;

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function normalizeVideoSyncKey(rawSrc: string | null | undefined): string {
  if (!rawSrc) return "";
  if (rawSrc.startsWith("/")) return rawSrc;
  try {
    const base =
      typeof window !== "undefined" ? window.location.origin : "http://localhost";
    return new URL(rawSrc, base).pathname;
  } catch {
    return rawSrc;
  }
}

function circularTimeDelta(
  leaderTime: number,
  followerTime: number,
  duration: number
): number {
  let delta = leaderTime - followerTime;
  if (Number.isFinite(duration) && duration > 0.5) {
    const half = duration * 0.5;
    if (delta > half) delta -= duration;
    else if (delta < -half) delta += duration;
  }
  return delta;
}

function electGroupLeader(
  entries: Set<SyncedVideoEntry>
): { leader: SyncedVideoEntry | null; isUserPausedGroup: boolean } {
  let pausedCardLeader: SyncedVideoEntry | null = null;
  let heroLeader: SyncedVideoEntry | null = null;
  let centerCardLeader: SyncedVideoEntry | null = null;
  let visibleCardLeader: SyncedVideoEntry | null = null;
  let blobLeader: SyncedVideoEntry | null = null;

  for (const entry of entries) {
    const { el, role } = entry;
    if (!el.isConnected) continue;

    if (role === "card" && el.dataset.cardPaused === "true") {
      if (
        !pausedCardLeader ||
        (el.dataset.cardCenter === "true" &&
          pausedCardLeader.el.dataset.cardCenter !== "true")
      ) {
        pausedCardLeader = entry;
      }
      continue;
    }

    if (el.readyState < 2 || el.paused) continue;

    if (role === "hero") {
      if (!heroLeader) heroLeader = entry;
    } else if (role === "card") {
      if (el.dataset.cardCenter === "true") {
        if (!centerCardLeader) centerCardLeader = entry;
      } else if (!visibleCardLeader) {
        visibleCardLeader = entry;
      }
    } else if (role === "blob") {
      if (!blobLeader) blobLeader = entry;
    }
  }

  if (pausedCardLeader) {
    return { leader: pausedCardLeader, isUserPausedGroup: true };
  }

  return {
    leader:
      heroLeader ?? centerCardLeader ?? visibleCardLeader ?? blobLeader ?? null,
    isUserPausedGroup: false,
  };
}

export function snapFollowerToGroupLeader(
  followerEl: HTMLVideoElement,
  rawSrc: string | null | undefined
): boolean {
  const key = normalizeVideoSyncKey(rawSrc);
  if (!key) return false;
  const entries = syncGroups.get(key);
  if (!entries || entries.size === 0) return false;

  const { leader, isUserPausedGroup } = electGroupLeader(entries);
  if (!leader || leader.el === followerEl || leader.el.readyState < 1) {
    return false;
  }

  if (followerEl.readyState >= 1 && !followerEl.seeking) {
    const dur = leader.el.duration || followerEl.duration || 0;
    const delta = Math.abs(
      circularTimeDelta(leader.el.currentTime, followerEl.currentTime, dur)
    );
    if (delta > TIGHT_LOCK_SEC) {
      try {
        followerEl.currentTime = leader.el.currentTime;
      } catch {
        // Ignore seek before metadata ready
      }
    }
  }

  if (followerEl.playbackRate !== 1) {
    followerEl.playbackRate = 1;
  }

  if (isUserPausedGroup && !followerEl.paused) {
    followerEl.pause();
  }

  return true;
}

function syncAllGroups(now: number) {
  for (const entries of syncGroups.values()) {
    if (entries.size < 2) {
      for (const only of entries) {
        if (only.el.playbackRate !== 1) {
          only.el.playbackRate = 1;
        }
      }
      continue;
    }

    const { leader, isUserPausedGroup } = electGroupLeader(entries);
    if (!leader) continue;

    const leaderEl = leader.el;
    if (leaderEl.playbackRate !== 1) {
      leaderEl.playbackRate = 1;
    }

    const leaderTime = leaderEl.currentTime;
    const duration = leaderEl.duration || 0;

    for (const entry of entries) {
      if (entry === leader) continue;
      const follower = entry.el;
      if (!follower.isConnected) continue;

      if (isUserPausedGroup) {
        if (!follower.paused && entry.role !== "hero") {
          follower.pause();
        }
        if (
          follower.readyState >= 1 &&
          !follower.seeking &&
          leaderEl.readyState >= 1
        ) {
          const delta = Math.abs(
            circularTimeDelta(leaderTime, follower.currentTime, duration)
          );
          if (delta > 0.03 && now - entry.lastHardSeekAt > HARD_SEEK_COOLDOWN_MS) {
            entry.lastHardSeekAt = now;
            try {
              follower.currentTime = leaderTime;
            } catch {}
          }
        }
        continue;
      }

      // Resume blob follower automatically once a user-paused card resumes playing
      if (
        entry.role === "blob" &&
        follower.paused &&
        follower.dataset.reducedMotion !== "true"
      ) {
        follower.play().catch(() => {});
      }

      if (
        follower.paused ||
        follower.readyState < 2 ||
        follower.seeking ||
        leaderEl.seeking
      ) {
        continue;
      }

      const delta = circularTimeDelta(
        leaderTime,
        follower.currentTime,
        duration || follower.duration || 0
      );
      const absDelta = Math.abs(delta);

      if (absDelta <= TIGHT_LOCK_SEC) {
        if (follower.playbackRate !== 1) {
          follower.playbackRate = 1;
        }
      } else if (absDelta <= SOFT_PLL_MAX_SEC) {
        const targetRate = clamp(1 + delta * 3.0, 0.72, 1.38);
        if (Math.abs(follower.playbackRate - targetRate) > 0.008) {
          follower.playbackRate = targetRate;
        }
      } else if (now - entry.lastHardSeekAt > HARD_SEEK_COOLDOWN_MS) {
        entry.lastHardSeekAt = now;
        if (follower.playbackRate !== 1) {
          follower.playbackRate = 1;
        }
        try {
          follower.currentTime = leaderTime;
        } catch {}
      }
    }
  }
}

function hasAnyRegisteredEntries(): boolean {
  for (const entries of syncGroups.values()) {
    if (entries.size > 0) return true;
  }
  return false;
}

function tickLoop(now: number) {
  if (!hasAnyRegisteredEntries()) {
    rafId = null;
    return;
  }

  if (typeof document !== "undefined" && !document.hidden) {
    if (now - lastTickAt >= TICK_INTERVAL_MS) {
      lastTickAt = now;
      syncAllGroups(now);
    }
  }

  rafId = window.requestAnimationFrame(tickLoop);
}

function ensureTickerRunning() {
  if (typeof window === "undefined" || rafId !== null) return;
  lastTickAt = 0;
  rafId = window.requestAnimationFrame(tickLoop);
}

export function registerSyncedVideo(
  el: HTMLVideoElement,
  rawSrc: string | null | undefined,
  role: SyncedVideoRole
): () => void {
  const key = normalizeVideoSyncKey(rawSrc);
  if (!key) return () => {};

  let group = syncGroups.get(key);
  if (!group) {
    group = new Set<SyncedVideoEntry>();
    syncGroups.set(key, group);
  }

  const entry: SyncedVideoEntry = {
    el,
    key,
    role,
    lastHardSeekAt: 0,
  };
  group.add(entry);

  const handleSnapEvent = () => {
    snapFollowerToGroupLeader(el, key);
  };

  el.addEventListener("loadedmetadata", handleSnapEvent);
  if (role !== "hero") {
    el.addEventListener("play", handleSnapEvent);
  }

  snapFollowerToGroupLeader(el, key);
  ensureTickerRunning();

  return () => {
    el.removeEventListener("loadedmetadata", handleSnapEvent);
    el.removeEventListener("play", handleSnapEvent);
    if (el.playbackRate !== 1) {
      el.playbackRate = 1;
    }
    const existing = syncGroups.get(key);
    if (existing) {
      existing.delete(entry);
      if (existing.size === 0) {
        syncGroups.delete(key);
      }
    }
    if (!hasAnyRegisteredEntries() && rafId !== null && typeof window !== "undefined") {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}
