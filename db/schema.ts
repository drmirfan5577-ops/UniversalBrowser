import { boolean, integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const launchers = pgTable("launchers", {
  id: serial().primaryKey(),
  name: text().notNull(),
  url: text().notNull(),
  iconEmoji: text("icon_emoji").notNull(),
  hubId: text("hub_id").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const themes = pgTable("themes", {
  id: serial().primaryKey(),
  name: text().notNull(),
  gradient: text().notNull(),
  accentColor: text("accent_color").notNull(),
  cardBg: text("card_bg").notNull(),
  isBuiltIn: boolean("is_built_in").notNull().default(false),
});

export const settings = pgTable("settings", {
  key: text().primaryKey(),
  value: text().notNull(),
});

// Admin-controlled ticker/narrative messages
export const tickerMessages = pgTable("ticker_messages", {
  id: serial().primaryKey(),
  content: text().notNull(),
  strip: text().notNull(), // "info" | "mission"
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});
