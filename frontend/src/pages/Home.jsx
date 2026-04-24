import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/home/Navbar";
import FeatureCard from "../components/home/FeatureCard";

const ICONS = {
  schemes: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10l9-6 9 6-9 6-9-6z" />
      <path d="M7 12v5a2 2 0 002 2h6a2 2 0 002-2v-5" />
    </svg>
  ),
  certificates: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h6" />
    </svg>
  ),
  land: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 20h18" />
      <path d="M5 20V9l7-5 7 5v11" />
    </svg>
  ),
  apply: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  ),
};

export default function Home() {
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSkeleton(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen scroll-smooth bg-inkwash">
      <Navbar />

      <main id="home" className="mx-auto w-full max-w-6xl px-4 pb-14 pt-8 sm:px-6 sm:pt-12">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="surface-card rounded-3xl border border-river/10 bg-white/85 p-6 shadow-glow sm:p-10"
        >
          <p className="mb-3 inline-flex rounded-full bg-river/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-river">
            AI Civic Assistant
          </p>

          <h1 className="font-display text-4xl text-ink sm:text-5xl">CiviServe AI</h1>
          <p className="mt-2 text-sm text-ink/70 sm:text-base">
            Smart assistance for every civic service in one place.
          </p>

          <div className="mt-6 rounded-2xl border border-river/15 bg-white/85 p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-river">Quick Actions</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Link
                to="/app"
                className="rounded-xl bg-ink px-4 py-3 text-center text-sm font-semibold text-mist transition hover:scale-[1.02] hover:bg-river"
              >
                Continue as Guest
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-ink/20 bg-white px-4 py-3 text-center text-sm font-semibold text-ink transition hover:scale-[1.02] hover:border-river/40"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-xl border border-brass/25 bg-brass/10 px-4 py-3 text-center text-sm font-semibold text-brass transition hover:scale-[1.02] hover:bg-brass/20"
              >
                Create Account
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Check schemes",
                "Apply certificates",
                "Land services",
                "Track application",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  className="rounded-full border border-river/20 bg-river/5 px-3 py-1.5 text-xs font-semibold text-river transition hover:scale-105 hover:bg-river/10"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        <section id="services" className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Services</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/50">Explore</span>
          </div>

          {showSkeleton ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-2xl border border-river/10 bg-white/70" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard icon={ICONS.schemes} label="Schemes" delay={0.05} />
              <FeatureCard icon={ICONS.certificates} label="Certificates" delay={0.1} />
              <FeatureCard icon={ICONS.land} label="Land Services" delay={0.15} />
              <FeatureCard icon={ICONS.apply} label="Apply Services" delay={0.2} />
            </div>
          )}
        </section>

        <section id="about" className="mt-12 rounded-2xl border border-river/10 bg-white/75 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-river">About</p>
          <p className="mt-2 text-sm text-ink/70">
            CiviServe AI helps citizens quickly find service guidance with cleaner steps and faster access.
          </p>
        </section>
      </main>
    </div>
  );
}
