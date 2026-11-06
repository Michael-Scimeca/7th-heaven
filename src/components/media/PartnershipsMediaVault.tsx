/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useCallback } from "react";
import { Play, Camera, X, RotateCcw } from "lucide-react";
import { videoThumb } from "@/lib/videoThumb";
import { VIDEO_TRACKS, type VideoTrack } from "./TbwaPillHero";
import TopLayerDialog from "./TopLayerDialog";
import MediaFilterLayoutSwitcherDock from "./MediaFilterLayoutSwitcherDock";
import {
  DEFAULT_VAULT_FILTER_STATE,
  filterVaultCategories,
  type FilterLayoutRendererProps,
  type VaultFilterState,
} from "./MediaFilterLayoutsTypes";
import { renderFilterLayoutsPackA } from "./MediaFilterLayoutsPackA";
import { renderFilterLayoutsPackB } from "./MediaFilterLayoutsPackB";
import { renderFilterLayoutsPackC } from "./MediaFilterLayoutsPackC";

export interface VaultMediaCard {
  id: string;
  type: "video" | "photo";
  title: string;
  subtitle?: string;
  badge?: string;
  src: string;
  youtubeId?: string;
  duration?: string;
  venue?: string;
  year?: number | string;
  caption?: string;
}

export interface VaultCategoryRow {
  id: string;
  categoryType: "video" | "photo";
  title: string;
  subtitle: string;
  itemsCount: number;
  items: VaultMediaCard[];
}

