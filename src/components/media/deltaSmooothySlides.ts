import { videoThumb } from "@/lib/videoThumb";
import type { GooeyPaginationSlideMeta } from "./GooeyPagination";
import type { VideoTrack } from "./TbwaPillHero";

export interface DeltaSmooothyCardItem {
  id: string;
  tileClass: string;
  videoType: string;
  packTitle: string;
  originSubtitle: string;
  scriptColorClass: string;
  previewVideoSrc: string;
  coverSrc: string;
  wideFeature?: boolean;
  track: VideoTrack;
}

export const DELTA_SMOOOTHY_CARDS: readonly DeltaSmooothyCardItem[] = [
  {
    id: "delta-better-this-way",
    tileClass: "delta-tile-taupe",
    videoType: "Official Music Video",
    packTitle: "CHICAGO",
    originSubtitle: "Billboard #1 Single",
    scriptColorClass: "text-amber-300",
    previewVideoSrc: "/movie/previews/FMo5aARV1MA.mp4",
    coverSrc: videoThumb("FMo5aARV1MA"),
    wideFeature: true,
    track: {
      id: "better-this-way",
      name: "Better This Way",
      badge: "BILLBOARD #1",
      subtitle: "Billboard Top 40 Single • #1 on Midwest Radio Charts",
      src: "/movie/color-in-motion-clip.mp4",
      youtubeId: "FMo5aARV1MA",
      year: "2019",
      duration: "4:54",
    },
  },
  {
    id: "delta-aint-that-just-beautiful",
    tileClass: "delta-tile-emerald",
    videoType: "Official 4K Music Video",
    packTitle: "STUDIO 4K",
    originSubtitle: "2025 Studio Single",
    scriptColorClass: "text-emerald-300",
    previewVideoSrc: "/movie/previews/BzHUNTZ66zY.mp4",
    coverSrc: videoThumb("BzHUNTZ66zY"),
    track: {
      id: "aint-that-just-beautiful",
      name: "Ain't That Just Beautiful",
      badge: "OFFICIAL 4K RELEASE",
      subtitle: "Official Studio Music Video • Worldwide 4K Release",
      src: "/movie/loops/aint-that-just-beautiful-30s.mp4",
      youtubeId: "BzHUNTZ66zY",
      year: "2025",
      duration: "3:35",
    },
  },
  {
    id: "delta-are-we-there-yet",
    tileClass: "delta-tile-cobalt",
    videoType: "Official Music Video",
    packTitle: "TOP 40 HIT",
    originSubtitle: "Billboard Top 40",
    scriptColorClass: "text-sky-300",
    previewVideoSrc: "/movie/previews/Es4TIoA2Emg.mp4",
    coverSrc: videoThumb("Es4TIoA2Emg"),
    wideFeature: true,
    track: {
      id: "Es4TIoA2Emg",
      name: "Are We There Yet",
      badge: "BILLBOARD TOP 40",
      subtitle: "Billboard Top 40 Radio Single • Official Music Video",
      src: "/movie/loops/are-we-there-yet-30s.mp4",
      youtubeId: "Es4TIoA2Emg",
      year: "2021",
      duration: "3:57",
    },
  },
  {
    id: "delta-monster",
    tileClass: "delta-tile-plum",
    videoType: "Official Music Video",
    packTitle: "MONSTER",
    originSubtitle: "Studio Rock Single",
    scriptColorClass: "text-purple-300",
    previewVideoSrc: "/movie/previews/SWV7-pmtoA8.mp4",
    coverSrc: videoThumb("SWV7-pmtoA8"),
    track: {
      id: "monster-rock",
      name: "Monster",
      badge: "STUDIO CUT",
      subtitle: "High-Energy Hard Rock Single • Official Video",
      src: "/movie/loops/monster-30s.mp4",
      youtubeId: "SWV7-pmtoA8",
      year: "2021",
      duration: "4:48",
    },
  },
  {
    id: "delta-sing",
    tileClass: "delta-tile-cerulean",
    videoType: "Official Music Video",
    packTitle: "MIDWEST",
    originSubtitle: "Live Fan Anthem",
    scriptColorClass: "text-cyan-300",
    previewVideoSrc: "/movie/previews/wDEXG3kHjqk.mp4",
    coverSrc: videoThumb("wDEXG3kHjqk"),
    track: {
      id: "sing-anthem",
      name: "Sing",
      badge: "FAN FAVORITE",
      subtitle: "Signature Live Radio Single & Fan Anthem",
      src: "/movie/luminous-clip.mp4",
      youtubeId: "wDEXG3kHjqk",
      year: "2017",
      duration: "3:38",
    },
  },
  {
    id: "delta-taste-of-chicago",
    tileClass: "delta-tile-crimson",
    videoType: "Full Festival Concert",
    packTitle: "GRANT PARK",
    originSubtitle: "Grant Park Main Stage",
    scriptColorClass: "text-rose-300",
    previewVideoSrc: "/movie/previews/8QJ7XfltJIM.mp4",
    coverSrc: videoThumb("8QJ7XfltJIM"),
    wideFeature: true,
    track: {
      id: "taste-of-chicago-live",
      name: "Taste of Chicago Headline",
      badge: "LIVE ARENA TOUR",
      subtitle: "Grant Park Main Stage • 35,000+ Festival Goers",
      src: "/movie/previews/8QJ7XfltJIM.mp4",
      youtubeId: "8QJ7XfltJIM",
      year: "2024",
      duration: "45:20",
    },
  },
  {
    id: "delta-30-in-30",
    tileClass: "delta-tile-forest",
    videoType: "30-in-30 Live Medley",
    packTitle: "30-IN-30",
    originSubtitle: "30 Songs in 30 Minutes",
    scriptColorClass: "text-lime-300",
    previewVideoSrc: "/movie/previews/1XViDUo1FvI.mp4",
    coverSrc: videoThumb("1XViDUo1FvI"),
    track: {
      id: "1XViDUo1FvI",
      name: "80s Rock Anthem Medley",
      badge: "THE 30-IN-30 MEDLEYS",
      subtitle: "Signature 7th Heaven Marathon • 30 Songs in 30 Minutes",
      src: "/movie/previews/1XViDUo1FvI.mp4",
      youtubeId: "1XViDUo1FvI",
      year: "2024",
      duration: "30:00",
    },
  },
  {
    id: "delta-wgn-live",
    tileClass: "delta-tile-terracotta",
    videoType: "Live TV Broadcast",
    packTitle: "WGN 9 TV",
    originSubtitle: "WGN Studios Chicago",
    scriptColorClass: "text-orange-300",
    previewVideoSrc: "/movie/previews/UXexWLnSI_w.mp4",
    coverSrc: videoThumb("UXexWLnSI_w"),
    track: {
      id: "UXexWLnSI_w",
      name: "WGN Morning News Live Set",
      badge: "TV & NATIONAL PRESS",
      subtitle: "WGN Studios Chicago • Live Morning Broadcast",
      src: "/movie/previews/UXexWLnSI_w.mp4",
      youtubeId: "UXexWLnSI_w",
      year: "2024",
      duration: "3:28",
    },
  },
  {
    id: "delta-caribbean-cruise",
    tileClass: "delta-tile-amber",
    videoType: "Caribbean Cruise Concert",
    packTitle: "CARIBBEAN",
    originSubtitle: "Royal Caribbean Live",
    scriptColorClass: "text-yellow-300",
    previewVideoSrc: "/movie/previews/OGV1oXbHwUw.mp4",
    coverSrc: videoThumb("OGV1oXbHwUw"),
    wideFeature: true,
    track: {
      id: "OGV1oXbHwUw",
      name: "Cozumel Sailaway Party",
      badge: "CARIBBEAN CRUISE",
      subtitle: "Royal Caribbean Concert Series • Pool Deck Main Stage",
      src: "/movie/cruise-desktop.mp4",
      youtubeId: "OGV1oXbHwUw",
      year: "2024",
      duration: "22:15",
    },
  },
  {
    id: "delta-arcada-4k",
    tileClass: "delta-tile-botanical",
    videoType: "Full 4K Theatre Concert",
    packTitle: "ARCADA 4K",
    originSubtitle: "Multi-Cam Broadcast",
    scriptColorClass: "text-emerald-300",
    previewVideoSrc: "/movie/previews/3ZhqLJDRxQ8.mp4",
    coverSrc: videoThumb("3ZhqLJDRxQ8"),
    track: {
      id: "3ZhqLJDRxQ8",
      name: "Arcada Theatre 4K Concert",
      badge: "HISTORIC THEATRE",
      subtitle: "Complete Multi-Camera 4K Theater Broadcast",
      src: "/movie/previews/3ZhqLJDRxQ8.mp4",
      youtubeId: "3ZhqLJDRxQ8",
      year: "2023",
      duration: "1:12:00",
    },
  },
];

