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
  logoHeight: number;       // px (default 82)
  containerHeight: number;  // px (default 142)
  paddingX: number;         // px (default 70 => 140px gap)
  speedSec: number;         // sec (default 38)
  invert: boolean;          // boolean (default true)
};

const DEFAULT_TICKER_CONFIG: LogoTickerConfig = {
  logoHeight: 82,
  containerHeight: 142,
  paddingX: 70,
  speedSec: 38,
  invert: true,
};

// Artists 7th Heaven has shared stages with
export const ARTIST_LOGOS: TickerItem[] = [
  { src: "/images/press-logos/BonJovi.svg", alt: "Bon Jovi" },
  { src: "/images/press-logos/3DoorsDown.svg", alt: "3 Doors Down" },
  { src: "/images/press-logos/DefLeppard.svg", alt: "Def Leppard" },
  { src: "/images/press-logos/Journey.svg", alt: "Journey" },
  { src: "/images/press-logos/KidRock.svg", alt: "Kid Rock" },
  { src: "/images/press-logos/REOSpeedwagon.svg", alt: "REO Speedwagon" },
  { src: "/images/press-logos/Foreigner.svg", alt: "Foreigner" },
  { src: "/images/press-logos/Styx.svg", alt: "Styx" },
  { src: "/images/press-logos/TedNugent.svg", alt: "Ted Nugent" },
  { src: "/images/press-logos/RickSpringfield.svg", alt: "Rick Springfield" },
  { src: "/images/press-logos/Survivor.svg", alt: "Survivor" },
  { src: "/images/press-logos/JoanJettSignature.svg", alt: "Joan Jett" },
  { src: "/images/press-logos/JeffersonStarship.svg", alt: "Jefferson Starship" },
  { src: "/images/press-logos/Europe.svg", alt: "Europe" },
  { src: "/images/press-logos/TheFixx.svg", alt: "The Fixx" },
  { src: "/images/press-logos/Ratt.svg", alt: "Ratt" },
  { src: "/images/press-logos/WASP.svg", alt: "W.A.S.P." },
];

// Press, media & sports marks
export const PRESS_LOGOS: TickerItem[] = [
  { src: "/images/press-logos/Billboard.svg", alt: "Billboard" },
  { src: "/images/press-logos/MTV.svg", alt: "MTV" },
  { src: "/images/press-logos/NBC.svg", alt: "NBC" },
  { src: "/images/press-logos/NBCOlympics.svg", alt: "NBC Olympics" },
  { src: "/images/press-logos/ABC.svg", alt: "ABC" },
  { src: "/images/press-logos/CBS.svg", alt: "CBS" },
  { src: "/images/press-logos/Fox.svg", alt: "Fox" },
  { src: "/images/press-logos/WGN.svg", alt: "WGN" },
  { src: "/images/press-logos/Mancow.svg", alt: "Mancow" },
  { src: "/images/press-logos/JennyJonesShow.svg", alt: "The Jenny Jones Show" },
  { src: "/images/press-logos/GuitarEdge.svg", alt: "Guitar Edge" },
  { src: "/images/press-logos/ChicagoBulls.svg", alt: "Chicago Bulls" },
  { src: "/images/press-logos/ChicagoCubs.svg", alt: "Chicago Cubs" },
  { src: "/images/press-logos/LosAngelesLakers.svg", alt: "Los Angeles Lakers" },
];

const DEFAULT_ITEMS: TickerItem[] = [...ARTIST_LOGOS, ...PRESS_LOGOS];

function Icon({ kind }: { kind: NonNullable<TickerItem["icon"]> }) {
  if (kind === "square") return <span className="block h-4 w-4 bg-white" />;
  if (kind === "diamond")
    return <span className="block h-4 w-4 rotate-45 bg-white" />;
  if (kind === "dot") return <span className="block h-3 w-3 rounded-lg bg-white" />;
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-white text-[8px] font-bold leading-none text-white">
      ★
    </span>
  );
}

export default function LogoTicker({
  items = DEFAULT_ITEMS,
  speedSec: initialSpeedSec = 38,
  bgClassName = "bg-transparent",
  direction = "left",
}: {
  items?: TickerItem[];
  speedSec?: number;
  bgClassName?: string;
  direction?: "left" | "right";
}) {
  const config = DEFAULT_TICKER_CONFIG;

  // render the list 2x back-to-back for seamless CSS scroll loop while reducing DOM node count
  const track = [...items, ...items];
  const activeSpeed = config.speedSec || initialSpeedSec;

  return (
    <div className="relative w-full">
      <div
        className={`hoy-ticker relative w-full overflow-hidden ${bgClassName}`}
        style={{ ["--ticker-speed" as string]: `${activeSpeed}s` }}
      >
        <div
          className={`hoy-ticker-track flex w-max items-stretch${direction === "right" ? " hoy-ticker-reverse" : ""
            }`}
        >
          {track.map((item, i) =>
            item.src ? (
              <div
                key={item.src + "-" + i}
                className="flex shrink-0 items-center justify-center transition-all duration-150 transform-gpu"
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
                  className={`w-auto max-w-none object-contain transition-[height,filter] duration-150 ${config.invert ? "hoy-ticker-logo" : ""
                    }`}
                  style={{ height: "clamp(24px, 4vw, 64px)", width: "auto", maxHeight: "100%" }}
                  unoptimized
                />
              </div>
            ) : (
              <div
                key={(item.label || "item") + "-" + i}
                className="flex shrink-0 items-center gap-4 border-r border-white/10 px-4 sm:px-8 transform-gpu"
                style={{ height: "clamp(44px, 6vw, 96px)" }}
              >
                {item.icon && <Icon kind={item.icon} />}
                <div className="flex flex-col leading-tight">
                  <span className="whitespace-nowrap text-[clamp(1rem,2vw,1.6rem)] font-black tracking-tight text-white">
                    {item.label}
                  </span>
                  {item.sub && (
                    <span className="whitespace-nowrap text-[clamp(9px,1vw,11px)] font-medium uppercase tracking-wide text-white">
                      {item.sub}
                    </span>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        <style>{`
          .hoy-ticker-track {
            animation: hoy-ticker-scroll var(--ticker-speed, 40s) linear infinite;
            will-change: transform;
            transform: translate3d(0, 0, 0);
            -webkit-transform: translate3d(0, 0, 0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            -webkit-perspective: 1000px;
            perspective: 1000px;
          }
          .hoy-ticker-track.hoy-ticker-reverse {
            animation-direction: reverse;
          }
          .hoy-ticker-logo {
            filter: brightness(0) invert(1);
          }
          .hoy-ticker {
            isolation: isolate;
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 2.5%, black 97.5%, transparent 100%);
            mask-image: linear-gradient(to right, transparent 0%, black 2.5%, black 97.5%, transparent 100%);
          }
          @keyframes hoy-ticker-scroll {
            from {
              transform: translate3d(0, 0, 0);
              -webkit-transform: translate3d(0, 0, 0);
            }
            to {
              transform: translate3d(-50%, 0, 0);
              -webkit-transform: translate3d(-50%, 0, 0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

