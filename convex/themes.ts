import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("themes").collect();
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("themes").take(1);
    if (existing.length > 0) return;

    const builtIn = [
      { name: "Pearl Glow", gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ffecd2 100%)", accentColor: "#fcb69f", cardBg: "rgba(255,236,210,0.7)" },
      { name: "Rose Crystal", gradient: "linear-gradient(135deg, #ffdde1 0%, #ee9ca7 100%)", accentColor: "#ee9ca7", cardBg: "rgba(255,221,225,0.7)" },
      { name: "Aurora White", gradient: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 50%, #e8f5e9 100%)", accentColor: "#4dd0e1", cardBg: "rgba(224,247,250,0.7)" },
      { name: "Golden Dawn", gradient: "linear-gradient(135deg, #fff9c4 0%, #ffecb3 50%, #ffe082 100%)", accentColor: "#ffb300", cardBg: "rgba(255,249,196,0.7)" },
      { name: "Crimson Glass", gradient: "linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%)", accentColor: "#e53935", cardBg: "rgba(255,205,210,0.7)" },
      { name: "Snow LED", gradient: "linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 50%, #f8f9fa 100%)", accentColor: "#1565c0", cardBg: "rgba(248,249,250,0.8)" },
      { name: "Ruby Light", gradient: "linear-gradient(135deg, #fff3e0 0%, #ffccbc 50%, #ff8a65 100%)", accentColor: "#f4511e", cardBg: "rgba(255,243,224,0.7)" },
      { name: "Silk White", gradient: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)", accentColor: "#9e9e9e", cardBg: "rgba(250,250,250,0.8)" },
      { name: "Glass Radiance", gradient: "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 50%, #9fa8da 100%)", accentColor: "#3949ab", cardBg: "rgba(232,234,246,0.7)" },
      { name: "Sunrise Glow", gradient: "linear-gradient(135deg, #fff3e0 0%, #ffb74d 50%, #ff7043 100%)", accentColor: "#e64a19", cardBg: "rgba(255,243,224,0.7)" },
      { name: "Diamond White", gradient: "linear-gradient(135deg, #eceff1 0%, #cfd8dc 50%, #b0bec5 100%)", accentColor: "#455a64", cardBg: "rgba(236,239,241,0.75)" },
      { name: "Celestial White", gradient: "linear-gradient(135deg, #ede7f6 0%, #d1c4e9 50%, #b39ddb 100%)", accentColor: "#6200ea", cardBg: "rgba(237,231,246,0.7)" },
      { name: "Blossom", gradient: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%)", accentColor: "#e91e63", cardBg: "rgba(252,228,236,0.7)" },
      { name: "Mint Glass", gradient: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)", accentColor: "#2e7d32", cardBg: "rgba(232,245,233,0.7)" },
      { name: "Ice Crystal", gradient: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)", accentColor: "#1565c0", cardBg: "rgba(227,242,253,0.7)" },
      { name: "Ivory Glow", gradient: "linear-gradient(135deg, #fffff0 0%, #fafad2 50%, #fffacd 100%)", accentColor: "#c8a400", cardBg: "rgba(255,255,240,0.8)" },
      { name: "Solar Burst", gradient: "linear-gradient(135deg, #fffde7 0%, #fff176 50%, #ffee58 100%)", accentColor: "#f9a825", cardBg: "rgba(255,253,231,0.7)" },
      { name: "Opal Dream", gradient: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 50%, #ce93d8 100%)", accentColor: "#8e24aa", cardBg: "rgba(243,229,245,0.7)" },
      { name: "Ocean Mist", gradient: "linear-gradient(135deg, #e0f4ff 0%, #b3e5fc 50%, #81d4fa 100%)", accentColor: "#0277bd", cardBg: "rgba(224,244,255,0.7)" },
      { name: "Blue Cyber", gradient: "linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 40%, #0d2137 100%)", accentColor: "#00d4ff", cardBg: "rgba(10,20,60,0.75)" },
    ];

    for (const t of builtIn) {
      await ctx.db.insert("themes", { ...t, isBuiltIn: true });
    }
  },
});

export const createCustom = mutation({
  args: {
    name: v.string(),
    gradient: v.string(),
    accentColor: v.string(),
    cardBg: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("themes", { ...args, isBuiltIn: false });
  },
});

export const remove = mutation({
  args: { id: v.id("themes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
