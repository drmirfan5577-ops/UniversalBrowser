// Client for the /api function backed by Netlify Database
export type Launcher = {
  id: number;
  name: string;
  url: string;
  iconEmoji: string;
  hubId: string;
  sortOrder: number;
  isActive: boolean;
};

export type ThemeConfig = {
  name: string;
  gradient: string;
  accentColor: string;
  cardBg: string;
};

export type Theme = ThemeConfig & { id: number; isBuiltIn: boolean };

export type TickerMessage = {
  id: number;
  content: string;
  strip: "info" | "mission";
  isActive: boolean;
  sortOrder: number;
};

export type SiteData = {
  launchers: Launcher[];
  themes: Theme[];
  ticker: TickerMessage[];
  activeTheme: ThemeConfig | null;
};

const TOKEN_KEY = "adminToken";

export const adminToken = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (t: string) => sessionStorage.setItem(TOKEN_KEY, t),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init: Omit<RequestInit, "body"> & { body?: unknown } = {}): Promise<T> {
  const token = adminToken.get();
  const res = await fetch(`/api/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? "Request failed", res.status);
  return data as T;
}
