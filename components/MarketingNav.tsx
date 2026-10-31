import Link from "next/link";
import { Wordmark } from "@/components/AppShell";
import { ThemeToggle } from "@/components/theme";
export function MarketingNav() {
  return (<header className="fixed top-4 inset-x-0 z-50 px-4"><div className="mx-auto max-w-[1200px] flex items-center justify-between rounded-full border border-ink/10 bg-mkbg/60 backdrop-blur-xl pl-4 md:pl-5 pr-2 h-14 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)]">
    <Link href="/"><Wordmark /></Link>
    <nav className="hidden md:flex items-center gap-1 rounded-full border border-ink/10 px-1.5 py-1 text-sm text-muted">
      {[["#problem", "Story"], ["#how", "How it works"], ["#referee", "Referee"], ["#faq", "FAQ"]].map(([h, l]) => <a key={h} href={h} className="rounded-full px-4 py-1.5 hover:text-ink hover:bg-ink/5 transition-colors">{l}</a>)}</nav>
    <div className="flex items-center gap-1.5 md:gap-3"><span className="hidden lg:inline-flex items-center gap-2 mk-mono text-[10px] text-muted"><span className="w-1.5 h-1.5 rounded-full bg-ok pulse-chip text-ok" />SANDBOX LIVE</span><ThemeToggle className="!w-10 !h-10" />
      <Link href="/pledge/new" className="mk-btn-primary !h-10 !px-4 md:!px-5 text-sm"><span className="sm:hidden">Open app</span><span className="hidden sm:inline">Open the app</span></Link></div>
  </div></header>);
}
