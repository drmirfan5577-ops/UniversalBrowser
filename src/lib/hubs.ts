// Hub definitions — single source of truth
export type Hub = {
  id: string;
  label: string;
  emoji: string;
  color: string;
  bg: string;
  description: string;
};

export const HUBS: Hub[] = [
  { id: "ai",       label: "AI Hub",      emoji: "🤖", color: "#7c3aed", bg: "linear-gradient(135deg,#7c3aed22,#7c3aed44)", description: "Artificial Intelligence tools" },
  { id: "social",   label: "Social Hub",  emoji: "💬", color: "#0ea5e9", bg: "linear-gradient(135deg,#0ea5e922,#0ea5e944)", description: "Social media & messaging" },
  { id: "news",     label: "News Hub",    emoji: "📰", color: "#ef4444", bg: "linear-gradient(135deg,#ef444422,#ef444444)", description: "News & current events" },
  { id: "islamic",  label: "I Hub",       emoji: "☪️", color: "#16a34a", bg: "linear-gradient(135deg,#16a34a22,#16a34a44)", description: "Islamic resources" },
  { id: "es",       label: "ES Hub",      emoji: "🎓", color: "#f59e0b", bg: "linear-gradient(135deg,#f59e0b22,#f59e0b44)", description: "Education & science" },
  { id: "general",  label: "General Hub", emoji: "🌐", color: "#64748b", bg: "linear-gradient(135deg,#64748b22,#64748b44)", description: "General tools & utilities" },
];
