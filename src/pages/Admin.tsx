import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, EyeOff, LogOut, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import GlassCard from "@/components/glass-card.tsx";
import { adminToken, api, ApiError, type SiteData, type ThemeConfig } from "@/lib/api.ts";
import { HUBS } from "@/lib/hubs.ts";
import { cn } from "@/lib/utils.ts";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400";
const buttonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50";

function onError(e: unknown) {
  toast.error(e instanceof Error ? e.message : "Something went wrong");
}

function PasswordGate({ onAuthed }: { onAuthed: () => void }) {
  const status = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => api<{ hasPassword: boolean }>("admin/status"),
  });
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const setup = status.data && !status.data.hasPassword;

  const submit = useMutation({
    mutationFn: () => {
      if (setup && password !== confirm) throw new Error("Passwords don't match");
      return api<{ token: string }>(setup ? "admin/setup" : "admin/login", {
        method: "POST",
        body: { password },
      });
    },
    onSuccess: ({ token }) => {
      adminToken.set(token);
      onAuthed();
    },
    onError,
  });

  return (
    <GlassCard className="mx-auto mt-16 w-full max-w-sm p-6" hover={false}>
      <h1 className="text-lg font-bold">{setup ? "Create admin password" : "Admin sign in"}</h1>
      <p className="mt-1 mb-4 text-sm text-slate-600">
        {setup
          ? "No admin password exists yet. Choose one (at least 8 characters) to protect the admin panel."
          : "Enter the admin password to manage launchers, tickers and themes."}
      </p>
      {status.isLoading ? (
        <div className="h-10 animate-pulse rounded-xl bg-white/60" />
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit.mutate();
          }}
        >
          <input
            type="password"
            className={inputClass}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete={setup ? "new-password" : "current-password"}
          />
          {setup && (
            <input
              type="password"
              className={inputClass}
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          )}
          <button className={buttonClass} disabled={!password || submit.isPending}>
            {setup ? "Create password" : "Sign in"}
          </button>
        </form>
      )}
    </GlassCard>
  );
}

function useAdminMutation<T>(fn: (vars: T) => Promise<unknown>, success?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-data"] });
      qc.invalidateQueries({ queryKey: ["site"] });
      if (success) toast.success(success);
    },
    onError,
  });
}

