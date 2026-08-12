/* eslint-disable react-doctor/no-giant-component */
"use client";
/* impeccable-disable codex-grid-background */
import Image from 'next/image';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// Colors matching the user's sitemap flowchart image
const FLOWCHART_COLORS = {
  home: "#ff6b8b",       // Pink
  teal: "#7feed2",       // Teal (Music)
  blue: "#75d5fa",       // Blue (Live)
  beige: "#cdc3a9",      // Beige (Merch)
  purple: "#c09aff",     // Purple (Band)
  coral: "#f9aa8f",      // Coral (Connect)
  lilac: "#decaff",      // Lilac (Admin/Blogs)
  yellow: "#ffd266",     // Yellow (Decision branches)
  darkbeige: "#a29983",  // Grey-Beige for Log In / Register
};

interface FlowNode {
  id: string;
  label: string;
  sub?: string;
  url?: string;
  color?: string; // bg color code
  textColor?: string;
}

interface FlowCardProps {
  label: string;
  sub?: string;
  url?: string;
  screenshot?: string;
  overlayScreenshot?: string;
  isEmail?: boolean;
  width?: string;
  height?: string;
  fontSize?: string;
}

function FlowCard({ label, sub, url, screenshot, overlayScreenshot, isEmail, width = "300px", height = "175px", fontSize = "17.5px" }: FlowCardProps) {
  const [imgVersion, setImgVersion] = useState("");
  useEffect(() => {
    setImgVersion(`?v=${Date.now()}`);
  }, []);

  const textContent = (
    <div style={{ textAlign: "center", width: "100%", marginBottom: "6px" }}>
      <div style={{ fontSize: fontSize, fontWeight: "800", color: "#e2e8f0", lineHeight: "1.25", letterSpacing: "-0.01em" }}>{label}</div>
      {sub && <div style={{ fontSize: "9.5px", color: "#64748b", fontWeight: "500", marginTop: "3px", lineHeight: "1.1" }}>{sub}</div>}
    </div>
  );

  const targetUrl = url || (isEmail && sub ? `/api/dev/email-preview?id=${sub}` : undefined);

  const handleCardClick = (e?: React.SyntheticEvent) => {
    if (screenshot || overlayScreenshot) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const activeSrc = overlayScreenshot 
        ? `/sitemap-screenshots/${overlayScreenshot}${imgVersion}` 
        : `/sitemap-screenshots/${screenshot}${imgVersion}`;
      window.dispatchEvent(new CustomEvent("flow-card-preview", { 
        detail: { src: activeSrc, label: label } 
      }));
    } else if (targetUrl) {
      window.location.href = targetUrl;
    }
  };

  const cardBox = (
    <button
      type="button"
      style={{
        width: width,
        height: height,
        borderRadius: "10px",
        border: isEmail ? `2px dashed #9333ea` : `1px solid rgba(255,255,255,0.08)`,
        boxShadow: isEmail ? "0 0 16px rgba(255,10,61,0.2)" : "0 4px 12px rgba(0,0,0,0.4)",
        overflow: "hidden",
        background: isEmail ? "rgba(255,10,61,0.06)" : "#0a0a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease",
        cursor: (screenshot || overlayScreenshot) ? "zoom-in" : (targetUrl ? "pointer" : "default")
      }}
      className="flowcard-img-container outline-none" onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick(e);
        }
      }}
    >
      {screenshot && (
        <Image width={200} height={200} unoptimized
          src={`/sitemap-screenshots/${screenshot}${imgVersion}`}
          alt={label}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      
      {overlayScreenshot && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(5,5,8,0.4)",
          backdropFilter: "blur(1px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6px"
        }}>
          <Image width={200} height={200} unoptimized
            src={`/sitemap-screenshots/${overlayScreenshot}${imgVersion}`}
            alt="overlay"
            style={{
              width: "85%",
              height: "85%",
              objectFit: "contain",
              borderRadius: "6px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          />
        </div>
      )}

      {targetUrl && (screenshot || overlayScreenshot) && (
        <Link href={targetUrl} style={{
          position: "absolute",
          top: "6px",
          right: "6px",
          background: "rgba(124,58,237,0.9)",
          color: "#fff",
          fontSize: "9px",
          fontWeight: "bold",
          padding: "3px 8px",
          borderRadius: "6px",
          textDecoration: "none",
          zIndex: 10,
          cursor: "pointer",
          letterSpacing: "0.5px"
        }} onClick={(e) => {
          e.stopPropagation();
        }}
        >
          GO ↗
        </Link>
      )}

      {!screenshot && !overlayScreenshot && (
        <span style={{ fontSize: "28px", opacity: 0.4 }}>{isEmail ? "✉️" : "📄"}</span>
      )}
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: width, transition: "transform 0.25s, opacity 0.25s", padding: "6px 0" }} className="flowcard-wrapper">
      {textContent}
      {cardBox}
    </div>
  );
}

interface EmailListItemProps {
  label: string;
  sub: string;
  screenshot?: string;
  colorTheme: {
    primary: string;
    border: string;
    bg: string;
  };
}

function EmailListItem({ label, sub, screenshot, colorTheme }: EmailListItemProps) {
  const [imgVersion, setImgVersion] = useState("");
  useEffect(() => {
    setImgVersion(`?v=${Date.now()}`);
  }, []);

  const handleClick = () => {
    if (screenshot) {
      window.dispatchEvent(new CustomEvent("flow-card-preview", { 
        detail: { 
          src: `/sitemap-screenshots/${screenshot}${imgVersion}`, 
          label: label 
        } 
      }));
    }
  };

  const hasScreenshot = !!screenshot;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full text-left border-0 p-0 outline-none ${hasScreenshot ? "email-item-interactive" : ""}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        padding: "8px 12px",
        background: colorTheme.bg,
        border: `1px ${hasScreenshot ? 'solid' : 'dashed'} ${colorTheme.border}`,
        borderRadius: "8px",
        cursor: hasScreenshot ? "zoom-in" : "default",
        transition: "background-color 0.2s, border-color 0.2s, transform 0.2s",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
        {hasScreenshot ? (
          <div style={{
            width: "52px",
            height: "36px",
            borderRadius: "4px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "#050508",
            flexShrink: 0,
            boxShadow: "0 2px 4px rgba(0,0,0,0.4)"
          }}>
            <Image width={200} height={200} unoptimized
              src={`/sitemap-screenshots/${screenshot}${imgVersion}`}
              alt={label}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        ) : (
          <span style={{ fontSize: "16px", opacity: 0.6, width: "52px", textAlign: "center", flexShrink: 0 }}>✉️</span>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
          <div style={{ fontSize: "9px", color: "#64748b", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>
        </div>
      </div>
      
      {hasScreenshot && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          background: "rgba(255,255,255,0.06)",
          padding: "3px 8px",
          borderRadius: "4px",
          border: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0
        }}>
          <span style={{ fontSize: "8.5px", color: colorTheme.primary, fontWeight: "950", textTransform: "uppercase", letterSpacing: "0.5px" }}>VIEW</span>
        </div>
      )}
    </button>
  );
}

