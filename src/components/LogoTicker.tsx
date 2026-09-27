"use client";
/* oxlint-disable react-doctor/only-export-components */
/* eslint-disable react-doctor/only-export-components */

import Image from "next/image";

export type TickerItem = {
  label?: string;
  sub?: string;
  icon?: "square" | "diamond" | "dot" | "seal";
  src?: string; // path to a logo image (public/... ), takes priority over text
  alt?: string;
};

export type LogoTickerConfig = {
  logoHeight: number; // px (default 82)
  containerHeight: number; // px (default 142)
  paddingX: number; // px (default 70 => 140px gap)
  speedSec: number; // sec (default 38)
  invert: boolean; // boolean (default true)
};

const DEFAULT_TICKER_CONFIG: LogoTickerConfig = {
  logoHeight: 82,
  containerHeight: 142,
  paddingX: 70,
  speedSec: 85,
  invert: true,
};

// Artists 7th Heaven has shared stages with
export const ARTIST_LOGOS: TickerItem[] = [
  { src: "/images/press-logos/bonjovi.svg", alt: "Bon Jovi" },
  { src: "/images/press-logos/3doorsdown.svg", alt: "3 Doors Down" },
  { src: "/images/press-logos/defleppard.svg", alt: "Def Leppard" },
  { src: "/images/press-logos/journey.svg", alt: "Journey" },
  { src: "/images/press-logos/kidrock.svg", alt: "Kid Rock" },
  { src: "/images/press-logos/reospeedwagon.svg", alt: "REO Speedwagon" },
  { src: "/images/press-logos/foreigner.svg", alt: "Foreigner" },
  { src: "/images/press-logos/styx.svg", alt: "Styx" },
  { src: "/images/press-logos/tednugent.svg", alt: "Ted Nugent" },
  { src: "/images/press-logos/rickspringfield.svg", alt: "Rick Springfield" },
  { src: "/images/press-logos/survivor.svg", alt: "Survivor" },
  { src: "/images/press-logos/joanjettsignature.svg", alt: "Joan Jett" },
  {
    src: "/images/press-logos/jeffersonstarship.svg",
    alt: "Jefferson Starship",
  },
  { src: "/images/press-logos/europe.svg", alt: "Europe" },
  { src: "/images/press-logos/TheFixx.svg", alt: "The Fixx" },
  { src: "/images/press-logos/ratt.svg", alt: "Ratt" },
  { src: "/images/press-logos/wasp.svg", alt: "W.A.S.P." },
];

// Press, media & sports marks
export const PRESS_LOGOS: TickerItem[] = [
  { src: "/images/press-logos/billboard.svg", alt: "Billboard" },
  { src: "/images/press-logos/mtv.svg", alt: "MTV" },
  { src: "/images/press-logos/nbc.svg", alt: "NBC" },
  { src: "/images/press-logos/nbcolympics.svg", alt: "NBC Olympics" },
  { src: "/images/press-logos/abc.svg", alt: "ABC" },
  { src: "/images/press-logos/cbs.svg", alt: "CBS" },
  { src: "/images/press-logos/fox.svg", alt: "Fox" },
  { src: "/images/press-logos/wgn.svg", alt: "WGN" },
  { src: "/images/press-logos/mancow.svg", alt: "Mancow" },
  {
    src: "/images/press-logos/jennyjonesshow.svg",
    alt: "The Jenny Jones Show",
  },
  { src: "/images/press-logos/guitaredge.svg", alt: "Guitar Edge" },
  { src: "/images/press-logos/chicagobulls.svg", alt: "Chicago Bulls" },
  { src: "/images/press-logos/chicagocubs.svg", alt: "Chicago Cubs" },
  {
    src: "/images/press-logos/losangeleslakers.svg",
    alt: "Los Angeles Lakers",
  },
];

const DEFAULT_ITEMS: TickerItem[] = [...ARTIST_LOGOS, ...PRESS_LOGOS];

function Icon({ kind }: { kind: NonNullable<TickerItem["icon"]> }) {
  if (kind === "square") return <span className="block h-4 w-4 bg-white" />;
  if (kind === "diamond")
    return <span className="block h-4 w-4 rotate-45 bg-white" />;
  if (kind === "dot")
    return <span className="block h-3 w-3  bg-white" />;
  return (
    <span className="flex h-8 w-8 items-center justify-center  border-2 border-white text-[9px]">
      ★
    </span>
  );
}

export default function LogoTicker({
  items = DEFAULT_ITEMS,
  speedSec,
  bgClassName = "  ",
  direction = "left",
}: {
  items?: TickerItem[];
  speedSec?: number;
  bgClassName?: string;
  direction?: "left" | "right";
}) {
  const config = DEFAULT_TICKER_CONFIG;

  // render the list 4x back-to-back for 100% seamless CSS scroll loop on all viewport sizes
  const track = [...items, ...items, ...items, ...items];
  const activeSpeed = speedSec ?? config.speedSec;

  return (
    <div className="relative w-full">
      <div
        className={`hoy-ticker relative w-full overflow-hidden ${bgClassName}`}
        style={{ ["--ticker-speed" as string]: `${activeSpeed}s` }}
      >
        <div
          className={`hoy-ticker-track flex w-max items-stretch ${direction === "right" ? "hoy-ticker-reverse" : ""}`}
        >
          {track.map((item, i) =>
            item.src ? (
              <div
                key={item.src + "-" + i}
                className="flex shrink-0 transform-gpu items-center justify-center"
                style={{
                  height: "clamp(44px, 6vw, 96px)",
                  paddingLeft: "clamp(12px, 2.5vw, 44px)",
                  paddingRight: "clamp(12px, 2.5vw, 44px)",
                }}
              >
                <Image
                  src={item.src}
                  alt={item.alt ?? ""}
                  width={0}
                  height={0}
                  className={`w-auto max-w-none object-contain transition-[filter] ${config.invert ? "hoy-ticker-logo" : ""}`}
                  style={{
                    height: "clamp(24px, 4vw, 64px)",
                    width: "auto",
                    maxHeight: "100%",
                  }}
                  unoptimized
                />
              </div>
            ) : (
              <div
                key={(item.label || "item") + "-" + i}
                className="flex shrink-0 transform-gpu items-center gap-4 border-r border-white/10 px-4 sm:px-8"
                style={{ height: "clamp(44px, 6vw, 96px)" }}
              >
                {item.icon && <Icon kind={item.icon} />}
                <div className="flex flex-col">
                  <span className="text-[clamp(1rem,2vw,1.6rem)] font-black whitespace-nowrap">
                    {item.label}
                  </span>
                  {item.sub && (
                    <span className="text-[clamp(9px,1vw,11px)] whitespace-nowrap">
                      {item.sub}
                    </span>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
