import LogoTicker, { ARTIST_LOGOS, PRESS_LOGOS } from "@/components/LogoTicker";

export default function TickerPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-black">
      <LogoTicker items={ARTIST_LOGOS} direction="left" />
      <LogoTicker items={PRESS_LOGOS} direction="right" />
    </div>
  );
}
