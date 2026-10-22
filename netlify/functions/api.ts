import type { Config } from "@netlify/functions";
import { asc, eq } from "drizzle-orm";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db } from "../../db/index.js";
import { launchers, settings, themes, tickerMessages } from "../../db/schema.js";
import { SEED_LAUNCHERS, SEED_MISSION, SEED_THEMES } from "../../db/seed-data.js";

const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

const json = (data: unknown, status = 200) => Response.json(data, { status });
const error = (message: string, status: number) => json({ error: message }, status);

async function getSetting(key: string) {
  const [row] = await db.select().from(settings).where(eq(settings.key, key));
  return row?.value ?? null;
}

async function setSetting(key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

// Insert the starter content exactly once, the first time the API is used
async function ensureSeeded() {
  const claimed = await db
    .insert(settings)
    .values({ key: "seeded", value: new Date().toISOString() })
    .onConflictDoNothing()
    .returning();
  if (claimed.length === 0) return;

  await db.insert(launchers).values(SEED_LAUNCHERS);
  await db.insert(themes).values(SEED_THEMES.map((t) => ({ ...t, isBuiltIn: true })));
  await db
    .insert(tickerMessages)
    .values(SEED_MISSION.map((content, i) => ({ content, strip: "mission", sortOrder: i })));
}

// ---- Admin password + session tokens ----

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function getSessionSecret() {
  const existing = await getSetting("sessionSecret");
  if (existing) return existing;
  await db
    .insert(settings)
    .values({ key: "sessionSecret", value: randomBytes(32).toString("hex") })
    .onConflictDoNothing();
  return (await getSetting("sessionSecret"))!;
}

async function issueToken() {
  const secret = await getSessionSecret();
  const expires = String(Date.now() + SESSION_TTL_MS);
  const sig = createHmac("sha256", secret).update(expires).digest("hex");
  return `${expires}.${sig}`;
}

async function isAuthorized(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig || Number(expires) < Date.now()) return false;
  const secret = await getSessionSecret();
  const expected = createHmac("sha256", secret).update(expires).digest("hex");
  return sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

function validPassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= 8;
}

// ---- Data ----

async function loadAll(includeInactive: boolean) {
  const [allLaunchers, allThemes, allTicker, activeTheme] = await Promise.all([
    db.select().from(launchers).orderBy(asc(launchers.sortOrder), asc(launchers.id)),
    db.select().from(themes).orderBy(asc(themes.id)),
    db.select().from(tickerMessages).orderBy(asc(tickerMessages.sortOrder), asc(tickerMessages.id)),
    getSetting("activeTheme"),
  ]);
  const visible = <T extends { isActive: boolean }>(rows: T[]) =>
    includeInactive ? rows : rows.filter((r) => r.isActive);
  return {
    launchers: visible(allLaunchers),
    themes: allThemes,
    ticker: visible(allTicker),
    activeTheme: activeTheme ? JSON.parse(activeTheme) : null,
  };
}

const isUrl = (v: unknown) => typeof v === "string" && /^https?:\/\/\S+$/i.test(v);
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

