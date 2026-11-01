import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ParticleOrb } from "@/components/ParticleOrb";
import { MarketingNav } from "@/components/MarketingNav";
import { Reveal } from "@/components/Reveal";
import { Steps } from "@/components/Steps";
import { Wordmark } from "@/components/AppShell";
const Em = ({ children }: { children: React.ReactNode }) => <em className="mk-em">{children}</em>;
function Chapter({ id, n, label, title, children }: { id: string; n: string; label: string; title: React.ReactNode; children: React.ReactNode }) {
  return (<section id={id} className="relative py-20 md:py-40 scroll-mt-24">
    <span className="absolute -left-[29px] md:-left-[45px] top-[5.6rem] md:top-[10.6rem] w-2.5 h-2.5 rounded-full bg-brand shadow-[0_0_16px_#0070E0]" />
    <Reveal><div className="mk-mono text-[11px] text-muted mb-6">{n} — {label}</div>
      <h2 className="text-[2.1rem] sm:text-4xl md:text-6xl font-light tracking-[-0.04em] leading-[1.02] max-w-[720px]">{title}</h2></Reveal>
    <Reveal delay={0.1} className="mt-12">{children}</Reveal></section>);
}
const Row = ({ t, d }: { t: string; d: string }) => <div className="grid md:grid-cols-[240px_1fr] gap-3 md:gap-10 border-b border-ink/10 py-6"><div className="text-ink">{t}</div><div className="text-muted leading-relaxed">{d}</div></div>;
const FAQ = [
  ["Is my money charged up front?", "No. PayPal places an authorization hold. It’s voided if you pass, captured only if you miss."],
  ["Where does a missed stake go?", "To the charity or friend you picked, via PayPal Payouts."],
  ["Can I cheat with a stock photo?", "The referee flags stock, AI-generated and reused images, and checks timing against your deadline."],
  ["What if something real comes up?", "You get one ‘Life happened’ per pledge — explain it to the referee and it can release the hold."],
  ["Is this real money?", "This build runs on PayPal sandbox for the hackathon."],
];
export default function Landing() {
  return (<>
    <MarketingNav />
    <section className="relative min-h-[100svh] overflow-hidden">
      {/* Ambient depth — soft brand glows so hero isn’t flat */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 w-[520px] h-[520px] rounded-full bg-brand/20 blur-[110px]" />
        <div className="absolute top-1/3 -right-16 w-[640px] h-[640px] rounded-full bg-brand/15 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 w-[420px] h-[280px] rounded-full bg-brand/10 blur-[100px]" />
      </div>
      <div className="relative mx-auto max-w-[1200px] px-6 min-h-[100svh] grid md:grid-cols-2 items-center gap-0 md:gap-6 pt-24 md:pt-24 pb-10 md:pb-0">
        <Reveal className="relative z-10">
          <div className="relative rounded-[28px] border border-ink/10 bg-surface/40 backdrop-blur-2xl shadow-[0_8px_40px_-16px_rgb(0_0_0/0.35),inset_0_1px_0_0_rgb(255_255_255/0.08)] p-6 sm:p-8 md:p-10 overflow-hidden">
            <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 w-56 h-56 rounded-full bg-brand/25 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-10 w-48 h-48 rounded-full bg-brand/10 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-ink/[0.04] backdrop-blur px-3 py-1.5 mk-mono text-[10px] text-muted"><span className="w-1.5 h-1.5 rounded-full bg-brand pulse-chip text-brand" />PAYPAL AI HACKATHON</div>
              <h1 className="mt-5 sm:mt-8 text-[2.4rem] sm:text-[3.2rem] md:text-[5.2rem] font-light tracking-[-0.05em] leading-[0.95]">Stake money<br />on a habit.<br /><Em>Or lose it.</Em></h1>
              <p className="mt-5 sm:mt-8 text-base sm:text-lg text-muted max-w-[420px] leading-relaxed">PayPal holds your stake. An AI referee checks your proof. Show up and it’s voided — miss and it’s paid forward.</p>
              <div className="mt-6 sm:mt-10 flex flex-wrap gap-3"><Link href="/pledge/new" className="mk-btn-primary">Open the app <ArrowRight size={16} /></Link><a href="#how" className="mk-btn-ghost">How it works</a></div>
            </div>
          </div>
        </Reveal>
        <div className="relative h-[320px] sm:h-[420px] md:h-[800px] -mx-6 -mt-10 md:mt-0 md:-mr-16 md:ml-0"><ParticleOrb /></div>
      </div>
      <a href="#problem" className="hidden md:inline-flex absolute bottom-8 left-1/2 -translate-x-1/2 items-center gap-2 rounded-full border border-ink/10 bg-mkbg/60 backdrop-blur px-4 py-2 mk-mono text-[10px] text-muted hover:text-ink transition-colors">SCROLL <ChevronDown size={13} className="animate-bounce" /></a>
    </section>
    <div className="mx-auto max-w-[1200px] px-6"><div className="relative ml-1 md:ml-8 pl-6 md:pl-10 border-l border-ink/10">
      <Chapter id="problem" n="01" label="THE PROBLEM" title={<>Habits fail when <Em>nothing is at stake.</Em></>}>
        <p className="text-lg text-muted max-w-[535px] leading-relaxed">Apps remind. Streaks reset. Nobody loses anything when you skip. CommitPay puts real money on the line — and makes skipping cost something that does good.</p>
        <div className="mt-14 grid grid-cols-3 max-w-[640px] gap-4 md:gap-8">{[["$0", "charged until you miss"], ["AI", "checks every proof"], ["1", "honest escape per pledge"]].map(([k, v]) => <div key={v}><div className="text-4xl md:text-5xl font-extralight tracking-[-0.05em]">{k}</div><div className="mt-2 text-sm text-muted">{v}</div></div>)}</div>
      </Chapter>
      <Chapter id="how" n="02" label="HOW IT WORKS" title={<>Three steps. <Em>One promise.</Em></>}><Steps /></Chapter>
      <Chapter id="referee" n="03" label="THE REFEREE" title={<>An AI that can’t be <Em>sweet-talked.</Em></>}>
        <div className="max-w-[860px] border-t border-ink/10">
          <Row t="Stock photo detection" d="Images lifted from the web or stock libraries are flagged before they count." />
          <Row t="Reuse & AI-fake checks" d="Recycled shots and generated images get rejected with a clear reason." />
          <Row t="Life happened" d="One honest conversation per pledge. If the referee believes you, the hold is released." />
          <Row t="Explained verdicts" d="Every pass or reject comes with the reasoning — no black box." />
        </div>
      </Chapter>
      <Chapter id="paypal" n="04" label="BUILT ON PAYPAL" title={<>Money that moves <Em>only when it should.</Em></>}>
        <div className="max-w-[860px] border-t border-ink/10">
          <Row t="Authorize" d="Your stake is held on your PayPal account at pledge time." />
          <Row t="Void" d="Pass, and the authorization is voided. You were never charged." />
          <Row t="Capture + Payouts" d="Miss, and the hold is captured and paid to your charity or friend." />
          <Row t="Sandbox" d="Running end-to-end on PayPal sandbox for the hackathon." />
        </div>
      </Chapter>
      <Chapter id="faq" n="05" label="FAQ" title={<>Short answers, <Em>no fine print.</Em></>}>
        <div className="max-w-[860px] border-t border-ink/10">{FAQ.map(([q, a]) => <details key={q} className="group border-b border-ink/10 py-6"><summary className="cursor-pointer list-none flex justify-between gap-6 text-lg"><span>{q}</span><span className="text-muted transition-transform group-open:rotate-45">+</span></summary><p className="mt-3 text-muted leading-relaxed max-w-[620px]">{a}</p></details>)}</div>
      </Chapter>
    </div></div>
    <section className="relative py-24 md:py-40 px-6 text-center overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] md:w-[600px] md:h-[600px] rounded-full bg-brand/15 blur-[120px]" />
      <Reveal className="relative"><h2 className="text-[2.6rem] sm:text-5xl md:text-7xl font-light tracking-[-0.05em] leading-[1]">Your next habit.<br /><Em>Put money behind it.</Em></h2>
        <div className="mt-12 flex justify-center flex-wrap gap-3"><Link href="/pledge/new" className="mk-btn-primary">Create a pledge <ArrowRight size={16} /></Link><Link href="/dashboard" className="mk-btn-ghost">View dashboard</Link></div></Reveal>
    </section>
    <footer className="border-t border-ink/10"><div className="mx-auto max-w-[1200px] px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-sm text-muted"><Wordmark /><span className="mk-mono text-[10px]">© 2026 COMMITPAY · PAYPAL SANDBOX</span></div></footer>
  </>);
}
