import Link from "next/link";
import { ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";
import { AuthProvider } from "./auth/AuthProvider";
import { UserNav } from "./auth/UserNav";

interface AppShellProps {
  children: ReactNode;
  heroMode?: boolean;
}

export function AppShell({ children, heroMode = false }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background - either Icarus hero or standard warm gradient */}
      {heroMode ? (
        <>
          {/* Icarus hero background */}
          <div 
            className="fixed inset-0 bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/images/icarus-hero.png')" }}
          />
          {/* Gradient overlay for readability */}
          <div className="fixed inset-0 bg-gradient-to-b from-[#2a1f3d]/30 via-[#2a1f3d]/10 to-[#2a1f3d]/60" />
        </>
      ) : (
        <>
          {/* Standard warm gradient background */}
          <div className="fixed inset-0 bg-gradient-to-br from-parchment via-cream to-parchment-warm dark:from-navy-deep dark:via-navy dark:to-ink" />
          
          {/* Decorative light beams - Rembrandt-style chiaroscuro */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {/* Top-left golden light */}
            <div className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-gradient-radial from-gold/8 via-gold/3 to-transparent rounded-full blur-3xl" />
            {/* Bottom-right warm glow */}
            <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-radial from-amber/6 via-amber/2 to-transparent rounded-full blur-3xl" />
            {/* Center subtle warmth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-gradient-radial from-cream/40 via-transparent to-transparent rounded-full blur-3xl dark:from-gold/5" />
          </div>
        </>
      )}
      
      {/* Subtle texture overlay */}
      <div 
        className="fixed inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />
      
      {/* Vignette effect */}
      <div className="fixed inset-0 bg-gradient-radial from-transparent via-transparent to-ink/5 pointer-events-none dark:to-ink/30" />
      
      {/* Content wrapper */}
      <div className="relative z-10">
        <header className={`relative border-b backdrop-blur-md ${
          heroMode 
            ? "border-white/10 bg-[#2a1f3d]/40" 
            : "border-gold/10 bg-cream/60 dark:bg-navy/60 dark:border-gold/5"
        }`}>
          {/* Header glow line */}
          <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${
            heroMode ? "via-[#c9a227]/40" : "via-gold/30"
          } to-transparent`} />
          
          <div className="container flex flex-wrap items-center justify-between gap-4 py-6">
            <Link href="/" className="group flex items-center gap-3">
              {/* Logo with premium styling */}
              <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl shadow-button group-hover:shadow-glow transition-all duration-300 ${
                heroMode 
                  ? "bg-gradient-to-br from-[#c9a227] to-[#d4a84b] text-[#1a1425]"
                  : "bg-gradient-to-br from-ink to-ink-soft text-cream"
              }`}>
                <span className="text-lg font-bold tracking-tight">C</span>
                {/* Subtle shine effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div>
                <p className={`text-[10px] uppercase tracking-[0.3em] font-medium ${
                  heroMode ? "text-[#e8c36d]" : "text-gold"
                }`}>C&amp;L Job Match</p>
                <p className={`text-lg font-semibold tracking-tight ${
                  heroMode ? "text-white" : "text-ink dark:text-cream"
                }`}>Offer Farming Report</p>
              </div>
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link 
                href="/pricing" 
                className={`relative font-medium group transition-colors duration-200 ${
                  heroMode 
                    ? "text-white/80 hover:text-white" 
                    : "text-ink-soft hover:text-ink dark:text-parchment-dark dark:hover:text-cream"
                }`}
              >
                Pricing
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                  heroMode ? "bg-[#c9a227]" : "bg-gold"
                }`} />
              </Link>
              <ThemeToggle />
              <AuthProvider>
                <UserNav />
              </AuthProvider>
            </nav>
          </div>
        </header>
        
        <main className="relative">
          {children}
        </main>
        
        <footer className={`relative border-t py-12 backdrop-blur-md ${
          heroMode
            ? "border-white/10 bg-[#2a1f3d]/80"
            : "border-gold/10 bg-parchment-warm/60 dark:bg-navy-deep/60 dark:border-gold/5"
        }`}>
          {/* Footer glow line */}
          <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${
            heroMode ? "via-[#c9a227]/30" : "via-gold/20"
          } to-transparent`} />
          
          <div className="container">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-2">
                <p className={`text-sm font-medium ${
                  heroMode ? "text-white" : "text-ink dark:text-cream"
                }`}>
                  © {new Date().getFullYear()} C&L Job Match
                </p>
                <p className={`text-xs ${
                  heroMode ? "text-white/50" : "text-ink-soft/70 dark:text-parchment-dark/50"
                }`}>
                  Premium sourcing, anti-ghost intelligence.
                </p>
              </div>
              <div className="flex gap-6 text-sm">
                <Link 
                  href="/pricing" 
                  className={`transition-colors duration-200 ${
                    heroMode ? "text-white/60 hover:text-[#e8c36d]" : "text-ink-soft hover:text-gold"
                  }`}
                >
                  Pricing
                </Link>
                <a 
                  href="mailto:hello@cljobmatch.com" 
                  className={`transition-colors duration-200 ${
                    heroMode ? "text-white/60 hover:text-[#e8c36d]" : "text-ink-soft hover:text-gold"
                  }`}
                >
                  hello@cljobmatch.com
                </a>
              </div>
            </div>
            
            {/* Decorative brush stroke */}
            <div className={`mt-8 h-px bg-gradient-to-r from-transparent ${
              heroMode ? "via-[#c9a227]/20" : "via-gold/20"
            } to-transparent`} />
          </div>
        </footer>
      </div>
    </div>
  );
}
