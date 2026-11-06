/* eslint-disable react-doctor/no-high-complexity-react-function, react-doctor/rendering-hydration-no-flicker */
"use client";

import MeltAvatar from "@/components/MeltAvatar";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Ticket } from "lucide-react";
import { DotChevronLeft, DotChevronRight } from "@/components/ui/DotArrow";
import { useScrollLock } from "@/lib/useScrollLock";
import "./member-fact-sheet.css";

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
  avatarLeaving?: boolean;
  isOpen: boolean;
  onClose: () => void;
  member: BandMemberFactSheet | null;
  allMembers?: BandMemberFactSheet[];
  onSelectMember?: (member: BandMemberFactSheet) => void;
  /** Extra classes on the sliding panel, for pages that need a different width */
  panelClassName?: string;
}

const EMPTY_MEMBERS: BandMemberFactSheet[] = [];

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="mfs-fact">
      <dt className="mfs-label">{label}</dt>
      <dd className="mfs-value">{value}</dd>
    </div>
  );
}

function FactSection({ title, facts }: { title: string; facts: [string, string | undefined][] }) {
  const filled = facts.filter((f): f is [string, string] => Boolean(f[1]));
  if (!filled.length) return null;
  return (
    <section className="mfs-section">
      <h3 className="mfs-heading">{title}</h3>
      <dl className="mfs-grid">
        {filled.map(([label, value]) => (
          <Fact key={label} label={label} value={value} />
        ))}
      </dl>
    </section>
  );
}

export default function MemberFactSheetDrawer({
  isOpen,
  onClose,
  member,
  allMembers = EMPTY_MEMBERS,
  onSelectMember,
  panelClassName = "",
  avatarLeaving = false,
}: MemberFactSheetDrawerProps) {
  useScrollLock(isOpen);
  // The first photo waits for the sheet to slide in; paging to another member melts in straight away
  const [lastPagedTo, setLastPagedTo] = useState<string | null>(null);
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
        setLastPagedTo(null);
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
          const nextMember = allMembers[nextIndex];
          setLastPagedTo(nextMember.name);
          onSelectMember(nextMember);
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
          const prevMember = allMembers[prevIndex];
          setLastPagedTo(prevMember.name);
          onSelectMember(prevMember);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !member || typeof window === "undefined") return null;

  const currentIndex = allMembers.findIndex((m) => m.name === member.name);
  const hasMultiple = allMembers.length > 1;

  const handleClose = () => {
    setLastPagedTo(null);
    onClose();
  };

  const handlePrev = () => {
    if (hasMultiple && currentIndex !== -1 && onSelectMember) {
      const prevIndex =
        (currentIndex - 1 + allMembers.length) % allMembers.length;
      const prevMember = allMembers[prevIndex];
      setLastPagedTo(prevMember.name);
      onSelectMember(prevMember);
    }
  };

  const handleNext = () => {
    if (hasMultiple && currentIndex !== -1 && onSelectMember) {
      const nextIndex = (currentIndex + 1) % allMembers.length;
      const nextMember = allMembers[nextIndex];
      setLastPagedTo(nextMember.name);
      onSelectMember(nextMember);
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
    <div data-scroll-lock={isOpen} className="fixed inset-0 z-[100000] flex justify-end overflow-hidden select-none">
      {/* Dimmed Blurred Backdrop Overlay */}
      <div className="fixed inset-0" onClick={handleClose} aria-hidden="true" />

      {/* Slide-Over Drawer Container */}
      <div
        ref={drawerRef}
        data-lenis-prevent="true"
        className={`custom-scrollbar fact-sheet-scrollbar mfs relative z-10 flex h-full w-full transform flex-col overflow-y-auto bg-[#0c0a14]/45 shadow-[-12px_0_36px_rgba(0,0,0,0.8),0_0_45px_rgba(168,85,247,0.15)] backdrop-blur-2xl sm:w-[480px] md:w-[520px] lg:w-[560px] ${panelClassName}`}
      >
        {/* Top Control Bar */}
        <div className="mfs-bar">
          <span className="mfs-bar-title">Backstage Fact Sheet</span>

          <div className="mfs-bar-controls">
            {hasMultiple && (
              <div className="mfs-pager">
                <button type="button" onClick={handlePrev} title="Previous Member" aria-label="Previous member">
                  <DotChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span>
                  {currentIndex + 1} / {allMembers.length}
                </span>
                <button type="button" onClick={handleNext} title="Next Member" aria-label="Next member">
                  <DotChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <button type="button" onClick={handleClose} className="mfs-close" aria-label="Close modal">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mfs-body" key={member.name}>
          <header className="mfs-header">
            {member.image && (
              // Phones only: there is no large photo beside the sheet there
              <MeltAvatar src={member.image} leaving={avatarLeaving} delayed={lastPagedTo !== member.name} />
            )}
            <div className="mfs-header-text">
              <h2 className="mfs-name">{fullName}</h2>
              <p className="mfs-role">{member.role}</p>
            </div>
          </header>

          <dl className="mfs-stats">
            <Fact label="Born" value={born} />
            <Fact label="Sign" value={sign} />
            <Fact label="Lucky No." value={luckyNo} />
            <Fact label="Color" value={color} />
          </dl>

          <section className="mfs-section">
            <h3 className="mfs-heading">The Contradiction</h3>
            <div className="mfs-traits">
              <div>
                <span className="mfs-label">Best trait</span>
                <p className="mfs-trait">{bestTrait}</p>
              </div>
              <span className="mfs-yet">and yet</span>
              <div>
                <span className="mfs-label">Worst trait</span>
                <p className="mfs-trait">{worstTrait}</p>
              </div>
            </div>
            <figure className="mfs-quote">
              <blockquote>&ldquo;{favQuote}&rdquo;</blockquote>
              <figcaption className="mfs-label">Favorite quote</figcaption>
            </figure>
          </section>

          <FactSection
            title="The Setlist"
            facts={[
              ["Favorite love song", member.favLoveSong],
              ["Favorite rock song", member.favRockSong],
              ["Favorite album", member.favAlbum],
              ["Favorite band", member.favBands],
              ["Favorite soundtrack", member.favSoundtrack],
              ["Favorite 7th Heaven song", member.fav7hSong],
              ["First song learned", member.firstSongLearned],
              ["Favorite place to play", member.favPlaceToPlay],
              ["Best concert seen", member.bestConcertSeen],
            ]}
          />

          <FactSection
            title="On Screen"
            facts={[
              ["Favorite TV show", member.favTvShow],
              ["Favorite movie", member.favMovie],
              ["Favorite cartoon", member.favCartoon],
              ["Favorite magazine", member.favMagazine],
            ]}
          />

          <FactSection
            title="Off Stage"
            facts={[
              ["Hobby away from the band", member.hobbyAwayFromBand],
              ["Best feeling in the world", member.bestFeelingInWorld],
              ["Influences", member.influences],
              ["Favorite pet", member.favPet],
              ["Favorite foods", member.favFoods],
              ["Favorite drink", member.favDrink],
              ["Favorite car", member.favCar],
              ["Favorite sport to watch", member.favSportToWatch],
              ["Favorite board/video game", member.favBoardGame],
              ["Little-known fact", member.littleKnownFact || member.funFact],
            ]}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
