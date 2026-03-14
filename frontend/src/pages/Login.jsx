import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-inkwash px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="surface-card grid gap-8 rounded-3xl p-6 shadow-glow sm:p-8 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">
              CivicsServe
            </p>
            <h1 className="font-display text-3xl text-ink sm:text-4xl md:text-4xl">
              Sign in to continue your civic requests
            </h1>
            <p className="mt-3 text-sm text-ink/70">
              Track your submissions, save answers, and jump back into your
              conversations anytime.
            </p>
            <div className="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-4">
              <p className="text-sm text-ink/70">
                New here? Create an account to manage certificates, schemes, and
                municipal services with confidence.
              </p>
              <Link
                to="/signup"
                className="mt-4 inline-flex w-full justify-center rounded-full bg-ink px-5 py-2 text-sm font-semibold text-mist sm:w-auto"
              >
                Create account
              </Link>
            </div>
          </div>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs uppercase tracking-widest text-ink/40">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@email.com"
                className="mt-2 w-full rounded-2xl border border-ink/20 bg-white px-4 py-3 text-sm focus:border-ink focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-ink/40">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="mt-2 w-full rounded-2xl border border-ink/20 bg-white px-4 py-3 text-sm focus:border-ink focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="mt-2 rounded-full bg-brass px-6 py-3 text-sm font-semibold text-mist shadow-glow transition hover:translate-y-[-1px]"
            >
              Sign in
            </button>
            <Link to="/" className="text-xs text-ink/60">
              Back to home
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
