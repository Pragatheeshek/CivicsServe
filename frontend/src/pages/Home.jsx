import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-inkwash px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="surface-card grid gap-8 rounded-3xl p-6 shadow-glow sm:p-8 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">
              CivicsServe
            </p>
            <h1 className="font-display text-3xl text-ink sm:text-4xl md:text-5xl">
              Your civic companion for Tamil Nadu services
            </h1>
            <p className="text-sm text-ink/70">
              Get instant guidance for certificates, schemes, and municipal
              services with trusted sources and official apply links.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="rounded-full bg-ink px-6 py-3 text-center text-sm font-semibold text-mist"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full border border-ink/30 bg-white px-6 py-3 text-center text-sm font-semibold text-ink"
              >
                Sign up
              </Link>
            </div>
            <Link to="/app" className="text-xs text-ink/60">
              Continue as guest
            </Link>
          </div>
          <div className="space-y-4 rounded-2xl border border-ink/10 bg-white/60 p-6">
            <p className="text-sm font-semibold text-ink">What you can do</p>
            <ul className="space-y-2 text-sm text-ink/70">
              <li>Check eligibility for income or caste certificates.</li>
              <li>Find scheme requirements with official forms.</li>
              <li>Get municipal payment steps in one place.</li>
            </ul>
            <div className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-xs text-ink/60">
              You can explore without an account, or sign in to save your history.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
