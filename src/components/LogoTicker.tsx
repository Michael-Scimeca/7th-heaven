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
    return <span className="block h-3 w-3 bg-white" />;
  return (
    <span className="flex h-8 w-8 items-center justify-center border-2 border-white text-[9px]">
      ★
    </span>
  );
}

export default function LogoTicker({
  items = DEFAULT_ITEMS,
  speedSec,
  bgClassName = "  ",
  direction = "left",
  ariaLabel,
}: {
  items?: TickerItem[];
  speedSec?: number;
  bgClassName?: string;
  direction?: "left" | "right";
  ariaLabel?: string;
}) {
  const config = DEFAULT_TICKER_CONFIG;
  const activeSpeed = speedSec ?? config.speedSec;
  const defaultLabel =
    direction === "left"
      ? "Featured artists and bands ticker"
      : "Press and media features ticker";

  const renderItem = (item: TickerItem, key: string, isDuplicate = false) => {
    if (item.src) {
      const altText = item.alt ? `${item.alt} logo` : "Partner logo";
      return (
        <div
          key={key}
          aria-hidden={isDuplicate ? true : undefined}
          className="flex h-[clamp(44px,6vw,96px)] shrink-0 transform-gpu items-center justify-center px-[clamp(12px,2.5vw,44px)]"
        >
          <Image
            src={item.src}
            alt={isDuplicate ? "" : altText}
            width={160}
            height={64}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className={`pointer-events-none h-[clamp(24px,4vw,64px)] w-auto max-w-none select-none object-contain transition-[filter] ${config.invert ? "hoy-ticker-logo" : ""}`}
            unoptimized
          />
        </div>
      );
    }

    return (
      <div
        key={key}
        aria-hidden={isDuplicate ? true : undefined}
        className="flex h-[clamp(44px,6vw,96px)] shrink-0 transform-gpu items-center gap-4 border-r border-white/10 px-4 sm:px-8"
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
    );
  };

  return (
    <div
      role="region"
      aria-label={ariaLabel || defaultLabel}
      tabIndex={0}
      className="relative w-full focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-amber-400/50"
    >
      <div
        className={`hoy-ticker relative w-full overflow-hidden ${bgClassName}`}
        style={{ ["--ticker-speed" as string]: `${activeSpeed}s` }}
      >
        <div
          className={`hoy-ticker-track flex w-max flex-nowrap items-stretch ${direction === "right" ? "hoy-ticker-reverse" : ""}`}
        >
          {/* Primary semantic track for screen readers and visual render */}
          {items.map((item, i) =>
            renderItem(item, `primary-${item.src || item.label || i}-${i}`, false),
          )}
          {/* Secondary loop track: purely visual duplicate hidden from screen readers */}
          {items.map((item, i) =>
            renderItem(item, `duplicate-${item.src || item.label || i}-${i}`, true),
          )}
        </div>
      </div>
    </div>
  );
}
