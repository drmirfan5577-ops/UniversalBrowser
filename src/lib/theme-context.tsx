// Theme context shared across the app
import { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";

export type ThemeConfig = {
  name: string;
  gradient: string;
  accentColor: string;
  cardBg: string;
};

const DEFAULT_THEME: ThemeConfig = {
  name: "Ice Crystal",
  gradient: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)",
  accentColor: "#1565c0",
  cardBg: "rgba(227,242,253,0.7)",
};

type ThemeCtx = {
  theme: ThemeConfig;
  setTheme: (t: ThemeConfig) => void;
};

const Ctx = createContext<ThemeCtx>({ theme: DEFAULT_THEME, setTheme: () => {} });

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(DEFAULT_THEME);
  const savedTheme = useQuery(api.settings.get, { key: "activeTheme" });
  const setSetting = useMutation(api.settings.set);

  useEffect(() => {
    if (savedTheme) {
      try { setThemeState(JSON.parse(savedTheme) as ThemeConfig); } catch { /* ignore */ }
    }
  }, [savedTheme]);

  const setTheme = (t: ThemeConfig) => {
    setThemeState(t);
    setSetting({ key: "activeTheme", value: JSON.stringify(t) });
  };

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export const useThemeCtx = () => useContext(Ctx);
