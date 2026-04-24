import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { signup } from "../api";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import Button from "../components/ui/Button";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0116 0" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 7 9-7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </svg>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = "Enter a valid email.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 6) {
      nextErrors.password = "Use at least 6 characters.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirm your password.";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await signup({ name, email, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setError(err?.message || "Signup failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Register once and save your civic conversations securely."
      switchText="Already have an account?"
      switchAction={
        <motion.span whileHover={{ x: 3 }} className="inline-flex">
          <Link to="/login" className="font-semibold text-river">Login</Link>
        </motion.span>
      }
    >
      <motion.form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AuthInput
          id="signup-name"
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          icon={<UserIcon />}
          autoComplete="name"
          error={fieldErrors.name}
        />

        <AuthInput
          id="signup-email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          icon={<MailIcon />}
          autoComplete="email"
          error={fieldErrors.email}
        />

        <AuthInput
          id="signup-password"
          label="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          icon={<LockIcon />}
          autoComplete="new-password"
          error={fieldErrors.password}
          canTogglePassword
        />

        <AuthInput
          id="signup-confirm"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          icon={<LockIcon />}
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
          canTogglePassword
        />

        <Button type="submit" variant="secondary" loading={submitting} disabled={success}>
          {success ? (
            <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="inline-flex items-center gap-2">
              <span>✓</span>
              Account created
            </motion.span>
          ) : (
            "Register"
          )}
        </Button>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="rounded-xl border border-clay/40 bg-clay/10 px-3 py-2 text-xs text-clay"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.form>
    </AuthLayout>
  );
}
