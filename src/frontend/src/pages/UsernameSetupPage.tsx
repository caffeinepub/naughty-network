import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HttpAgent } from "@icp-sdk/core/agent";
import { AlertCircle, Loader2, UserCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { createActor } from "../backend";
import { loadConfig } from "../config";
import { useAuth } from "../hooks/useAuth";

export default function UsernameSetupPage() {
  const { identity, setUsername } = useAuth();
  const [usernameInput, setUsernameInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (val: string): string => {
    if (!val.trim()) return "Please enter a username.";
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(val.trim())) {
      return "Username must be 3\u201320 characters: letters, numbers, or underscores only.";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate(usernameInput);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!identity) {
      setError("Authentication error. Please sign in again.");
      return;
    }

    setLoading(true);
    try {
      const config = await loadConfig();
      const agent = new HttpAgent({ host: config.backend_host, identity });
      const actor = createActor(config.backend_canister_id, { agent });
      const result = await actor.registerWithII(usernameInput.trim());
      if ("err" in result) {
        setError(result.err);
      } else {
        setUsername(usernameInput.trim());
      }
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Failed to set username. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: "rgba(10, 10, 15, 0.97)" }}
      data-ocid="username_setup.modal"
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.28 0.14 26 / 0.2) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <span className="text-xl font-black uppercase tracking-tight">
            <span className="text-primary">NAUGHTY</span>
            <span className="text-foreground ml-1">NETWORK</span>
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "oklch(0.13 0.004 260 / 0.98)",
            border: "1px solid oklch(0.49 0.22 26 / 0.35)",
            boxShadow:
              "0 0 60px oklch(0.49 0.22 26 / 0.15), 0 24px 48px rgba(0,0,0,0.6)",
          }}
        >
          {/* Icon & Heading */}
          <div className="flex flex-col items-center text-center mb-7">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{
                background: "oklch(0.49 0.22 26 / 0.2)",
                border: "1px solid oklch(0.49 0.22 26 / 0.4)",
              }}
            >
              <UserCheck size={26} className="text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              Welcome! Choose your username
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              This is the name other members will see. You can only set it once.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label
                htmlFor="username-setup-input"
                className="text-sm font-medium"
              >
                Username
              </Label>
              <Input
                id="username-setup-input"
                type="text"
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. coolviewer99"
                autoComplete="username"
                autoFocus
                maxLength={20}
                className="bg-white/5 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-primary h-11"
                data-ocid="username_setup.input"
              />
              <p className="text-xs text-muted-foreground">
                3\u201320 characters: letters, numbers, underscores
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-red-400"
                  data-ocid="username_setup.error_state"
                >
                  <AlertCircle size={15} className="flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={loading || !usernameInput.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-xl"
              data-ocid="username_setup.submit_button"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Set Username"
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
