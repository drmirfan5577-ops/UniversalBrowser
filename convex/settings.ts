import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const s = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    return s?.value ?? null;
  },
});

export const set = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
    } else {
      await ctx.db.insert("settings", { key: args.key, value: args.value });
    }
  },
});

export const checkAdminPassword = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db.query("adminPassword").first();
    if (!record) {
      return args.password === "admin1234";
    }
    return record.hash === args.password;
  },
});

export const setAdminPassword = mutation({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("adminPassword").first();
    if (existing) {
      await ctx.db.patch(existing._id, { hash: args.password });
    } else {
      await ctx.db.insert("adminPassword", { hash: args.password });
    }
  },
});
