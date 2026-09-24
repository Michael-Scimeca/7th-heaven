/* eslint-disable react-doctor/no-high-complexity-react-function, react-doctor/rendering-hydration-no-flicker */
"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  const drawerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.scrollTop = 0;
    }
  }, [isOpen, member?.name]);

  const callbacksRef = useRef({ onClose, onSelectMember, member, allMembers });
  useEffect(() => {
    callbacksRef.current = { onClose, onSelectMember, member, allMembers };
  });

  // ESC key listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const { onClose, onSelectMember, member, allMembers } =
        callbacksRef.current;
      if (e.key === "Escape") {
        onClose();
      } else if (
        e.key === "ArrowRight" &&
        allMembers.length > 0 &&
        member &&
        onSelectMember
      ) {
        const currentIndex = allMembers.findIndex(
          (m) => m.name === member.name,
        );
        if (currentIndex !== -1) {
          const nextIndex = (currentIndex + 1) % allMembers.length;
          onSelectMember(allMembers[nextIndex]);
        }
      } else if (
        e.key === "ArrowLeft" &&
        allMembers.length > 0 &&
        member &&
        onSelectMember
      ) {
        const currentIndex = allMembers.findIndex(
          (m) => m.name === member.name,
        );
        if (currentIndex !== -1) {
          const prevIndex =
            (currentIndex - 1 + allMembers.length) % allMembers.length;
          onSelectMember(allMembers[prevIndex]);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !member || typeof window === "undefined") return null;

  const currentIndex = allMembers.findIndex((m) => m.name === member.name);
  const hasMultiple = allMembers.length > 1;

  const handlePrev = () => {
    if (hasMultiple && currentIndex !== -1 && onSelectMember) {
      const prevIndex =
        (currentIndex - 1 + allMembers.length) % allMembers.length;
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
  const memberNo =
    member.memberNo || `NO. 00${currentIndex >= 0 ? currentIndex + 1 : 1}`;
  const fullName = member.fullName || member.name.toUpperCase();
  const born = member.birthday || "N/A";
  const sign = member.zodiac || "N/A";
  const luckyNo = member.luckyNo || "7";
  const color = member.color || "Black";
  const bestTrait = member.bestTrait || "I CARE TOO MUCH";
  const worstTrait = member.worstTrait || member.bestTrait || "I CARE TOO MUCH";
  const favQuote = member.favQuote || "I'm always happy and never satisfied.";

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex justify-end overflow-hidden select-none">
      {/* Dimmed Blurred Backdrop Overlay */}
      <div
        className="fixed inset-0 transition-opacity duration-300 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-Over Drawer Container */}
      <div
        ref={drawerRef}
        data-lenis-prevent="true"
        className="custom-scrollbar fact-sheet-scrollbar relative z-10 flex h-full w-full transform flex-col justify-between overflow-y-auto bg-[#0c0a14]/45 backdrop-blur-2xl transition-transform duration-300 ease-out sm:w-[480px] md:w-[520px] lg:w-[560px]"
        style={{
          boxShadow:
            "-12px 0 36px rgba(0, 0, 0, 0.8), 0 0 45px rgba(168, 85, 247, 0.15)",
        }}
      >
        {/* Top Control Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between bg-[#0c0a14] px-6 py-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-purple-300/90">
              BACKSTAGE FACT SHEET
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasMultiple && (
              <div className="mr-1 flex items-center gap-1 border-r border-white/10 pr-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="rounded-md border border-white/10 bg-white/5 p-1 text-neutral-300 transition-colors hover:bg-purple-500/20 hover:text-white"
                  title="Previous Member"
                  aria-label="Previous member"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="px-1 font-mono text-[10px] text-neutral-400">
                  {currentIndex + 1} / {allMembers.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-md border border-white/10 bg-white/5 p-1 text-neutral-300 transition-colors hover:bg-purple-500/20 hover:text-white"
                  title="Next Member"
                  aria-label="Next member"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="hover:white/20 rounded-full border border-white/10 bg-white/10 p-1.5 text-neutral-300 transition-colors hover:text-white"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main Content Scroll Container */}
        <div className="flex-1 space-y-3 py-4 pr-6 pl-6">
          {/* 🎟️ VINTAGE LIGHT PAPER TICKET STUB / FACT SHEET CARD */}
          <div className="relative overflow-hidden sm:py-2">
            {/* Member Name */}
            <h2 className="font-serif text-2xl font-black sm:text-3xl">
              {fullName}
            </h2>

            {/* Role Subtitle */}
            <p className="mt-2 mb-5 text-[11px] sm:text-xs">{member.role}</p>

            {/* 4-Column Quick Metadata Grid */}
            <div className="grid grid-cols-4 gap-2 border-t border-white/10 pt-3">
              <div>
                <span className="block text-purple-400">BORN</span>
                <span className="mt-0.5 block">{born}</span>
              </div>
              <div>
                <span className="block text-purple-400">SIGN</span>
                <span className="mt-0.5 block">{sign}</span>
              </div>
              <div>
                <span className="block text-purple-400">LUCKY NO.</span>
                <span className="mt-0.5 block">{luckyNo}</span>
              </div>
              <div>
                <span className="block text-purple-400">COLOR</span>
                <span className="mt-0.5 block">{color}</span>
              </div>
            </div>
          </div>

          {/* ── SECTION 01: THE CONTRADICTION ── */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">
              <h3 className="font-mono text-[11px]">THE CONTRADICTION</h3>
            </div>

            <div className="space-y-3.5">
              {/* Best Trait vs Worst Trait Row */}
              <div className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-black/40 px-3 py-3 text-center">
                <div className="flex-1">
                  <span className="mb-1 block">BEST TRAIT</span>
                  <span className="block text-xs text-rose-400">
                    {bestTrait}
                  </span>
                </div>
                <span className="shrink-0 px-2 font-serif italic">and yet</span>
                <div className="flex-1">
                  <span>WORST TRAIT</span>
                  <span className="block text-xs text-rose-400">
                    {worstTrait}
                  </span>
                </div>
              </div>

              {/* Favorite Quote Box */}
              <div className="border-l-2 border-purple-500/60 py-1 pt-2 pl-3.5">
                <p className="font-serif text-sm text-neutral-200 italic sm:text-base">
                  &ldquo;{favQuote}&rdquo;
                </p>
                <span className="block text-[12px] text-purple-400">
                  FAVORITE QUOTE
                </span>
              </div>
            </div>
          </div>

          {/* ── SECTION 02: THE SETLIST ── */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">
              <h3 className="font-mono text-[11px]">THE SETLIST</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {member.favLoveSong && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    FAVORITE LOVE SONG
                  </span>
                  <p className="text-xs text-neutral-200">
                    {member.favLoveSong}
                  </p>
                </div>
              )}

              {member.favRockSong && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    FAVORITE ROCK SONG
                  </span>
                  <p className="text-xs text-neutral-200">
                    {member.favRockSong}
                  </p>
                </div>
              )}

              {member.favAlbum && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    FAVORITE ALBUM
                  </span>
                  <p className="text-xs text-neutral-200">{member.favAlbum}</p>
                </div>
              )}

              {member.favBands && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    FAVORITE BAND
                  </span>
                  <p className="text-xs text-neutral-200">{member.favBands}</p>
                </div>
              )}

              {member.favSoundtrack && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    FAVORITE SOUNDTRACK
                  </span>
                  <p className="text-xs text-neutral-200">
                    {member.favSoundtrack}
                  </p>
                </div>
              )}

              {member.fav7hSong && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    FAVORITE 7TH HEAVEN SONG
                  </span>
                  <p className="text-xs text-purple-300">{member.fav7hSong}</p>
                </div>
              )}

              {member.firstSongLearned && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    FIRST SONG LEARNED
                  </span>
                  <p className="text-xs text-neutral-200">
                    {member.firstSongLearned}
                  </p>
                </div>
              )}

              {member.favPlaceToPlay && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    FAVORITE PLACE TO PLAY
                  </span>
                  <p className="text-xs text-neutral-200">
                    {member.favPlaceToPlay}
                  </p>
                </div>
              )}

              {member.bestConcertSeen && (
                <div className="sm:col-span-2">
                  <span className="mb-1 block text-purple-400">
                    BEST CONCERT SEEN
                  </span>
                  <p className="text-xs text-neutral-200 italic">
                    {member.bestConcertSeen}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── SECTION 03: ON SCREEN ── */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">
              <h3 className="text-[11px] text-neutral-300">ON SCREEN</h3>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {member.favTvShow && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    FAVORITE TV SHOW
                  </span>
                  <p className="text-xs text-neutral-200">{member.favTvShow}</p>
                </div>
              )}

              {member.favMovie && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    FAVORITE MOVIE
                  </span>
                  <p className="text-xs text-neutral-200">{member.favMovie}</p>
                </div>
              )}

              {member.favCartoon && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    FAVORITE CARTOON
                  </span>
                  <p className="text-xs text-neutral-200">
                    {member.favCartoon}
                  </p>
                </div>
              )}

              {member.favMagazine && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    FAVORITE MAGAZINE
                  </span>
                  <p className="text-xs text-neutral-200 italic">
                    {member.favMagazine}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── SECTION 04: OFF STAGE ── */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">
              <h3 className="font-mono text-[11px]">OFF STAGE</h3>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {member.hobbyAwayFromBand && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    HOBBY AWAY FROM THE BAND
                  </span>
                  <p className="text-xs text-neutral-200">
                    {member.hobbyAwayFromBand}
                  </p>
                </div>
              )}

              {member.bestFeelingInWorld && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    BEST FEELING IN THE WORLD
                  </span>
                  <p className="text-xs text-neutral-200">
                    {member.bestFeelingInWorld}
                  </p>
                </div>
              )}

              {member.influences && (
                <div>
                  <span className="mb-1 block text-purple-400">INFLUENCES</span>
                  <p className="text-xs text-neutral-200">
                    {member.influences}
                  </p>
                </div>
              )}

              {member.favPet && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    FAVORITE PET
                  </span>
                  <p className="text-xs text-neutral-200">{member.favPet}</p>
                </div>
              )}

              {member.favFoods && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    FAVORITE FOODS
                  </span>
                  <p className="text-xs text-neutral-200">{member.favFoods}</p>
                </div>
              )}

              {member.favDrink && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    FAVORITE DRINK
                  </span>
                  <p className="text-xs text-neutral-200">{member.favDrink}</p>
                </div>
              )}

              {member.favCar && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    FAVORITE CAR
                  </span>
                  <p className="text-xs text-neutral-200">{member.favCar}</p>
                </div>
              )}

              {member.favSportToWatch && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    FAVORITE SPORT TO WATCH
                  </span>
                  <p className="text-xs text-neutral-200">
                    {member.favSportToWatch}
                  </p>
                </div>
              )}

              {member.favBoardGame && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    FAVORITE BOARD/VIDEO GAME
                  </span>
                  <p className="text-xs text-neutral-200">
                    {member.favBoardGame}
                  </p>
                </div>
              )}

              {(member.littleKnownFact || member.funFact) && (
                <div>
                  <span className="mb-1 block text-purple-400">
                    LITTLE-KNOWN FACT
                  </span>
                  <p className="text-xs text-neutral-200">
                    {member.littleKnownFact || member.funFact}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
