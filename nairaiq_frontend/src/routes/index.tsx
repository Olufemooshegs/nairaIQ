import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Brain, Landmark, Sparkles } from "lucide-react";
import { ScoreGauge } from "@/components/ScoreGauge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NairaIQ — Know your Finance, Grow your Future" },
      { name: "description", content: "Nigeria's personal finance intelligence platform. Get your NairaIQ score in minutes." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-hero-gradient text-white">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-teal-dark/60 border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
          <span className="w-8 h-8 rounded-lg bg-mint flex items-center justify-center text-teal-dark">₦</span>
          NairaIQ
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-text-muted">
          <a href="#features" className="hover:text-mint transition">Features</a>
          <a href="#how" className="hover:text-mint transition">How it works</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-text-muted hover:text-white">Sign in</Link>
          <Link to="/register" className="rounded-lg bg-mint text-teal-dark px-4 py-2 text-sm font-semibold hover:opacity-90 transition">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-teal-overlay/40 px-3 py-1 text-xs text-mint">
            <Sparkles className="w-3 h-3" /> Built for Nigerians
          </span>
          <h1 className="mt-6 font-display font-extrabold leading-[1.05] tracking-tight" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
            Know your Finance,
            <br />
            <span className="text-gradient-mint">Grow your Future.</span>
          </h1>
          <p className="mt-6 text-lg text-text-muted max-w-xl">
            Nigeria's personal finance intelligence platform.
            Get your financial health score in minutes — tailored to BVN, Nigerian banks, and Naira realities.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-mint text-teal-dark px-6 py-3 font-semibold hover:opacity-90 transition mint-glow">
              Get Your Score <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how" className="inline-flex items-center rounded-xl border border-border px-6 py-3 font-semibold text-white hover:bg-teal-overlay/50 transition">
              See How It Works
            </a>
          </div>
          <div className="mt-10 flex items-center gap-6 text-xs text-text-muted">
            <div><span className="text-white font-mono text-xl">12K+</span> Nigerians scored</div>
            <div className="h-8 w-px bg-border" />
            <div><span className="text-white font-mono text-xl">₦2.4B</span> tracked</div>
          </div>
        </div>
        <div className="relative flex justify-center animate-fade-up" style={{ animationDelay: "150ms" }}>
          <div className="glass-card p-8 mint-glow animate-mint-pulse">
            <ScoreGauge score={847} size={280} />
            <div className="mt-6 grid grid-cols-3 gap-4 text-center text-xs">
              <div><div className="font-mono text-mint text-lg">+34</div><div className="text-text-muted">This month</div></div>
              <div><div className="font-mono text-mint text-lg">73%</div><div className="text-text-muted">Percentile</div></div>
              <div><div className="font-mono text-mint text-lg">A</div><div className="text-text-muted">Grade</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: Landmark, title: "Nigerian Context", body: "Understands BVN, all 26+ Nigerian banks, NIN, and Naira income structures." },
    { icon: BarChart3, title: "Financial Scoring", body: "0–1000 NairaIQ score built from 12 financial health dimensions." },
    { icon: Brain, title: "Smart Insights", body: "Personalized recommendations built from your real financial data." },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-20">
      <h2 className="font-display text-3xl md:text-4xl font-bold text-center">Built differently. For us.</h2>
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        {items.map((f, i) => (
          <div key={i} className="glass-card p-6 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-mint/15 flex items-center justify-center text-mint">
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">{f.title}</h3>
            <p className="mt-2 text-text-muted text-sm leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Create your account", d: "Sign up in under 60 seconds." },
    { n: "02", t: "Complete your profile", d: "Tell us about your income, goals & habits." },
    { n: "03", t: "Get your NairaIQ Score", d: "See your 0–1000 financial health rating." },
    { n: "04", t: "Track and improve", d: "Watch your score grow over time." },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl px-6 py-20">
      <h2 className="font-display text-3xl md:text-4xl font-bold text-center">How it works</h2>
      <div className="mt-12 grid md:grid-cols-4 gap-6">
        {steps.map((s) => (
          <div key={s.n} className="glass-card p-6">
            <div className="font-mono text-mint text-2xl">{s.n}</div>
            <div className="mt-3 font-semibold">{s.t}</div>
            <div className="mt-1 text-sm text-text-muted">{s.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="glass-card p-12 text-center mint-glow">
        <h2 className="font-display text-3xl md:text-4xl font-bold">Ready to take control of your finances?</h2>
        <p className="mt-3 text-text-muted">Join thousands of Nigerians building wealth, one score at a time.</p>
        <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-mint text-teal-dark px-8 py-3 font-semibold">
          Get Your Score <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row gap-4 items-center justify-between text-sm text-text-muted">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-mint flex items-center justify-center text-teal-dark text-xs">₦</span>
          © 2025 NairaIQ
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-mint">Privacy</a>
          <a href="#" className="hover:text-mint">Terms</a>
          <a href="#" className="hover:text-mint">Contact</a>
        </div>
      </div>
    </footer>
  );
}
