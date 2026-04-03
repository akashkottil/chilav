import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)]">
      {/* Animated mesh background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] right-[-10%] h-[700px] w-[700px] rounded-full bg-[var(--primary)] opacity-[0.07] blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[var(--accent)] opacity-[0.07] blur-[120px] animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute top-[30%] left-[40%] h-[500px] w-[500px] rounded-full bg-pink-500 opacity-[0.05] blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl gradient-bg flex items-center justify-center">
            <span className="text-white font-black text-sm">C</span>
          </div>
          <span className="text-xl font-black tracking-tight text-foreground">chilav</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-[var(--muted)] hover:text-foreground">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-32 md:pt-32 md:pb-40 text-center">
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs font-medium text-[var(--muted)] mb-8 shadow-sm">
            <span className="flex h-2 w-2"><span className="animate-ping absolute h-2 w-2 rounded-full bg-[var(--success)] opacity-75"></span><span className="relative rounded-full h-2 w-2 bg-[var(--success)]"></span></span>
            Now with investment tracking
          </div>
        </div>

        <h1 className="text-6xl font-black tracking-tight text-foreground sm:text-8xl md:text-9xl leading-[0.9] animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <span className="gradient-text">Money,</span>
          <br />
          <span className="text-foreground">simplified.</span>
        </h1>

        <p className="mx-auto mt-8 max-w-lg text-lg text-[var(--muted)] leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
          The beautiful way to track expenses, manage investments, and understand your spending with your partner.
        </p>

        <div className="flex flex-col items-center gap-4 mt-10 sm:flex-row animate-slide-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <Link href="/signup">
            <Button size="lg" className="text-base px-10 h-14 rounded-2xl text-base shadow-xl shadow-[var(--primary)]/20">
              Start for free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-base px-10 h-14 rounded-2xl">
              I have an account
            </Button>
          </Link>
        </div>
      </section>

      {/* Bento Feature Grid */}
      <section className="relative z-10 px-6 pb-32 md:px-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 stagger-children">
          {/* Large card - Analytics */}
          <div className="md:col-span-4 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--primary)] to-purple-900 p-8 md:p-10 text-white min-h-[280px] group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium mb-6 backdrop-blur-sm">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Analytics
              </div>
              <h3 className="text-3xl md:text-4xl font-black mb-3 leading-tight">See where your money goes</h3>
              <p className="text-white/70 text-base max-w-md">Interactive pie charts, trends, and breakdowns by category, payment source, and time period.</p>
            </div>
          </div>

          {/* Small card - Shared */}
          <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-8 group hover:border-[var(--primary)]/30 transition-all duration-300 min-h-[280px]">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-300">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">For couples</h3>
            <p className="text-[var(--muted)] text-sm leading-relaxed">Share expenses, split bills, and see who owes what - all in real-time.</p>
          </div>

          {/* Small card - Categories */}
          <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-8 group hover:border-[var(--accent)]/30 transition-all duration-300 min-h-[240px]">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-amber-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-[var(--accent)]/20 group-hover:scale-110 transition-transform duration-300">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">Smart categories</h3>
            <p className="text-[var(--muted)] text-sm leading-relaxed">Custom categories with icons, colors, and subcategories.</p>
          </div>

          {/* Large card - Investments */}
          <div className="md:col-span-4 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 p-8 md:p-10 text-white min-h-[240px] group">
            <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium mb-6 backdrop-blur-sm">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                Investments
              </div>
              <h3 className="text-3xl md:text-4xl font-black mb-3 leading-tight">Grow your wealth</h3>
              <p className="text-white/70 text-base max-w-md">Track deposits, withdrawals, FDs, mutual funds, and more alongside your daily expenses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border)] py-8 text-center">
        <p className="text-sm text-[var(--muted)]">
          Built with care for smarter finances
        </p>
      </footer>
    </div>
  );
}