export const SMOOOTHY_HERO_TRACKS: readonly VideoTrack[] =
  DELTA_SMOOOTHY_CARDS.map((card) => card.track);

export const SMOOOTHY_PAGINATION_SLIDES: readonly GooeyPaginationSlideMeta[] =
  DELTA_SMOOOTHY_CARDS.map((card) => ({
    id: card.id,
    title: card.track.name,
    videoType: card.videoType,
    subtitle: card.track.subtitle,
    duration: card.track.duration,
    previewVideoSrc: card.previewVideoSrc,
    coverSrc: card.coverSrc,
  }));

function proxiedAlbumCover(remoteUrl: string): string {
  return `/_next/image?url=${encodeURIComponent(remoteUrl)}&w=256&q=75`;
}

interface HeroAlbumSlideDefinition {
  readonly id: string;
  readonly title: string;
  readonly albumType: string;
  readonly year: string;
  readonly trackCount: number;
  readonly subtitle: string;
  readonly coverSrc: string;
  readonly videoSrc: string;
  readonly youtubeId: string;
  readonly fallbackDuration: string;
}

const HERO_STUDIO_ALBUMS: readonly HeroAlbumSlideDefinition[] = [
  {
    id: "01-be-here",
    title: "Be Here",
    albumType: "Studio Album",
    year: "2021",
    trackCount: 14,
    subtitle: "Featuring Are We There Yet, Come What May & Monster",
    coverSrc: "/images/album/be-here.png",
    videoSrc: "/movie/be-here-clip.mp4",
    youtubeId: "Es4TIoA2Emg",
    fallbackDuration: "3:57",
  },
  {
    id: "28-pop-life",
    title: "Pop Life",
    albumType: "Studio Album",
    year: "2019",
    trackCount: 17,
    subtitle: "Featuring Let's Talk, 13 Steps & The Way It Used To Be",
    coverSrc: proxiedAlbumCover(
      "https://7thheavenband.com/wimpy7/28%20Pop%20Life/coverart.jpg"
    ),
    videoSrc: "/movie/loops/aint-that-just-beautiful-30s.mp4",
    youtubeId: "BzHUNTZ66zY",
    fallbackDuration: "3:35",
  },
  {
    id: "07-color-in-motion",
    title: "Color In Motion",
    albumType: "Studio Album",
    year: "2018",
    trackCount: 10,
    subtitle: "Featuring Better This Way, Wonderful World & Say It Already",
    coverSrc: "/images/album/colot-in-motion.png",
    videoSrc: "/movie/color-in-motion-clip.mp4",
    youtubeId: "FMo5aARV1MA",
    fallbackDuration: "4:54",
  },
  {
    id: "09-luminous",
    title: "Luminous",
    albumType: "Studio Album",
    year: "2017",
    trackCount: 10,
    subtitle: "Featuring Home, Beautiful Life & Midwest Girl in the Summertime",
    coverSrc: "/images/album/luminous.png",
    videoSrc: "/movie/luminous-clip.mp4",
    youtubeId: "wDEXG3kHjqk",
    fallbackDuration: "3:38",
  },
  {
    id: "10-next",
    title: "Next",
    albumType: "Studio Album",
    year: "2015",
    trackCount: 10,
    subtitle: "Featuring Time Of Our Lives, Diamonds & She's On Fire",
    coverSrc: proxiedAlbumCover(
      "https://7thheavenband.com/wimpy7/10%20Next/coverart.jpg"
    ),
    videoSrc: "/movie/loops/monster-30s.mp4",
    youtubeId: "SWV7-pmtoA8",
    fallbackDuration: "4:48",
  },
  {
    id: "11-best-of-1985-2015",
    title: "Best of 1985–2015",
    albumType: "Greatest Hits LP",
    year: "2015",
    trackCount: 42,
    subtitle: "30-Year Anthology Featuring Sing, Gravity & Fan Favorites",
    coverSrc: proxiedAlbumCover(
      "https://7thheavenband.com/wimpy7/11%20Best%20of%201985%20-%202015/coverart.jpg"
    ),
    videoSrc: "/movie/previews/8QJ7XfltJIM.mp4",
    youtubeId: "8QJ7XfltJIM",
    fallbackDuration: "45:20",
  },
  {
    id: "13-spectrum",
    title: "Spectrum",
    albumType: "Studio Album",
    year: "2014",
    trackCount: 20,
    subtitle: "Featuring Stoplight, It's You & Dance In The Rain",
    coverSrc: proxiedAlbumCover(
      "https://7thheavenband.com/wimpy7/13%20Spectrum/coverart.jpg"
    ),
    videoSrc: "/movie/previews/1XViDUo1FvI.mp4",
    youtubeId: "1XViDUo1FvI",
    fallbackDuration: "30:00",
  },
  {
    id: "14-synergy",
    title: "Synergy",
    albumType: "Studio Album",
    year: "2013",
    trackCount: 12,
    subtitle: "Featuring We Live Life Young, Pages & Never Gonna Bring Me Down",
    coverSrc: proxiedAlbumCover(
      "https://7thheavenband.com/wimpy7/14%20Synergy/coverart.jpg"
    ),
    videoSrc: "/movie/previews/UXexWLnSI_w.mp4",
    youtubeId: "UXexWLnSI_w",
    fallbackDuration: "3:28",
  },
  {
    id: "15-dance-media",
    title: "Dance Media",
    albumType: "Studio Album",
    year: "2012",
    trackCount: 10,
    subtitle: "Featuring Dance Of A Lifetime, Sing & Go For A Ride",
    coverSrc: proxiedAlbumCover(
      "https://7thheavenband.com/wimpy7/15%20Dance%20Media/coverart.jpg"
    ),
    videoSrc: "/movie/cruise-desktop.mp4",
    youtubeId: "OGV1oXbHwUw",
    fallbackDuration: "22:15",
  },
  {
    id: "16-pop-media",
    title: "Pop Media",
    albumType: "Studio Album",
    year: "2011",
    trackCount: 22,
    subtitle: "Featuring Sing, Go For A Ride & She Should Have Been An Angel",
    coverSrc: proxiedAlbumCover(
      "https://7thheavenband.com/wimpy7/16%20Pop%20Media/coverart.jpg"
    ),
    videoSrc: "/movie/previews/3ZhqLJDRxQ8.mp4",
    youtubeId: "3ZhqLJDRxQ8",
    fallbackDuration: "1:12:00",
  },
];

export const HERO_ALBUM_TRACKS: readonly VideoTrack[] = HERO_STUDIO_ALBUMS.map(
  (album) => ({
    id: album.id,
    name: album.title,
    badge: album.albumType.toUpperCase(),
    subtitle: album.subtitle,
    src: album.videoSrc,
    youtubeId: album.youtubeId,
    year: album.year,
    duration: album.fallbackDuration,
  })
);

export const HERO_ALBUM_PAGINATION_SLIDES: readonly GooeyPaginationSlideMeta[] =
  HERO_STUDIO_ALBUMS.map((album) => ({
    id: album.id,
    title: album.title,
    videoType: album.albumType,
    subtitle: album.subtitle,
    duration: `${album.year} • ${album.trackCount} TRACKS`,
    coverSrc: album.coverSrc,
  }));

