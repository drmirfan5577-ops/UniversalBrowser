import { useQuery } from "@tanstack/react-query";
import { Palette, Search, Settings, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import GlassCard from "@/components/glass-card.tsx";
import Ticker from "@/components/ticker.tsx";
import { api, type Launcher, type SiteData } from "@/lib/api.ts";
import { HUBS } from "@/lib/hubs.ts";
import { isDarkTheme, useVisitorTheme } from "@/lib/theme.ts";
import { cn } from "@/lib/utils.ts";

function faviconFor(url: string) {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
  } catch {
    return null;
  }
}

function LauncherTile({ launcher }: { launcher: Launcher }) {
  const [iconFailed, setIconFailed] = useState(false);
  const favicon = faviconFor(launcher.url);
  return (
    <a href={launcher.url} target="_blank" rel="noopener noreferrer" className="group block">
      <GlassCard className="flex h-full flex-col items-center gap-2 p-3 text-center transition-transform duration-200 group-hover:-translate-y-0.5 group-active:scale-95">
        <div className="relative flex size-12 items-center justify-center rounded-xl bg-white/70 text-2xl shadow-sm">
          {favicon && !iconFailed ? (
            <img
              src={favicon}
              alt=""
              className="size-7"
              loading="lazy"
              onError={() => setIconFailed(true)}
            />
          ) : (
            <span aria-hidden>{launcher.iconEmoji}</span>
          )}
        </div>
        <span className="line-clamp-2 text-xs font-medium leading-tight">{launcher.name}</span>
      </GlassCard>
    </a>
  );
}

export default function Index() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["site"],
    queryFn: () => api<SiteData>("data"),
  });
  const { theme, setTheme, resetTheme } = useVisitorTheme(data?.activeTheme);
  const [hubId, setHubId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showThemes, setShowThemes] = useState(false);
  const dark = isDarkTheme(theme);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.launchers ?? []).filter(
      (l) =>
        (hubId === "all" || l.hubId === hubId) &&
        (!q || l.name.toLowerCase().includes(q) || l.url.toLowerCase().includes(q)),
    );
  }, [data, hubId, search]);

  const grouped = HUBS.map((hub) => ({
    hub,
    items: filtered.filter((l) => l.hubId === hub.id),
  })).filter((g) => g.items.length > 0);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    if (filtered.length === 1) {
      window.open(filtered[0].url, "_blank", "noopener");
    } else if (filtered.length === 0) {
      const target = /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(q)
        ? `https://${q}`
        : `https://www.google.com/search?q=${encodeURIComponent(q)}`;
      window.open(target, "_blank", "noopener");
    }
  };

  const mission = data?.ticker.filter((t) => t.strip === "mission") ?? [];
  const info = data?.ticker.filter((t) => t.strip === "info") ?? [];

  return (
    <div
      className={cn("min-h-screen transition-colors", dark ? "theme-dark text-white" : "text-slate-900")}
      style={{ background: theme.gradient, backgroundAttachment: "fixed" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex size-11 items-center justify-center rounded-2xl text-2xl text-white shadow-lg"
              style={{ background: theme.accentColor }}
            >
              🌐
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">UniversalBrowser</h1>
              <p className={cn("text-xs", dark ? "text-white/70" : "text-slate-600")}>
                E.S OneWorld · A Global Family Platform
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowThemes((s) => !s)}
              className="glass flex size-10 items-center justify-center rounded-xl"
              aria-label="Choose theme"
              aria-expanded={showThemes}
            >
              <Palette className="size-5" />
            </button>
            <Link
              to="/admin"
              className="glass flex size-10 items-center justify-center rounded-xl"
              aria-label="Admin panel"
            >
              <Settings className="size-5" />
            </Link>
          </div>
        </header>

        {showThemes && data && (
          <GlassCard className="p-4" hover={false}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Choose a theme</h2>
              <div className="flex items-center gap-3">
                <button onClick={resetTheme} className="text-xs underline opacity-70 hover:opacity-100">
                  Use site default
                </button>
                <button onClick={() => setShowThemes(false)} aria-label="Close themes">
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
              {data.themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl p-1.5 text-[11px] transition",
                    theme.name === t.name && "ring-2",
                  )}
                  style={{ ["--tw-ring-color" as string]: t.accentColor }}
                >
                  <span
                    className="h-10 w-full rounded-lg border border-white/60 shadow-sm"
                    style={{ background: t.gradient }}
                  />
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </GlassCard>
        )}

        <Ticker messages={mission} accent={theme.accentColor} label="Mission" />
        <Ticker messages={info} accent="#0f172a" label="Info" />

        <form onSubmit={onSearchSubmit} className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 opacity-50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search launchers, type a website, or search the web…"
            className="glass w-full rounded-2xl py-3.5 pr-4 pl-12 text-base outline-none placeholder:opacity-60 focus:ring-2"
            style={{ ["--tw-ring-color" as string]: theme.accentColor }}
          />
        </form>

        <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Hubs">
          {[{ id: "all", label: "All", emoji: "✨", color: theme.accentColor }, ...HUBS].map((h) => {
            const active = hubId === h.id;
            return (
              <button
                key={h.id}
                onClick={() => setHubId(h.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition",
                  active ? "text-white shadow-md" : "glass",
                )}
                style={active ? { background: h.color } : undefined}
                aria-pressed={active}
              >
                <span aria-hidden>{h.emoji}</span>
                {h.label}
              </button>
            );
          })}
        </nav>

        <main className="flex flex-col gap-6 pb-10">
          {isLoading && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="glass h-24 animate-pulse rounded-2xl" />
              ))}
            </div>
          )}
          {error && (
            <GlassCard className="p-6 text-center" hover={false}>
              <p className="font-medium">Couldn't load launchers.</p>
              <p className="text-sm opacity-70">Please refresh the page in a moment.</p>
            </GlassCard>
          )}
          {data && grouped.length === 0 && (
            <GlassCard className="p-6 text-center text-sm" hover={false}>
              No launchers match “{search}”. Press Enter to search the web.
            </GlassCard>
          )}
          {grouped.map(({ hub, items }) => (
            <section key={hub.id}>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <span
                  className="flex size-7 items-center justify-center rounded-lg text-base"
                  style={{ background: hub.bg }}
                  aria-hidden
                >
                  {hub.emoji}
                </span>
                {hub.label}
                <span className="text-xs font-normal opacity-60">{hub.description}</span>
              </h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
                {items.map((l) => (
                  <LauncherTile key={l.id} launcher={l} />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