async function handleAdmin(req: Request, parts: string[]) {
  const [resource, idPart] = parts;
  const id = Number(idPart);
  const body = ["POST", "PATCH", "PUT"].includes(req.method)
    ? await req.json().catch(() => ({}))
    : {};

  if (resource === "status" && req.method === "GET") {
    return json({ hasPassword: Boolean(await getSetting("adminPasswordHash")) });
  }

  if (resource === "setup" && req.method === "POST") {
    if (await getSetting("adminPasswordHash")) return error("Admin password already set", 409);
    if (!validPassword(body.password)) return error("Password must be at least 8 characters", 400);
    const claimed = await db
      .insert(settings)
      .values({ key: "adminPasswordHash", value: hashPassword(body.password) })
      .onConflictDoNothing()
      .returning();
    if (claimed.length === 0) return error("Admin password already set", 409);
    return json({ token: await issueToken() });
  }

  if (resource === "login" && req.method === "POST") {
    const stored = await getSetting("adminPasswordHash");
    if (!stored || typeof body.password !== "string" || !verifyPassword(body.password, stored)) {
      return error("Incorrect password", 401);
    }
    return json({ token: await issueToken() });
  }

  if (!(await isAuthorized(req))) return error("Unauthorized", 401);

  if (resource === "data" && req.method === "GET") return json(await loadAll(true));

  if (resource === "password" && req.method === "POST") {
    if (!validPassword(body.password)) return error("Password must be at least 8 characters", 400);
    await setSetting("adminPasswordHash", hashPassword(body.password));
    return json({ ok: true });
  }

  if (resource === "active-theme" && req.method === "PUT") {
    const { name, gradient, accentColor, cardBg } = body;
    await setSetting("activeTheme", JSON.stringify({ name, gradient, accentColor, cardBg }));
    return json({ ok: true });
  }

  if (resource === "launchers") {
    if (req.method === "POST") {
      if (!str(body.name) || !isUrl(body.url) || !str(body.hubId)) {
        return error("Name, a valid http(s) URL and hub are required", 400);
      }
      const [row] = await db
        .insert(launchers)
        .values({
          name: str(body.name),
          url: str(body.url),
          iconEmoji: str(body.iconEmoji) || "🔗",
          hubId: str(body.hubId),
          sortOrder: Number(body.sortOrder) || 999,
        })
        .returning();
      return json(row, 201);
    }
    if (req.method === "PATCH" && id) {
      const patch: Partial<typeof launchers.$inferInsert> = {};
      if (body.name !== undefined) patch.name = str(body.name);
      if (body.url !== undefined) {
        if (!isUrl(body.url)) return error("URL must start with http:// or https://", 400);
        patch.url = str(body.url);
      }
      if (body.iconEmoji !== undefined) patch.iconEmoji = str(body.iconEmoji) || "🔗";
      if (body.hubId !== undefined) patch.hubId = str(body.hubId);
      if (body.isActive !== undefined) patch.isActive = Boolean(body.isActive);
      const [row] = await db.update(launchers).set(patch).where(eq(launchers.id, id)).returning();
      return row ? json(row) : error("Not found", 404);
    }
    if (req.method === "DELETE" && id) {
      await db.delete(launchers).where(eq(launchers.id, id));
      return json({ ok: true });
    }
  }

  if (resource === "themes") {
    if (req.method === "POST") {
      if (!str(body.name) || !str(body.gradient)) return error("Name and gradient are required", 400);
      const [row] = await db
        .insert(themes)
        .values({
          name: str(body.name),
          gradient: str(body.gradient),
          accentColor: str(body.accentColor) || "#1565c0",
          cardBg: str(body.cardBg) || "rgba(255,255,255,0.7)",
        })
        .returning();
      return json(row, 201);
    }
    if (req.method === "DELETE" && id) {
      await db.delete(themes).where(eq(themes.id, id));
      return json({ ok: true });
    }
  }

  if (resource === "ticker") {
    if (req.method === "POST") {
      const strip = body.strip === "info" ? "info" : "mission";
      if (!str(body.content)) return error("Content is required", 400);
      const [row] = await db
        .insert(tickerMessages)
        .values({ content: str(body.content), strip, sortOrder: Number(body.sortOrder) || 999 })
        .returning();
      return json(row, 201);
    }
    if (req.method === "PATCH" && id) {
      const patch: Partial<typeof tickerMessages.$inferInsert> = {};
      if (body.content !== undefined) patch.content = str(body.content);
      if (body.isActive !== undefined) patch.isActive = Boolean(body.isActive);
      const [row] = await db
        .update(tickerMessages)
        .set(patch)
        .where(eq(tickerMessages.id, id))
        .returning();
      return row ? json(row) : error("Not found", 404);
    }
    if (req.method === "DELETE" && id) {
      await db.delete(tickerMessages).where(eq(tickerMessages.id, id));
      return json({ ok: true });
    }
  }

  return error("Not found", 404);
}

export default async (req: Request) => {
  const parts = new URL(req.url).pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  try {
    await ensureSeeded();
    if (parts[0] === "data" && req.method === "GET") return json(await loadAll(false));
    if (parts[0] === "admin") return await handleAdmin(req, parts.slice(1));
    return error("Not found", 404);
  } catch (e) {
    console.error(e);
    return error("Server error", 500);
  }
};

export const config: Config = {
  path: "/api/*",
};
