import { useEffect, useState } from "react";
import type { ThemeConfig } from "./api.ts";

export const DEFAULT_THEME: ThemeConfig = {
  name: "Ice Crystal",
  gradient: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)",
  accentColor: "#1565c0",
  cardBg: "rgba(227,242,253,0.7)",
};

const STORAGE_KEY = "visitorTheme";

function readStored(): ThemeConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ThemeConfig) : null;
  } catch {
    return null;
  }
}

// A visitor's own pick wins; otherwise the admin's site-wide theme; otherwise the default
export function useVisitorTheme(siteTheme: ThemeConfig | null | undefined) {
  const [picked, setPicked] = useState<ThemeConfig | null>(readStored);
  const theme = picked ?? siteTheme ?? DEFAULT_THEME;

  useEffect(() => {
    if (picked) localStorage.setItem(STORAGE_KEY, JSON.stringify(picked));
    else localStorage.removeItem(STORAGE_KEY);
  }, [picked]);

  return { theme, setTheme: setPicked, resetTheme: () => setPicked(null) };
}

// Dark gradients (e.g. "Blue Cyber") need light text
export function isDarkTheme(theme: ThemeConfig) {
  const hex = theme.gradient.match(/#([0-9a-f]{6})/i)?.[1];
  if (!hex) return false;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b < 110;
}
