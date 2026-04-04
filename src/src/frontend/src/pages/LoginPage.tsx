import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  "data-ocid": dataOcid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  "data-ocid"?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="pr-10 bg-white/5 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
        data-ocid={dataOcid}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, signUp } = useAuth();

  // Sign in state
  const [signInUsername, setSignInUsername] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);

  // Sign up state
  const [upUsername, setUpUsername] = useState("");
  const [upPassword, setUpPassword] = useState("");
  const [upConfirm, setUpConfirm] = useState("");
  const [upError, setUpError] = useState("");
  const [upLoading, setUpLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    if (!signInUsername.trim() || !signInPassword) {
      setSignInError("Please enter your username and password.");
      return;
    }
    setSignInLoading(true);
    const result = await login(signInUsername.trim(), signInPassword);
    setSignInLoading(false);
    if (result.success) {
      navigate({ to: "/" });
    } else {
      setSignInError(result.error ?? "Login failed.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpError("");

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(upUsername)) {
      setUpError(
        "Username must be 3–20 characters: letters, numbers, or underscores.",
      );
      return;
    }
    if (upPassword.length < 8) {
      setUpError("Password must be at least 8 characters.");
      return;
    }
    if (upPassword !== upConfirm) {
      setUpError("Passwords don't match.");
      return;
    }

    setUpLoading(true);
    const result = await signUp(upUsername.trim(), upPassword);
    setUpLoading(false);
    if (result.success) {
      navigate({ to: "/" });
    } else {
      setUpError(result.error ?? "Sign up failed.");
    }
  };

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
          />
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "oklch(0.13 0.004 260 / 0.95)",
            border: "1px solid oklch(0.49 0.22 26 / 0.3)",
            boxShadow:
              "0 0 60px oklch(0.49 0.22 26 / 0.12), 0 24px 48px rgba(0,0,0,0.5)",
          }}
        >
          <Tabs defaultValue="signin" className="w-full">
            <TabsList
              className="grid grid-cols-2 w-full mb-6 bg-white/5 rounded-lg p-1"
              data-ocid="login.tab"
            >
              <TabsTrigger
                value="signin"
                className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                data-ocid="login.signin.tab"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                data-ocid="login.signup.tab"
              >
                Create Account
              </TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-5" noValidate>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="signin-username"
                    className="text-sm font-medium"
                  >
                    Username
                  </Label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="signin-username"
                      type="text"
                      value={signInUsername}
                      onChange={(e) => setSignInUsername(e.target.value)}
                      placeholder="Enter your username"
                      autoComplete="username"
                      className="pl-9 bg-white/5 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-primary"
                      data-ocid="login.signin.input"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="signin-password"
                    className="text-sm font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
                    />
                    <div className="pl-9">
                      <PasswordInput
                        id="signin-password"
                        value={signInPassword}
                        onChange={setSignInPassword}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        data-ocid="login.signin.password.input"
                      />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {signInError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-red-400"
                      data-ocid="login.signin.error_state"
                    >
                      <AlertCircle size={15} className="flex-shrink-0" />
                      {signInError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={signInLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
                  data-ocid="login.signin.submit_button"
                >
                  {signInLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />{" "}
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Create Account Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-5" noValidate>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="signup-username"
                    className="text-sm font-medium"
                  >
                    Username
                  </Label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="signup-username"
                      type="text"
                      value={upUsername}
                      onChange={(e) => setUpUsername(e.target.value)}
                      placeholder="Choose a username"
                      autoComplete="username"
                      className="pl-9 bg-white/5 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-primary"
                      data-ocid="login.signup.input"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    3–20 characters: letters, numbers, underscores
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="signup-password"
                    className="text-sm font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
                    />
                    <div className="pl-9">
                      <PasswordInput
                        id="signup-password"
                        value={upPassword}
                        onChange={setUpPassword}
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        data-ocid="login.signup.password.input"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="signup-confirm"
                    className="text-sm font-medium"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
                    />
                    <div className="pl-9">
                      <PasswordInput
                        id="signup-confirm"
                        value={upConfirm}
                        onChange={setUpConfirm}
                        placeholder="Repeat your password"
                        autoComplete="new-password"
                        data-ocid="login.signup.confirm.input"
                      />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {upError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-red-400"
                      data-ocid="login.signup.error_state"
                    >
                      <AlertCircle size={15} className="flex-shrink-0" />
                      {upError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={upLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
                  data-ocid="login.signup.submit_button"
                >
                  {upLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />{" "}
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
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
