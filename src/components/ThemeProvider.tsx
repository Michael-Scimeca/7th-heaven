"use client";
/* oxlint-disable react-doctor/no-fetch-in-effect */
/* eslint-disable react-doctor/no-fetch-in-effect */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import {
  ThemeTokens,
  DEFAULT_THEME_TOKENS,
  applyThemeTokensToDocument,
  parseAndValidateThemeJson,
  exportTokensAsJson,
} from "@/lib/theme-tokens";

interface ThemeContextType {
  tokens: ThemeTokens;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  updateToken: (category: keyof ThemeTokens, tokenKey: string, value: string) => void;
  updateTokens: (newTokens: ThemeTokens) => void;
  saveTheme: () => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
  exportThemeJson: () => string;
  importThemeJson: (jsonString: string) => Promise<boolean>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({
  children,
  initialTokens,
}: {
  children: React.ReactNode;
  initialTokens?: ThemeTokens;
}) {
  const [tokens, setTokens] = useState<ThemeTokens>(initialTokens || DEFAULT_THEME_TOKENS);
  const [savedTokens, setSavedTokens] = useState<ThemeTokens>(initialTokens || DEFAULT_THEME_TOKENS);
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize custom CSS custom properties only if tokens have been modified dynamically
  useEffect(() => {
    if (tokens !== DEFAULT_THEME_TOKENS) {
      applyThemeTokensToDocument(tokens);
    }
  }, [tokens]);

  // Fetch persisted tokens from API only on admin routes to prevent full-page CSS variable flicker on public loads
  useEffect(() => {
    if (typeof window === "undefined" || !window.location.pathname.startsWith("/admin")) return;

    async function fetchTokens() {
      try {
        const res = await fetch("/api/admin/theme");
        if (res.ok) {
          const data = await res.json();
          if (data.tokens) {
            const mergedTokens: ThemeTokens = {
              colors: {
                ...DEFAULT_THEME_TOKENS.colors,
                ...(data.tokens.colors || {}),
              },
              typography: {
                ...DEFAULT_THEME_TOKENS.typography,
                ...(data.tokens.typography || {}),
              },
              spacing: {
                ...DEFAULT_THEME_TOKENS.spacing,
                ...(data.tokens.spacing || {}),
              },
              radii: {
                ...DEFAULT_THEME_TOKENS.radii,
                ...(data.tokens.radii || {}),
              },
              shadows: {
                ...DEFAULT_THEME_TOKENS.shadows,
                ...(data.tokens.shadows || {}),
              },
              breakpoints: {
                ...DEFAULT_THEME_TOKENS.breakpoints,
                ...(data.tokens.breakpoints || {}),
              },
            };
            setTokens(mergedTokens);
            setSavedTokens(mergedTokens);
          }
        }
      } catch (e) {
        console.warn("Could not fetch server theme tokens:", e);
      }
    }
    fetchTokens();
  }, []);

  const updateToken = useCallback((category: keyof ThemeTokens, tokenKey: string, value: string) => {
    setTokens((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [tokenKey]: value,
      },
    }));
  }, []);

  const updateTokens = useCallback((newTokens: ThemeTokens) => {
    setTokens(newTokens);
  }, []);

  const saveTheme = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.tokens) {
          setTokens(data.tokens);
          setSavedTokens(data.tokens);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Failed to save theme:", err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [tokens]);

  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/theme", { method: "DELETE" });
      if (res.ok) {
        setTokens(DEFAULT_THEME_TOKENS);
        setSavedTokens(DEFAULT_THEME_TOKENS);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to reset theme:", err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const exportThemeJson = useCallback(() => {
    return exportTokensAsJson(tokens);
  }, [tokens]);

  const importThemeJson = useCallback(async (jsonString: string): Promise<boolean> => {
    const parsed = parseAndValidateThemeJson(jsonString);
    if (!parsed) return false;
    setTokens(parsed);
    return true;
  }, []);

  const hasUnsavedChanges = useMemo(() => JSON.stringify(tokens) !== JSON.stringify(savedTokens), [tokens, savedTokens]);

  const contextValue = useMemo(() => ({
    tokens,
    isSaving,
    hasUnsavedChanges,
    updateToken,
    updateTokens,
    saveTheme,
    resetToDefaults,
    exportThemeJson,
    importThemeJson,
  }), [tokens, isSaving, hasUnsavedChanges, updateToken, updateTokens, saveTheme, resetToDefaults, exportThemeJson, importThemeJson]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeTokens() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeTokens must be used within a ThemeProvider");
  }
  return context;
}
