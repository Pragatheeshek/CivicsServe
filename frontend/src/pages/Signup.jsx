import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { signup } from "../api";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      await signup({ name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err?.message || "Signup failed.");
    } finally {
      setSubmitting(false);
    }
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
              Create your CivicsServe account
            </h1>
            <p className="mt-3 text-sm text-ink/70">
              Get personalized guidance, save your progress, and receive timely
              updates on your civic applications.
            </p>
            <div className="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-4">
              <p className="text-sm text-ink/70">
                Already have an account? Sign in and continue your ongoing
                requests.
              </p>
              <Link
                to="/login"
                className="mt-4 inline-flex w-full justify-center rounded-full bg-ink px-5 py-2 text-sm font-semibold text-mist sm:w-auto"
              >
                Sign in
              </Link>
            </div>
          </div>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs uppercase tracking-widest text-ink/40">
                Full name
              </label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-ink/20 bg-white px-4 py-3 text-sm focus:border-ink focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-ink/40">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-ink/20 bg-white px-4 py-3 text-sm focus:border-ink focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-ink/40">
                Password
              </label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-ink/20 bg-white px-4 py-3 text-sm focus:border-ink focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-full bg-brass px-6 py-3 text-sm font-semibold text-mist shadow-glow transition hover:translate-y-[-1px]"
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
            {error && (
              <p className="rounded-xl border border-clay/40 bg-clay/10 px-3 py-2 text-xs text-clay">
                {error}
              </p>
            )}
            <Link to="/" className="text-xs text-ink/60">
              Back to home
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
