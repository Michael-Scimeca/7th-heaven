"use client";

import DiscTestClient, { type DiscOrigin } from "./DiscTestClient";
import { ITEMS } from "./data";
import type { TransitionName } from "./transitions";

/** The spinning CD vault, mounted over whatever page opens it. */
export default function DiscVault({
  onClose,
  origin,
  onHandoff,
  transition = "snappy",
}: {
  onClose: () => void;
  /** on-page disc the vault's first (newest album) disc grows out of and returns to */
  origin?: DiscOrigin;
  /** the 3D disc now covers the page disc; hide the page's copy */
  onHandoff?: () => void;
  /** transition animation style */
  transition?: TransitionName;
}) {
  return (
    <DiscTestClient items={ITEMS} transition={transition} onClose={onClose} origin={origin} onHandoff={onHandoff} />
  );
}
