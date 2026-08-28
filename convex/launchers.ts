import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { hubId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("launchers").order("asc").collect();
    if (args.hubId) {
      return all.filter((l) => (l.hubId ?? l.category) === args.hubId);
    }
    return all;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    url: v.string(),
    iconEmoji: v.string(),
    hubId: v.string(),
    sortOrder: v.number(),
    faviconUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("launchers", { ...args, isActive: true });
  },
});
export const update = mutation({
  args: {
    id: v.id("launchers"),
    name: v.optional(v.string()),
    url: v.optional(v.string()),
    iconEmoji: v.optional(v.string()),
    hubId: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id("launchers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const allDocs = await ctx.db.query("launchers").collect();
    const withHubId = allDocs.filter((l) => l.hubId !== undefined && l.hubId !== null);
    if (withHubId.length >= 50) return;

    for (const doc of allDocs) {
      await ctx.db.delete(doc._id);
    }

    const items: Array<{ name: string; url: string; iconEmoji: string; hubId: string; sortOrder: number }> = [
      // AI Hub
      { name: "ChatGPT", url: "https://chat.openai.com", iconEmoji: "🧠", hubId: "ai", sortOrder: 1 },
      { name: "Google Gemini", url: "https://gemini.google.com", iconEmoji: "✨", hubId: "ai", sortOrder: 2 },
      { name: "Claude AI", url: "https://claude.ai", iconEmoji: "🤖", hubId: "ai", sortOrder: 3 },
      { name: "Perplexity", url: "https://perplexity.ai", iconEmoji: "🔮", hubId: "ai", sortOrder: 4 },
      { name: "AI Studio", url: "https://aistudio.google.com", iconEmoji: "🧪", hubId: "ai", sortOrder: 5 },
      { name: "Hugging Face", url: "https://huggingface.co", iconEmoji: "🤗", hubId: "ai", sortOrder: 6 },
      { name: "Mistral AI", url: "https://mistral.ai", iconEmoji: "💡", hubId: "ai", sortOrder: 7 },
      { name: "DeepSeek", url: "https://chat.deepseek.com", iconEmoji: "🔍", hubId: "ai", sortOrder: 8 },
      { name: "Grok", url: "https://grok.com", iconEmoji: "⚡", hubId: "ai", sortOrder: 9 },
      { name: "Cohere", url: "https://coral.cohere.com", iconEmoji: "🌊", hubId: "ai", sortOrder: 10 },
      { name: "Poe", url: "https://poe.com", iconEmoji: "📡", hubId: "ai", sortOrder: 11 },
      { name: "Copilot", url: "https://copilot.microsoft.com", iconEmoji: "🪁", hubId: "ai", sortOrder: 12 },
      { name: "Canva AI", url: "https://canva.com/ai-image-generator", iconEmoji: "🎨", hubId: "ai", sortOrder: 13 },
      { name: "Midjourney", url: "https://www.midjourney.com", iconEmoji: "🖼️", hubId: "ai", sortOrder: 14 },
      { name: "Runway ML", url: "https://runwayml.com", iconEmoji: "🎬", hubId: "ai", sortOrder: 15 },
      { name: "ElevenLabs", url: "https://elevenlabs.io", iconEmoji: "🔊", hubId: "ai", sortOrder: 16 },
      { name: "Suno AI", url: "https://suno.com", iconEmoji: "🎵", hubId: "ai", sortOrder: 17 },
      { name: "Udio", url: "https://udio.com", iconEmoji: "🎶", hubId: "ai", sortOrder: 18 },
      { name: "LM Studio", url: "https://lmstudio.ai", iconEmoji: "💻", hubId: "ai", sortOrder: 19 },
      { name: "Together AI", url: "https://together.ai", iconEmoji: "🤝", hubId: "ai", sortOrder: 20 },
      // Social Hub
      { name: "WhatsApp Web", url: "https://web.whatsapp.com", iconEmoji: "💬", hubId: "social", sortOrder: 21 },
      { name: "YouTube", url: "https://youtube.com", iconEmoji: "▶️", hubId: "social", sortOrder: 22 },
      { name: "Facebook", url: "https://facebook.com", iconEmoji: "👥", hubId: "social", sortOrder: 23 },
      { name: "Instagram", url: "https://instagram.com", iconEmoji: "📸", hubId: "social", sortOrder: 24 },
      { name: "Twitter / X", url: "https://x.com", iconEmoji: "🐦", hubId: "social", sortOrder: 25 },
      { name: "LinkedIn", url: "https://linkedin.com", iconEmoji: "💼", hubId: "social", sortOrder: 26 },
      { name: "TikTok", url: "https://tiktok.com", iconEmoji: "🎵", hubId: "social", sortOrder: 27 },
      { name: "Reddit", url: "https://reddit.com", iconEmoji: "🤠", hubId: "social", sortOrder: 28 },
      { name: "Pinterest", url: "https://pinterest.com", iconEmoji: "📌", hubId: "social", sortOrder: 29 },
      { name: "Snapchat Web", url: "https://snapchat.com", iconEmoji: "👻", hubId: "social", sortOrder: 30 },
      { name: "Telegram Web", url: "https://web.telegram.org", iconEmoji: "✈️", hubId: "social", sortOrder: 31 },
      { name: "Discord", url: "https://discord.com/app", iconEmoji: "🎮", hubId: "social", sortOrder: 32 },
      { name: "Gmail", url: "https://gmail.com", iconEmoji: "📧", hubId: "social", sortOrder: 33 },
      { name: "Google Meet", url: "https://meet.google.com", iconEmoji: "📹", hubId: "social", sortOrder: 34 },
      { name: "Zoom", url: "https://zoom.us", iconEmoji: "🎥", hubId: "social", sortOrder: 35 },
      { name: "Medium", url: "https://medium.com", iconEmoji: "✍️", hubId: "social", sortOrder: 36 },
      { name: "Quora", url: "https://quora.com", iconEmoji: "❓", hubId: "social", sortOrder: 37 },
      { name: "Tumblr", url: "https://tumblr.com", iconEmoji: "📝", hubId: "social", sortOrder: 38 },
      { name: "Flickr", url: "https://flickr.com", iconEmoji: "🌅", hubId: "social", sortOrder: 39 },
      { name: "Mastodon", url: "https://mastodon.social", iconEmoji: "🦣", hubId: "social", sortOrder: 40 },
      // News Hub
      { name: "BBC News", url: "https://bbc.com/news", iconEmoji: "📰", hubId: "news", sortOrder: 41 },
      { name: "Google News", url: "https://news.google.com", iconEmoji: "🗞️", hubId: "news", sortOrder: 42 },
      { name: "Al Jazeera", url: "https://aljazeera.com", iconEmoji: "📡", hubId: "news", sortOrder: 43 },
      { name: "Reuters", url: "https://reuters.com", iconEmoji: "📊", hubId: "news", sortOrder: 44 },
      { name: "CNN", url: "https://cnn.com", iconEmoji: "🌍", hubId: "news", sortOrder: 45 },
      { name: "The Guardian", url: "https://theguardian.com", iconEmoji: "🛡️", hubId: "news", sortOrder: 46 },
      { name: "Sky News", url: "https://news.sky.com", iconEmoji: "🌤️", hubId: "news", sortOrder: 47 },
      { name: "AP News", url: "https://apnews.com", iconEmoji: "📢", hubId: "news", sortOrder: 48 },
      { name: "NPR", url: "https://npr.org", iconEmoji: "📻", hubId: "news", sortOrder: 49 },
      { name: "Deutsche Welle", url: "https://dw.com", iconEmoji: "🇩🇪", hubId: "news", sortOrder: 50 },
      { name: "France 24", url: "https://france24.com", iconEmoji: "🇫🇷", hubId: "news", sortOrder: 51 },
      { name: "TRT World", url: "https://trtworld.com", iconEmoji: "🌐", hubId: "news", sortOrder: 52 },
      { name: "Dawn News", url: "https://dawn.com", iconEmoji: "🌅", hubId: "news", sortOrder: 53 },
      { name: "Geo News", url: "https://geo.tv", iconEmoji: "📺", hubId: "news", sortOrder: 54 },
      { name: "ARY News", url: "https://arynews.tv", iconEmoji: "🔴", hubId: "news", sortOrder: 55 },
      { name: "Samaa TV", url: "https://samaa.tv", iconEmoji: "📡", hubId: "news", sortOrder: 56 },
      { name: "Independent", url: "https://independent.co.uk", iconEmoji: "📄", hubId: "news", sortOrder: 57 },
      { name: "Bloomberg", url: "https://bloomberg.com", iconEmoji: "💹", hubId: "news", sortOrder: 58 },
      { name: "CNBC", url: "https://cnbc.com", iconEmoji: "📈", hubId: "news", sortOrder: 59 },
      { name: "Hacker News", url: "https://news.ycombinator.com", iconEmoji: "💻", hubId: "news", sortOrder: 60 },
      // Islamic Hub
      { name: "Quran.com", url: "https://quran.com", iconEmoji: "📖", hubId: "islamic", sortOrder: 61 },
      { name: "Sunnah.com", url: "https://sunnah.com", iconEmoji: "☪️", hubId: "islamic", sortOrder: 62 },
      { name: "IslamQA", url: "https://islamqa.info/en", iconEmoji: "🕌", hubId: "islamic", sortOrder: 63 },
      { name: "Quran Radio", url: "https://quranicaudio.com", iconEmoji: "🎙️", hubId: "islamic", sortOrder: 64 },
      { name: "Muslim Pro", url: "https://muslimpro.com", iconEmoji: "🌙", hubId: "islamic", sortOrder: 65 },
      { name: "Islam21c", url: "https://islam21c.com", iconEmoji: "✨", hubId: "islamic", sortOrder: 66 },
      { name: "Seekers Guidance", url: "https://seekersguidance.org", iconEmoji: "🔎", hubId: "islamic", sortOrder: 67 },
      { name: "Dar al-Ifta", url: "https://daralifta.org.eg", iconEmoji: "📜", hubId: "islamic", sortOrder: 68 },
      { name: "Al-Mawrid", url: "https://al-mawrid.org", iconEmoji: "📚", hubId: "islamic", sortOrder: 69 },
      { name: "Tanzil Quran", url: "https://tanzil.net", iconEmoji: "🌟", hubId: "islamic", sortOrder: 70 },
      { name: "Duas.org", url: "https://duas.org", iconEmoji: "🙏", hubId: "islamic", sortOrder: 71 },
      { name: "IslamiCity", url: "https://islamicity.org", iconEmoji: "🏙️", hubId: "islamic", sortOrder: 72 },
      { name: "Halal Trip", url: "https://halaltrip.com", iconEmoji: "✈️", hubId: "islamic", sortOrder: 73 },
      { name: "Ahadith.co.uk", url: "https://ahadith.co.uk", iconEmoji: "📕", hubId: "islamic", sortOrder: 74 },
      { name: "OnePath Net", url: "https://onepath.net.au", iconEmoji: "🛤️", hubId: "islamic", sortOrder: 75 },
      { name: "5Pillars", url: "https://5pillarsuk.com", iconEmoji: "🕍", hubId: "islamic", sortOrder: 76 },
      { name: "IlmFeed", url: "https://ilmfeed.com", iconEmoji: "💡", hubId: "islamic", sortOrder: 77 },
      { name: "Muslim Matters", url: "https://muslimmatters.org", iconEmoji: "💬", hubId: "islamic", sortOrder: 78 },
      { name: "Productive Muslim", url: "https://productivemuslim.com", iconEmoji: "⏰", hubId: "islamic", sortOrder: 79 },
      { name: "AboutIslam", url: "https://aboutislam.net", iconEmoji: "ℹ️", hubId: "islamic", sortOrder: 80 },
      // ES Hub
      { name: "Khan Academy", url: "https://khanacademy.org", iconEmoji: "🎓", hubId: "es", sortOrder: 81 },
      { name: "Coursera", url: "https://coursera.org", iconEmoji: "📓", hubId: "es", sortOrder: 82 },
      { name: "edX", url: "https://edx.org", iconEmoji: "🏫", hubId: "es", sortOrder: 83 },
      { name: "Wikipedia", url: "https://wikipedia.org", iconEmoji: "📚", hubId: "es", sortOrder: 84 },
      { name: "arXiv", url: "https://arxiv.org", iconEmoji: "🔬", hubId: "es", sortOrder: 85 },
      { name: "Nature", url: "https://nature.com", iconEmoji: "🌿", hubId: "es", sortOrder: 86 },
      { name: "Science Daily", url: "https://sciencedaily.com", iconEmoji: "⚗️", hubId: "es", sortOrder: 87 },
      { name: "NASA", url: "https://nasa.gov", iconEmoji: "🚀", hubId: "es", sortOrder: 88 },
      { name: "National Geo", url: "https://nationalgeographic.com", iconEmoji: "🌍", hubId: "es", sortOrder: 89 },
      { name: "MIT OpenCourse", url: "https://ocw.mit.edu", iconEmoji: "🏛️", hubId: "es", sortOrder: 90 },
      { name: "TED Talks", url: "https://ted.com", iconEmoji: "🎤", hubId: "es", sortOrder: 91 },
      { name: "Duolingo", url: "https://duolingo.com", iconEmoji: "🦉", hubId: "es", sortOrder: 92 },
      { name: "Wolfram Alpha", url: "https://wolframalpha.com", iconEmoji: "🧮", hubId: "es", sortOrder: 93 },
      { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov", iconEmoji: "🧬", hubId: "es", sortOrder: 94 },
      { name: "Google Scholar", url: "https://scholar.google.com", iconEmoji: "🔭", hubId: "es", sortOrder: 95 },
      { name: "Britannica", url: "https://britannica.com", iconEmoji: "📘", hubId: "es", sortOrder: 96 },
      { name: "Udemy", url: "https://udemy.com", iconEmoji: "💡", hubId: "es", sortOrder: 97 },
      { name: "Skillshare", url: "https://skillshare.com", iconEmoji: "✏️", hubId: "es", sortOrder: 98 },
      { name: "FutureLearn", url: "https://futurelearn.com", iconEmoji: "🌱", hubId: "es", sortOrder: 99 },
      { name: "Brilliant", url: "https://brilliant.org", iconEmoji: "💎", hubId: "es", sortOrder: 100 },
      // General Hub
      { name: "Google", url: "https://google.com", iconEmoji: "🔍", hubId: "general", sortOrder: 101 },
      { name: "GitHub", url: "https://github.com", iconEmoji: "💻", hubId: "general", sortOrder: 102 },
      { name: "Stack Overflow", url: "https://stackoverflow.com", iconEmoji: "🗂️", hubId: "general", sortOrder: 103 },
      { name: "Amazon", url: "https://amazon.com", iconEmoji: "🛒", hubId: "general", sortOrder: 104 },
      { name: "Canva", url: "https://canva.com", iconEmoji: "🎨", hubId: "general", sortOrder: 105 },
      { name: "Google Drive", url: "https://drive.google.com", iconEmoji: "☁️", hubId: "general", sortOrder: 106 },
      { name: "Google Docs", url: "https://docs.google.com", iconEmoji: "📄", hubId: "general", sortOrder: 107 },
      { name: "Google Sheets", url: "https://sheets.google.com", iconEmoji: "📊", hubId: "general", sortOrder: 108 },
      { name: "Notion", url: "https://notion.so", iconEmoji: "📓", hubId: "general", sortOrder: 109 },
      { name: "Trello", url: "https://trello.com", iconEmoji: "📋", hubId: "general", sortOrder: 110 },
      { name: "Figma", url: "https://figma.com", iconEmoji: "🖌️", hubId: "general", sortOrder: 111 },
      { name: "Dropbox", url: "https://dropbox.com", iconEmoji: "📦", hubId: "general", sortOrder: 112 },
      { name: "Outlook", url: "https://outlook.live.com", iconEmoji: "📮", hubId: "general", sortOrder: 113 },
      { name: "OneDrive", url: "https://onedrive.live.com", iconEmoji: "🌩️", hubId: "general", sortOrder: 114 },
      { name: "Translate", url: "https://translate.google.com", iconEmoji: "🌐", hubId: "general", sortOrder: 115 },
      { name: "Maps", url: "https://maps.google.com", iconEmoji: "🗺️", hubId: "general", sortOrder: 116 },
      { name: "Weather", url: "https://weather.com", iconEmoji: "🌦️", hubId: "general", sortOrder: 117 },
      { name: "Bing", url: "https://bing.com", iconEmoji: "🔎", hubId: "general", sortOrder: 118 },
      { name: "DuckDuckGo", url: "https://duckduckgo.com", iconEmoji: "🦆", hubId: "general", sortOrder: 119 },
      { name: "Archive.org", url: "https://archive.org", iconEmoji: "🏛️", hubId: "general", sortOrder: 120 },
    ];

    for (const item of items) {
      await ctx.db.insert("launchers", { ...item, isActive: true });
    }
  },
});
