import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { login, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();

  const handleLogin = () => {
    onOpenChange(false);
    // Small delay to let the dialog close before II popup opens
    setTimeout(() => {
      login();
    }, 150);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden border-0"
        style={{
          background: "oklch(0.13 0.004 260 / 0.98)",
          border: "1px solid oklch(0.49 0.22 26 / 0.35)",
          boxShadow:
            "0 0 80px oklch(0.49 0.22 26 / 0.18), 0 32px 64px rgba(0,0,0,0.7)",
        }}
        data-ocid="auth.modal"
      >
        <DialogHeader className="px-8 pt-8 pb-0">
          <DialogTitle className="text-center text-xl font-black uppercase tracking-wide">
            Watch This Show
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground mt-1">
            Sign in with Internet Identity to start watching.
          </p>
        </DialogHeader>

        <div className="px-8 pb-8 pt-6 space-y-4">
          <Button
            type="button"
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 text-base rounded-xl"
            data-ocid="auth.modal.ii.button"
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

          <AnimatePresence>
            {isLoginError && loginError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-red-400"
                data-ocid="auth.modal.error_state"
              >
                <AlertCircle size={15} className="flex-shrink-0" />
                {loginError.message === "Login failed"
                  ? "Login was cancelled. Please try again."
                  : loginError.message}
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-xs text-center text-muted-foreground pt-2">
            Internet Identity is a secure, passwordless login system on the
            Internet Computer.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
