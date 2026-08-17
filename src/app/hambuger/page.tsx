"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

// Test page for /hambuger — recreation of Max Böck's
// "Animated Accessible Navigation" CodePen (https://codepen.io/mxbck/pen/xdaGNL)
// ported to React, wired up with the same a11y behavior:
//  - aria-expanded / hidden toggled on click
//  - Tab is trapped inside the menu while it's open
//  - Escape closes the menu and returns focus to the toggle
//
// Rendered via a portal straight onto <body> so it isn't tinted by the
// site's global grain/shader background layers — matches the CodePen 1:1.

const LINKS = ["Home", "Shop", "Blog", "About", "Contact"];

export default function HamburgerTestPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLAnchorElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => setMounted(true), []);

  // TRAP TAB INSIDE NAV WHEN OPEN (+ Escape to close)
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        toggleRef.current?.focus();
        return;
      }

      // abort if menu isn't open or modifier keys are pressed
      if (!isOpen || e.ctrlKey || e.metaKey || e.altKey) return;

      // listen for tab press and move focus if we're on either
      // end of the navigation
      const links = linkRefs.current.filter(Boolean) as HTMLAnchorElement[];
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === links[0]) {
            toggleRef.current?.focus();
            e.preventDefault();
          }
        } else if (document.activeElement === toggleRef.current) {
          links[0]?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [isOpen]);

  const handleToggle = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsOpen((v) => !v);
  };

  const demo = (
    <div className="hb-page">
      <div className="hb-blur-bg" aria-hidden="true" />

      <Link href="/" className="hb-back">
        ← Back to site
      </Link>

      <div className="viewport">
        <header className="header">
          <nav
            ref={navRef}
            id="nav"
            className={`nav ${isOpen ? "nav--open" : ""}`}
          >
            {/* ACTUAL NAVIGATION MENU */}
            <ul
              className="nav__menu"
              id="menu"
              tabIndex={-1}
              aria-label="main navigation"
              hidden={!isOpen}
            >
              {LINKS.map((label, i) => (
                <li className="nav__item" key={label}>
                  <a
                    href="#"
                    className="nav__link"
                    ref={(el) => {
                      linkRefs.current[i] = el;
                    }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>

            {/* MENU TOGGLE BUTTON */}
            <a
              href="#nav"
              ref={toggleRef}
              className="nav__toggle"
              role="button"
              aria-expanded={isOpen}
              aria-controls="menu"
              onClick={handleToggle}
            >
              <svg className="menuicon" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
                <title>Toggle Menu</title>
                <g>
                  <line className="menuicon__bar" x1="13" y1="16.5" x2="37" y2="16.5" />
                  <line className="menuicon__bar" x1="13" y1="24.5" x2="37" y2="24.5" />
                  <line className="menuicon__bar" x1="13" y1="24.5" x2="37" y2="24.5" />
                  <line className="menuicon__bar" x1="13" y1="32.5" x2="37" y2="32.5" />
                </g>
              </svg>
            </a>

            {/* ANIMATED BACKGROUND ELEMENT */}
            <div className="splash" />
          </nav>
        </header>

        {/* DEMO CONTENT */}
        <main className="main">
          <div className="gallery" aria-label="gallery">
            {Array.from({ length: 20 }).map((_, i) => (
              <a href="#" className="gallery__item" key={`gallery-item-${i + 1}`} aria-label={`Gallery item ${i + 1}`} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(demo, document.body);
}
