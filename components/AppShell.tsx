"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Plus, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle, useTheme } from "@/components/theme";
export function Wordmark() {
  const { theme } = useTheme();
  const mark = theme === "light" ? "/logo-mark.png" : "/logo-mark-white.png";
  return (
    <span className="flex items-center gap-2.5 font-semibold tracking-[-0.03em] text-lg">
      <img
        src={mark}
        alt=""
        width={32}
        height={32}
        className="w-8 h-8 object-contain"
      />
      <span className="inline-flex items-baseline tracking-[-0.04em]">
        <span>Commit</span>
        <span className="font-serif italic font-normal text-brand -ml-[0.12em] tracking-[-0.02em] text-[1.15em] leading-none">Pay</span>
      </span>
    </span>
  );
}
const NAV = [
  { section: "Overview", items: [{ href: "/", label: "Landing", icon: <Home size={16} /> }, { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> }] },
  { section: "Pledges", items: [{ href: "/pledge/new", label: "Create pledge", icon: <Plus size={16} /> }] },
  { section: "Learn", items: [{ href: "/#how", label: "How it works", icon: <HelpCircle size={16} /> }] },
];
const crumb = (p: string) => p === "/" ? ["Overview", "Home"] : p.startsWith("/dashboard") ? ["Overview", "Dashboard"]
  : p === "/pledge/new" ? ["Pledges", "Create pledge"] : p.includes("/proof") ? ["Pledges", "Submit proof"]
  : p.includes("/escape") ? ["Pledges", "Life happened"] : p.includes("/verdict") ? ["Pledges", "Verdict"] : ["Pledges", "Pledge"];
export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const active = (h: string) => h === "/" ? path === "/" : h.startsWith("/#") ? false : path.startsWith(h);
  const [sec, page] = crumb(path);
  return (<div className="min-h-screen md:flex">
    <aside className="hidden md:flex w-[220px] shrink-0 flex-col border-r border-line bg-surface/50 backdrop-blur-xl px-4 py-6 sticky top-0 h-screen">
      <Link href="/" className="px-2 mb-8"><Wordmark /></Link>
      <nav className="flex-1 space-y-6">{NAV.map((g) => <div key={g.section}>
        <div className="px-3 mb-2 text-[11px] uppercase tracking-[0.12em] text-muted/70">{g.section}</div>
        <div className="space-y-1">{g.items.map((it) => <Link key={it.href} href={it.href} className={`nav-item ${active(it.href) ? "nav-active" : ""}`}>
          <span className="w-5 grid place-items-center opacity-80">{it.icon}</span>{it.label}</Link>)}</div></div>)}</nav>
      <div className="flex items-center justify-between mb-3 px-1"><span className="text-xs text-muted">Theme</span><ThemeToggle /></div>
      <div className="rounded-2xl bg-surface2/70 border border-line p-3 text-xs text-muted">PayPal sandbox · holds are authorized, not charged.</div>
    </aside>
    <div className="flex-1 min-w-0">
      <header className="md:hidden sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur"><div className="px-4 h-16 flex items-center justify-between gap-2">
        <Link href="/"><Wordmark /></Link>
        <div className="flex items-center gap-1 text-sm text-muted"><Link href="/dashboard" aria-label="Dashboard" className={`inline-grid place-items-center w-11 h-11 rounded-full hover:bg-ink/5 ${path.startsWith("/dashboard") ? "text-ink bg-ink/5" : ""}`}><LayoutDashboard size={18} /></Link><ThemeToggle className="!border-0" /><Link href="/pledge/new" className="btn-primary !min-h-0 !h-10 !py-0 !px-3.5 text-sm"><Plus size={15} />New</Link></div></div></header>
      <div className="hidden md:flex h-16 items-center justify-between border-b border-line px-10 sticky top-0 z-20 bg-bg/70 backdrop-blur-xl">
        <div className="text-sm"><span className="text-muted">{sec}</span><span className="text-muted/50 mx-2">/</span><span>{page}</span></div>
        <div className="flex items-center gap-3"><ThemeToggle /><Link href="/pledge/new" className="btn-primary !py-2 !px-4 text-sm"><Plus size={15} />New pledge</Link></div></div>
      <motion.main key={path} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-[1080px] px-4 sm:px-5 md:px-10 py-6 md:py-10 overflow-x-hidden">{children}</motion.main>
    </div></div>);
}