export const CATEGORIES_DATA: VaultCategoryRow[] = [
  // ── VIDEOS SECTION ──
  {
    id: "official-music-videos",
    categoryType: "video",
    title: "Official Music Videos",
    subtitle: "Billboard Charts & Studio Hits",
    itemsCount: 8,
    items: [
      {
        id: "BzHUNTZ66zY",
        type: "video",
        youtubeId: "BzHUNTZ66zY",
        title: "Ain't That Just Beautiful",
        src: videoThumb("BzHUNTZ66zY"),
        duration: "3:35",
        year: 2025,
        venue: "Official Studio Release",
        caption: "7th Heaven - Ain't That Just Beautiful (Official Music Video)",
      },
      {
        id: "SWV7-pmtoA8",
        type: "video",
        youtubeId: "SWV7-pmtoA8",
        title: "Monster",
        src: videoThumb("SWV7-pmtoA8"),
        duration: "4:48",
        year: 2021,
        venue: "Studio Cut",
        caption: "7th Heaven - Monster (Official Video)",
      },
      {
        id: "Es4TIoA2Emg",
        type: "video",
        youtubeId: "Es4TIoA2Emg",
        title: "Are We There Yet",
        src: videoThumb("Es4TIoA2Emg"),
        duration: "3:57",
        year: 2021,
        venue: "Billboard Top 40 Single",
        caption: "7th Heaven - Are We There Yet",
      },
      {
        id: "zAQL-diwq0A",
        type: "video",
        youtubeId: "zAQL-diwq0A",
        title: "Wonderful World",
        src: videoThumb("zAQL-diwq0A"),
        duration: "3:21",
        year: 2020,
        venue: "Acoustic Version",
        caption: "7th Heaven - Wonderful World (Acoustic Video)",
      },
      {
        id: "pUxsIGCmP3w",
        type: "video",
        youtubeId: "pUxsIGCmP3w",
        title: "Say It Already",
        src: videoThumb("pUxsIGCmP3w"),
        duration: "3:29",
        year: 2020,
        venue: "Nashville Recording Sessions",
        caption: "7th Heaven - Say It Already",
      },
      {
        id: "FMo5aARV1MA",
        type: "video",
        youtubeId: "FMo5aARV1MA",
        title: "Better This Way",
        src: videoThumb("FMo5aARV1MA"),
        duration: "4:54",
        year: 2019,
        venue: "Radio Single",
        caption: "7th Heaven - Better This Way",
      },
      {
        id: "Tj-gK_g5g1I",
        type: "video",
        youtubeId: "Tj-gK_g5g1I",
        title: "Stoplight",
        src: videoThumb("Tj-gK_g5g1I"),
        duration: "3:15",
        year: 2018,
        venue: "Summer Single",
        caption: "7th Heaven - Stoplight",
      },
      {
        id: "wDEXG3kHjqk",
        type: "video",
        youtubeId: "wDEXG3kHjqk",
        title: "Sing",
        src: videoThumb("wDEXG3kHjqk"),
        duration: "3:38",
        year: 2017,
        venue: "Studio Master",
        caption: "7th Heaven - Sing",
      },
    ],
  },
  {
    id: "full-concerts",
    categoryType: "video",
    title: "Full Arena Concerts",
    subtitle: "Headline Stadiums & 4K Specials",
    itemsCount: 8,
    items: [
      {
        id: "8QJ7XfltJIM",
        type: "video",
        youtubeId: "8QJ7XfltJIM",
        title: "Taste of Chicago Headline",
        src: videoThumb("8QJ7XfltJIM"),
        duration: "45:20",
        year: 2024,
        venue: "Grant Park Main Stage",
        caption: "Headline performance in front of 35,000+ festival goers in downtown Chicago.",
      },
      {
        id: "3ZhqLJDRxQ8",
        type: "video",
        youtubeId: "3ZhqLJDRxQ8",
        title: "Arcada Theatre 4K Concert",
        src: videoThumb("3ZhqLJDRxQ8"),
        duration: "1:12:00",
        year: 2023,
        venue: "Historic Arcada Theatre",
        caption: "Complete live theater broadcast captured in multi-camera 4K.",
      },
      {
        id: "Bxgs3suv5Wg",
        type: "video",
        youtubeId: "Bxgs3suv5Wg",
        title: "DeKalb Cornfest Main Stage",
        src: videoThumb("Bxgs3suv5Wg"),
        duration: "38:15",
        year: 2023,
        venue: "DeKalb Arena",
        caption: "Annual festival headline performance with full arena pyrotechnics.",
      },
      {
        id: "UQBvl_wZ0ak",
        type: "video",
        youtubeId: "UQBvl_wZ0ak",
        title: "Navy Pier Miller Lite Stage",
        src: videoThumb("UQBvl_wZ0ak"),
        duration: "24:10",
        year: 2024,
        venue: "Chicago Lakefront",
        caption: "Lake Michigan summer concert headline series on Navy Pier.",
      },
      {
        id: "vW9GMwJtUZ0",
        type: "video",
        youtubeId: "vW9GMwJtUZ0",
        title: "Summerfest Milwaukee",
        src: videoThumb("vW9GMwJtUZ0"),
        duration: "32:45",
        year: 2023,
        venue: "Henry Maier Festival Park",
        caption: "World's largest music festival featured stage set.",
      },
      {
        id: "vaMRyPbgAz4",
        type: "video",
        youtubeId: "vaMRyPbgAz4",
        title: "Rosemont Rockin' in the Park",
        src: videoThumb("vaMRyPbgAz4"),
        duration: "28:30",
        year: 2024,
        venue: "Parkway Bank Park",
        caption: "Annual Rosemont summer kickoff with synchronized fireworks finale.",
      },
      {
        id: "W3dkLd9UkZU",
        type: "video",
        youtubeId: "W3dkLd9UkZU",
        title: "DuPage County Fair Arena",
        src: videoThumb("W3dkLd9UkZU"),
        duration: "30:15",
        year: 2023,
        venue: "Fairgrounds Grandstand",
        caption: "Packed fairgrounds grandstand concert performance.",
      },
      {
        id: "XVQ9Sa0wfeY",
        type: "video",
        youtubeId: "XVQ9Sa0wfeY",
        title: "Rockford Speedway Rally",
        src: videoThumb("XVQ9Sa0wfeY"),
        duration: "22:40",
        year: 2022,
        venue: "Speedway Infield Arena",
        caption: "High octane infield rock concert event.",
      },
    ],
  },
  {
    id: "medleys-marathons",
    categoryType: "video",
    title: "The 30-in-30 Medleys",
    subtitle: "30 Songs in 30 Minutes Speed Run",
    itemsCount: 6,
    items: [
      {
        id: "1XViDUo1FvI",
        type: "video",
        youtubeId: "1XViDUo1FvI",
        title: "80s Rock Anthem Medley",
        src: videoThumb("1XViDUo1FvI"),
        duration: "30:00",
        year: 2024,
        venue: "Signature 7th Heaven Marathon",
        caption: "The legendary 30 songs in 30 minutes 80s rock speed-run live.",
      },
      {
        id: "51i9EK_LswU",
        type: "video",
        youtubeId: "51i9EK_LswU",
        title: "Pop Rock Mega Medley",
        src: videoThumb("51i9EK_LswU"),
        duration: "30:00",
        year: 2023,
        venue: "Festival Main Stage",
        caption: "30 massive pop rock hits chained together without a single breath.",
      },
      {
        id: "6NJKIpsC7bs",
        type: "video",
        youtubeId: "6NJKIpsC7bs",
        title: "Classic Arena Rock Medley",
        src: videoThumb("6NJKIpsC7bs"),
        duration: "30:00",
        year: 2023,
        venue: "Impact Field Arena",
        caption: "Queen, Journey, Bon Jovi, Def Leppard in a continuous 30-song sprint.",
      },
      {
        id: "88TOdJ24Re0",
        type: "video",
        youtubeId: "88TOdJ24Re0",
        title: "Guitar Shred Fast Medley",
        src: videoThumb("88TOdJ24Re0"),
        duration: "30:00",
        year: 2024,
        venue: "Vic Theater",
        caption: "High speed guitar solos and harmonic lead runs.",
      },
      {
        id: "PHQ3SCZ--Zs",
        type: "video",
        youtubeId: "PHQ3SCZ--Zs",
        title: "Millennium Dance Rock",
        src: videoThumb("PHQ3SCZ--Zs"),
        duration: "30:00",
        year: 2022,
        venue: "Summer Stadium Cut",
        caption: "Y2K rock and modern dance favorites interwoven live.",
      },
      {
        id: "SRxUiTqwaZs",
        type: "video",
        youtubeId: "SRxUiTqwaZs",
        title: "30-In-30 Tour Special",
        src: videoThumb("SRxUiTqwaZs"),
        duration: "30:00",
        year: 2024,
        venue: "Tour Highlights Cut",
        caption: "Compiled greatest medleys across 5,000 career shows.",
      },
    ],
  },
  {
    id: "tv-broadcasts",
    categoryType: "video",
    title: "TV & National Broadcasts",
    subtitle: "NBC, WGN 9 & Chicago Press",
    itemsCount: 6,
    items: [
      {
        id: "UXexWLnSI_w",
        type: "video",
        youtubeId: "UXexWLnSI_w",
        title: "WGN Morning News Live Set",
        src: videoThumb("UXexWLnSI_w"),
        duration: "3:28",
        year: 2024,
        venue: "WGN Studios Chicago",
        caption: "Live studio morning broadcast and interview performance.",
      },
      {
        id: "HWqFyXh2sTI",
        type: "video",
        youtubeId: "HWqFyXh2sTI",
        title: "NBC Chicago Festival Special",
        src: videoThumb("HWqFyXh2sTI"),
        duration: "5:30",
        year: 2023,
        venue: "NBC Tower Chicago",
        caption: "NBC 5 feature spotlight on 7th Heaven's 40-year milestone.",
      },
      {
        id: "rTZI2YYtUxY",
        type: "video",
        youtubeId: "rTZI2YYtUxY",
        title: "FOX 32 Good Day Chicago",
        src: videoThumb("rTZI2YYtUxY"),
        duration: "6:10",
        year: 2023,
        venue: "FOX 32 Studio",
        caption: "Live acoustic session on morning television.",
      },
      {
        id: "ru092b-ejgY",
        type: "video",
        youtubeId: "ru092b-ejgY",
        title: "Arcada Live TV Broadcast",
        src: videoThumb("ru092b-ejgY"),
        duration: "8:45",
        year: 2022,
        venue: "PBS / WTTW Chicago",
        caption: "Public television live concert segment.",
      },
      {
        id: "t_4p4Fdb9yY",
        type: "video",
        youtubeId: "t_4p4Fdb9yY",
        title: "Midwest Music Awards",
        src: videoThumb("t_4p4Fdb9yY"),
        duration: "7:20",
        year: 2021,
        venue: "Awards Gala Stage",
        caption: "Hall of Fame induction and live medley performance.",
      },
      {
        id: "xE3PwBOPByk",
        type: "video",
        youtubeId: "xE3PwBOPByk",
        title: "Billboard Top 40 Chronicle",
        src: videoThumb("xE3PwBOPByk"),
        duration: "5:50",
        year: 2020,
        venue: "National Syndication",
        caption: "Behind the hit single that charted #1 in the Midwest.",
      },
    ],
  },
  {
    id: "caribbean-cruise-video",
    categoryType: "video",
    title: "Caribbean Cruise at Sea",
    subtitle: "Royal Caribbean Concert Series",
    itemsCount: 6,
    items: [
      {
        id: "N3xFvQPXfqk",
        type: "video",
        youtubeId: "N3xFvQPXfqk",
        title: "Pool Deck Main Stage Sunset",
        src: videoThumb("N3xFvQPXfqk"),
        duration: "18:40",
        year: 2024,
        venue: "Oasis Class Cruise Ship",
        caption: "High seas concert with fans under the Caribbean stars.",
      },
      {
        id: "OGV1oXbHwUw",
        type: "video",
        youtubeId: "OGV1oXbHwUw",
        title: "Cozumel Sailaway Party",
        src: videoThumb("OGV1oXbHwUw"),
        duration: "22:15",
        year: 2024,
        venue: "Port of Cozumel, Mexico",
        caption: "Departing Mexico with thousands of fans rocking on deck.",
      },
      {
        id: "P45q-bvidzw",
        type: "video",
        youtubeId: "P45q-bvidzw",
        title: "Royal Theater Acoustic Set",
        src: videoThumb("P45q-bvidzw"),
        duration: "15:30",
        year: 2023,
        venue: "Royal Theater Proscenium",
        caption: "Intimate two-tier theater performance at sea.",
      },
      {
        id: "P4j-2p-qLZE",
        type: "video",
        youtubeId: "P4j-2p-qLZE",
        title: "St. Thomas Sunset Deck Jam",
        src: videoThumb("P4j-2p-qLZE"),
        duration: "19:50",
        year: 2023,
        venue: "St. Thomas Port Dock",
        caption: "Sunset acoustic rock session overlooking Charlotte Amalie.",
      },
      {
        id: "udUpEgchlck",
        type: "video",
        youtubeId: "udUpEgchlck",
        title: "Midnight Jam on the Atlantic",
        src: videoThumb("udUpEgchlck"),
        duration: "25:00",
        year: 2024,
        venue: "Mid-Atlantic Sea Stage",
        caption: "Late night jam session for dedicated 7th Heaven cruisers.",
      },
      {
        id: "4XkPpM0at6o",
        type: "video",
        youtubeId: "4XkPpM0at6o",
        title: "Final Sailaway Encore",
        src: videoThumb("4XkPpM0at6o"),
        duration: "14:20",
        year: 2024,
        venue: "Port Canaveral Horizon",
        caption: "Return voyage homecoming concert celebration.",
      },
    ],
  },
  {
    id: "legendary-covers",
    categoryType: "video",
    title: "Legendary Rock Covers",
    subtitle: "Journey, Def Leppard & Arena Anthems",
    itemsCount: 6,
    items: [
      {
        id: "4DR68Z8rd_k",
        type: "video",
        youtubeId: "4DR68Z8rd_k",
        title: "Don't Stop Believin' Live",
        src: videoThumb("4DR68Z8rd_k"),
        duration: "4:30",
        year: 2024,
        venue: "Navy Pier Festival",
        caption: "The ultimate Chicago singalong Journey tribute anthem.",
      },
      {
        id: "4llWsEd2do4",
        type: "video",
        youtubeId: "4llWsEd2do4",
        title: "Sweet Child O' Mine",
        src: videoThumb("4llWsEd2do4"),
        duration: "5:15",
        year: 2023,
        venue: "Rosemont Stadium",
        caption: "Slash's iconic guitar riffs replicated with precision.",
      },
      {
        id: "55C64kqfR9I",
        type: "video",
        youtubeId: "55C64kqfR9I",
        title: "Livin' on a Prayer Stadium Cut",
        src: videoThumb("55C64kqfR9I"),
        duration: "4:20",
        year: 2024,
        venue: "Taste of Chicago",
        caption: "Massive crowd harmony on the Bon Jovi anthem.",
      },
      {
        id: "5nLO1fjBvmU",
        type: "video",
        youtubeId: "5nLO1fjBvmU",
        title: "Separate Ways Arena Live",
        src: videoThumb("5nLO1fjBvmU"),
        duration: "5:05",
        year: 2023,
        venue: "DeKalb Arena",
        caption: "Powerful synths and soaring vocals in full force.",
      },
      {
        id: "7_0to5g8XjI",
        type: "video",
        youtubeId: "7_0to5g8XjI",
        title: "Here I Go Again",
        src: videoThumb("7_0to5g8XjI"),
        duration: "4:45",
        year: 2023,
        venue: "Arcada Theatre",
        caption: "Whitesnake power ballad classic with dual lead guitars.",
      },
      {
        id: "7kCUAA69Po0",
        type: "video",
        youtubeId: "7kCUAA69Po0",
        title: "Highway to Hell Live Encore",
        src: videoThumb("7kCUAA69Po0"),
        duration: "3:55",
        year: 2024,
        venue: "Summerfest Milwaukee",
        caption: "Hard rock encore with SG Gibson crunch.",
      },
    ],
  },

  // ── PHOTOS SECTION ──
  {
    id: "stage-lighting-photos",
    categoryType: "photo",
    title: "Stage & Lighting Visuals",
    subtitle: "Stadium Pyros, Lasers & Sound Rig",
    itemsCount: 6,
    items: [
      {
        id: "photo-stage-01",
        type: "photo",
        title: "Full Stage Laser Truss",
        src: "/images/hero/band-performance.webp",
        venue: "Taste of Chicago Main Stage",
        year: 2024,
        caption: "The full stadium lighting array and moving fixtures at Grant Park.",
      },
      {
        id: "photo-stage-02",
        type: "photo",
        title: "Arena Front Row View",
        src: "/images/tour/fan-concert-photo.jpg",
        venue: "Impact Field Rosemont",
        year: 2024,
        caption: "Front-row perspective facing the towering stadium PA stacks.",
      },
      {
        id: "photo-stage-03",
        type: "photo",
        title: "Station 34 Intimate Club",
        src: "/images/fan-photo-featured.jpg",
        venue: "Station 34 Mount Prospect",
        year: 2025,
        caption: "High energy club stage lighting right up against the rail.",
      },
      {
        id: "photo-stage-04",
        type: "photo",
        title: "Sunset Over Navy Pier",
        src: "/images/cruise/at-sea.png",
        venue: "Miller Lite Stage Chicago",
        year: 2024,
        caption: "Golden hour glow as thousands pack the lakefront pier.",
      },
      {
        id: "photo-stage-05",
        type: "photo",
        title: "Historic Arcada Proscenium",
        src: "/images/band/band-cutout.png",
        venue: "Arcada Theatre St. Charles",
        year: 2023,
        caption: "Historic 1920s architecture framing the modern rock show.",
      },
      {
        id: "photo-stage-06",
        type: "photo",
        title: "Midnight Pyrotechnics",
        src: "/images/hero/band-performance.webp",
        venue: "Rosemont Parkway Bank Park",
        year: 2024,
        caption: "Synchronized fireworks illuminating the stadium sky.",
      },
    ],
  },
  {
    id: "fan-community-vault",
    categoryType: "photo",
    title: "Fan Community Vault",
    subtitle: "Concert Memories & Front Row Rail",
    itemsCount: 6,
    items: [
      {
        id: "photo-fan-01",
        type: "photo",
        title: "Front Row High Fives",
        src: "/images/tour/fan-concert-photo.jpg",
        venue: "Station 34",
        year: 2025,
        caption: "Unfiltered fan connection from the front barricade.",
      },
      {
        id: "photo-fan-02",
        type: "photo",
        title: "Sea of Flashlights",
        src: "/images/fan-photo-featured.jpg",
        venue: "Parkway Bank Park",
        year: 2024,
        caption: "Thousands of phone flashlights swaying during 'Wonderful World'.",
      },
      {
        id: "photo-fan-03",
        type: "photo",
        title: "Navy Pier Singalong",
        src: "/images/hero/band-performance.webp",
        venue: "Chicago Lakefront",
        year: 2024,
        caption: "Fans shouting every word to the 30-song medley in unison.",
      },
      {
        id: "photo-fan-04",
        type: "photo",
        title: "CocoCay Beach Party Fans",
        src: "/images/cruise/cococay-beach-party.png",
        venue: "Royal Caribbean CocoCay",
        year: 2024,
        caption: "Private island beach bash with 7th Heaven fans in paradise.",
      },
      {
        id: "photo-fan-05",
        type: "photo",
        title: "Backstage VIP Passes",
        src: "/images/fans/fan-photo-featured.jpg",
        venue: "Arcada Theatre",
        year: 2023,
        caption: "Laminate VIP badge holders meeting the band post-show.",
      },
      {
        id: "photo-fan-06",
        type: "photo",
        title: "Generations of Rock Fans",
        src: "/images/tour/fan-concert-photo.jpg",
        venue: "DeKalb Cornfest",
        year: 2023,
        caption: "Parents and kids celebrating 40 years of rock together.",
      },
    ],
  },
  {
    id: "backstage-green-room",
    categoryType: "photo",
    title: "Backstage & Green Room",
    subtitle: "Soundcheck, Guitars & Pre-Show Huddle",
    itemsCount: 6,
    items: [
      {
        id: "photo-backstage-01",
        type: "photo",
        title: "Pre-Show Team Huddle",
        src: "/images/hero/band-performance.webp",
        venue: "Grant Park Tunnel",
        year: 2024,
        caption: "The band gathers moments before walking out to 35,000 screaming fans.",
      },
      {
        id: "photo-backstage-02",
        type: "photo",
        title: "Guitar Tech Rig & Rack",
        src: "/images/picks/picks-hero.png",
        venue: "Arena Backstage",
        year: 2024,
        caption: "Lineup of tuned Fender Strats and Gibson Les Pauls ready for battle.",
      },
      {
        id: "photo-backstage-03",
        type: "photo",
        title: "Setlist Markups & Sharpies",
        src: "/images/fan-photo-featured.jpg",
        venue: "Green Room Station 34",
        year: 2025,
        caption: "Handwritten song adjustments made minutes before showtime.",
      },
      {
        id: "photo-backstage-04",
        type: "photo",
        title: "Band Promo Cutout Lineup",
        src: "/images/band/band-cutout.png",
        venue: "Chicago Photo Studio",
        year: 2024,
        caption: "Official archival band portrait session.",
      },
      {
        id: "photo-backstage-05",
        type: "photo",
        title: "Tour Bus Departure",
        src: "/images/cruise/port-canaveral-docked.png",
        venue: "Midwest Tour Route",
        year: 2024,
        caption: "Loading gear at 2:00 AM heading into the next city on the calendar.",
      },
      {
        id: "photo-backstage-06",
        type: "photo",
        title: "Grand Cayman Acoustic Soundcheck",
        src: "/images/cruise/grand-cayman.png",
        venue: "Island Stage",
        year: 2024,
        caption: "Acoustic line checks in the tropical morning breeze.",
      },
    ],
  },
  {
    id: "retro-archives-history",
    categoryType: "photo",
    title: "40-Year Retro Archives",
    subtitle: "Vintage Posters, Plaques & Memorabilia",
    itemsCount: 6,
    items: [
      {
        id: "photo-retro-01",
        type: "photo",
        title: "Custom Guitar Picks Collection",
        src: "/images/picks/picks-hero.png",
        venue: "Archive Display",
        year: "1985-2025",
        caption: "Four decades of custom stamped 7th Heaven stage guitar picks.",
      },
      {
        id: "photo-retro-02",
        type: "photo",
        title: "Billboard Top 40 Plaque",
        src: "/images/band/band-cutout.png",
        venue: "Studio Wall of Fame",
        year: 2011,
        caption: "Commemorating 'Sing' and 'Stoplight' climbing national radio charts.",
      },
      {
        id: "photo-retro-03",
        type: "photo",
        title: "Original Club Tour Posters",
        src: "/images/tour/fan-concert-photo.jpg",
        venue: "Chicago Club Circuit",
        year: 1989,
        caption: "Vintage hand-printed gig posters from the early Chicagoland days.",
      },
      {
        id: "photo-retro-04",
        type: "photo",
        title: "5,000 Career Shows Milestone",
        src: "/images/hero/band-performance.webp",
        venue: "Rosemont Arena",
        year: 2023,
        caption: "Honoring 5,000 live concert performances across North America.",
      },
      {
        id: "photo-retro-05",
        type: "photo",
        title: "Vintage Cassette Master Tapes",
        src: "/images/fan-photo-featured.jpg",
        venue: "Recording Studio Vault",
        year: 1993,
        caption: "Analog quarter-inch 24-track tape reels preserved in the vault.",
      },
      {
        id: "photo-retro-06",
        type: "photo",
        title: "Historic Arcada Marquee",
        src: "/images/cruise/cruise-hero.png",
        venue: "St. Charles Historic District",
        year: 2022,
        caption: "Sold-out marquee lit up in neon lights on main street.",
      },
    ],
  },
  {
    id: "caribbean-cruise-photos",
    categoryType: "photo",
    title: "Caribbean Cruise Shore Excursions",
    subtitle: "CocoCay, Cozumel & Grand Cayman",
    itemsCount: 6,
    items: [
      {
        id: "photo-cruise-01",
        type: "photo",
        title: "Cruise Ship Sunset Horizon",
        src: "/images/cruise/cruise-hero.png",
        venue: "Caribbean Sea",
        year: 2024,
        caption: "Golden twilight over the wake of Royal Caribbean's flagship.",
      },
      {
        id: "photo-cruise-02",
        type: "photo",
        title: "CocoCay Beach Stage Party",
        src: "/images/cruise/cococay-beach-party.png",
        venue: "CocoCay Bahamas",
        year: 2024,
        caption: "Sun, sand, and rock & roll on a private Bahamian island.",
      },
      {
        id: "photo-cruise-03",
        type: "photo",
        title: "Cozumel Sailaway Deck Crowd",
        src: "/images/cruise/cozumel.png",
        venue: "Cozumel, Mexico",
        year: 2024,
        caption: "Cheering crowds filling the upper pool deck as the ship departs.",
      },
      {
        id: "photo-cruise-04",
        type: "photo",
        title: "Grand Cayman Seven Mile Beach",
        src: "/images/cruise/grand-cayman.png",
        venue: "Grand Cayman",
        year: 2024,
        caption: "Band and fan excursion along turquoise Caribbean waters.",
      },
      {
        id: "photo-cruise-05",
        type: "photo",
        title: "St. Thomas Mountain Top View",
        src: "/images/cruise/st-thomas-island.png",
        venue: "St. Thomas, USVI",
        year: 2023,
        caption: "Panoramic overlook across Magens Bay and Charlotte Amalie harbor.",
      },
      {
        id: "photo-cruise-06",
        type: "photo",
        title: "Ocean Pool Deck Night Stage",
        src: "/images/cruise/at-sea.png",
        venue: "Atlantic Ocean",
        year: 2024,
        caption: "Electric night concert underneath the Caribbean constellations.",
      },
    ],
  },
];

