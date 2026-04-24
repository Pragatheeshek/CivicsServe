import { useState } from "react";
import { motion } from "framer-motion";

export default function SearchBox({ onSearch }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!query.trim() || loading) {
      return;
    }

    setLoading(true);
    await onSearch(query.trim());
    setLoading(false);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="group flex w-full items-center gap-2 rounded-2xl border border-river/20 bg-white p-2 shadow-sm transition focus-within:border-river focus-within:shadow-lg"
    >
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Ask about schemes, certificates, or land services..."
        className="w-full rounded-xl bg-transparent px-3 py-3 text-sm text-ink placeholder:text-ink/45 focus:outline-none"
      />
      <button
        type="submit"
        className="inline-flex min-w-28 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-mist transition hover:scale-105 hover:bg-river disabled:cursor-not-allowed disabled:opacity-70"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-mist border-t-transparent" />
            Loading
          </>
        ) : (
          "Search"
        )}
      </button>
    </motion.form>
  );
}
