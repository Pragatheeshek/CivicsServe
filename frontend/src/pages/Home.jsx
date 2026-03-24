import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-inkwash px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="surface-card grid gap-6 rounded-3xl border border-ink/10 bg-white p-6 shadow-glow sm:p-8 md:grid-cols-[1.25fr_1fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <img
                src="/civicsserve-logo.svg"
                alt="CivicsServe logo"
                className="h-11 w-11"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/70">
                  CivicsServe
                </p>
                <p className="text-xs text-ink/50">Tamil Nadu Citizen Assistant</p>
              </div>
            </div>

            <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
              Fast help for certificates and citizen services
            </h1>

            <p className="max-w-xl text-sm text-ink/70 sm:text-base">
              Ask a question. Get the right documents, steps, and official apply links.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/app"
                className="rounded-full bg-ink px-7 py-3 text-center text-sm font-semibold text-mist transition hover:bg-river"
              >
                Continue as guest
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-ink/20 bg-white px-7 py-3 text-center text-sm font-semibold text-ink transition hover:border-river/40"
              >
                Login
              </Link>
            </div>

            <Link to="/signup" className="inline-block text-xs font-semibold text-river hover:text-ink">
              New user? Create account
            </Link>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white/70 p-6">
            <p className="text-sm font-semibold text-ink">Try quick questions</p>
            <ul className="mt-4 space-y-2 text-sm text-ink/70">
              <li>What certificates are available?</li>
              <li>How to apply for Income Certificate?</li>
              <li>Documents required for Nativity Certificate?</li>
            </ul>

            <div className="mt-5 rounded-xl border border-ink/10 bg-white px-4 py-3 text-xs text-ink/60">
              Official links only. Clear steps only.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
