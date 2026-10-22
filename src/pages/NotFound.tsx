import { Link } from "react-router-dom";
import GlassCard from "@/components/glass-card.tsx";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <GlassCard className="max-w-sm p-8 text-center" hover={false}>
        <div className="text-5xl">🧭</div>
        <h1 className="mt-3 text-xl font-bold">Page not found</h1>
        <p className="mt-1 text-sm text-slate-600">This page doesn't exist.</p>
        <Link
          to="/"
          className="mt-5 inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          Go to UniversalBrowser
        </Link>
      </GlassCard>
    </div>
  );
}
