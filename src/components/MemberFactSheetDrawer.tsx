"use client";

import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Ticket } from "lucide-react";

export interface BandMemberFactSheet {
  memberNo?: string;
  fullName?: string;
  name: string;
  role: string;
  birthday?: string;
  zodiac?: string;
  luckyNo?: string;
  color?: string;
  bestTrait?: string;
  worstTrait?: string;
  favQuote?: string;
  favLoveSong?: string;
  favRockSong?: string;
  favAlbum?: string;
  favBands?: string;
  favSoundtrack?: string;
  fav7hSong?: string;
  firstSongLearned?: string;
  favPlaceToPlay?: string;
  bestConcertSeen?: string;
  favTvShow?: string;
  favMovie?: string;
  favCartoon?: string;
  favMagazine?: string;
  hobbyAwayFromBand?: string;
  bestFeelingInWorld?: string;
  influences?: string;
  favPet?: string;
  favFoods?: string;
  favDrink?: string;
  favCar?: string;
  favSportToWatch?: string;
  favBoardGame?: string;
  littleKnownFact?: string;
  funFact?: string;
  image?: string;
  desktopImage?: string;
  mobileImage?: string;
}

interface MemberFactSheetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  member: BandMemberFactSheet | null;
  allMembers?: BandMemberFactSheet[];
  onSelectMember?: (member: BandMemberFactSheet) => void;
}

const EMPTY_MEMBERS: BandMemberFactSheet[] = [];

