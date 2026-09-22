/**
 * Universal Font Inspector Snippet
 * 
 * Automatically inspects ALL elements on the page (including dynamic React components
 * loaded post-hydration) that have text or computed font-size. Outlines them and
 * floats a label showing tag name, computed font-size, and font-family.
 * 
 * Handles SmoothScroll (Lenis), sticky elements, and scrolling without disappearing!
 */
(function () {
  const LABEL_CLASS = '__font_inspector_label__';
  const CONTAINER_ID = '__font_inspector_container__';
  const MARK_ATTR = 'data-font-inspector-active';

  const SKIP_TAGS = new Set([
    'html', 'head', 'script', 'style', 'meta', 'link', 'title',
    'svg', 'path', 'g', 'defs', 'clippath', 'use', 'br', 'hr',
    'iframe', 'canvas', 'picture', 'source', 'audio', 'video', 'track'
  ]);

  const TAG_COLORS = {
    div: '#ef4444',     // red
    p: '#3b82f6',       // blue
    a: '#10b981',       // green
    button: '#a855f7',  // purple
    span: '#eab308',    // yellow
    h1: '#ec4899',      // pink
    h2: '#f97316',      // orange
    h3: '#06b6d4',      // cyan
    h4: '#84cc16',      // lime
    h5: '#6366f1',      // indigo
    h6: '#14b8a6',      // teal
    input: '#f43f5e',   // rose
    textarea: '#d946ef',// fuchsia
    select: '#8b5cf6',  // violet
    label: '#0284c7',   // sky
    li: '#059669',      // emerald
  };

  function getColorForTag(tag) {
    if (TAG_COLORS[tag]) return TAG_COLORS[tag];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${Math.abs(hash) % 360}, 75%, 50%)`;
  }

  let isRunning = false;
  let observer = null;
  let rafId = null;

  function updatePositions() {
    if (!isRunning) return;

    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    document.querySelectorAll('.' + LABEL_CLASS).forEach((label) => {
      const target = label.__targetEl;
      if (!target || !target.isConnected) {
        label.remove();
        return;
      }
      const rect = target.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        label.style.display = 'none';
        return;
      }
      label.style.display = 'block';
      label.style.top = `${rect.top + scrollY}px`;
      label.style.left = `${rect.left + scrollX}px`;
    });
  }

  function scanElements() {
    if (!isRunning) return;

    let container = document.getElementById(CONTAINER_ID);
    if (!container) {
      container = document.createElement('div');
      container.id = CONTAINER_ID;
      Object.assign(container.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        pointerEvents: 'none',
        zIndex: '2147483647',
      });
      document.body.appendChild(container);
    }

    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const elements = document.querySelectorAll('*');

    elements.forEach((el) => {
      const tag = el.tagName.toLowerCase();
      if (SKIP_TAGS.has(tag)) return;
      if (el.classList.contains(LABEL_CLASS) || el.id === CONTAINER_ID) return;
      if (el.hasAttribute(MARK_ATTR)) return;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      const computed = window.getComputedStyle(el);
      if (computed.display === 'none' || computed.visibility === 'hidden') return;

      const fontSize = computed.fontSize;
      if (!fontSize || parseFloat(fontSize) === 0) return;

      const color = getColorForTag(tag);
      const fontFamily = computed.fontFamily.split(',')[0].replace(/["']/g, '').trim();

      el.setAttribute(MARK_ATTR, 'true');
      el.dataset.fontInspectorPrevOutline = el.style.outline;
      el.dataset.fontInspectorPrevOutlineOffset = el.style.outlineOffset;

      el.style.outline = `1px solid ${color}`;
      el.style.outlineOffset = '-1px';

      const label = document.createElement('span');
      label.className = LABEL_CLASS;
      label.textContent = `${tag} · ${fontSize} · ${fontFamily}`;
      label.__targetEl = el;

      Object.assign(label.style, {
        position: 'absolute',
        top: `${rect.top + scrollY}px`,
        left: `${rect.left + scrollX}px`,
        transform: 'translateY(-100%)',
        background: color,
        color: (tag === 'span' || tag === 'h4') ? '#000000' : '#ffffff',
        fontFamily: 'monospace, sans-serif',
        fontSize: '10px',
        lineHeight: '1.4',
        fontWeight: 'bold',
        padding: '1px 5px',
        borderRadius: '3px 3px 0 0',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
      });

      container.appendChild(label);
    });

    updatePositions();
  }

  function loop() {
    if (!isRunning) return;
    updatePositions();
    rafId = requestAnimationFrame(loop);
  }

  function show() {
    hide();
    isRunning = true;

    scanElements();
    loop();

    // Re-scan whenever React hydrates or updates components in the DOM
    observer = new MutationObserver(() => {
      scanElements();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Periodic check for dynamic late-loading fonts/styles
    const scanInterval = setInterval(scanElements, 1000);
    window.__fontInspectorInterval = scanInterval;

    window.addEventListener('scroll', updatePositions, { passive: true, capture: true });
    window.addEventListener('resize', updatePositions);
  }

  function hide() {
    isRunning = false;
    if (rafId) cancelAnimationFrame(rafId);
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (window.__fontInspectorInterval) {
      clearInterval(window.__fontInspectorInterval);
      delete window.__fontInspectorInterval;
    }

    const container = document.getElementById(CONTAINER_ID);
    if (container) container.remove();

    document.querySelectorAll('.' + LABEL_CLASS).forEach((el) => el.remove());
    document.querySelectorAll(`[${MARK_ATTR}]`).forEach((el) => {
      el.style.outline = el.dataset.fontInspectorPrevOutline || '';
      el.style.outlineOffset = el.dataset.fontInspectorPrevOutlineOffset || '';
      delete el.dataset.fontInspectorPrevOutline;
      delete el.dataset.fontInspectorPrevOutlineOffset;
      el.removeAttribute(MARK_ATTR);
    });

    window.removeEventListener('scroll', updatePositions, { passive: true, capture: true });
    window.removeEventListener('resize', updatePositions);
  }

  window.fontInspector = { show, hide, scan: scanElements };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', show);
  } else {
    show();
  }
})();
