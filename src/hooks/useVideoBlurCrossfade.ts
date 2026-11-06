"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VideoCrossfadeLayerPhase =
  | "settled"
  | "outgoing"
  | "entering"
  | "active";

export interface VideoCrossfadeLayer {
  readonly id: number;
  readonly src: string;
  readonly phase: VideoCrossfadeLayerPhase;
  readonly isTarget: boolean;
}

interface StoredLayer {
  readonly id: number;
  readonly src: string;
}

interface IncomingLayer extends StoredLayer {
  readonly ready: boolean;
}

interface CrossfadeMachineState {
  readonly trackedSrc: string;
  readonly base: StoredLayer;
  readonly incoming: IncomingLayer | null;
  readonly nextId: number;
}

export interface UseVideoBlurCrossfadeOptions {
  /** Fallback cleanup timeout (ms) slightly longer than the CSS transition duration. */
  readonly fallbackDurationMs?: number;
}

/**
 * Dual-buffer `<video>` crossfade state machine:
 * - Keeps the outgoing `<video>` mounted & playing at full opacity underneath until the incoming
 *   `<video>` has decoded a playable frame AND completed its optical blur-dissolve transition.
 * - Preserves monotonic `key={layer.id}` across incoming -> base promotion so React reuses the
 *   live `<video>` DOM node without reloading, seeking, or flickering.
 */
export function useVideoBlurCrossfade(
  src: string,
  options: UseVideoBlurCrossfadeOptions = {}
) {
  const { fallbackDurationMs = 1150 } = options;

  const [machine, setMachine] = useState<CrossfadeMachineState>(() => ({
    trackedSrc: src,
    base: { id: 0, src },
    incoming: null,
    nextId: 1,
  }));

  const readyTriggeredRef = useRef<Set<number>>(new Set());
  const rafIdsRef = useRef<Set<number>>(new Set());
  const timerIdsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  // Synchronously enqueue incoming video layer when `src` changes during render
  if (src && src !== machine.trackedSrc) {
    const nextId = machine.nextId;
    const visibleBase =
      machine.incoming && machine.incoming.ready
        ? { id: machine.incoming.id, src: machine.incoming.src }
        : machine.base;

    setMachine({
      trackedSrc: src,
      base: visibleBase,
      incoming:
        visibleBase.src === src ? null : { id: nextId, src, ready: false },
      nextId: nextId + 1,
    });
  }

  useEffect(() => {
    const rafSet = rafIdsRef.current;
    const timerMap = timerIdsRef.current;
    return () => {
      for (const rafId of rafSet) {
        cancelAnimationFrame(rafId);
      }
      rafSet.clear();
      for (const timer of timerMap.values()) {
        clearTimeout(timer);
      }
      timerMap.clear();
    };
  }, []);

  const promoteIncomingLayer = useCallback((layerId: number) => {
    const pendingTimer = timerIdsRef.current.get(layerId);
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      timerIdsRef.current.delete(layerId);
    }
    readyTriggeredRef.current.delete(layerId);

    setMachine((prev) => {
      if (!prev.incoming || prev.incoming.id !== layerId) return prev;
      return {
        ...prev,
        base: { id: prev.incoming.id, src: prev.incoming.src },
        incoming: null,
      };
    });
  }, []);

  const notifyLayerReady = useCallback(
    (layerId: number) => {
      if (readyTriggeredRef.current.has(layerId)) return;
      readyTriggeredRef.current.add(layerId);

      // Double-rAF guarantees the browser paints at least one frame in `entering` (opacity: 0 + blur)
      // before transitioning to `active` (opacity: 1 + target blur), even for memory-cached MP4s.
      const raf1 = requestAnimationFrame(() => {
        rafIdsRef.current.delete(raf1);
        const raf2 = requestAnimationFrame(() => {
          rafIdsRef.current.delete(raf2);
          setMachine((prev) => {
            if (
              !prev.incoming ||
              prev.incoming.id !== layerId ||
              prev.incoming.ready
            ) {
              return prev;
            }
            return {
              ...prev,
              incoming: { ...prev.incoming, ready: true },
            };
          });
        });
        rafIdsRef.current.add(raf2);
      });
      rafIdsRef.current.add(raf1);

      // Safety fallback in case CSS transition is shortened by prefers-reduced-motion or tab visibility
      const existing = timerIdsRef.current.get(layerId);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        timerIdsRef.current.delete(layerId);
        promoteIncomingLayer(layerId);
      }, fallbackDurationMs);
      timerIdsRef.current.set(layerId, timer);
    },
    [fallbackDurationMs, promoteIncomingLayer]
  );

  const dropFailedIncoming = useCallback((layerId: number) => {
    const pendingTimer = timerIdsRef.current.get(layerId);
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      timerIdsRef.current.delete(layerId);
    }
    readyTriggeredRef.current.delete(layerId);

    setMachine((prev) => {
      if (!prev.incoming || prev.incoming.id !== layerId) return prev;
      return {
        ...prev,
        incoming: null,
      };
    });
  }, []);

  const layers: VideoCrossfadeLayer[] = [];

  if (machine.base.src) {
    const isOutgoing = Boolean(machine.incoming && machine.incoming.ready);
    layers.push({
      id: machine.base.id,
      src: machine.base.src,
      phase: isOutgoing ? "outgoing" : "settled",
      isTarget: !machine.incoming,
    });
  }

  if (machine.incoming && machine.incoming.src) {
    layers.push({
      id: machine.incoming.id,
      src: machine.incoming.src,
      phase: machine.incoming.ready ? "active" : "entering",
      isTarget: true,
    });
  }

  return {
    layers,
    notifyLayerReady,
    promoteIncomingLayer,
    dropFailedIncoming,
  };
}