export default function MemberFactSheetDrawer({
  isOpen,
  onClose,
  member,
  allMembers = EMPTY_MEMBERS,
  onSelectMember,
}: MemberFactSheetDrawerProps) {
  const callbacksRef = useRef({ onClose, onSelectMember, member, allMembers });
  useEffect(() => {
    callbacksRef.current = { onClose, onSelectMember, member, allMembers };
  });

  // ESC key listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const { onClose, onSelectMember, member, allMembers } = callbacksRef.current;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" && allMembers.length > 0 && member && onSelectMember) {
        const currentIndex = allMembers.findIndex((m) => m.name === member.name);
        if (currentIndex !== -1) {
          const nextIndex = (currentIndex + 1) % allMembers.length;
          onSelectMember(allMembers[nextIndex]);
        }
      } else if (e.key === "ArrowLeft" && allMembers.length > 0 && member && onSelectMember) {
        const currentIndex = allMembers.findIndex((m) => m.name === member.name);
        if (currentIndex !== -1) {
          const prevIndex = (currentIndex - 1 + allMembers.length) % allMembers.length;
          onSelectMember(allMembers[prevIndex]);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !member) return null;

  const currentIndex = allMembers.findIndex((m) => m.name === member.name);
  const hasMultiple = allMembers.length > 1;

  const handlePrev = () => {
    if (hasMultiple && currentIndex !== -1 && onSelectMember) {
      const prevIndex = (currentIndex - 1 + allMembers.length) % allMembers.length;
      onSelectMember(allMembers[prevIndex]);
    }
  };

  const handleNext = () => {
    if (hasMultiple && currentIndex !== -1 && onSelectMember) {
      const nextIndex = (currentIndex + 1) % allMembers.length;
      onSelectMember(allMembers[nextIndex]);
    }
  };

  // Derived metadata fallbacks for backstage ticket
  const memberNo = member.memberNo || `NO. 00${(currentIndex >= 0 ? currentIndex + 1 : 1)}`;
  const fullName = member.fullName || member.name.toUpperCase();
  const born = member.birthday || "N/A";
  const sign = member.zodiac || "N/A";
  const luckyNo = member.luckyNo || "7";
  const color = member.color || "Black";
  const bestTrait = member.bestTrait || "I CARE TOO MUCH";
  const worstTrait = member.worstTrait || member.bestTrait || "I CARE TOO MUCH";
  const favQuote = member.favQuote || "I'm always happy and never satisfied.";

  return (
    <div className="fixed inset-0 z-[100000] flex justify-end overflow-hidden select-none font-sans">
      {/* Dimmed Blurred Backdrop Overlay */}
      <div
        className="fixed inset-0  transition-opacity duration-300 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-Over Drawer Container */}
      <div
        data-lenis-prevent="true"
        className="relative z-10 w-full sm:w-[480px] md:w-[520px] lg:w-[560px] h-full backdrop-blur-2xl border-l border-purple-500/20 text-white shadow-2xl flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ease-out custom-scrollbar"
        style={{
          boxShadow: "-12px 0 36px rgba(0, 0, 0, 0.8), 0 0 45px rgba(168, 85, 247, 0.15)",
        }}
      >
        {/* Top Control Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3.5 bg-[#0c0a14]/95 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-2">

            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-purple-300/90 uppercase">
              BACKSTAGE FACT SHEET
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasMultiple && (
              <div className="flex items-center gap-1 mr-1 border-r border-white/10 pr-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1 rounded-md bg-white/5 hover:bg-purple-500/20 text-neutral-300 hover:text-white transition-colors border border-white/10"
                  title="Previous Member"
                  aria-label="Previous member"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-neutral-400 px-1">
                  {currentIndex + 1} / {allMembers.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1 rounded-md bg-white/5 hover:bg-purple-500/20 text-neutral-300 hover:text-white transition-colors border border-white/10"
                  title="Next Member"
                  aria-label="Next member"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-rose-500/20 text-neutral-300 hover:text-white transition-colors border border-white/10"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Scroll Container */}
        <div className="flex-1 p-4 sm:p-6 space-y-6">
          {/* 🎟️ VINTAGE LIGHT PAPER TICKET STUB / FACT SHEET CARD */}
          <div className="relative  p-2 sm:p-2 overflow-hidden font-sans">

            {/* Ticket Header Row */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.22em] uppercase">
                ALL ACCESS • BACKSTAGE FACT SHEET
              </span>

            </div>

            {/* Member Name */}
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight  uppercase leading-none font-serif">
              {fullName}
            </h2>

            {/* Role Subtitle */}
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase mt-2 mb-5">
              {member.role}
            </p>

            {/* 4-Column Quick Metadata Grid */}
            <div className="grid grid-cols-4 gap-2 border-t border-white/10 pt-3">
              <div>
                <span className="block text-[8px] sm:text-[9px] font-mono font-bold tracking-widest  uppercase">
                  BORN
                </span>
                <span className="block text-xs sm:text-sm font-bold mt-0.5">
                  {born}
                </span>
              </div>
              <div>
                <span className="block text-[8px] sm:text-[9px] font-mono font-bold tracking-widest uppercase">
                  SIGN
                </span>
                <span className="block text-xs sm:text-sm font-bold  mt-0.5">
                  {sign}
                </span>
              </div>
              <div>
                <span className="block text-[8px] sm:text-[9px] font-mono font-bold tracking-widest uppercase">
                  LUCKY NO.
                </span>
                <span className="block text-xs sm:text-sm font-bold  mt-0.5">
                  {luckyNo}
                </span>
              </div>
              <div>
                <span className="block text-[8px] sm:text-[9px] font-mono font-bold tracking-widest  uppercase">
                  COLOR
                </span>
                <span className="block text-xs sm:text-sm font-bold mt-0.5">
                  {color}
                </span>
              </div>
            </div>
          </div>



          {/* ── SECTION 01: THE CONTRADICTION ── */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">
              <h3 className="text-[11px] font-mono font-bold uppercase">
                THE CONTRADICTION
              </h3>
            </div>

            <div className="bg-[#12101e]/80 border border-white/10 rounded-xl p-4 space-y-3.5">
              {/* Best Trait vs Worst Trait Row */}
              <div className="flex items-center justify-between text-center gap-2 py-3 px-3 bg-black/40 rounded-lg border border-white/5">
                <div className="flex-1">
                  <span className="block text-[8px] font-mono font-bold tracking-widest text-neutral-400 uppercase mb-1">
                    BEST TRAIT
                  </span>
                  <span className="block text-xs font-bold text-rose-400 uppercase tracking-wide">
                    {bestTrait}
                  </span>
                </div>
                <span className="font-serif italic text-xs text-neutral-400 px-2 shrink-0">
                  and yet
                </span>
                <div className="flex-1">
                  <span className="block text-[8px] font-mono font-bold tracking-widest text-neutral-400 uppercase mb-1">
                    WORST TRAIT
                  </span>
                  <span className="block text-xs font-bold text-rose-400 uppercase tracking-wide">
                    {worstTrait}
                  </span>
                </div>
              </div>

              {/* Favorite Quote Box */}
              <div className="pt-2 border-l-2 border-purple-500/60 pl-3.5 py-1">
                <p className="font-serif italic text-sm sm:text-base text-neutral-200 leading-relaxed">
                  &ldquo;{favQuote}&rdquo;
                </p>
                <span className="block text-[8px] font-mono font-bold tracking-widest text-purple-400 uppercase mt-1.5">
                  FAVORITE QUOTE
                </span>
              </div>
            </div>
          </div>

          {/* ── SECTION 02: THE SETLIST ── */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">

              <h3 className="text-[11px] font-mono font-bold uppercase">
                THE SETLIST
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {member.favLoveSong && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    FAVORITE LOVE SONG
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.favLoveSong}
                  </p>
                </div>
              )}

              {member.favRockSong && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    FAVORITE ROCK SONG
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.favRockSong}
                  </p>
                </div>
              )}

              {member.favAlbum && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    FAVORITE ALBUM
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.favAlbum}
                  </p>
                </div>
              )}

              {member.favBands && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    FAVORITE BAND
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.favBands}
                  </p>
                </div>
              )}

              {member.favSoundtrack && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    FAVORITE SOUNDTRACK
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.favSoundtrack}
                  </p>
                </div>
              )}

              {member.fav7hSong && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    FAVORITE 7TH HEAVEN SONG
                  </span>
                  <p className="text-xs font-bold text-purple-300">
                    {member.fav7hSong}
                  </p>
                </div>
              )}

              {member.firstSongLearned && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    FIRST SONG LEARNED
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.firstSongLearned}
                  </p>
                </div>
              )}

              {member.favPlaceToPlay && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    FAVORITE PLACE TO PLAY
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.favPlaceToPlay}
                  </p>
                </div>
              )}

              {member.bestConcertSeen && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3 sm:col-span-2">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    BEST CONCERT SEEN
                  </span>
                  <p className="text-xs font-medium text-neutral-200 italic">
                    {member.bestConcertSeen}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── SECTION 03: ON SCREEN ── */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">

              <h3 className="text-[11px] font-mono font-bold tracking-widest text-neutral-300 uppercase">
                ON SCREEN
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {member.favTvShow && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    FAVORITE TV SHOW
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.favTvShow}
                  </p>
                </div>
              )}

              {member.favMovie && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    FAVORITE MOVIE
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.favMovie}
                  </p>
                </div>
              )}

              {member.favCartoon && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    FAVORITE CARTOON
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.favCartoon}
                  </p>
                </div>
              )}

              {member.favMagazine && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    FAVORITE MAGAZINE
                  </span>
                  <p className="text-xs font-medium text-neutral-200 italic">
                    {member.favMagazine}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── SECTION 04: OFF STAGE ── */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">
              <h3 className="text-[11px] font-mono font-bold uppercase">
                OFF STAGE
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {member.hobbyAwayFromBand && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    HOBBY AWAY FROM THE BAND
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.hobbyAwayFromBand}
                  </p>
                </div>
              )}

              {member.bestFeelingInWorld && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    BEST FEELING IN THE WORLD
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.bestFeelingInWorld}
                  </p>
                </div>
              )}

              {member.influences && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    INFLUENCES
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.influences}
                  </p>
                </div>
              )}

              {member.favPet && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    FAVORITE PET
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.favPet}
                  </p>
                </div>
              )}

              {member.favFoods && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    FAVORITE FOODS
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.favFoods}
                  </p>
                </div>
              )}

              {member.favDrink && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    FAVORITE DRINK
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.favDrink}
                  </p>
                </div>
              )}

              {member.favCar && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    FAVORITE CAR
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.favCar}
                  </p>
                </div>
              )}

              {member.favSportToWatch && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    FAVORITE SPORT TO WATCH
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.favSportToWatch}
                  </p>
                </div>
              )}

              {member.favBoardGame && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    FAVORITE BOARD/VIDEO GAME
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.favBoardGame}
                  </p>
                </div>
              )}

              {(member.littleKnownFact || member.funFact) && (
                <div className="bg-[#12101e]/80 border border-white/10 rounded-lg p-3">
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase mb-1">
                    LITTLE-KNOWN FACT
                  </span>
                  <p className="text-xs font-medium text-neutral-200">
                    {member.littleKnownFact || member.funFact}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Sticky Footer Bar */}
        <div className="sticky bottom-0 z-30 p-3.5 sm:p-4 border-t border-white/10 bg-[#0c0a14]/95 backdrop-blur-md flex items-center justify-between text-[11px] font-mono">
          <span className="text-neutral-400 font-medium">
            {member.name} • {member.role}
          </span>
          <span className="text-amber-500 font-bold italic">
            &ldquo;{member.favPlaceToPlay || member.fav7hSong || "7th Heaven"}&rdquo;
          </span>
        </div>
      </div>
    </div>
  );
}
