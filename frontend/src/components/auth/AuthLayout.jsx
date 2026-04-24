import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Card from "../ui/Card";

export default function AuthLayout({ title, subtitle, children, switchText, switchAction }) {
  return (
    <div className="min-h-screen bg-inkwash px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-river/20 bg-white/70 px-4 py-2 text-xs font-semibold text-ink transition hover:scale-105 hover:border-river/40"
        >
          <span aria-hidden="true">←</span>
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid gap-8 rounded-3xl p-1 md:grid-cols-[1.1fr_1fr]"
        >
          <div className="flex items-center justify-center md:hidden">
            <div className="h-24 w-24 overflow-hidden rounded-2xl border border-river/20 bg-white sm:h-28 sm:w-28">
              <img
                src="/civicsserve-logo.png"
                alt="CiviServe AI"
                className="h-full w-full scale-[1.18] object-cover object-center"
              />
            </div>
          </div>

          <div className="hidden rounded-2xl bg-gradient-to-br from-river/20 via-white to-brass/20 p-6 md:block">
            <div className="relative h-full min-h-[420px] overflow-hidden rounded-2xl border border-white/50 bg-white/55 p-4 backdrop-blur">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-river/20 bg-white p-4">
                <img
                  src="/civicsserve-logo.png"
                  alt="CiviServe AI"
                  className="h-full w-full object-contain object-center"
                />
              </div>
            </div>
          </div>

          <Card className="p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-river">CiviServe AI</p>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">{title}</h1>
            <p className="mt-2 text-sm text-ink/65">{subtitle}</p>

            <div className="mt-6">{children}</div>

            <p className="mt-5 text-sm text-ink/65">
              {switchText}{" "}
              {switchAction}
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
