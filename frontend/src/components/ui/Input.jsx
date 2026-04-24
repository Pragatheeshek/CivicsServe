import { useState } from "react";

export default function Input({
  id,
  label,
  type = "text",
  value,
  onChange,
  icon,
  autoComplete,
  error,
  canTogglePassword = false,
  className = "",
}) {
  const [showPassword, setShowPassword] = useState(false);
  const effectiveType = canTogglePassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={className}>
      <div
        className={`group relative rounded-2xl border bg-white/90 transition ${
          error ? "border-clay/60" : "border-ink/20 focus-within:border-river"
        } focus-within:shadow-[0_0_0_4px_rgba(31,106,165,0.15)]`}
      >
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/45">
          {icon}
        </span>

        <input
          id={id}
          type={effectiveType}
          value={value}
          autoComplete={autoComplete}
          onChange={onChange}
          placeholder=" "
          className="peer w-full rounded-2xl bg-transparent pb-3 pl-12 pr-12 pt-6 text-sm text-ink outline-none"
        />

        <label
          htmlFor={id}
          className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-sm text-ink/50 transition-all peer-placeholder-shown:top-1/2 peer-focus:top-4 peer-focus:text-xs peer-focus:text-river peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-xs"
        >
          {label}
        </label>

        {canTogglePassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-ink/70 transition hover:bg-river/10"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-clay">{error}</p>}
    </div>
  );
}