function LaunchersTab({ data }: { data: SiteData }) {
  const [hubId, setHubId] = useState(HUBS[0].id);
  const [form, setForm] = useState({ name: "", url: "", iconEmoji: "" });
  const create = useAdminMutation(
    () => api("admin/launchers", { method: "POST", body: { ...form, hubId } }),
    "Launcher added",
  );
  const update = useAdminMutation((v: { id: number; isActive: boolean }) =>
    api(`admin/launchers/${v.id}`, { method: "PATCH", body: { isActive: v.isActive } }),
  );
  const remove = useAdminMutation(
    (id: number) => api(`admin/launchers/${id}`, { method: "DELETE" }),
    "Launcher removed",
  );
  const items = data.launchers.filter((l) => l.hubId === hubId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {HUBS.map((h) => (
          <button
            key={h.id}
            onClick={() => setHubId(h.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm",
              hubId === h.id ? "text-white" : "bg-white/70",
            )}
            style={hubId === h.id ? { background: h.color } : undefined}
          >
            {h.emoji} {h.label} ({data.launchers.filter((l) => l.hubId === h.id).length})
          </button>
        ))}
      </div>

      <form
        className="grid gap-2 sm:grid-cols-[80px_1fr_1.5fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate(undefined, { onSuccess: () => setForm({ name: "", url: "", iconEmoji: "" }) });
        }}
      >
        <input
          className={inputClass}
          placeholder="Emoji"
          value={form.iconEmoji}
          onChange={(e) => setForm({ ...form, iconEmoji: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className={inputClass}
          placeholder="https://example.com"
          type="url"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          required
        />
        <button className={buttonClass} disabled={create.isPending}>
          <Plus className="size-4" /> Add
        </button>
      </form>

      <ul className="divide-y divide-slate-200/70">
        {items.map((l) => (
          <li key={l.id} className={cn("flex items-center gap-3 py-2", !l.isActive && "opacity-50")}>
            <span className="w-7 text-center text-xl">{l.iconEmoji}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{l.name}</div>
              <div className="truncate text-xs text-slate-500">{l.url}</div>
            </div>
            <button
              onClick={() => update.mutate({ id: l.id, isActive: !l.isActive })}
              className="rounded-lg p-2 hover:bg-white/70"
              aria-label={l.isActive ? "Hide launcher" : "Show launcher"}
              title={l.isActive ? "Hide" : "Show"}
            >
              {l.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            </button>
            <button
              onClick={() => confirm(`Delete “${l.name}”?`) && remove.mutate(l.id)}
              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
              aria-label="Delete launcher"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="py-4 text-sm text-slate-500">No launchers in this hub yet.</li>}
      </ul>
    </div>
  );
}

function TickerTab({ data }: { data: SiteData }) {
  const [strip, setStrip] = useState<"mission" | "info">("mission");
  const [content, setContent] = useState("");
  const create = useAdminMutation(
    () => api("admin/ticker", { method: "POST", body: { content, strip } }),
    "Message added",
  );
  const update = useAdminMutation((v: { id: number; isActive: boolean }) =>
    api(`admin/ticker/${v.id}`, { method: "PATCH", body: { isActive: v.isActive } }),
  );
  const remove = useAdminMutation(
    (id: number) => api(`admin/ticker/${id}`, { method: "DELETE" }),
    "Message removed",
  );
  const items = data.ticker.filter((t) => t.strip === strip);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {(["mission", "info"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStrip(s)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm capitalize",
              strip === s ? "bg-blue-600 text-white" : "bg-white/70",
            )}
          >
            {s} strip
          </button>
        ))}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate(undefined, { onSuccess: () => setContent("") });
        }}
      >
        <input
          className={inputClass}
          placeholder="New scrolling message…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button className={buttonClass} disabled={create.isPending}>
          <Plus className="size-4" /> Add
        </button>
      </form>
      <ul className="divide-y divide-slate-200/70">
        {items.map((t) => (
          <li key={t.id} className={cn("flex items-center gap-3 py-2", !t.isActive && "opacity-50")}>
            <span className="flex-1 text-sm">{t.content}</span>
            <button
              onClick={() => update.mutate({ id: t.id, isActive: !t.isActive })}
              className="rounded-lg p-2 hover:bg-white/70"
              aria-label={t.isActive ? "Hide message" : "Show message"}
            >
              {t.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            </button>
            <button
              onClick={() => confirm("Delete this message?") && remove.mutate(t.id)}
              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
              aria-label="Delete message"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="py-4 text-sm text-slate-500">No messages on this strip.</li>}
      </ul>
    </div>
  );
}

function ThemesTab({ data }: { data: SiteData }) {
  const [form, setForm] = useState({ name: "", from: "#e3f2fd", to: "#90caf9", accentColor: "#1565c0" });
  const setActive = useAdminMutation(
    (t: ThemeConfig) => api("admin/active-theme", { method: "PUT", body: t }),
    "Site default theme updated",
  );
  const create = useAdminMutation(
    () =>
      api("admin/themes", {
        method: "POST",
        body: {
          name: form.name,
          gradient: `linear-gradient(135deg, ${form.from} 0%, ${form.to} 100%)`,
          accentColor: form.accentColor,
          cardBg: "rgba(255,255,255,0.7)",
        },
      }),
    "Theme created",
  );
  const remove = useAdminMutation(
    (id: number) => api(`admin/themes/${id}`, { method: "DELETE" }),
    "Theme removed",
  );

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-slate-600">
        Pick the default theme visitors see. Visitors can still choose their own from the palette button.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {data.themes.map((t) => {
          const active = data.activeTheme?.name === t.name;
          return (
            <div key={t.id} className={cn("rounded-xl bg-white/60 p-2", active && "ring-2 ring-blue-500")}>
              <button onClick={() => setActive.mutate(t)} className="block w-full text-left">
                <span className="block h-12 rounded-lg" style={{ background: t.gradient }} />
                <span className="mt-1 block truncate text-xs font-medium">
                  {t.name} {active && "· default"}
                </span>
              </button>
              {!t.isBuiltIn && (
                <button
                  onClick={() => confirm(`Delete theme “${t.name}”?`) && remove.mutate(t.id)}
                  className="mt-1 text-xs text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          );
        })}
      </div>
      <form
        className="flex flex-wrap items-end gap-3 rounded-xl bg-white/50 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate(undefined, { onSuccess: () => setForm({ ...form, name: "" }) });
        }}
      >
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs">
          New theme name
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        {(["from", "to", "accentColor"] as const).map((k) => (
          <label key={k} className="flex flex-col gap-1 text-xs">
            {k === "accentColor" ? "Accent" : k === "from" ? "Start" : "End"}
            <input
              type="color"
              className="h-9 w-14 rounded-lg"
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          </label>
        ))}
        <span
          className="h-9 w-20 rounded-lg border border-white"
          style={{ background: `linear-gradient(135deg, ${form.from}, ${form.to})` }}
        />
        <button className={buttonClass} disabled={create.isPending}>
          <Plus className="size-4" /> Create
        </button>
      </form>
    </div>
  );
}

function SecurityTab() {
  const [password, setPassword] = useState("");
  const change = useAdminMutation(
    () => api("admin/password", { method: "POST", body: { password } }),
    "Password changed",
  );
  return (
    <form
      className="flex max-w-sm flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        change.mutate(undefined, { onSuccess: () => setPassword("") });
      }}
    >
      <label className="text-sm font-medium">New admin password</label>
      <input
        type="password"
        className={inputClass}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
        autoComplete="new-password"
        required
      />
      <button className={buttonClass} disabled={change.isPending}>
        Change password
      </button>
    </form>
  );
}

