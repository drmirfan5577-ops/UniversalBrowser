import type { TickerMessage } from "@/lib/api.ts";

type TickerProps = {
  messages: TickerMessage[];
  accent: string;
  label: string;
};

export default function Ticker({ messages, accent, label }: TickerProps) {
  if (messages.length === 0) return null;
  const text = messages.map((m) => m.content);
  // Duplicate the run so the loop is seamless
  const items = [...text, ...text];
  const duration = Math.max(30, text.join(" ").length / 4);

  return (
    <div
      className="relative flex items-center overflow-hidden rounded-xl text-sm text-white shadow-md"
      style={{ background: accent }}
      aria-label={label}
    >
      <span className="z-10 shrink-0 bg-black/25 px-3 py-2 text-xs font-bold uppercase tracking-wider">
        {label}
      </span>
      <div className="ticker-mask flex-1 overflow-hidden py-2">
        <div className="ticker-track" style={{ animationDuration: `${duration}s` }}>
          {items.map((t, i) => (
            <span key={i} className="px-8 whitespace-nowrap" aria-hidden={i >= text.length}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
