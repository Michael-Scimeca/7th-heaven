import React from "react";

export interface SocialLinkItem {
  name: string;
  url: string;
}

export const FALLBACK_SOCIAL_LINKS: SocialLinkItem[] = [
  { name: "Spotify", url: "https://open.spotify.com/artist/7thheavenband" },
  {
    name: "Apple Music",
    url: "https://music.apple.com/us/artist/7th-heaven/711717089",
  },
  { name: "YouTube", url: "https://www.youtube.com/user/7thheavenband" },
  { name: "Facebook", url: "https://www.facebook.com/7thheavenband" },
  { name: "Instagram", url: "https://www.instagram.com/7thheavenband" },
];

const OBJECT_KEY_LABELS: readonly { key: string; name: string }[] = [
  { key: "spotify", name: "Spotify" },
  { key: "appleMusic", name: "Apple Music" },
  { key: "youtube", name: "YouTube" },
  { key: "facebook", name: "Facebook" },
  { key: "instagram", name: "Instagram" },
  { key: "tiktok", name: "TikTok" },
  { key: "twitter", name: "X" },
  { key: "x", name: "X" },
];

export function normalizeSocialLinks(raw: unknown): SocialLinkItem[] {
  if (Array.isArray(raw)) {
    const valid = raw.filter(
      (item): item is SocialLinkItem =>
        Boolean(
          item &&
            typeof item === "object" &&
            typeof (item as SocialLinkItem).name === "string" &&
            typeof (item as SocialLinkItem).url === "string" &&
            (item as SocialLinkItem).url.trim().length > 0
        )
    );
    if (valid.length > 0) return valid;
  }

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const record = raw as Record<string, unknown>;
    const mapped: SocialLinkItem[] = [];
    for (const entry of OBJECT_KEY_LABELS) {
      const val = record[entry.key];
      if (typeof val === "string" && val.trim().length > 0) {
        mapped.push({ name: entry.name, url: val.trim() });
      }
    }
    if (mapped.length > 0) return mapped;
  }

  return FALLBACK_SOCIAL_LINKS;
}

export function SocialPlatformIcon({
  name,
  url,
  className = "footer-social-icon",
}: {
  name: string;
  url: string;
  className?: string;
}) {
  const key = `${name} ${url}`.toLowerCase();

  if (key.includes("spotify")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    );
  }

  if (key.includes("apple")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 0 0-1.877-.726 10.496 10.496 0 0 0-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.802.42.127.856.187 1.297.228.56.053 1.122.07 1.684.077.55.006 1.1.008 1.65.006h7.7c.51 0 1.02-.006 1.53-.022.62-.02 1.24-.05 1.85-.17.93-.18 1.77-.545 2.468-1.188.71-.654 1.18-1.454 1.434-2.38.167-.604.234-1.224.27-1.848.03-.503.04-1.008.047-1.512V6.124zm-6.772 8.89v3.63c0 .27-.04.533-.15.78a1.57 1.57 0 0 1-.967.876c-.383.14-.78.2-1.18.228-.5.03-1.003.003-1.48-.177a1.6 1.6 0 0 1-1.028-.975c-.167-.44-.103-.87.098-1.288.26-.545.718-.87 1.272-1.06.44-.15.9-.213 1.36-.287.31-.05.62-.098.92-.183.2-.06.32-.18.37-.39.01-.03.01-.06.01-.09V9.43c0-.09-.023-.16-.1-.21-.06-.04-.13-.03-.2-.02l-4.87 1.06c-.04.01-.07.02-.1.03-.1.04-.15.11-.16.22v6.24c.005.07.003.14 0 .21-.03.56-.07 1.12-.38 1.62-.29.48-.7.79-1.22.96-.37.12-.76.16-1.15.18-.47.02-.94-.02-1.39-.18-.61-.22-1.03-.62-1.19-1.26-.12-.47-.06-.93.16-1.37.27-.54.71-.87 1.27-1.06.44-.15.9-.21 1.36-.29.3-.05.6-.09.9-.18.19-.06.32-.18.37-.39.01-.03.01-.06.01-.09V7.54c0-.2.06-.36.22-.47.09-.06.18-.1.28-.12l6.2-1.35c.17-.04.34-.07.51-.08.26-.01.42.13.45.39.01.06.01.12.01.18v8.94z" />
      </svg>
    );
  }

  if (key.includes("youtube") || key.includes("youtu.be")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }

  if (key.includes("facebook")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }

  if (key.includes("instagram")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    );
  }

  if (key.includes("tiktok")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    );
  }

  if (
    name.trim().toLowerCase() === "x" ||
    key.includes("twitter") ||
    key.includes("x.com")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        className={className}
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

