"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

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

// Cache-busting suffix for all screenshot image URLs
const SCREENSHOT_VERSION = `?v=${Date.now()}`;

function FlowCard({ label, sub, url, screenshot, overlayScreenshot, isEmail, width = "145px", height = "82px", fontSize = "10.5px" }: FlowCardProps) {
  const textContent = (
    <div style={{ textAlign: "center", width: "100%", marginBottom: "4px" }}>
      <div style={{ fontSize: fontSize, fontWeight: "800", color: "#0f172a", lineHeight: "1.2" }}>{label}</div>
      {sub && <div style={{ fontSize: "8.5px", color: "#64748b", fontWeight: "500", marginTop: "2px", lineHeight: "1.1" }}>{sub}</div>}
    </div>
  );

  const targetUrl = url || (isEmail && sub ? `/api/dev/email-preview?id=${sub}` : undefined);
  const imgVersion = SCREENSHOT_VERSION;

  const handleCardClick = (e: React.MouseEvent) => {
    if (screenshot || overlayScreenshot) {
      e.preventDefault();
      e.stopPropagation();
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
    <div 
      style={{
        width: width,
        height: height,
        borderRadius: "6px",
        border: isEmail ? `2px dashed #9333ea` : `1.5px solid rgba(0,0,0,0.15)`,
        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        overflow: "hidden",
        background: isEmail ? "#f5f3ff" : "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        transition: "all 0.2s ease",
        cursor: (screenshot || overlayScreenshot) ? "zoom-in" : (targetUrl ? "pointer" : "default")
      }}
      className="flowcard-img-container"
      onClick={handleCardClick}
    >
      {screenshot && (
        <img
          src={`/sitemap-screenshots/${screenshot}${imgVersion}`}
          alt={label}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      
      {overlayScreenshot && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15,23,42,0.35)",
          backdropFilter: "blur(1px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px"
        }}>
          <img
            src={`/sitemap-screenshots/${overlayScreenshot}${imgVersion}`}
            alt="overlay"
            style={{
              width: "85%",
              height: "85%",
              objectFit: "contain",
              borderRadius: "4px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.2)"
            }}
          />
        </div>
      )}

      {targetUrl && (screenshot || overlayScreenshot) && (
        <Link href={targetUrl} style={{
          position: "absolute",
          top: "4px",
          right: "4px",
          background: "rgba(15,23,42,0.85)",
          color: "#fff",
          fontSize: "8px",
          fontWeight: "bold",
          padding: "2px 5px",
          borderRadius: "4px",
          textDecoration: "none",
          zIndex: 10,
          cursor: "pointer"
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
        >
          GO ↗
        </Link>
      )}

      {!screenshot && !overlayScreenshot && (
        <span style={{ fontSize: "20px", opacity: 0.6 }}>{isEmail ? "✉️" : "📄"}</span>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: width, transition: "all 0.2s" }} className="flowcard-wrapper">
      {textContent}
      {cardBox}
    </div>
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
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
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
    setHasDragged(false);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    if (Math.abs(dx - panOffset.x) > 3 || Math.abs(dy - panOffset.y) > 3) {
      setHasDragged(true);
    }
    setPanOffset({ x: dx, y: dy });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Colors matching the user's sitemap flowchart image
  const colors = {
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

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div 
      className="flowchart-root"
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
        body {
          background-color: #ffffff !important;
          color: #1e293b !important;
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
          background: #ffffff;
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
          max-width: 1980px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 20px;
        }

        .flowchart-title h1 {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
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
          color: #475569;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .sitemap-toggle-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        /* Sitemap Canvas Layout */
        .canvas-container {
          position: relative;
          width: 100%;
          max-width: 1980px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Home Node Row */
        .home-node-row {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
          width: 100%;
          position: relative;
        }

        /* Base Node Box */
        .flow-node-box {
          width: 145px;
          padding: 12px 8px;
          font-size: 11.5px;
          font-weight: 700;
          text-align: center;
          border-radius: 4px;
          border: 1px solid rgba(0,0,0,0.15);
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
          color: #000000;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          text-decoration: none;
        }

        .flow-node-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.12);
        }

        .flow-node-box .node-sub {
          font-size: 9.5px;
          font-weight: 500;
          opacity: 0.6;
          margin-top: 4px;
        }

        /* Horizontal Split line under Home */
        .home-to-nav-line {
          width: 2px;
          height: 25px;
          background: #94a3b8;
        }

        .nav-horizontal-bar {
          width: 94.5%;
          height: 2px;
          background: #94a3b8;
          margin-bottom: 25px;
        }

        /* Flow Columns Layout */
        .columns-grid {
          display: flex;
          justify-content: space-between;
          width: 100%;
          position: relative;
          gap: 16px;
        }

        .flow-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          min-width: 160px;
        }

        .node-connector-line {
          width: 2px;
          height: 24px;
          background: #94a3b8;
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
          gap: 8px;
          width: 100%;
          position: relative;
        }

        .branch-join-line {
          width: 2px;
          height: 18px;
          background: #94a3b8;
        }

        .flowcard-wrapper:hover .flowcard-img-container {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.12) !important;
        }

        .zoom-btn:hover {
          background: #f1f5f9 !important;
          transform: scale(1.05);
        }
      `}</style>

      {/* Control Panel Header */}
      <header className="flowchart-header">
        <div className="flowchart-title">
          <h1>🗺️ Platform UX Flowchart & Sitemap</h1>
          <p>Structured with main navigation pages as the top first row, branching down into sub-pages.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/sitemap/visual" className="sitemap-toggle-btn">
            🖼️ View Interactive Visual Map
          </Link>
          <Link href="/sitemap" className="sitemap-toggle-btn">
            📋 Directory Map
          </Link>
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
          {/* Column 1: Band Bio (Purple) */}
          <div className="flow-column">
            <FlowCard
              label="Bio"
              sub="/bio"
              url="/bio"
              screenshot="bio.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Band Members"
              sub="/members"
              url="/members"
              screenshot="bio.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="News Feed"
              sub="/news"
              url="/news"
              screenshot="news.png"
            />
          </div>

          {/* Column 2: Music Experience (Teal) */}
          <div className="flow-column">
            <FlowCard
              label="Music"
              sub="/music"
              url="/music"
              screenshot="music.png"
            />
            <div className="node-connector-line" />
            
            <FlowCard
              label="Albums"
              sub="List Releases"
              screenshot="music.png"
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
              screenshot="music.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Streaming Links"
              sub="Spotify/Apple"
              screenshot="music.png"
            />
          </div>

          {/* Column 3: Merch Store (Beige) */}
          <div className="flow-column">
            <FlowCard
              label="Store"
              sub="/store"
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
              <div style={{ width: "90px", height: "2px", background: "#94a3b8", position: "absolute", top: "0" }} />
              <div style={{ display: "flex", gap: "8px", width: "100%", justifyContent: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: colors.yellow, width: "105px", minHeight: "34px", padding: "4px", fontSize: "10.5px" }}>
                    Not Logged In
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Log In / Register"
                    url="/cruise/verify"
                    screenshot="login-modal.png"
                    width="105px"
                    height="62px"
                    fontSize="9px"
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: colors.yellow, width: "105px", minHeight: "34px", padding: "4px", fontSize: "10.5px" }}>
                    Logged In
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Fan Dashboard"
                    url="/fans/super_fan"
                    screenshot="fan-dashboard.png"
                    width="105px"
                    height="62px"
                    fontSize="9px"
                  />
                </div>
              </div>
              <div style={{ width: "115px", height: "2px", background: "#94a3b8", marginTop: "10px" }} />
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

          {/* Column 4: Video Gallery (Purple) */}
          <div className="flow-column">
            <FlowCard
              label="Video"
              sub="/video"
              url="/video"
              screenshot="video.png"
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

          <div className="flow-column" style={{ minWidth: "660px" }}>
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
              <div style={{ width: "320px", height: "2px", background: "#94a3b8", position: "absolute", top: "0" }} />
              <div style={{ display: "flex", gap: "24px", width: "100%", justifyContent: "center" }}>
                
                {/* Branch A: Raffle Flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "300px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: colors.yellow, width: "150px", minHeight: "34px", padding: "4px", fontSize: "10.5px" }}>
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
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", justifyContent: "center" }}>
                    <FlowCard
                      label="📩 Email: Raffle Win Claim"
                      sub="raffle_win"
                      isEmail={true}
                      screenshot="raffle-win-preview.png"
                      width="135px"
                      fontSize="9.5px"
                    />
                    <FlowCard
                      label="📩 Email: Raffle Loss"
                      sub="raffle_loss"
                      isEmail={true}
                      screenshot="raffle-loss-preview.png"
                      width="135px"
                      fontSize="9.5px"
                    />
                  </div>
                </div>

                {/* Branch B: Flash Sale Flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "300px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: colors.yellow, width: "150px", minHeight: "34px", padding: "4px", fontSize: "10.5px" }}>
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
                    <div style={{ width: "160px", height: "2px", background: "#94a3b8", position: "absolute", top: "0" }} />
                    <div style={{ display: "flex", gap: "12px", width: "100%", justifyContent: "center" }}>
                      
                      {/* Sub-branch A: Merch Table Pickup */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "140px" }}>
                        <div className="branch-join-line" />
                        <FlowCard
                          label="Purchase Success"
                          sub="QR Code Overlay"
                          screenshot="live-flash-success.png"
                          width="130px"
                          fontSize="9.5px"
                        />
                        <div className="node-connector-line" />
                        <FlowCard
                          label="📩 Email: Merch QR"
                          sub="merch_purchase"
                          isEmail={true}
                          screenshot="email-flash-pickup.png"
                          width="130px"
                          fontSize="9.5px"
                        />
                        <div className="node-connector-line" style={{ height: "144px" }} />
                      </div>
 
                      {/* Sub-branch B: Ship to Home (Shopify API) */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "140px" }}>
                        <div className="branch-join-line" />
                        <FlowCard
                          label="Shopify Checkout"
                          sub="Shopify Storefront API"
                          screenshot="live-flash-ship-checkout.png"
                          url="/store"
                          width="130px"
                          fontSize="9.5px"
                        />
                        <div className="node-connector-line" />
                        <FlowCard
                          label="Purchase Success"
                          sub="Shipping Info Overlay"
                          screenshot="live-flash-ship-success.png"
                          width="130px"
                          fontSize="9.5px"
                        />
                        <div className="node-connector-line" />
                        <FlowCard
                          label="📩 Email: Shopify Receipt"
                          sub="merch_purchase"
                          isEmail={true}
                          screenshot="email-flash-shipping.png"
                          width="130px"
                          fontSize="9.5px"
                        />
                        <div className="node-connector-line" />
                      </div>
                    </div>
                    {/* Bottom join horizontal line merging Sub-branch A and B */}
                    <div style={{ width: "152px", height: "2px", background: "#94a3b8" }} />
                    <div className="branch-join-line" />
                  </div>
 
                  <FlowCard
                    label="Admin dashboard purchase add to list"
                    sub="Admin Page"
                    screenshot="admin-inventory.png"
                    url="/admin"
                    width="130px"
                    fontSize="9.5px"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Column 6: Cruise Flow (Lilac) */}
          <div className="flow-column">
            <FlowCard
              label="Cruise Page"
              sub="/cruise"
              url="/cruise"
              screenshot="cruise.png"
            />
            <div className="node-connector-line" />
 
            <FlowCard
              label="Verify Cabin Overlay"
              sub="/cruise/verify"
              screenshot="cruise-verify.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="📩 Email: Cabin Confirm"
              sub="cruise_confirmation"
              isEmail={true}
              screenshot="email-cruise-confirm.png"
            />
            <div className="node-connector-line" />

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
            <div className="node-connector-line" />

            <FlowCard
              label="Cruise Lounge"
              sub="/cruise/dashboard"
              url="/cruise/dashboard"
              screenshot="cruise-dashboard.png"
            />
          </div>

          {/* Column 7: Fan Wall (Coral) */}
          <div className="flow-column" style={{ minWidth: "300px" }}>
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
              <div style={{ width: "172px", height: "2px", background: "#94a3b8", position: "absolute", top: "0" }} />
              
              <div style={{ display: "flex", gap: "12px", width: "100%", justifyContent: "center" }}>
                {/* Branch: If Logged In */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "135px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: colors.yellow, width: "120px", minHeight: "32px", padding: "4px", fontSize: "8.5px" }}>
                    If Logged In
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Upload Box Overlay"
                    sub="Image(s) or video"
                    url="/fan-photo-wall?mockUpload=true"
                    screenshot="fan-upload-form.png"
                    width="120px"
                    height="70px"
                    fontSize="9px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Submit Content"
                    sub="Send to review"
                    url="/fan-photo-wall?mockScanning=true"
                    screenshot="fan-upload-scanning.png"
                    width="120px"
                    height="70px"
                    fontSize="9px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Success Message"
                    sub="Centered thanks modal"
                    url="/fan-photo-wall?mockSuccess=true"
                    screenshot="fan-upload-success.png"
                    width="120px"
                    height="70px"
                    fontSize="9px"
                  />
                </div>

                {/* Branch: If NOT Logged In */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "135px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: colors.yellow, width: "120px", minHeight: "32px", padding: "4px", fontSize: "8.5px" }}>
                    If NOT Logged In
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Auth Gateway"
                    sub="Sign Up / Sign In modals"
                    screenshot="login-modal.png"
                    width="120px"
                    height="70px"
                    fontSize="9px"
                  />
                  <div className="branch-join-line" />
                  
                  {/* Decision sub-branch */}
                  <div className="branch-wrapper">
                    <div style={{ width: "102px", height: "2px", background: "#94a3b8", position: "absolute", top: "0" }} />
                    <div style={{ display: "flex", gap: "6px", width: "100%", justifyContent: "center" }}>
                      {/* Sub-branch: Cancel Auth */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "70px" }}>
                        <div className="branch-join-line" />
                        <div className="flow-node-box" style={{ backgroundColor: "#ef4444", color: "#ffffff", width: "65px", minHeight: "28px", padding: "2px", fontSize: "7.5px" }}>
                          Cancel
                        </div>
                        <div className="branch-join-line" />
                        <div className="flow-node-box" style={{ backgroundColor: colors.darkbeige, color: "#ffffff", width: "65px", minHeight: "32px", padding: "4px", fontSize: "7.5px" }}>
                          "Sign up to submit content"
                        </div>
                      </div>
                      
                      {/* Sub-branch: Auth Success */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "70px" }}>
                        <div className="branch-join-line" />
                        <div className="flow-node-box" style={{ backgroundColor: "#10b981", color: "#ffffff", width: "65px", minHeight: "28px", padding: "2px", fontSize: "7.5px" }}>
                          Success
                        </div>
                        <div className="branch-join-line" />
                        <div style={{ fontSize: "16px" }}>➡️</div>
                        <div style={{ fontSize: "8px", fontWeight: "bold", textAlign: "center", color: "#64748b" }}>Proceeds to Upload Box</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
              <div style={{ width: "172px", height: "2px", background: "#94a3b8", position: "absolute", top: "0" }} />
              
              <div style={{ display: "flex", gap: "12px", width: "100%", justifyContent: "center" }}>
                {/* Branch: Approved */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "135px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: "#10b981", color: "#ffffff", width: "120px", minHeight: "32px", padding: "4px", fontSize: "8.5px" }}>
                    If Approved
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Publish to Wall"
                    sub="Approved gallery view"
                    screenshot="fan-photo-wall.png"
                    width="120px"
                    height="70px"
                    fontSize="9px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: Approved"
                    sub="fan_upload_approved"
                    isEmail={true}
                    screenshot="admin-emails.png"
                    width="120px"
                    height="70px"
                    fontSize="9px"
                  />
                </div>

                {/* Branch: Rejected */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "135px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: "#ef4444", color: "#ffffff", width: "120px", minHeight: "32px", padding: "4px", fontSize: "8.5px" }}>
                    If Rejected
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Reject Content"
                    sub="Warn or ban user"
                    screenshot="admin.png"
                    width="120px"
                    height="70px"
                    fontSize="9px"
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
              label="📩 Email: Planner Confirm"
              sub="booking_confirmation"
              isEmail={true}
              screenshot="admin-emails.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="📩 Email: Admin booking Alert"
              sub="booking_admin"
              isEmail={true}
              screenshot="admin-emails.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="📩 Email: Status Update"
              sub="booking_status"
              isEmail={true}
              screenshot="admin-emails.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="📩 Email: Booking Cancel Alert"
              sub="booking_cancelled_admin"
              isEmail={true}
              screenshot="admin-emails.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Contact"
              sub="/contact"
              url="/contact"
              screenshot="contact.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="FAQs"
              sub="Help Center"
              screenshot="book.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Press Kit / EPK"
              sub="Assets & Promo"
              screenshot="book.png"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Newsletter"
              sub="Email Opt-In"
              screenshot="news.png"
            />
            <div className="node-connector-line" />
            <FlowCard
              label="📩 Email: Global Blast"
              sub="newsletter_blast"
              isEmail={true}
              screenshot="admin-emails.png"
            />
          </div>

          {/* Column 9: Sign Up / Onboarding (Purple/Grey) */}
          <div className="flow-column" style={{ minWidth: "450px" }}>
            <FlowCard
              label="Sign Up"
              sub="/members (Register)"
              screenshot="signup-modal.png"
              width="160px"
              height="90px"
            />
            <div className="node-connector-line" />

            {/* Split branch for all 5 User Roles and their sign up flows */}
            <div className="branch-wrapper">
              <div style={{ width: "402px", height: "2px", background: "#94a3b8", position: "absolute", top: "0" }} />
              
              <div style={{ display: "flex", gap: "6px", width: "100%", justifyContent: "center" }}>
                {/* Admin flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "84px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: colors.yellow, width: "80px", minHeight: "32px", padding: "4px", fontSize: "8.5px" }}>
                    Admin Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Request PIN"
                    screenshot="signup-modal.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: PIN"
                    sub="pin_number"
                    isEmail={true}
                    screenshot="admin-emails.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Verify PIN"
                    screenshot="signup-modal.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Set Password"
                    screenshot="signup-modal.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email Alert"
                    sub="new_account_admin_alert"
                    isEmail={true}
                    screenshot="admin-emails.png"
                    width="80px"
                    height="50px"
                    fontSize="7.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Admin Panel"
                    url="/admin"
                    screenshot="admin.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                </div>

                {/* Crew flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "84px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: colors.yellow, width: "80px", minHeight: "32px", padding: "4px", fontSize: "8.5px" }}>
                    Crew Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Request PIN"
                    screenshot="signup-modal.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: PIN"
                    sub="pin_number"
                    isEmail={true}
                    screenshot="admin-emails.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Verify PIN"
                    screenshot="signup-modal.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Set Password"
                    screenshot="signup-modal.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: Crew"
                    sub="welcome_crew"
                    isEmail={true}
                    screenshot="admin-emails.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email Alert"
                    sub="new_account_admin_alert"
                    isEmail={true}
                    screenshot="admin-emails.png"
                    width="80px"
                    height="50px"
                    fontSize="7.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Crew Hub"
                    url="/crew"
                    screenshot="crew.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                </div>

                {/* Fan flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "84px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: colors.yellow, width: "80px", minHeight: "32px", padding: "4px", fontSize: "8.5px" }}>
                    Fan Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Request PIN / CSV"
                    screenshot="signup-modal.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: PIN"
                    sub="pin_number"
                    isEmail={true}
                    screenshot="admin-emails.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Verify PIN"
                    screenshot="signup-modal.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: Welcome Fan"
                    sub="welcome_fan"
                    isEmail={true}
                    screenshot="admin-emails.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email Alert"
                    sub="new_account_admin_alert"
                    isEmail={true}
                    screenshot="admin-emails.png"
                    width="80px"
                    height="50px"
                    fontSize="7.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Fan Dash"
                    url="/fans"
                    screenshot="fans.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                </div>

                {/* Planner flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "84px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: colors.yellow, width: "80px", minHeight: "32px", padding: "4px", fontSize: "8.5px" }}>
                    Planner Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Request PIN"
                    screenshot="signup-modal.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: PIN"
                    sub="pin_number"
                    isEmail={true}
                    screenshot="admin-emails.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Verify PIN"
                    screenshot="signup-modal.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: Welcome"
                    sub="welcome_planner"
                    isEmail={true}
                    screenshot="admin-emails.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email Alert"
                    sub="new_account_admin_alert"
                    isEmail={true}
                    screenshot="admin-emails.png"
                    width="80px"
                    height="50px"
                    fontSize="7.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Planner Dash"
                    url="/planner"
                    screenshot="planner.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                </div>

                {/* Cruise passenger flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "84px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: colors.yellow, width: "80px", minHeight: "32px", padding: "4px", fontSize: "8.5px" }}>
                    Cruise Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Book Cruise"
                    url="/cruise"
                    screenshot="cruise.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: PIN"
                    sub="pin_number"
                    isEmail={true}
                    screenshot="admin-emails.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Verify PIN"
                    sub="Enter PIN"
                    screenshot="cruise.png"
                    overlayScreenshot="cruise-verify.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: Welcome"
                    sub="cruise_community"
                    isEmail={true}
                    screenshot="admin-emails.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email Alert"
                    sub="new_account_admin_alert"
                    isEmail={true}
                    screenshot="admin-emails.png"
                    width="80px"
                    height="50px"
                    fontSize="7.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Cruise Lounge"
                    url="/cruise/dashboard"
                    screenshot="cruise-dashboard.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column 10: Sign In / Access Flows (Purple/Grey) */}
          <div className="flow-column" style={{ minWidth: "450px" }}>
            <FlowCard
              label="Sign In"
              sub="/members (Login)"
              screenshot="login-modal.png"
              width="160px"
              height="90px"
            />
            <div className="node-connector-line" />

            {/* Split branch for all 5 User Roles and their sign in flows */}
            <div className="branch-wrapper">
              <div style={{ width: "402px", height: "2px", background: "#94a3b8", position: "absolute", top: "0" }} />
              
              <div style={{ display: "flex", gap: "6px", width: "100%", justifyContent: "center" }}>
                {/* Admin flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "84px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: colors.yellow, width: "80px", minHeight: "32px", padding: "4px", fontSize: "8.5px" }}>
                    Admin Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Enter PW"
                    screenshot="login-modal.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Admin Panel"
                    url="/admin"
                    screenshot="admin.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                </div>

                {/* Crew flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "84px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: colors.yellow, width: "80px", minHeight: "32px", padding: "4px", fontSize: "8.5px" }}>
                    Crew Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Enter PW"
                    screenshot="login-modal.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email: Shifts"
                    sub="crew_hours_summary"
                    isEmail={true}
                    screenshot="admin-emails.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="📩 Email Alert"
                    sub="schedule_change_alert"
                    isEmail={true}
                    screenshot="admin-emails.png"
                    width="80px"
                    height="50px"
                    fontSize="7.5px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Crew Hub"
                    url="/crew"
                    screenshot="crew.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                </div>

                {/* Fan flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "84px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: colors.yellow, width: "80px", minHeight: "32px", padding: "4px", fontSize: "8.5px" }}>
                    Fan Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Enter PW"
                    screenshot="login-modal.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Fan Dash"
                    url="/fans"
                    screenshot="fans.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                </div>

                {/* Planner flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "84px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: colors.yellow, width: "80px", minHeight: "32px", padding: "4px", fontSize: "8.5px" }}>
                    Planner Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Enter PW"
                    screenshot="login-modal.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Planner Dash"
                    url="/planner"
                    screenshot="planner.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                </div>

                {/* Cruise passenger flow */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "84px" }}>
                  <div className="branch-join-line" />
                  <div className="flow-node-box" style={{ backgroundColor: colors.yellow, width: "80px", minHeight: "32px", padding: "4px", fontSize: "8.5px" }}>
                    Cruise Role
                  </div>
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Enter PW"
                    screenshot="login-modal.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
                  />
                  <div className="branch-join-line" />
                  <FlowCard
                    label="Cruise Lounge"
                    url="/cruise/dashboard"
                    screenshot="cruise-dashboard.png"
                    width="80px"
                    height="50px"
                    fontSize="8px"
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
              width="160px"
              height="90px"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Request PIN"
              sub="Enter Email"
              screenshot="forgot-password.png"
              width="120px"
              height="70px"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="📩 Email: PIN Recovery"
              sub="Email template of pin number"
              isEmail={true}
              screenshot="admin-emails.png"
              width="120px"
              height="70px"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Verify PIN"
              sub="Enter Code"
              screenshot="forgot-password.png"
              width="120px"
              height="70px"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Set Password"
              sub="Choose PW"
              screenshot="forgot-password.png"
              width="120px"
              height="70px"
            />
            <div className="node-connector-line" />

            <FlowCard
              label="Redirect Sign In"
              sub="Login Gate"
              screenshot="login-modal.png"
              width="120px"
              height="70px"
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
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(8px)",
        padding: "8px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        border: "1px solid rgba(0,0,0,0.08)",
        zIndex: 9999
      }}>
        <button 
          onClick={() => setZoom(z => Math.min(2.5, z + 0.1))}
          style={{
            width: "36px", height: "36px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)",
            background: "#ffffff", color: "#000", fontWeight: "bold", fontSize: "16px", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", transition: "all 0.2s"
          }}
          className="zoom-btn"
        >+</button>
        <button 
          onClick={() => setZoom(z => Math.max(0.15, z - 0.1))}
          style={{
            width: "36px", height: "36px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)",
            background: "#ffffff", color: "#000", fontWeight: "bold", fontSize: "16px", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", transition: "all 0.2s"
          }}
          className="zoom-btn"
        >−</button>
        <button 
          onClick={() => { setZoom(0.85); setPanOffset({ x: 0, y: 0 }); }}
          style={{
            padding: "6px 8px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)",
            background: "#ffffff", color: "#000", fontWeight: "bold", fontSize: "9px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
          }}
          className="zoom-btn"
        >RESET</button>
        <div style={{ fontSize: "9px", color: "#64748b", textAlign: "center", fontWeight: "700", marginTop: "2px" }}>
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
          }}
          onClick={() => setLightboxImage(null)}
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
            <button 
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
                transition: "all 0.2s"
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
            <img 
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
