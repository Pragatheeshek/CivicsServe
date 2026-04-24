import { motion } from "framer-motion";

export default function FeatureCard({ icon, label, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group rounded-2xl border border-river/10 bg-white p-5 shadow-sm transition hover:shadow-xl"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-river/10 text-river transition group-hover:bg-river group-hover:text-mist">
        {icon}
      </div>
      <p className="text-sm font-semibold text-ink">{label}</p>
    </motion.div>
  );
}
