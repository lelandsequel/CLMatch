export function SiteFooter() {
  return (
    <footer className="border-t border-mist py-10 text-sm text-slate-500">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6">
        <p>© {new Date().getFullYear()} C&L Job Match. Premium sourcing &amp; anti-ghost intelligence.</p>
        <p>Questions? hello@cljobmatch.com</p>
      </div>
    </footer>
  );
}
