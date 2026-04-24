import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="sticky top-0 z-50 border-b border-river/10 bg-white/75 backdrop-blur-md"
    >
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#home" className="flex items-center gap-3">
          <img src="/civicsserve-logo.png" alt="CiviServe AI logo" className="h-9 w-9" />
          <span className="font-display text-lg font-semibold text-ink">CiviServe AI</span>
        </a>

        <div className="flex items-center gap-3 text-xs font-semibold text-ink/80 sm:gap-7 sm:text-sm">
          <a href="#home" className="transition hover:text-river">Home</a>
          <a href="#services" className="transition hover:text-river">Services</a>
          <a href="#about" className="transition hover:text-river">About</a>
          <Link
            to="/login"
            className="rounded-full bg-ink px-3 py-2 text-mist transition hover:scale-105 hover:bg-river sm:px-4"
          >
            Login
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