export interface PartnershipsMediaVaultProps {
  activeTrackId?: string;
  onSelectTrack?: (track: VideoTrack) => void;
  onVideoSelect?: (src: string | null) => void;
}

export default function PartnershipsMediaVault({
  activeTrackId,
  onSelectTrack,
  onVideoSelect,
}: PartnershipsMediaVaultProps = {}) {
  const [filterLayoutId, setFilterLayoutId] = useState<number>(1);
  const [filterState, setFilterState] = useState<VaultFilterState>(DEFAULT_VAULT_FILTER_STATE);
  const [activeRowId, setActiveRowId] = useState<string>("official-music-videos");
  const [selectedMedia, setSelectedMedia] = useState<VaultMediaCard | null>(null);

  const handleSelectMedia = useCallback(
    (item: VaultMediaCard | null) => {
      setSelectedMedia(item);
      if (item && item.type === "video" && item.youtubeId) {
        onVideoSelect?.(`/movie/previews/${item.youtubeId}.mp4`);
      } else {
        onVideoSelect?.(null);
      }
    },
    [onVideoSelect]
  );

  const handleFilterChange = useCallback((patch: Partial<VaultFilterState>) => {
    setFilterState((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleToggleCategory = useCallback((categoryId: string) => {
    setFilterState((prev) => {
      const exists = prev.categories.includes(categoryId);
      const categories = exists
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId];
      return { ...prev, categories };
    });
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilterState(DEFAULT_VAULT_FILTER_STATE);
  }, []);

  const {
    rows: filteredCategories,
    totalItems,
    videoItems,
    photoItems,
    activeFilterCount,
  } = filterVaultCategories(CATEGORIES_DATA, filterState);

  const effectiveActiveRowId = filteredCategories.some((c) => c.id === activeRowId)
    ? activeRowId
    : (filteredCategories[0]?.id ?? "");

  const catalogRowsNode =
    filteredCategories.length === 0 ? (
      <div className="flex flex-col items-center justify-center gap-4 rounded-[var(--radius-box)] border border-white/15 bg-white/5 p-10 text-center">
        <p className="text-base font-bold uppercase tracking-wide text-white">
          No archival titles match the current filter combination
        </p>
        <p className="text-xs font-mono text-zinc-400">
          Try clearing one of your active facets or resetting back to all 70 vault items.
        </p>
        <button
          type="button"
          onClick={handleResetFilters}
          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 font-mono text-xs font-extrabold uppercase tracking-wider text-zinc-950 hover:bg-amber-300 transition-colors cursor-pointer"
        >
          <RotateCcw className="size-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>
    ) : (
      <div className="w-full flex flex-col divide-y divide-white/10 border-t border-b border-white/10">
        {filteredCategories.map((category) => {
          const isActive = effectiveActiveRowId === category.id;

          return (
            <div
              key={category.id}
              onMouseEnter={() => setActiveRowId(category.id)}
              onClick={() => setActiveRowId(category.id)}
              className={`group/row relative w-full transition-all duration-300 select-none ${
                isActive
                  ? "bg-stone-100 text-zinc-950 py-3 sm:py-4 px-3 sm:px-6 shadow-2xl z-20"
                  : "bg-transparent text-white/80 hover:text-white py-4 px-3 sm:px-6 cursor-pointer"
              }`}
            >
              <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* ── LEFT: Title & Category Subtitle ── */}
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 shrink-0 lg:max-w-[34%]">
                  <h3
                    className={`font-mono uppercase font-bold tracking-widest transition-colors duration-200 ${
                      isActive
                        ? "text-base sm:text-lg md:text-xl text-zinc-950"
                        : "text-sm sm:text-base md:text-lg text-zinc-200 group-hover/row:text-white"
                    }`}
                  >
                    {category.title}
                  </h3>

                  <span
                    className={`font-mono text-xs uppercase tracking-wider transition-all duration-200 ${
                      isActive
                        ? "text-zinc-600 opacity-100 font-semibold"
                        : "text-zinc-400 opacity-0 group-hover/row:opacity-90 max-md:hidden"
                    }`}
                  >
                    {category.subtitle}
                  </span>
                </div>

                {/* ── RIGHT: Horizontal Ribbon of Vertical Cards ── */}
                <div
                  className={`flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-1 shrink-0 transition-all duration-300 ${
                    isActive
                      ? "opacity-100 translate-y-0 max-h-[190px] w-full lg:w-auto lg:max-w-[66%]"
                      : "opacity-0 translate-y-2 max-h-0 lg:max-h-0 pointer-events-none hidden lg:flex"
                  }`}
                >
                  {category.items.map((item, idx) => {
                    const isCurrentlyPlaying =
                      item.type === "video" &&
                      Boolean(
                        activeTrackId &&
                          (activeTrackId === item.id ||
                            activeTrackId === item.youtubeId ||
                            activeTrackId === item.title)
                      );

                    return (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.type === "video") {
                            const matchingTrack = VIDEO_TRACKS.find(
                              (t) =>
                                t.youtubeId === item.youtubeId ||
                                t.name.toLowerCase() === item.title.toLowerCase() ||
                                t.id === item.id
                            );
                            const trackToPlay: VideoTrack = matchingTrack || {
                              id: item.id || item.youtubeId || "custom",
                              name: item.title,
                              badge: item.venue || "VAULT SELECTION",
                              subtitle:
                                item.caption || item.subtitle || "7th Heaven Vault Exclusive",
                              src: `/movie/previews/${item.youtubeId}.mp4`,
                              youtubeId: item.youtubeId || "",
                              year: item.year,
                              duration: item.duration || "4K",
                            };

                            if (onSelectTrack) {
                              onSelectTrack(trackToPlay);
                              const heroEl = document.getElementById("media-hero");
                              if (heroEl) {
                                heroEl.scrollIntoView({ behavior: "smooth", block: "start" });
                              } else {
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }
                            } else {
                              handleSelectMedia(item);
                            }
                          } else {
                            handleSelectMedia(item);
                          }
                        }}
                        className={`group/card relative w-[76px] sm:w-[86px] md:w-[98px] aspect-[9/14] rounded-lg overflow-hidden shrink-0 border shadow-md bg-zinc-900 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:z-30 ${
                          isCurrentlyPlaying
                            ? "border-amber-400 ring-2 ring-amber-400 shadow-lg"
                            : "border-black/15 hover:ring-2 hover:ring-amber-400"
                        }`}
                        title={item.title}
                      >
                        <img
                          src={item.src}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-110"
                          loading={idx < 4 ? "eager" : "lazy"}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                        <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1">
                          {item.type === "video" ? (
                            <span
                              className={`flex items-center justify-center w-5 h-5 rounded-full backdrop-blur-md text-xs ${
                                isCurrentlyPlaying
                                  ? "bg-amber-400 text-zinc-950 font-bold animate-pulse"
                                  : "bg-black/60 text-amber-400"
                              }`}
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                            </span>
                          ) : (
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-black/60 backdrop-blur-md text-purple-300 text-xs">
                              <Camera className="w-2.5 h-2.5" />
                            </span>
                          )}
                          {isCurrentlyPlaying && (
                            <span className="px-1 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider bg-amber-400 text-zinc-950">
                              LIVE
                            </span>
                          )}
                        </div>

                        <div className="absolute inset-x-1.5 bottom-1.5 z-10">
                          <p className="text-xs font-sans font-medium text-white line-clamp-1 leading-tight drop-shadow-sm">
                            {item.title}
                          </p>
                          {item.duration && (
                            <span className="text-xs font-mono text-zinc-300">{item.duration}</span>
                          )}
                          {item.year && !item.duration && (
                            <span className="text-xs font-mono text-zinc-300">{item.year}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Inactive State Right Chevron / Indicator */}
                <div
                  className={`flex items-center gap-2 text-zinc-500 font-mono text-xs uppercase tracking-wider shrink-0 transition-opacity duration-200 ${
                    isActive ? "hidden" : "flex"
                  }`}
                >
                  <span className="hidden sm:inline">{category.itemsCount} items</span>
                  <span>+</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

  const filterLayoutProps: FilterLayoutRendererProps = {
    allCategories: CATEGORIES_DATA,
    filteredRows: filteredCategories,
    state: filterState,
    selectedCategorySet: new Set(filterState.categories),
    onChange: handleFilterChange,
    onToggleCategory: handleToggleCategory,
    onReset: handleResetFilters,
    totalItems,
    videoItems,
    photoItems,
    activeFilterCount,
    activeRowId: effectiveActiveRowId,
    onSelectRow: setActiveRowId,
    children: catalogRowsNode,
  };

  return (
    <section
      id="partnerships-vault"
      aria-label="Partnerships Media Vault"
      className="relative w-full flex flex-col gap-5 text-white"
    >
      {/* ── FLOATING 20-FILTER ARCHITECTURE SWITCHER DOCK ── */}
      <MediaFilterLayoutSwitcherDock
        activeLayoutId={filterLayoutId}
        onSelectLayout={setFilterLayoutId}
        activeFilterCount={activeFilterCount}
        onResetFilters={handleResetFilters}
      />

      {/* ── ACTIVE FILTER ARCHITECTURE (#01–#25) + VAULT CATALOG ROWS ── */}
      {renderFilterLayoutsPackA(filterLayoutId, filterLayoutProps) ??
        renderFilterLayoutsPackB(filterLayoutId, filterLayoutProps) ??
        renderFilterLayoutsPackC(filterLayoutId, filterLayoutProps)}

      {/* ── CINEMA MODAL (For Videos) ── */}
      <TopLayerDialog
        open={Boolean(selectedMedia && selectedMedia.type === "video" && selectedMedia.youtubeId)}
        onClose={() => handleSelectMedia(null)}
        ariaLabel={selectedMedia?.title ?? "Cinema Player"}
        className="m-auto w-full max-w-4xl rounded-2xl p-4 sm:p-0"
      >
        {selectedMedia && selectedMedia.type === "video" && selectedMedia.youtubeId && (
          <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/20 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/60">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs uppercase tracking-widest text-amber-400 font-bold">
                  {selectedMedia.venue || "7th Heaven Vault"}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                  {selectedMedia.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleSelectMedia(null)}
                aria-label="Close Cinema Player"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedMedia.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={selectedMedia.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {selectedMedia.caption && (
              <div className="px-6 py-4 bg-zinc-950 border-t border-white/10 flex items-center justify-between gap-4 text-xs font-mono text-zinc-400">
                <p className="line-clamp-2">{selectedMedia.caption}</p>
                {selectedMedia.duration && (
                  <span className="shrink-0 px-2 py-0.5 rounded bg-white/10 text-white">
                    {selectedMedia.duration}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </TopLayerDialog>

      {/* ── LIGHTBOX MODAL (For Photos) ── */}
      <TopLayerDialog
        open={Boolean(selectedMedia && selectedMedia.type === "photo")}
        onClose={() => handleSelectMedia(null)}
        ariaLabel={selectedMedia?.title ?? "Photography Lightbox"}
        className="m-auto w-full max-w-4xl rounded-2xl p-4 sm:p-0"
      >
        {selectedMedia && selectedMedia.type === "photo" && (
          <div className="relative max-h-[90vh] rounded-2xl overflow-hidden bg-zinc-950 border border-white/20 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/60">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs uppercase tracking-widest text-purple-400 font-bold">
                  {selectedMedia.venue || "Photography Vault"}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {selectedMedia.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleSelectMedia(null)}
                aria-label="Close Lightbox"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative max-h-[70vh] flex items-center justify-center bg-black p-2">
              <img
                src={selectedMedia.src}
                alt={selectedMedia.title}
                className="max-h-[68vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>

            {selectedMedia.caption && (
              <div className="px-6 py-4 bg-zinc-950 border-t border-white/10 flex items-center justify-between gap-4 text-xs font-mono text-zinc-400">
                <p>{selectedMedia.caption}</p>
                {selectedMedia.year && (
                  <span className="shrink-0 px-2 py-0.5 rounded bg-white/10 text-white">
                    {selectedMedia.year}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </TopLayerDialog>
    </section>
  );
}
