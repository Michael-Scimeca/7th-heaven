import type { Metadata } from "next";
import MediaWeGoAgainClient from "@/components/media/MediaWeGoAgainClient";

export const metadata: Metadata = {
  title: "7th Heaven | Theatrical Cinema Stream",
  description: "Immersive editorial cinema stream showcasing 40 years of 7th Heaven concert films, official music videos, and arena headliners.",
};

export const revalidate = 60;

export default function MediaCinemaPage() {
  return <MediaWeGoAgainClient />;
}
