import { cn } from "@/lib/utils.ts";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
};

export default function GlassCard({ children, className, onClick, hover = true }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass rounded-2xl overflow-hidden",
        hover && onClick && "cursor-pointer transition-all duration-200 active:scale-95",
        className
      )}
    >
      {children}
    </div>
  );
}
