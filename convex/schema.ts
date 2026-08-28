import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  launchers: defineTable({
    name: v.string(),
    url: v.string(),
    iconEmoji: v.string(),
    hubId: v.optional(v.string()),
    category: v.optional(v.string()),
    sortOrder: v.number(),
    isActive: v.boolean(),
    faviconUrl: v.optional(v.string()),
  })
    .index("by_hub", ["hubId"])
    .index("by_sort", ["sortOrder"]),

  themes: defineTable({
    name: v.string(),
    gradient: v.string(),
    accentColor: v.string(),
    cardBg: v.string(),
    isBuiltIn: v.boolean(),
  }),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  adminPassword: defineTable({
    hash: v.string(),
  }),

  // Admin-controlled ticker/narrative messages
  tickerMessages: defineTable({
    content: v.string(),
    strip: v.union(v.literal("info"), v.literal("mission")),
    isActive: v.boolean(),
    sortOrder: v.number(),
  }).index("by_strip", ["strip"]),
});
