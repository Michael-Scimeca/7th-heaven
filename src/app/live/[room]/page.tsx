"use client";

import { FakeLiveStream } from "@/components/FakeLiveStream";
import { useParams } from "next/navigation";

export default function LiveRoomPage() {
  const params = useParams();
  const rawRoom = typeof params?.room === "string" ? params.room : "michael";
  const memberId = rawRoom.replace(/^live_/, "");

  return <FakeLiveStream memberId={memberId || "michael"} />;
}