const TABS = ["Launchers", "Ticker", "Themes", "Security"] as const;

export default function Admin() {
  const qc = useQueryClient();
  const [authed, setAuthed] = useState(() => Boolean(adminToken.get()));
  const [tab, setTab] = useState<(typeof TABS)[number]>("Launchers");

  const { data, error } = useQuery({
    queryKey: ["admin-data"],
    queryFn: () => api<SiteData>("admin/data"),
    enabled: authed,
    retry: (count, e) => !(e instanceof ApiError && e.status === 401) && count < 2,
  });

  // Expired or invalid session: back to the sign-in screen
  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) {
      adminToken.clear();
      setAuthed(false);
    }
  }, [error]);

  const signOut = () => {
    adminToken.clear();
    qc.removeQueries({ queryKey: ["admin-data"] });
    setAuthed(false);
  };

  return (
    <div className="min-h-screen px-4 py-5 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-4 flex items-center justify-between">
          <Link to="/" className="glass inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm">
            <ArrowLeft className="size-4" /> Back to launcher
          </Link>
          {authed && (
            <button onClick={signOut} className="glass inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm">
              <LogOut className="size-4" /> Sign out
            </button>
          )}
        </header>

        {!authed ? (
          <PasswordGate
            onAuthed={() => {
              qc.invalidateQueries({ queryKey: ["admin-status"] });
              setAuthed(true);
            }}
          />
        ) : (
          <GlassCard className="p-5" hover={false}>
            <h1 className="mb-4 text-xl font-bold">Admin panel</h1>
            <div className="mb-5 flex gap-1 rounded-xl bg-white/50 p-1">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
                    tab === t ? "bg-white shadow-sm" : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            {tab === "Security" ? (
              <SecurityTab />
            ) : !data ? (
              <div className="h-40 animate-pulse rounded-xl bg-white/50" />
            ) : tab === "Launchers" ? (
              <LaunchersTab data={data} />
            ) : tab === "Ticker" ? (
              <TickerTab data={data} />
            ) : (
              <ThemesTab data={data} />
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );
}
