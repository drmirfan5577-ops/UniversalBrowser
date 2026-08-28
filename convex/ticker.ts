import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByStrip = query({
  args: { strip: v.union(v.literal("info"), v.literal("mission")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tickerMessages")
      .withIndex("by_strip", (q) => q.eq("strip", args.strip))
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tickerMessages").order("asc").collect();
  },
});

export const create = mutation({
  args: {
    content: v.string(),
    strip: v.union(v.literal("info"), v.literal("mission")),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tickerMessages", { ...args, isActive: true });
  },
});

export const update = mutation({
  args: {
    id: v.id("tickerMessages"),
    content: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("tickerMessages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("tickerMessages").take(1);
    if (existing.length > 0) return;

    const missionItems = [
      "✦ E.S OneWorld · A Global Family Platform Vision by Dr M Irfan Qadir Thaheem",
      "⚡ Truth through the Lens · Both eyes on what's really going on",
      "🔍 Realities and Facts at your doorstep — Dark Realities, Hidden Facts, Deeper Insights",
      "⚖️ A Fight against Injustice and Double Standards · with the Help of Allah Almighty In-sha-Allah",
      "🌍 E.S OneWorld · Dark Realities, Hidden Facts, Deeper Insights — within your access In-sha-Allah Azza-wa-Jall",
      "🕌 بِسْمِ اللّٰهِ · Truth, Justice, and Knowledge for the Global Family · E.S OneWorld",
    ];

    for (let i = 0; i < missionItems.length; i++) {
      await ctx.db.insert("tickerMessages", {
        content: missionItems[i],
        strip: "mission",
        isActive: true,
        sortOrder: i,
      });
    }
  },
});