export default function FlowchartPage() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Lightbox modal preview state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>("");

  useEffect(() => {
    const handlePreview = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.src) {
        setLightboxImage(detail.src);
        setLightboxTitle(detail.label || "");
      }
    };
    window.addEventListener("flow-card-preview", handlePreview);
    return () => window.removeEventListener("flow-card-preview", handlePreview);
  }, []);

  const [zoom, setZoom] = useState(0.85);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Zoom in or out centered
      setZoom(z => Math.max(0.15, Math.min(2.5, z - e.deltaY * 0.001)));
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left button
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button") || target.closest("input")) {
      return;
    }
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx - panOffset.x) > 3 || Math.abs(dy - panOffset.y) > 3) {
      hasDraggedRef.current = true;
    }
    setPanOffset({ x: dx, y: dy });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };



  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      className="flowchart-root"
      role="region"
      aria-label="Interactive flowchart canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClickCapture={handleClickCapture}
      style={{
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none"
      }}
    >
      <style>{`
        @keyframes dashFlow {
          from { background-position: 0 0; }
          to { background-position: 0 40px; }
        }
        @keyframes dashFlowH {
          from { background-position: 0 0; }
          to { background-position: 40px 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(124,58,237,0.15); }
          50% { box-shadow: 0 0 20px rgba(124,58,237,0.3); }
        }

        body {
          background-color: #1a1a2e !important;
          color: #e2e8f0 !important;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        /* Hide global header/footer, dev navigator button, and chat widgets */
        header:not(.flowchart-header),
        footer,
        .fixed.bottom-8.left-8,
        [class*="chat-widget"],
        [class*="PageNav"] {
          display: none !important;
        }

        .flowchart-root {
          min-height: 100vh;
          background: #1a1a2e;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          user-select: none;
        }

        /* Top Header Control Panel */
        .flowchart-header {
          width: 100%;
          max-width: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 20px;
        }

        .flowchart-title h1 {
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }

        .flowchart-title p {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }

        .sitemap-toggle-btn {
          padding: 10px 20px;
          font-weight: 700;
          font-size: 14px;
          color: #94a3b8;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .sitemap-toggle-btn:hover {
          background: rgba(124,58,237,0.12);
          border-color: rgba(124,58,237,0.3);
          color: #c4b5fd;
        }

        /* Sitemap Canvas Layout */
        .canvas-container {
          position: relative;
          width: 100%;
          max-width: none; width: max-content;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Home Node Row */
        .home-node-row {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
          width: 100%;
          position: relative;
        }

        /* Base Node Box */
        .flow-node-box {
          width: 160px;
          padding: 12px 10px;
          font-size: 12px;
          font-weight: 700;
          text-align: center;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          color: #000;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          text-decoration: none;
        }

        .flow-node-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.4);
        }

        .flow-node-box .node-sub {
          font-size: 10px;
          font-weight: 500;
          opacity: 0.6;
          margin-top: 4px;
        }

        /* Connector lines — vertical */
        .home-to-nav-line {
          width: 2px;
          height: 80px;
          background: rgba(124,58,237,0.4);
        }

        .nav-horizontal-bar {
          width: 94.5%;
          height: 2px;
          background: rgba(124,58,237,0.4);
        }
          background-size: 40px 2px;
          animation: dashFlowH 1.2s linear infinite;
          margin-bottom: 10px;
        }

        /* Flow Columns Layout */
        .columns-grid {
          display: flex;
          justify-content: space-between;
          width: 100%;
          position: relative;
          gap: 80px;
        }

        .flow-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          min-width: 320px;
        }

        /* Connector lines — vertical connectors */
        .node-connector-line {
          width: 2px;
          height: 80px;
          background: rgba(124,58,237,0.4);
        }
          background-size: 2px 40px;
          animation: dashFlow 1.2s linear infinite;
        }

        /* Horizontal Split Branches */
        .branch-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          position: relative;
        }

        .branch-row {
          display: flex;
          justify-content: center;
          gap: 20px;
          width: 100%;
          position: relative;
        }

        .branch-join-line {
          width: 2px;
          height: 60px;
          background: rgba(124,58,237,0.4);
        }

        .flowcard-wrapper:hover .flowcard-img-container {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(124,58,237,0.25), 0 0 0 1px rgba(124,58,237,0.3) !important;
        }

        .zoom-btn:hover {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(124,58,237,0.4) !important;
          transform: scale(1.05);
        }

        /* Animated horizontal dashed branch lines */
        .branch-h-line {
          height: 2px;
          background: repeating-linear-gradient(
            to right,
            rgba(124,58,237,0.5) 0px,
            rgba(124,58,237,0.5) 5px,
            transparent 5px,
            transparent 10px
          );
          background-size: 40px 2px;
          animation: dashFlowH 1.2s linear infinite;
        }

        .email-item-interactive:hover {
          transform: translateY(-2px) scale(1.015);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border-color: rgba(255, 255, 255, 0.25) !important;
          background: rgba(255,255,255,0.08) !important;
        }
        .email-item-interactive:active {
          transform: scale(0.99);
        }
      `}</style>

      {/* Control Panel Header */}
      <header className="flowchart-header">
        <div className="flowchart-title">
          <h1>🗺️ Platform UX Flowchart & Sitemap</h1>
          <p>Structured with main navigation pages as the top first row, branching down into sub-pages.</p>
        </div>

      </header>

      {/* Canvas */}
      <div 
        ref={containerRef}
        style={{
          width: "100%",
          overflow: "hidden",
          position: "relative",
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          minHeight: "85vh",
          paddingBottom: "100px"
        }}
      >
        <div style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: "top center",
          transition: isDragging ? "none" : "transform 0.15s ease-out",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <main className="canvas-container">
        {/* Row 1: Home Page */}
        <div className="home-node-row">
          <FlowCard
            label="Home Page"
            sub="/"
            url="/"
            screenshot="home.png"
          />
        </div>

        {/* Home connection down to the horizontal bar */}
        <div className="home-to-nav-line" />
        <div className="nav-horizontal-bar" />

        {/* Main Flow Columns - Top item in each column is the Nav Header */}
        <div className="columns-grid">
          {/* Column 1: Band Bio (Purple) — now a homepage section, not a standalone route */}
          <div className="flow-column">
            <FlowCard
              label="Band"
              sub="Homepage Section · /#band"
              url="/#band"
              screenshot="bio.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Band Members"
              sub="Bios inside Band section"
              url="/#band"
              screenshot="members.png"
            />
          </div>

          {/* Column 2: Music Experience (Teal) */}
          <div className="flow-column">
            <FlowCard
              label="Music Player (Homepage)"
              sub="/#music"
              url="/#music"
              screenshot="music.png"
            />
            <div className="node-connector-line" />
            
            <FlowCard
              label="Albums"
              sub="List Releases"
              screenshot="albums.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Singles & Media"
              sub="Audio Players"
              screenshot="music.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Lyrics Page"
              sub="Song Details"
              screenshot="lyrics-page.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Streaming Links"
              sub="Spotify/Apple"
              screenshot="music.png"
            />
          </div>

          {/* Column 3: Merch (Beige) */}
          <div className="flow-column" style={{ minWidth: "700px" }}>
            <FlowCard
              label="Merch"
              sub="/merch"
              url="/merch"
              screenshot="merch.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Storefront"
              sub="/store (redirects to /merch)"
              url="/store"
              screenshot="store.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Product List"
              sub="Browse Items"
              screenshot="store-products.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Product Detail"
              sub="/store/[slug]"
              screenshot="store-detail.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Add to Cart"
              sub="✓ Item Added"
              screenshot="store-cart.png"
            />
            <div className="node-connector-line" />

            {/* Split branch: Logged In vs Not Logged In */}
            <div className="branch-wrapper">
              <div className="branch-h-line" style={{ width: "360px", position: "absolute", top: "0" }} />
              <div style={{ display: "flex", gap: "40px", width: "100%", justifyContent: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "320px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: FLOWCHART_COLORS.yellow, width: "120px", minHeight: "32px", padding: "4px", fontSize: "13.5px" }}>
                    Not Logged In
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Log In / Register"
                    url="/cruise/verify"
                    screenshot="login-modal.png"
                    width="300px"
                    height="175px"
                    fontSize="17.5px"
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "320px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: FLOWCHART_COLORS.yellow, width: "120px", minHeight: "32px", padding: "4px", fontSize: "13.5px" }}>
                    Logged In
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Fan Dashboard"
                    url="/fans/super_fan"
                    screenshot="fan-dashboard.png"
                    width="300px"
                    height="175px"
                    fontSize="17.5px"
                  />
                </div>
              </div>
              <div className="branch-h-line" style={{ width: "360px", marginTop: "10px" }} />
              <div className="branch-join-line" />
            </div>

            <FlowCard
              label="Checkout"
              sub="Complete Order"
              screenshot="store-checkout.png"
            />
            <div className="node-connector-line" />
            <FlowCard
              label="📧 Email: Order Confirmation"
              sub="merch_shipping"
              screenshot="email-flash-shipping.png"
            />
            <div className="node-connector-line" />
            <FlowCard
              label="Admin purchase notify & inventory update"
              sub="Admin Page"
              screenshot="admin-inventory.png"
              url="/admin"
            />
          </div>

          {/* Column 4: Media (Purple) */}
          <div className="flow-column">
            <FlowCard
              label="Media"
              sub="/media (formerly /video)"
              url="/media"
              screenshot="media.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Playlist Tabs"
              sub="Browse Videos"
              screenshot="video.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Inline Player"
              sub="16:9 Video Player"
              screenshot="video.png"
            />
          </div>

          {/* Column 4b: Contact (Coral) */}
          <div className="flow-column">
            <FlowCard
              label="Contact"
              sub="/contact"
              url="/contact"
              screenshot="contact.png"
            />
          </div>

          {/* Column 4c: Utility & Info Pages (Blue) */}
          <div className="flow-column">
            <div style={{
              background: "linear-gradient(135deg, rgba(117,213,250,0.15), rgba(117,213,250,0.06))",
              border: "1px solid rgba(117,213,250,0.3)",
              borderRadius: "14px",
              padding: "14px 20px",
              textAlign: "center",
              marginBottom: "8px",
              width: "260px"
            }}>
              <div style={{ fontSize: "22px", marginBottom: "4px" }}>📄</div>
              <div style={{ fontSize: "16px", fontWeight: "900", color: "#bee9fb", letterSpacing: "-0.01em" }}>Utility & Info Pages</div>
              <div style={{ fontSize: "10px", color: "#75d5fa", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>Standalone Reference Pages</div>
            </div>
            <div className="node-connector-line" />

            <FlowCard
              label="FAQ"
              sub="/faq"
              url="/faq"
              screenshot="faq.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Features"
              sub="/features"
              url="/features"
              screenshot="features.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Style Guide"
              sub="/style-guide"
              url="/style-guide"
              screenshot="style-guide.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Picks"
              sub="/picks"
              url="/picks"
              screenshot="picks.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Ticker"
              sub="/ticker"
              url="/ticker"
              screenshot="ticker.png"
            />
          </div>

          {/* Column 4d: Legal & Policies (Lilac) */}
          <div className="flow-column">
            <div style={{
              background: "linear-gradient(135deg, rgba(222,202,255,0.15), rgba(222,202,255,0.06))",
              border: "1px solid rgba(222,202,255,0.3)",
              borderRadius: "14px",
              padding: "14px 20px",
              textAlign: "center",
              marginBottom: "8px",
              width: "260px"
            }}>
              <div style={{ fontSize: "22px", marginBottom: "4px" }}>⚖️</div>
              <div style={{ fontSize: "16px", fontWeight: "900", color: "#f1e9ff", letterSpacing: "-0.01em" }}>Legal & Policies</div>
              <div style={{ fontSize: "10px", color: "#decaff", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>Footer Nav Pages</div>
            </div>
            <div className="node-connector-line" />

            <FlowCard
              label="Privacy Policy"
              sub="/privacy"
              url="/privacy"
              screenshot="privacy.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Terms of Service"
              sub="/terms"
              url="/terms"
              screenshot="terms.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Returns & Refunds"
              sub="/returns"
              url="/returns"
              screenshot="returns.png"
            />
          </div>

          {/* Column 4e: Payment Flow (Teal) */}
          <div className="flow-column">
            <div style={{
              background: "linear-gradient(135deg, rgba(127,238,210,0.15), rgba(127,238,210,0.06))",
              border: "1px solid rgba(127,238,210,0.3)",
              borderRadius: "14px",
              padding: "14px 20px",
              textAlign: "center",
              marginBottom: "8px",
              width: "260px"
            }}>
              <div style={{ fontSize: "22px", marginBottom: "4px" }}>💳</div>
              <div style={{ fontSize: "16px", fontWeight: "900", color: "#d3f9ec", letterSpacing: "-0.01em" }}>Payment Flow</div>
              <div style={{ fontSize: "10px", color: "#7feed2", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>Checkout & Sandbox Testing</div>
            </div>
            <div className="node-connector-line" />

            <FlowCard
              label="Payment"
              sub="/payment"
              url="/payment"
              screenshot="payment.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Payment Test"
              sub="/payment-test — sandbox entry"
              url="/payment-test"
              screenshot="payment-test.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Test Checkout"
              sub="/payment-test/checkout"
              url="/payment-test/checkout"
              screenshot="payment-test-checkout.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Test Result"
              sub="/payment-test/result"
              screenshot="payment-test-result.png"
              url="/payment-test/result"
            />
          </div>

          <div className="flow-column" style={{ minWidth: "1350px" }}>
            <FlowCard
              label="Live"
              sub="/live"
              url="/live"
              screenshot="live.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Live Feed"
              sub="/live/[room]"
              screenshot="live-feed.png"
            />
            <div className="node-connector-line" />

            {/* Split branch: Raffle Flow vs Flash Sale Flow */}
            <div className="branch-wrapper" style={{ minHeight: "380px" }}>
              <div className="branch-h-line" style={{ width: "584px", position: "absolute", top: "0" }} />
              <div style={{ display: "flex", gap: "24px", width: "100%", justifyContent: "center" }}>
                
                {/* Branch A: Raffle Flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "620px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: FLOWCHART_COLORS.yellow, width: "150px", minHeight: "34px", padding: "4px", fontSize: "10.5px" }}>
                    🎟️ Live Raffle Draw
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: Raffle Entry"
                    sub="raffle_entry"
                    isEmail={true}
                    screenshot="raffle-entry-preview.png"
                  />
                  <div className="node-connector-line" />
                  <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", justifyContent: "center" }}>
                    <FlowCard
                      label="📩 Email: Raffle Win Claim"
                      sub="raffle_win"
                      isEmail={true}
                      screenshot="raffle-win-preview.png"
                      width="300px"
                      height="175px"
                      fontSize="14.5px"
                    />
                    <FlowCard
                      label="📩 Email: Raffle Loss"
                      sub="raffle_loss"
                      isEmail={true}
                      screenshot="raffle-loss-preview.png"
                      width="300px"
                      height="175px"
                      fontSize="14.5px"
                    />
                  </div>
                </div>

                {/* Branch B: Flash Sale Flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "300px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: FLOWCHART_COLORS.yellow, width: "150px", minHeight: "34px", padding: "4px", fontSize: "10.5px" }}>
                    ⚡ Flash Merch Sale
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Flash Sale Popup"
                    sub="Live Chat Overlay"
                    screenshot="live-flash-sale.png"
                  />
                  <div className="node-connector-line" />
                  <FlowCard
                    label="Ship or Pick Up"
                    sub="Choose delivery method"
                    screenshot="live-flash-checkout.png"
                  />
                  <div className="node-connector-line" />

                  {/* Sub-branch split: Pick Up vs Ship Home */}
                  <div className="branch-wrapper" style={{ minHeight: "260px" }}>
                    <div className="branch-h-line" style={{ width: "360px", position: "absolute", top: "0" }} />
                    <div style={{ display: "flex", gap: "40px", width: "100%", justifyContent: "center" }}>
                      
                      {/* Sub-branch A: Merch Table Pickup */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "320px" }}>
                        <div className="branch-join-line" />
                        <FlowCard
                          label="Purchase Success"
                          sub="QR Code Overlay"
                          screenshot="live-flash-success.png"
                          width="300px"
                          height="175px"
                          fontSize="14.5px"
                        />
                        <div className="node-connector-line" />
                        <FlowCard
                          label="📩 Email: Merch QR"
                          sub="merch_purchase"
                          isEmail={true}
                          screenshot="email-flash-pickup.png"
                          width="300px"
                          height="175px"
                          fontSize="14.5px"
                        />
                        <div className="node-connector-line" style={{ height: "144px" }} />
                      </div>
 
                      {/* Sub-branch B: Ship to Home (Shopify API) */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "320px" }}>
                        <div className="branch-join-line" />
                        <FlowCard
                          label="Shopify Checkout"
                          sub="Shopify Storefront API"
                          screenshot="live-flash-ship-checkout.png"
                          url="/store"
                          width="300px"
                          height="175px"
                          fontSize="14.5px"
                        />
                        <div className="node-connector-line" />
                        <FlowCard
                          label="Purchase Success"
                          sub="Shipping Info Overlay"
                          screenshot="live-flash-ship-success.png"
                          width="300px"
                          height="175px"
                          fontSize="14.5px"
                        />
                        <div className="node-connector-line" />
                        <FlowCard
                          label="📩 Email: Shopify Receipt"
                          sub="merch_purchase"
                          isEmail={true}
                          screenshot="email-flash-shipping.png"
                          width="300px"
                          height="175px"
                          fontSize="14.5px"
                        />
                        <div className="node-connector-line" />
                      </div>
                    </div>
                    {/* Bottom join horizontal line merging Sub-branch A and B */}
                    <div className="branch-h-line" style={{ width: "360px" }} />
                    <div className="branch-join-line" />
                  </div>
 
                  <FlowCard
                    label="Admin dashboard purchase add to list"
                    sub="Admin Page"
                    screenshot="admin-inventory.png"
                    url="/admin"
                    width="300px"
                    height="175px"
                    fontSize="14.5px"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Column 6: Cruise Flow (Lilac) */}
          <div className="flow-column">
            {/* Step 1: Cruise Landing Page */}
            <FlowCard
              label="Cruise Page"
              sub="/cruise"
              url="/cruise"
              screenshot="cruise.png"
            />
            <div className="node-connector-line" />

            {/* Step 2: Form Filled Out & Submitted */}
            <FlowCard
              label="Cruise Form Submitted"
              sub="User fills out booking form"
              screenshot="cruise-form-filled.png"
            />
            <div className="node-connector-line" />

            {/* Step 3: PIN Code Sent via Email */}
            <FlowCard
              label="📩 Email: PIN Code Sent"
              sub="6-digit code emailed to user"
              isEmail={true}
              screenshot="email-pin-verification.png"
            />
            <div className="node-connector-line" />

            {/* Step 4: User Enters PIN from Email into Module */}
            <FlowCard
              label="Enter PIN from Email"
              sub="Types code into verify module"
              screenshot="cruise-verify.png"
            />
            <div className="node-connector-line" />

            {/* Step 5: PIN Correct → Cruise Dashboard */}
            <FlowCard
              label="Cruise Dashboard"
              sub="/cruise/dashboard"
              url="/cruise/dashboard"
              screenshot="cruise-dashboard.png"
            />
            <div className="node-connector-line" />

            {/* Step 6: Confirmation Email Sent to Member */}
            <FlowCard
              label="📩 Email: Member Confirmation"
              sub="cruise_confirmation"
              isEmail={true}
              screenshot="email-cruise-confirm.png"
            />
            <div className="node-connector-line" />

            {/* Step 7: Email Sent to Admin */}
            <FlowCard
              label="📩 Email: Admin New Member"
              sub="Admin notified of signup"
              isEmail={true}
              screenshot="email-cruise-confirm.png"
            />
            <div className="node-connector-line" />

            {/* Step 8: Info Sent to Admin Dashboard */}
            <FlowCard
              label="Admin: Cruise Roster Update"
              sub="Signup added to roster"
              screenshot="admin-cruise-roster.png"
              url="/admin"
            />
            <div className="node-connector-line" />

            {/* Supplementary emails */}
            <FlowCard
              label="📩 Email: Community Welcome"
              sub="cruise_community"
              isEmail={true}
              screenshot="email-cruise-welcome.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="📩 Email: Cruise Cancel"
              sub="cruise_cancellation"
              isEmail={true}
              screenshot="email-cruise-cancel.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="📩 Email: Cruise News Blast"
              sub="cruise_community_blast"
              isEmail={true}
              screenshot="email-cruise-blast.png"
            />
          </div>

          {/* Column 7: Fan Wall (Coral) */}
          <div className="flow-column" style={{ minWidth: "1400px" }}>
            <FlowCard
              label="Fan Wall"
              sub="/fan-photo-wall"
              url="/fan-photo-wall"
              screenshot="fan-photo-wall.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Press Upload"
              sub="Check authentication"
              screenshot="fan-photo-wall.png"
            />
            <div className="node-connector-line" />

            {/* Split branch for Logged In check */}
            <div className="branch-wrapper">
              <div className="branch-h-line" style={{ width: "720px", position: "absolute", top: "0" }} />
              
              <div style={{ display: "flex", gap: "40px", width: "100%", justifyContent: "center" }}>
                {/* Branch: If Logged In */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "680px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: FLOWCHART_COLORS.yellow, width: "120px", minHeight: "32px", padding: "4px", fontSize: "13.5px" }}>
                    If Logged In
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Upload Box Overlay"
                    sub="Image(s) or video"
                    url="/fan-photo-wall?mockUpload=true"
                    screenshot="fan-upload-form.png"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Submit Content"
                    sub="Send to review"
                    url="/fan-photo-wall?mockScanning=true"
                    screenshot="fan-upload-scanning.png"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Success Message"
                    sub="Centered thanks modal"
                    url="/fan-photo-wall?mockSuccess=true"
                    screenshot="fan-upload-success.png"
                  />
                  <div className="branch-join-line" style={{ flexGrow: 1, minHeight: "60px" }} />
                </div>

                {/* Branch: If NOT Logged In */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "680px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: FLOWCHART_COLORS.yellow, width: "120px", minHeight: "32px", padding: "4px", fontSize: "13.5px" }}>
                    If NOT Logged In
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Auth Gateway"
                    sub="Sign Up / Sign In modals"
                    screenshot="login-modal.png"
                  />
                  <div className="branch-join-line" />
                  
                  {/* Decision sub-branch */}
                  <div className="branch-wrapper">
                    <div className="branch-h-line" style={{ width: "360px", position: "absolute", top: "0" }} />
                    <div style={{ display: "flex", gap: "40px", width: "100%", justifyContent: "center" }}>
                      {/* Sub-branch: Cancel Auth */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "320px" }}>
                        <div className="branch-join-line" />
                        <div className="flow-node-box" style={{ backgroundColor: "#ef4444", color: "#ffffff", width: "120px", minHeight: "32px", padding: "4px", fontSize: "13.5px" }}>
                          Cancel
                        </div>
                        <div className="branch-join-line" />
                        <FlowCard
                          label="&quot;Sign up to submit content&quot;"
                          sub="Sign Up Module overlay"
                          screenshot="signup-modal.png"
                        />
                        <div className="branch-join-line" style={{ flexGrow: 1, minHeight: "60px" }} />
                      </div>
                      
                      {/* Sub-branch: Auth Success */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "320px" }}>
                        <div className="branch-join-line" />
                        <div className="flow-node-box" style={{ backgroundColor: "#10b981", color: "#ffffff", width: "120px", minHeight: "32px", padding: "4px", fontSize: "13.5px" }}>
                          Success
                        </div>
                        <div className="branch-join-line" />
                        <FlowCard
                          label="Proceeds to Upload Box"
                          sub="Form shown post-auth"
                          screenshot="fan-upload-form.png"
                        />
                        <div className="branch-join-line" />
                        <FlowCard
                          label="Submit Content"
                          sub="Send to review"
                          screenshot="fan-upload-scanning.png"
                        />
                        <div className="branch-join-line" />
                        <FlowCard
                          label="Success Message"
                          sub="Centered thanks modal"
                          screenshot="fan-upload-success.png"
                        />
                        <div className="branch-join-line" style={{ flexGrow: 1, minHeight: "60px" }} />
                      </div>
                    </div>
                    {/* Bottom join horizontal line merging Cancel and Success */}
                    <div className="branch-h-line" style={{ width: "360px", marginTop: "10px" }} />
                    <div className="branch-join-line" />
                  </div>
                </div>
              </div>
              {/* Bottom join horizontal line merging If Logged In and If NOT Logged In */}
              <div className="branch-h-line" style={{ width: "720px", marginTop: "10px" }} />
              <div className="branch-join-line" />
            </div>
            
            <div className="node-connector-line" />
            <FlowCard
              label="Admin Review"
              sub="Moderation queue"
              screenshot="admin.png"
            />
            <div className="node-connector-line" />

            {/* Split branch for Admin Decision */}
            <div className="branch-wrapper">
              <div className="branch-h-line" style={{ width: "360px", position: "absolute", top: "0" }} />
              
              <div style={{ display: "flex", gap: "40px", width: "100%", justifyContent: "center" }}>
                {/* Branch: Approved */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "320px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: "#10b981", color: "#ffffff", width: "120px", minHeight: "32px", padding: "4px", fontSize: "13.5px" }}>
                    If Approved
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Publish to Wall"
                    sub="Approved gallery view"
                    screenshot="fan-photo-wall.png"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: Approved"
                    sub="fan_upload_approved"
                    isEmail={true}
                    screenshot="email-upload-approved.png"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Fan Dashboard"
                    sub="Shows 'Published' status"
                    screenshot="fan-dashboard.png"
                    url="/fans"
                  />
                </div>

                {/* Branch: Rejected */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "320px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: "#ef4444", color: "#ffffff", width: "120px", minHeight: "32px", padding: "4px", fontSize: "13.5px" }}>
                    If Rejected
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Reject Content"
                    sub="Warn or ban user"
                    screenshot="admin.png"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: Upload Rejected"
                    sub="fan_upload_rejected"
                    isEmail={true}
                    screenshot="email-upload-rejected.png"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Fan Dashboard"
                    sub="Shows 'Declined' reason"
                    screenshot="fan-dashboard-rejected.png"
                    url="/fans"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column 8: Booking (Coral) */}
          <div className="flow-column">
            <FlowCard
              label="Book Us"
              sub="/book"
              url="/book"
              screenshot="book.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="📩 Email: Planner Confirmation"
              sub="booking_confirmation"
              isEmail={true}
              screenshot="email-booking-confirm.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="📩 Email: Admin Booking Alert"
              sub="booking_admin"
              isEmail={true}
              screenshot="email-booking-admin.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Admin Dashboard"
              sub="Booking Review Queue"
              url="/admin"
              screenshot="admin.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="📩 Email: Booking Accepted"
              sub="booking_status"
              isEmail={true}
              screenshot="email-booking-status.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="📩 Email: Booking Cancel Alert"
              sub="booking_cancelled_admin"
              isEmail={true}
              screenshot="email-booking-cancelled-admin.png"
            />
           </div>

          {/* Column 9: Sign Up / Onboarding (Purple/Grey) */}
          <div className="flow-column" style={{ minWidth: "1620px" }}>
            <FlowCard
              label="Sign Up"
              sub="/members (Register)"
              screenshot="signup-modal.png"
              width="300px"
              height="175px"
            />
            <div className="node-connector-line" />

            {/* Split branch for all 5 User Roles and their sign up flows */}
            <div className="branch-wrapper">
              <div className="branch-h-line" style={{ width: "1296px", position: "absolute", top: "0" }} />
              
              <div style={{ display: "flex", gap: "20px", width: "100%", justifyContent: "center" }}>
                {/* Admin flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "304px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: FLOWCHART_COLORS.yellow, width: "300px", minHeight: "32px", padding: "4px", fontSize: "13.5px" }}>
                    Admin Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Request PIN"
                    screenshot="signup-modal.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: PIN"
                    sub="pin_number"
                    isEmail={true}
                    screenshot="email-pin-verification.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Verify PIN"
                    screenshot="signup-modal.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Set Password"
                    screenshot="signup-modal.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email Alert"
                    sub="new_account_admin_alert"
                    isEmail={true}
                    screenshot="email-new-account-admin-alert.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Admin Panel"
                    url="/admin"
                    screenshot="admin.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                </div>

                {/* Crew flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "304px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: FLOWCHART_COLORS.yellow, width: "300px", minHeight: "32px", padding: "4px", fontSize: "13.5px" }}>
                    Crew Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Request PIN"
                    screenshot="signup-modal.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: PIN"
                    sub="pin_number"
                    isEmail={true}
                    screenshot="email-pin-verification.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Verify PIN"
                    screenshot="signup-modal.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Set Password"
                    screenshot="signup-modal.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: Crew"
                    sub="welcome_crew"
                    isEmail={true}
                    screenshot="email-welcome-crew.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email Alert"
                    sub="new_account_admin_alert"
                    isEmail={true}
                    screenshot="email-new-account-admin-alert.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Crew Dashboard"
                    url="/crew"
                    screenshot="crew-dashboard.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                </div>

                {/* Fan flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "304px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: FLOWCHART_COLORS.yellow, width: "300px", minHeight: "32px", padding: "4px", fontSize: "13.5px" }}>
                    Fan Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Request PIN / CSV"
                    screenshot="signup-modal.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: PIN"
                    sub="pin_number"
                    isEmail={true}
                    screenshot="email-pin-verification.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Verify PIN"
                    screenshot="signup-modal.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: Welcome Fan"
                    sub="welcome_fan"
                    isEmail={true}
                    screenshot="email-welcome-fan.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email Alert"
                    sub="new_account_admin_alert"
                    isEmail={true}
                    screenshot="email-new-account-admin-alert.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Fan Dash"
                    url="/fans"
                    screenshot="fans.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Proximity Demo"
                    url="/demo/proximity"
                    screenshot="proximity-demo.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                </div>

                {/* Planner flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "304px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: FLOWCHART_COLORS.yellow, width: "300px", minHeight: "32px", padding: "4px", fontSize: "13.5px" }}>
                    Planner Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Request PIN"
                    screenshot="signup-modal.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: PIN"
                    sub="pin_number"
                    isEmail={true}
                    screenshot="email-pin-verification.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Verify PIN"
                    screenshot="signup-modal.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: Welcome"
                    sub="welcome_planner"
                    isEmail={true}
                    screenshot="email-welcome-planner.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email Alert"
                    sub="new_account_admin_alert"
                    isEmail={true}
                    screenshot="email-new-account-admin-alert.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Planner Dash"
                    url="/planner"
                    screenshot="planner.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                </div>

                {/* Cruise passenger flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "304px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: FLOWCHART_COLORS.yellow, width: "300px", minHeight: "32px", padding: "4px", fontSize: "13.5px" }}>
                    Cruise Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Book Cruise"
                    url="/cruise"
                    screenshot="cruise.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: PIN"
                    sub="pin_number"
                    isEmail={true}
                    screenshot="email-pin-verification.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Verify PIN"
                    sub="Enter PIN"
                    screenshot="cruise.png"
                    overlayScreenshot="cruise-verify.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: Welcome"
                    sub="cruise_community"
                    isEmail={true}
                    screenshot="email-cruise-welcome.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email Alert"
                    sub="new_account_admin_alert"
                    isEmail={true}
                    screenshot="email-new-account-admin-alert.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Cruise Lounge"
                    url="/cruise/dashboard"
                    screenshot="cruise-dashboard.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column 10: Sign In / Access Flows (Purple/Grey) */}
          <div className="flow-column" style={{ minWidth: "1620px" }}>
            <FlowCard
              label="Sign In"
              sub="/members (Login)"
              screenshot="login-modal.png"
              width="300px"
              height="175px"
            />
            <div className="node-connector-line" />

            {/* Split branch for all 5 User Roles and their sign in flows */}
            <div className="branch-wrapper">
              <div className="branch-h-line" style={{ width: "1296px", position: "absolute", top: "0" }} />
              
              <div style={{ display: "flex", gap: "20px", width: "100%", justifyContent: "center" }}>
                {/* Admin flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "304px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: FLOWCHART_COLORS.yellow, width: "300px", minHeight: "32px", padding: "4px", fontSize: "13.5px" }}>
                    Admin Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Enter PW"
                    screenshot="login-modal.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Admin Panel"
                    url="/admin"
                    screenshot="admin.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                </div>

                {/* Crew flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "304px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: FLOWCHART_COLORS.yellow, width: "300px", minHeight: "32px", padding: "4px", fontSize: "13.5px" }}>
                    Crew Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Enter PW"
                    screenshot="login-modal.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Crew Dashboard"
                    url="/crew"
                    screenshot="crew-dashboard.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: FLOWCHART_COLORS.darkbeige, width: "300px", minHeight: "48px", padding: "6px", fontSize: "10.5px", color: "#1a1a2e" }}>
                    Direct Member Shortcuts (dev/QR): /crew-abbie, /crew-michael, /crew-ryan, /crew-sam, /crew-tony — each opens Crew Dashboard preset to that member
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: Shift Update Report"
                    sub="crew_hours_summary"
                    isEmail={true}
                    screenshot="email-crew-hours-summary.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: Admin Sent Out Schedule"
                    sub="schedule_change_alert"
                    isEmail={true}
                    screenshot="email-schedule-change-alert.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: Crew SMS Dispatched Alert"
                    sub="crew_sms_dispatched_alert"
                    isEmail={true}
                    screenshot="email-welcome-crew.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: Crew SMS Alert Received"
                    sub="crew_sms_alert_received"
                    isEmail={true}
                    screenshot="email-welcome-crew.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                </div>

                {/* Fan flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "304px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: FLOWCHART_COLORS.yellow, width: "300px", minHeight: "32px", padding: "4px", fontSize: "13.5px" }}>
                    Fan Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Enter PW"
                    screenshot="login-modal.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Fan Dash"
                    url="/fans"
                    screenshot="fans.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Proximity Demo"
                    url="/demo/proximity"
                    screenshot="proximity-demo.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                </div>

                {/* Planner flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "304px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: FLOWCHART_COLORS.yellow, width: "300px", minHeight: "32px", padding: "4px", fontSize: "13.5px" }}>
                    Planner Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Enter PW"
                    screenshot="login-modal.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Planner Dash"
                    url="/planner"
                    screenshot="planner.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                </div>

                {/* Cruise passenger flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "304px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: FLOWCHART_COLORS.yellow, width: "300px", minHeight: "32px", padding: "4px", fontSize: "13.5px" }}>
                    Cruise Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Enter PW"
                    screenshot="login-modal.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Cruise Lounge"
                    url="/cruise/dashboard"
                    screenshot="cruise-dashboard.png"
                    width="300px"
                    height="175px"
                    fontSize="12.5px"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column 11: Password Reset Flow (Purple/Grey) */}
          <div className="flow-column" style={{ minWidth: "180px" }}>
            <FlowCard
              label="Forgot Password"
              sub="/members/forgot"
              screenshot="forgot-password.png"
              width="300px"
              height="175px"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Request PIN"
              sub="Enter Email"
              screenshot="forgot-password.png"
              width="200px"
              height="115px"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="📩 Email: PIN Recovery"
              sub="Email template of pin number"
              isEmail={true}
              screenshot="email-pin-verification.png"
              width="200px"
              height="115px"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Verify PIN"
              sub="Enter Code"
              screenshot="forgot-password.png"
              width="200px"
              height="115px"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Set Password"
              sub="Choose PW"
              screenshot="forgot-password.png"
              width="200px"
              height="115px"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Redirect Sign In"
              sub="Login Gate"
              screenshot="login-modal.png"
              width="200px"
              height="115px"
            />
          </div>


          {/* Column 10: SMS Proximity Blast (Rose/Coral) */}
          <div className="flow-column">
            {/* Step 1: Fan subscribes to SMS alerts */}
            <FlowCard
              label="Fan Subscribes"
              sub="Enters phone + zip on homepage"
              screenshot="home.png"
              width="300px"
              height="175px"
              fontSize="15px"
            />
            <div className="node-connector-line" />

            {/* Step 2: Data stored in Supabase */}
            <FlowCard
              label="Supabase: sms_subscribers"
              sub="phone, zip, opted_in, radius"
              width="300px"
              height="175px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Step 3: Show approaches — admin opens SMS Blast */}
            <FlowCard
              label="Admin: SMS Proximity Blast"
              sub="Admin Dashboard Widget"
              url="/admin"
              screenshot="admin.png"
              width="300px"
              height="175px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Step 4: Select upcoming show */}
            <FlowCard
              label="Select Upcoming Show"
              sub="Auto-populates from Sanity tour dates"
              width="300px"
              height="175px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Step 5: Auto-compose SMS with show details */}
            <FlowCard
              label="Auto-Compose SMS"
              sub="Venue · Date · Doors/Show · Cover · Age"
              width="300px"
              height="175px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Step 6: Fetch real attendance count */}
            <FlowCard
              label="Fetch Attendance Count"
              sub="GET /api/shows/[id]/attendance"
              width="300px"
              height="175px"
              fontSize="13.5px"
            />
            <div className="node-connector-line" />

            {/* Step 7: Build SMS body with show card info */}
            <FlowCard
              label="📱 SMS Message Built"
              sub="🎸 Show info + 🔥 fans going + RSVP link"
              width="300px"
              height="175px"
              fontSize="13.5px"
            />
            <div className="node-connector-line" />

            {/* Step 8: Send via Twilio to nearby fans */}
            <FlowCard
              label="Twilio: Proximity Send"
              sub="POST /api/sms/send → nearby subscribers"
              width="300px"
              height="175px"
              fontSize="13.5px"
            />
            <div className="node-connector-line" />

            {/* Step 9: Fan receives text */}
            <FlowCard
              label="📲 Fan Receives SMS"
              sub="Reply 1=GOING · 2=DIRECTIONS · STOP"
              width="300px"
              height="175px"
              fontSize="13px"
            />
            <div className="node-connector-line" />

            {/* Step 10: Fan opens show page */}
            <FlowCard
              label="Show Page"
              sub="/shows/[id] — RSVP & Who's Going"
              url="/shows"
              screenshot="show-page.png"
              width="300px"
              height="175px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Shows Past Archive"
              sub="/shows/past"
              url="/shows/past"
              screenshot="shows.png"
              width="300px"
              height="175px"
              fontSize="14px"
            />
          </div>

          {/* ── Column 11: Booking System Flow ── */}
          <div className="flow-column" style={{ minWidth: "360px" }}>
            {/* Section Header */}
            <div style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.08))",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: "14px",
              padding: "14px 20px",
              textAlign: "center",
              marginBottom: "8px",
              width: "340px"
            }}>
              <div style={{ fontSize: "22px", marginBottom: "4px" }}>📅</div>
              <div style={{ fontSize: "16px", fontWeight: "900", color: "#a7f3d0", letterSpacing: "-0.01em" }}>Booking System Flow</div>
              <div style={{ fontSize: "10px", color: "#10b981", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>Planner & Admin Triggers</div>
            </div>
            <div className="node-connector-line" />

            {/* Trigger 1 */}
            <FlowCard
              label="1. Planner Requests Booking"
              sub="Planner submits booking request details at /book"
              screenshot="book.png"
              url="/book"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 1.1 */}
            <FlowCard
              label="📩 Email: Booking Request Received"
              sub="[TO: PLANNER] Confirms booking details are received and pending review"
              screenshot="email-booking-confirm.png"
              isEmail={true}
              url="/api/dev/email-preview?id=booking_confirmation"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 1.1 */}
            <FlowCard
              label="🖥️ Planner Dashboard SPU"
              sub="Appears in Planner portal under 'Pending Requests'"
              screenshot="planner.png"
              url="/planner"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 1.2 */}
            <FlowCard
              label="📩 Email: Admin Booking Alert"
              sub="[TO: ADMIN] Notifies admins that a new booking request requires action"
              screenshot="email-booking-admin.png"
              isEmail={true}
              url="/api/dev/email-preview?id=booking_admin"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 1.2 */}
            <FlowCard
              label="🖥️ Admin Dashboard SPU"
              sub="Appears in Admin Dashboard review queue"
              screenshot="admin.png"
              url="/admin/michaelscimeca"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Trigger 2 */}
            <FlowCard
              label="2. Admin Approves/Declines"
              sub="Admin clicks Approve/Decline in Dashboard review queue"
              screenshot="admin.png"
              url="/admin/michaelscimeca"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 2 */}
            <FlowCard
              label="📩 Email: Booking Status Update"
              sub="[TO: PLANNER] Notifies planner of approval/declination & contract terms"
              screenshot="email-booking-status.png"
              isEmail={true}
              url="/api/dev/email-preview?id=booking_status"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 2 */}
            <FlowCard
              label="🖥️ Planner Dashboard SPU"
              sub="Status shifts to 'Approved' or 'Declined' dynamically"
              screenshot="planner.png"
              url="/planner"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Trigger 3 */}
            <FlowCard
              label="3. Admin Cancels Booking"
              sub="Admin cancels a previously approved show date"
              screenshot="admin.png"
              url="/admin/michaelscimeca"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 3 */}
            <FlowCard
              label="📩 Email: Booking Cancelled"
              sub="[TO: PLANNER & ADMIN] Confirms date is cancelled and calendar is cleared"
              screenshot="email-booking-cancelled-admin.png"
              isEmail={true}
              url="/api/dev/email-preview?id=booking_cancelled_admin"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 3 */}
            <FlowCard
              label="🖥️ Portal Dashboards SPU"
              sub="Booking status reflects 'Cancelled' in both planner & admin screens"
              screenshot="planner.png"
              width="340px"
              height="180px"
              fontSize="14px"
            />
          </div>

          {/* ── Column 12: Crew Management Flow ── */}
          <div className="flow-column" style={{ minWidth: "360px" }}>
            {/* Section Header */}
            <div style={{
              background: "linear-gradient(135deg, rgba(147, 51, 234,0.15), rgba(192, 132, 252,0.08))",
              border: "1px solid rgba(147, 51, 234,0.3)",
              borderRadius: "14px",
              padding: "14px 20px",
              textAlign: "center",
              marginBottom: "8px",
              width: "340px"
            }}>
              <div style={{ fontSize: "22px", marginBottom: "4px" }}>👷</div>
              <div style={{ fontSize: "16px", fontWeight: "900", color: "#fef3c7", letterSpacing: "-0.01em" }}>Crew Management Flow</div>
              <div style={{ fontSize: "10px", color: "#9333ea", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>Schedule, Alerts & Hours</div>
            </div>
            <div className="node-connector-line" />

            {/* Trigger 1 */}
            <FlowCard
              label="1. Admin Invites Crew"
              sub="Admin adds crew member from Admin Dashboard"
              screenshot="admin.png"
              url="/admin/michaelscimeca"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 1 */}
            <FlowCard
              label="📩 Email: Welcome — Crew"
              sub="[TO: CREW] Contains activation link to register credentials"
              screenshot="email-welcome-crew.png"
              isEmail={true}
              url="/api/dev/email-preview?id=welcome_crew"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 1 */}
            <FlowCard
              label="🖥️ Crew Dashboard SPU"
              sub="Crew member logs in to view personal dashboard at /crew"
              screenshot="crew-dashboard.png"
              url="/crew"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Trigger 2 */}
            <FlowCard
              label="2. Admin Publishes Shifts"
              sub="Admin assigns, edits, or deletes shifts in Crew Schedule"
              screenshot="admin.png"
              url="/admin/michaelscimeca"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 2 */}
            <FlowCard
              label="📩 Email: Schedule Change Alert"
              sub="[TO: CREW] Notifies crew member that their work calendar was updated"
              screenshot="email-schedule-change-alert.png"
              isEmail={true}
              url="/api/dev/email-preview?id=schedule_change_alert"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 2 */}
            <FlowCard
              label="🖥️ Crew Dashboard Calendar SPU"
              sub="Shifts appear dynamically in crew schedule and calendar"
              screenshot="crew-dashboard.png"
              url="/crew"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Trigger 3 */}
            <FlowCard
              label="3. Group Text Broadcast"
              sub="Admin sends group broadcast alert in Crew Schedule view"
              screenshot="admin.png"
              url="/admin/michaelscimeca"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email/SMS 3.1 */}
            <FlowCard
              label="💬 Crew Alert (SMS + Email)"
              sub="[TO: ALL CREW] Multi-channel alert broadcasted to crew members' devices"
              screenshot="email-crew-sms-alert-received.png"
              isEmail={true}
              url="/api/dev/email-preview?id=crew_sms_alert_received"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 3.1 */}
            <FlowCard
              label="🖥️ Crew Dashboard Alert SPU"
              sub="Group message appears with list of recipients on Crew Dashboard"
              screenshot="crew-dashboard.png"
              url="/crew"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 3.2 */}
            <FlowCard
              label="📋 Crew SMS Dispatched Alert"
              sub="[TO: ADMIN] Confirms to broadcasting admin how many messages were sent"
              screenshot="email-crew-sms-dispatched-alert.png"
              isEmail={true}
              url="/api/dev/email-preview?id=crew_sms_dispatched_alert"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Trigger 4 */}
            <FlowCard
              label="4. Crew Shift Checkout"
              sub="Crew logs out of shift and enters hours at /crew"
              screenshot="crew-dashboard.png"
              url="/crew"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 4 */}
            <FlowCard
              label="📩 Email: Work Hours Summary"
              sub="[TO: CREW] Summarizes checkout details and pending admin approval"
              screenshot="email-crew-hours-summary.png"
              isEmail={true}
              url="/api/dev/email-preview?id=crew_hours_summary"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 4 */}
            <FlowCard
              label="🖥️ Admin Dashboard SPU"
              sub="Check-out log appears under Shift Approvals on Admin Panel"
              screenshot="admin.png"
              url="/admin/michaelscimeca"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Step 5 */}
            <FlowCard
              label="5. Crew Requests Shift Coverage"
              sub="Crew member clicks 'Request Coverage or Swap' on their shift inside the Crew Dashboard (/crew)"
              screenshot="crew-dashboard.png"
              url="/crew"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 5 */}
            <FlowCard
              label="🚨 Email: Shift Coverage Requested"
              sub="[TO: COWORKERS] Renders shift details & claim links; broadcasted to qualified coworkers"
              isEmail={true}
              screenshot="email-shift-coverage-request.png"
              url="/api/dev/email-preview?id=shift_coverage_request"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Step 6 */}
            <FlowCard
              label="6. Admin Dashboard: Coverage Indicator"
              sub="Shift displays yellow '⏳ Coverage' tag on Admin Calendar. Top dropdown shows red '🚨 N Coverage Requests' with pulsing glow highlight on click."
              screenshot="admin-coverage-indicator.png"
              url="/admin/michaelscimeca"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Step 7 */}
            <FlowCard
              label="7. Admin Manual Override or Assignment"
              sub="Admin opens the Shift Detail panel to cancel the request or manually select & assign a qualified replacement coworker"
              screenshot="admin-coverage-indicator.png"
              url="/admin/michaelscimeca"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Step 8 */}
            <FlowCard
              label="8. Coworker Dashboard / Email Claim"
              sub="Coworker claims shift in dashboard or email link. System validates certifications/training before reassigning owner."
              screenshot="crew-dashboard.png"
              url="/crew"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Step 9 */}
            <FlowCard
              label="9. Coverage Confirmation & Admin Update"
              sub="Requester & Accepter receive confirmations. Admin Dashboard updates owner and automatically clears the '⏳ Coverage' status."
              screenshot="email-schedule-change-alert.png"
              isEmail={true}
              url="/api/dev/email-preview?id=schedule_change_alert"
              width="340px"
              height="180px"
              fontSize="14px"
            />
          </div>

          {/* ── Column 13: Fan & Live Raffle Flow ── */}
          <div className="flow-column" style={{ minWidth: "360px" }}>
            {/* Section Header */}
            <div style={{
              background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(244,114,182,0.08))",
              border: "1px solid rgba(236,72,153,0.3)",
              borderRadius: "14px",
              padding: "14px 20px",
              textAlign: "center",
              marginBottom: "8px",
              width: "340px"
            }}>
              <div style={{ fontSize: "22px", marginBottom: "4px" }}>🎫</div>
              <div style={{ fontSize: "16px", fontWeight: "900", color: "#fbcfe8", letterSpacing: "-0.01em" }}>Fan & Raffle Flow</div>
              <div style={{ fontSize: "10px", color: "#ec4899", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>Raffles, Uploads & Welcomes</div>
            </div>
            <div className="node-connector-line" />

            {/* Trigger 1 */}
            <FlowCard
              label="1. Fan Signs Up"
              sub="User completes fan registration on site"
              screenshot="signup-modal.png"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 1 */}
            <FlowCard
              label="🎉 Email: Welcome — Fan"
              sub="[TO: FAN] Welcomes user to the fan club and unlocks features"
              screenshot="email-welcome-fan.png"
              isEmail={true}
              url="/api/dev/email-preview?id=welcome_fan"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 1 */}
            <FlowCard
              label="🖥️ Fan Dashboard Welcome SPU"
              sub="Unlocks personalized profile controls at /fans"
              screenshot="fans.png"
              url="/fans"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Trigger 2 */}
            <FlowCard
              label="2. Fan Enters Raffle"
              sub="Fan clicks Enter Raffle on live stream room page"
              screenshot="live-feed.png"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 2 */}
            <FlowCard
              label="📩 Email: Raffle Entry"
              sub="[TO: FAN] Confirms raffle entry ticket and draw details"
              screenshot="raffle-entry-preview.png"
              isEmail={true}
              url="/api/dev/email-preview?id=raffle_entry"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 2 */}
            <FlowCard
              label="🖥️ Fan Dashboard Entry SPU"
              sub="Raffle ticket shows as active in Fan portal"
              screenshot="fans.png"
              url="/fans"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Trigger 3 */}
            <FlowCard
              label="3. Admin Draws Raffle"
              sub="Admin triggers Draw Winner button on admin panel"
              screenshot="admin.png"
              url="/admin/michaelscimeca"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 3.1 */}
            <FlowCard
              label="🏆 Email: Raffle Winner"
              sub="[TO: WINNER] Winner alert containing claim PIN code"
              screenshot="raffle-win-preview.png"
              isEmail={true}
              url="/api/dev/email-preview?id=raffle_win"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 3.1 */}
            <FlowCard
              label="🖥️ Fan Dashboard Winner SPU"
              sub="Claim Prize button appears with claim status"
              screenshot="fan-dashboard.png"
              url="/fans"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 3.2 */}
            <FlowCard
              label="💔 Email: Raffle Loss"
              sub="[TO: PARTICIPANTS] Consolation mail sent to non-winning entrants"
              screenshot="raffle-loss-preview.png"
              isEmail={true}
              url="/api/dev/email-preview?id=raffle_loss"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Trigger 4 */}
            <FlowCard
              label="4. Fan Uploads Photo"
              sub="Fan uploads a show photo on /fan-photo-wall"
              screenshot="fan-upload-form.png"
              url="/fan-photo-wall"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 4.1 */}
            <FlowCard
              label="📸 Email: Upload Approved"
              sub="[TO: FAN] Notifies user photo is live on the public wall"
              screenshot="email-upload-approved.png"
              isEmail={true}
              url="/api/dev/email-preview?id=fan_upload_approved"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 4.1 */}
            <FlowCard
              label="🖥️ Fan Dashboard Photo SPU"
              sub="Photo status changes to 'Published' on portal"
              screenshot="fan-dashboard.png"
              url="/fans"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 4.2 */}
            <FlowCard
              label="🚫 Email: Upload Rejected"
              sub="[TO: FAN] Notifies user photo was rejected with guidelines link"
              screenshot="email-upload-rejected.png"
              isEmail={true}
              url="/api/dev/email-preview?id=fan_upload_rejected"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 4.2 */}
            <FlowCard
              label="🖥️ Fan Dashboard Photo SPU"
              sub="Photo status changes to 'Declined' with reasons"
              screenshot="fan-dashboard-rejected.png"
              url="/fans"
              width="340px"
              height="180px"
              fontSize="14px"
            />
          </div>

          {/* ── Column 14: Cruise System Flow ── */}
          <div className="flow-column" style={{ minWidth: "360px" }}>
            {/* Section Header */}
            <div style={{
              background: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(34,211,238,0.08))",
              border: "1px solid rgba(6,182,212,0.3)",
              borderRadius: "14px",
              padding: "14px 20px",
              textAlign: "center",
              marginBottom: "8px",
              width: "340px"
            }}>
              <div style={{ fontSize: "22px", marginBottom: "4px" }}>🚢</div>
              <div style={{ fontSize: "16px", fontWeight: "900", color: "#cffafe", letterSpacing: "-0.01em" }}>Cruise System Flow</div>
              <div style={{ fontSize: "10px", color: "#06b6d4", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>Signups, Lounge & Community</div>
            </div>
            <div className="node-connector-line" />

            {/* Trigger 1 */}
            <FlowCard
              label="1. Fan Joins Interest List"
              sub="User registers on /cruise page form"
              screenshot="cruise.png"
              url="/cruise"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 1 */}
            <FlowCard
              label="🚢 Email: Cruise Confirm"
              sub="[TO: FAN] Confirms registration on Cruise Interest List"
              screenshot="email-cruise-confirm.png"
              isEmail={true}
              url="/api/dev/email-preview?id=cruise_confirmation"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 1 */}
            <FlowCard
              label="🖥️ Cruise Dashboard SPU"
              sub="Grants initial access to Cruise dashboard at /cruise/dashboard"
              screenshot="cruise-dashboard.png"
              url="/cruise/dashboard"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Trigger 2 */}
            <FlowCard
              label="2. Admin Approves Access"
              sub="Admin grants Private Community approval on roster panel"
              screenshot="admin-cruise-roster.png"
              url="/admin/michaelscimeca"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 2 */}
            <FlowCard
              label="🌊 Email: Community Welcome"
              sub="[TO: PASSENGER] Welcomes member to the private community lounge"
              screenshot="email-cruise-welcome.png"
              isEmail={true}
              url="/api/dev/email-preview?id=cruise_community"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 2 */}
            <FlowCard
              label="🖥️ Cruise Dashboard Lounge SPU"
              sub="Private forums, chat rooms, and cabin matching unlock"
              screenshot="cruise-dashboard.png"
              url="/cruise/dashboard"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Trigger 3 */}
            <FlowCard
              label="3. Passenger Opts Out"
              sub="User requests cabin cancellation or list removal"
              screenshot="cruise-dashboard.png"
              url="/cruise/dashboard"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 3 */}
            <FlowCard
              label="❌ Email: Cruise Cancel"
              sub="[TO: PASSENGER] Confirms cancellation details and removal"
              screenshot="email-cruise-cancel.png"
              isEmail={true}
              url="/api/dev/email-preview?id=cruise_cancellation"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Trigger 4 */}
            <FlowCard
              label="4. Admin Community Broadcast"
              sub="Admin sends Cruise Blast to all community members"
              screenshot="admin.png"
              url="/admin/michaelscimeca"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 4 */}
            <FlowCard
              label="📣 Email: Cruise Blast"
              sub="[TO: COMMUNITY] Sent to all community members for updates"
              screenshot="email-cruise-blast.png"
              isEmail={true}
              url="/api/dev/email-preview?id=cruise_community_blast"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 4 */}
            <FlowCard
              label="🖥️ Cruise Dashboard Alert SPU"
              sub="Broadcast updates pinned to dashboard announcements"
              screenshot="cruise-dashboard.png"
              url="/cruise/dashboard"
              width="340px"
              height="180px"
              fontSize="14px"
            />
          </div>

          {/* ── Column 15: Newsletter & Merch Flow ── */}
          <div className="flow-column" style={{ minWidth: "360px" }}>
            {/* Section Header */}
            <div style={{
              background: "linear-gradient(135deg, rgba(255,10,61,0.15), rgba(255,10,61,0.08))",
              border: "1px solid rgba(255,10,61,0.3)",
              borderRadius: "14px",
              padding: "14px 20px",
              textAlign: "center",
              marginBottom: "8px",
              width: "340px"
            }}>
              <div style={{ fontSize: "22px", marginBottom: "4px" }}>📰</div>
              <div style={{ fontSize: "16px", fontWeight: "900", color: "#ddd6fe", letterSpacing: "-0.01em" }}>Newsletter & Merch Flow</div>
              <div style={{ fontSize: "10px", color: "#8b5cf6", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>E-commerce & Onboarding</div>
            </div>
            <div className="node-connector-line" />

            {/* Trigger 1 */}
            <FlowCard
              label="1. Admin Blasts Newsletter"
              sub="Admin publishes post or runs newsletter email blast"
              screenshot="admin.png"
              url="/admin/michaelscimeca"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 1 */}
            <FlowCard
              label="📰 Email: Newsletter Blast"
              sub="[TO: SUBSCRIBERS] Updates, discounts, and merch announcements"
              screenshot="email-newsletter-blast.png"
              isEmail={true}
              url="/api/dev/email-preview?id=newsletter_blast"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Trigger 2 */}
            <FlowCard
              label="2. Fan Buys Live Flash Merch"
              sub="User completes payment checkout in live chat overlay"
              screenshot="live-flash-checkout.png"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 2.1 */}
            <FlowCard
              label="🛍️ Email: Table Pickup Receipt"
              sub="[TO: BUYER] Contains QR code receipt for physical concert pickup"
              screenshot="email-flash-pickup.png"
              isEmail={true}
              url="/api/dev/email-preview?id=flash_merch_pickup"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 2.1 */}
            <FlowCard
              label="🖥️ Fan Dashboard Pickup SPU"
              sub="QR code receipt appears under Merch pickups in portal"
              screenshot="fans.png"
              url="/fans"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 2.2 */}
            <FlowCard
              label="📦 Email: Shipping Receipt"
              sub="[TO: BUYER] Shopify receipts and delivery status links"
              screenshot="email-flash-shipping.png"
              isEmail={true}
              url="/api/dev/email-preview?id=flash_merch_shipping"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 2.2 */}
            <FlowCard
              label="🖥️ Fan Dashboard Merch SPU"
              sub="Purchase receipts and tracking links show in Order History"
              screenshot="fans.png"
              url="/fans"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Trigger 3 */}
            <FlowCard
              label="3. Staff Registrations"
              sub="New Planner or Admin registers account on dashboard"
              screenshot="signup-modal.png"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 3.1 */}
            <FlowCard
              label="🔐 Email: Welcome — Planner"
              sub="[TO: PLANNER] Onboarding message detailing requests"
              screenshot="email-welcome-planner.png"
              isEmail={true}
              url="/api/dev/email-preview?id=welcome_planner"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 3.1 */}
            <FlowCard
              label="🖥️ Planner Dashboard SPU"
              sub="Unlocks planning tools and request tables at /planner"
              screenshot="planner.png"
              url="/planner"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Email 3.2 */}
            <FlowCard
              label="🔐 Email: New Account Audit"
              sub="[TO: STAFF] Audit warning sent to current admins for secure tracking"
              screenshot="email-new-account-admin-alert.png"
              isEmail={true}
              url="/api/dev/email-preview?id=new_account_admin_alert"
              width="340px"
              height="180px"
              fontSize="14px"
            />
            <div className="node-connector-line" />

            {/* Dashboard 3.2 */}
            <FlowCard
              label="🖥️ Admin Dashboard Security SPU"
              sub="Registration details logged inside user accounts list"
              screenshot="admin.png"
              url="/admin/michaelscimeca"
              width="340px"
              height="180px"
              fontSize="14px"
            />
          </div>
        </div>
      </main>
    </div>
  </div>

      {/* Floating Zoom Controls */}
      <div style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "8px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        border: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(10,10,15,0.9)",
        backdropFilter: "blur(12px)",
        zIndex: 9999
      }}>
        <button aria-label="Action button" 
             onClick={() => setZoom(z => Math.min(2.5, z + 0.1))}
          style={{
            width: "36px", height: "36px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)", color: "#e2e8f0", fontWeight: "bold", fontSize: "16px", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", transition: "background-color 0.2s, border-color 0.2s, transform 0.2s"
          }}
          className="zoom-btn"
        >+</button>
        <button aria-label="Action button" 
             onClick={() => setZoom(z => Math.max(0.15, z - 0.1))}
          style={{
            width: "36px", height: "36px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)", color: "#e2e8f0", fontWeight: "bold", fontSize: "16px", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", transition: "background-color 0.2s, border-color 0.2s, transform 0.2s"
          }}
          className="zoom-btn"
        >−</button>
        <button aria-label="Action button" 
             onClick={() => { setZoom(0.85); setPanOffset({ x: 0, y: 0 }); }}
          style={{
            padding: "6px 8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)", color: "#e2e8f0", fontWeight: "bold", fontSize: "9px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", transition: "background-color 0.2s, border-color 0.2s, transform 0.2s"
          }}
          className="zoom-btn"
        >RESET</button>
        <div style={{ fontSize: "9px", color: "#7c3aed", textAlign: "center", fontWeight: "700", marginTop: "2px" }}>
          {(zoom * 100).toFixed(0)}%
        </div>
      </div>

      {/* Premium Lightbox Modal overlay */}
      {lightboxImage && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(5, 5, 8, 0.85)",
            backdropFilter: "blur(12px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px"
          }} onClick={() => setLightboxImage(null)}
        >
          {/* Frosted Glass Header */}
          <div style={{
            position: "absolute",
            top: 24,
            left: 24,
            right: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              padding: "10px 16px",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
            }}>
              🔍 {lightboxTitle}
            </div>
            <button aria-label="Action button" 
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "18px",
                cursor: "pointer",
                transition: "background-color 0.2s, border-color 0.2s, transform 0.2s"
              }}
                 onClick={() => setLightboxImage(null)}
            >
              ✕
            </button>
          </div>

          {/* Expanded Image Box */}
          <div 
            style={{
              maxWidth: "90%",
              maxHeight: "80%",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#08080c"
            }}
            onClick={(e) => e.stopPropagation()} // Prevents closing when clicking on the image itself
          >
            <Image width={200} height={200} unoptimized 
              src={lightboxImage} 
              alt={lightboxTitle} 
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                display: "block"
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
