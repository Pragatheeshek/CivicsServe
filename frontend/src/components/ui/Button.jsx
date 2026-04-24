export default function Button({
  children,
  type = "button",
  onClick,
  disabled = false,
  loading = false,
  variant = "primary",
  className = "",
}) {
  const variantClass =
    variant === "secondary"
      ? "bg-brass text-mist hover:bg-river"
      : "bg-ink text-mist hover:bg-river";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 ${variantClass} ${className}`}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-mist border-t-transparent" />
          Please wait...
        </>
      ) : (
        children
      )}
    </button>
  );
}
