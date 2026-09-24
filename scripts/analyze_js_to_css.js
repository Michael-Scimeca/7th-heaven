const fs = require("fs");
const path = require("path");

const rawFindings = JSON.parse(fs.readFileSync("scripts/js_to_css_findings.json"));

const easySwap = [];
const needsCare = [];
const keepAsJs = [];

rawFindings.forEach(item => {
  const s = item.snippet;
  const f = item.file;

  // 1. MouseEnter / MouseLeave hover state
  if (item.type === "hover-state") {
    // If it's a video hover player or audio prebuffer trigger -> Keep as JS
    if (f.includes("MediaClient.tsx") || f.includes("HeroVideoPlayer.tsx") || f.includes("AudioPlayer.tsx") || s.includes("handleMouseEnter") && s.includes("buffer")) {
      keepAsJs.push({
        ...item,
        reason: "Triggers media loading/video buffer playback on hover, not just purely visual CSS styling."
      });
    } else {
      easySwap.push({
        ...item,
        category: "Hover & Mouse Tracking",
        before: `<div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className={isHovered ? "bg-white/20" : ""}>`,
        after: `<div className="hover:bg-white/20 group">`,
        benefit: "Eliminates React re-renders on every hover event, removes useState hook and event handlers.",
        risk: "None."
      });
    }
  }

  // 2. window.innerWidth or resize listeners
  else if (item.type === "responsive-js") {
    if (s.includes("isMobile") || s.includes("window.innerWidth")) {
      // If used ONLY for CSS class/layout toggling
      if (s.includes("className") || s.includes("style") || s.includes("hidden") || s.includes("flex-col")) {
        easySwap.push({
          ...item,
          category: "Responsive Layout",
          before: `const isMobile = window.innerWidth < 768; return <div className={isMobile ? "flex-col" : "flex-row"}>`,
          after: `<div className="flex-col md:flex-row">`,
          benefit: "Eliminates window resize listeners and re-renders during window drag/resize.",
          risk: "None."
        });
      } else {
        needsCare.push({
          ...item,
          category: "Responsive Layout",
          before: `const isMobile = useMediaQuery("(max-width: 768px)"); return isMobile ? <MobileView /> : <DesktopView />`,
          after: `<div className="block md:hidden"><MobileView /></div><div className="hidden md:block"><DesktopView /></div>`,
          benefit: "Removes JS resize listener and unifies DOM tree.",
          risk: "Both views mount in DOM (use CSS hidden to display); check if MobileView has heavy side-effects."
        });
      }
    } else {
      keepAsJs.push({
        ...item,
        reason: "Required for Canvas pixel re-calculation or WebGL viewport matrix updates."
      });
    }
  }

  // 3. Nth-child / Index checks
  else if (item.type === "nth-child") {
    easySwap.push({
      ...item,
      category: "Text & Media Styling",
      before: `<div className={idx === 0 ? "border-t-0" : "border-t"}>`,
      after: `<div className="border-t first:border-t-0">`,
      benefit: "Saves conditional inline ternary string logic in JSX loops.",
      risk: "None."
    });
  }

  // 4. Scroll listeners
  else if (item.type === "scroll-js") {
    if (s.includes("isScrolled") || s.includes("scrollY >")) {
      needsCare.push({
        ...item,
        category: "Sticky & Scroll Effects",
        before: `const [isScrolled, setIsScrolled] = useState(false); useEffect(() => { const onScroll = () => setIsScrolled(window.scrollY > 20)... })`,
        after: `CSS position: sticky; top: 0; or CSS animation-timeline: scroll()`,
        benefit: "Eliminates main-thread scroll event listener and setState re-renders on scroll.",
        risk: "Check if header requires full opacity background change on scroll vs CSS position: sticky."
      });
    } else {
      keepAsJs.push({
        ...item,
        reason: "Required for scroll sync state between two decoupled interactive audio/map containers."
      });
    }
  }

  // 5. Accordion Height
  else if (item.type === "accordion-height") {
    easySwap.push({
      ...item,
      category: "Accordions & Expandables",
      before: `style={{ height: isExpanded ? contentRef.current?.scrollHeight : 0 }}`,
      after: `<div className="grid transition-[grid-template-rows] duration-300 \${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}\"><div className="overflow-hidden">...</div></div>`,
      benefit: "Eliminates DOM ref measurements and inline pixel height calculations; pure CSS smooth transition.",
      risk: "None (CSS Grid 0fr -> 1fr trick is fully supported across all modern browsers)."
    });
  }

  // 6. Aspect Ratio
  else if (item.type === "aspect-ratio") {
    easySwap.push({
      ...item,
      category: "Text & Media Styling",
      before: `style={{ aspectRatio: "16 / 9" }}`,
      after: `className="aspect-video" or className="aspect-[16/9]"`,
      benefit: "Pure CSS aspect ratio class without JS inline style objects.",
      risk: "None."
    });
  }

  // 7. Reduced motion
  else if (item.type === "reduced-motion") {
    easySwap.push({
      ...item,
      category: "Theme & Motion Queries",
      before: `const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");`,
      after: `CSS @media (prefers-reduced-motion: reduce) or Tailwind motion-reduce:*`,
      benefit: "Handled natively by browser CSS engine without JS hook subscription.",
      risk: "None."
    });
  }
});

console.log("=== AUDIT CATEGORIZATION SUMMARY ===");
console.log(`✅ Easy swap: ${easySwap.length}`);
console.log(`⚠️ Needs care: ${needsCare.length}`);
console.log(`❌ Keep as JS: ${keepAsJs.length}`);

fs.writeFileSync("scripts/js_to_css_classified.json", JSON.stringify({
  easySwapCount: easySwap.length,
  needsCareCount: needsCare.length,
  keepAsJsCount: keepAsJs.length,
  easySwap,
  needsCare,
  keepAsJs
}, null, 2));
