import Link from "next/link";
import { ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";
import { AuthProvider } from "./auth/AuthProvider";
import { UserNav } from "./auth/UserNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cloud via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <header className="border-b border-mist/70 dark:border-slate-800">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-midnight text-white">C</div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">C&amp;L Job Match</p>
              <p className="text-lg font-semibold">Offer Farming Report</p>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/pricing" className="text-slate-600 hover:text-ink dark:text-slate-300">
              Pricing
            </Link>
            <ThemeToggle />
            <AuthProvider>
              <UserNav />
            </AuthProvider>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-mist/70 py-10 text-sm text-slate-500 dark:border-slate-800">
        <div className="container flex flex-wrap items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} C&L Job Match. Premium sourcing, anti-ghost intelligence.</p>
          <div className="flex gap-4">
            <Link href="/pricing">Pricing</Link>
            <a href="mailto:hello@cljobmatch.com">hello@cljobmatch.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
