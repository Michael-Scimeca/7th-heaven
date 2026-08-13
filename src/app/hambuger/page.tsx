"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

// Test page for /hambuger — recreation of Max Böck's
// "Animated Accessible Navigation" CodePen (https://codepen.io/mxbck/pen/xdaGNL)
// ported to React, wired up with the same a11y behavior:
//  - aria-expanded / hidden toggled on click
//  - Tab is trapped inside the menu while it's open
//  - Escape closes the menu and returns focus to the toggle

const LINKS = ["Home", "Shop", "Blog", "About", "Contact"];

export default function HamburgerTestPage() {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLAnchorElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

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

    nav.addEventListener("keydown", handleKeydown);
    return () => nav.removeEventListener("keydown", handleKeydown);
  }, [isOpen]);

  const handleToggle = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsOpen((v) => !v);
  };

  return (
    <div className="hb-page">
      <p className="hb-note">
        Test page — animated accessible hamburger nav, ported from{" "}
        <a href="https://codepen.io/mxbck/pen/xdaGNL" target="_blank" rel="noreferrer">
          Max Böck&rsquo;s CodePen
        </a>
        . Click the icon top-right of the screen below.
      </p>

      <div className="viewport">
        <header className="header">
          <nav
            ref={navRef}
            id="nav"
            className={`nav ${isOpen ? "nav--open" : ""}`}
            role="navigation"
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
                  <circle className="menuicon__circle" r="23" cx="25" cy="25" />
                </g>
              </svg>
            </a>

            {/* ANIMATED BACKGROUND ELEMENT */}
            <div className="splash" />
          </nav>
        </header>

        {/* DEMO CONTENT */}
        <main className="main" role="main">
          <div className="gallery" aria-label="gallery">
            {Array.from({ length: 20 }).map((_, i) => (
              <a href="#" className="gallery__item" key={i} />
            ))}
          </div>
        </main>
      </div>

      <style jsx>{`
        .hb-page {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
          padding: 48px 16px;
        }
        .hb-note {
          max-width: 420px;
          text-align: center;
          font-size: 0.8rem;
          letter-spacing: 0.04em;
          color: rgba(255, 255, 255, 0.55);
        }
        .hb-note a {
          color: var(--color-accent, #ff0a3d);
          text-decoration: underline;
        }

        .viewport {
          --screen-width: 320px;
          --screen-height: 560px;
          --header-bg-color: #673ab7;
          --splash-bg-color: #368887;

          width: var(--screen-width);
          height: var(--screen-height);
          margin: 0 auto;
          position: relative;
          overflow: hidden;
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
        }

        .header {
          height: 5rem;
          background-color: var(--header-bg-color);
        }

        .main {
          padding: 20px;
        }

        .gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
          grid-auto-rows: 90px;
          grid-gap: 14px;
        }
        .gallery :global(.gallery__item) {
          height: 100%;
          background-color: #d8d8d8;
          display: block;
        }
        .gallery :global(.gallery__item:hover),
        .gallery :global(.gallery__item:focus) {
          background-color: #a4a4a4;
        }

        /* ---------------------------
           Main Navigation Menu
        --------------------------- */
        .nav {
          position: relative;
        }
        .nav :global(.nav__toggle) {
          display: inline-block;
          position: absolute;
          z-index: 10;
          padding: 0;
          border: 0;
          background: transparent;
          outline: 0;
          right: 15px;
          top: 15px;
          cursor: pointer;
          border-radius: 50%;
          transition: background-color 0.15s linear;
        }
        .nav :global(.nav__toggle:hover),
        .nav :global(.nav__toggle:focus) {
          background-color: rgba(0, 0, 0, 0.5);
        }

        .nav :global(.nav__menu) {
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: var(--screen-height);
          position: relative;
          z-index: 5;
          visibility: hidden;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .nav :global(.nav__item) {
          opacity: 0;
          transition: all 0.3s cubic-bezier(0, 0.995, 0.99, 1) 0.3s;
        }
        .nav :global(.nav__item:nth-child(1)) { transform: translateY(-40px); }
        .nav :global(.nav__item:nth-child(2)) { transform: translateY(-80px); }
        .nav :global(.nav__item:nth-child(3)) { transform: translateY(-120px); }
        .nav :global(.nav__item:nth-child(4)) { transform: translateY(-160px); }
        .nav :global(.nav__item:nth-child(5)) { transform: translateY(-200px); }

        .nav :global(.nav__link) {
          color: white;
          display: block;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 5px;
          font-size: 1.1rem;
          text-decoration: none;
          padding: 1rem;
        }
        .nav :global(.nav__link:hover),
        .nav :global(.nav__link:focus) {
          outline: 0;
          background-color: rgba(0, 0, 0, 0.2);
        }

        /* ---------------------------
           SVG Menu Icon
        --------------------------- */
        .nav :global(.menuicon) {
          display: block;
          cursor: pointer;
          color: white;
          transform: rotate(0deg);
          transition: 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .nav :global(.menuicon__bar),
        .nav :global(.menuicon__circle) {
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          stroke-linecap: round;
        }
        .nav :global(.menuicon__bar) {
          transform: rotate(0deg);
          transform-origin: 50% 50%;
          transition: transform 0.25s ease-in-out;
        }
        .nav :global(.menuicon__circle) {
          transition: stroke-dashoffset 0.3s linear 0.1s;
          stroke-dashoffset: 144.513;
          stroke-dasharray: 144.513;
        }

        /* ---------------------------
           Circular Splash Background
        --------------------------- */
        .nav :global(.splash) {
          position: absolute;
          top: 40px;
          right: 40px;
          width: 1px;
          height: 1px;
        }
        .nav :global(.splash)::after {
          content: "";
          display: block;
          position: absolute;
          border-radius: 50%;
          background-color: var(--splash-bg-color);
          width: 284vmax;
          height: 284vmax;
          top: -142vmax;
          left: -142vmax;
          transform: scale(0);
          transform-origin: 50% 50%;
          transition: transform 0.5s cubic-bezier(0.755, 0.05, 0.855, 0.06);
          will-change: transform;
        }

        /* ---------------------------
           Active State
        --------------------------- */
        .nav.nav--open :global(> .splash)::after {
          transform: scale(1);
        }
        .nav.nav--open :global(.menuicon) {
          color: white;
          transform: rotate(180deg);
        }
        .nav.nav--open :global(.menuicon__circle) {
          stroke-dashoffset: 0;
        }
        .nav.nav--open :global(.menuicon__bar:nth-child(1)),
        .nav.nav--open :global(.menuicon__bar:nth-child(4)) {
          opacity: 0;
        }
        .nav.nav--open :global(.menuicon__bar:nth-child(2)) {
          transform: rotate(45deg);
        }
        .nav.nav--open :global(.menuicon__bar:nth-child(3)) {
          transform: rotate(-45deg);
        }
        .nav.nav--open :global(.nav__menu) {
          visibility: visible;
        }
        .nav.nav--open :global(.nav__item) {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
