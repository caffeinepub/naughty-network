import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { login, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();

  // If already logged in, go home
  useEffect(() => {
    if (isLoggedIn) {
      navigate({ to: "/" });
    }
  }, [isLoggedIn, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "#0a0a0f" }}
      data-ocid="login.page"
    >
      {/* Background radial glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.28 0.14 26 / 0.18) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/assets/generated/naughty-network-logo.dim_300x80-transparent.png"
            alt="Naughty Network"
            className="h-12 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {/* Fallback logo text */}
        <div className="flex justify-center mb-2">
          <span className="text-2xl font-black uppercase tracking-tight">
            <span className="text-primary">NAUGHTY</span>
            <span className="text-foreground ml-1">NETWORK</span>
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 mt-4"
          style={{
            background: "oklch(0.13 0.004 260 / 0.95)",
            border: "1px solid oklch(0.49 0.22 26 / 0.3)",
            boxShadow:
              "0 0 60px oklch(0.49 0.22 26 / 0.12), 0 24px 48px rgba(0,0,0,0.5)",
          }}
        >
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-foreground mb-2">
              Sign in to Naughty Network
            </h1>
            <p className="text-sm text-muted-foreground">
              Secure login powered by Internet Identity
            </p>
          </div>

          {/* II Button */}
          <Button
            type="button"
            onClick={login}
            disabled={isLoggingIn}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 text-base rounded-xl"
            data-ocid="login.ii.button"
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="currentColor"
                    opacity="0.2"
                  />
                  <path
                    d="M12 6C8.69 6 6 8.69 6 12s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                    fill="currentColor"
                  />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                </svg>
                Sign in with Internet Identity
              </>
            )}
          </Button>

          {/* Error */}
          <AnimatePresence>
            {isLoginError && loginError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-3 mt-4 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-red-400"
                data-ocid="login.error_state"
              >
                <AlertCircle size={15} className="flex-shrink-0" />
                {loginError.message === "Login failed"
                  ? "Login was cancelled or failed. Please try again."
                  : loginError.message}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-center text-muted-foreground">
              Internet Identity is a secure, privacy-preserving authentication
              system on the Internet Computer. No passwords required.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
