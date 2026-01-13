import Link from "next/link";
import { Button } from "./ui/button";

export function SiteHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-midnight text-white">C</div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">C&amp;L Job Match</p>
          <p className="text-lg font-semibold">Offer Farming Report</p>
        </div>
      </div>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/pricing" className="text-slate-600 hover:text-ink">
          Pricing
        </Link>
        <Link href="/login" className="text-slate-600 hover:text-ink">
          Client Login
        </Link>
        <Link href="/pricing">
          <Button variant="primary">Get Started</Button>
        </Link>
      </nav>
    </header>
  );
}
