import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultTab?: "signin" | "signup";
}

export default function AuthModal({
  open,
  onOpenChange,
  onSuccess,
  defaultTab = "signup",
}: AuthModalProps) {
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

  const resetState = () => {
    setSignInUsername("");
    setSignInPassword("");
    setSignInError("");
    setUpUsername("");
    setUpPassword("");
    setUpConfirm("");
    setUpError("");
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) resetState();
    onOpenChange(val);
  };

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
      resetState();
      onOpenChange(false);
      onSuccess?.();
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
      resetState();
      onOpenChange(false);
      onSuccess?.();
    } else {
      setUpError(result.error ?? "Sign up failed.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            Create a free account or sign in to start watching.
          </p>
        </DialogHeader>

        <div className="px-8 pb-8 pt-6">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList
              className="grid grid-cols-2 w-full mb-6 bg-white/5 rounded-lg p-1"
              data-ocid="auth.modal.tab"
            >
              <TabsTrigger
                value="signup"
                className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                data-ocid="auth.modal.signup.tab"
              >
                Create Account
              </TabsTrigger>
              <TabsTrigger
                value="signin"
                className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                data-ocid="auth.modal.signin.tab"
              >
                Sign In
              </TabsTrigger>
            </TabsList>

            {/* Create Account Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="modal-signup-username"
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
                      id="modal-signup-username"
                      type="text"
                      value={upUsername}
                      onChange={(e) => setUpUsername(e.target.value)}
                      placeholder="Choose a username"
                      autoComplete="username"
                      className="pl-9 bg-white/5 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-primary"
                      data-ocid="auth.modal.signup.input"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    3–20 characters: letters, numbers, underscores
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="modal-signup-password"
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
                        id="modal-signup-password"
                        value={upPassword}
                        onChange={setUpPassword}
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        data-ocid="auth.modal.signup.password.input"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="modal-signup-confirm"
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
                        id="modal-signup-confirm"
                        value={upConfirm}
                        onChange={setUpConfirm}
                        placeholder="Repeat your password"
                        autoComplete="new-password"
                        data-ocid="auth.modal.signup.confirm.input"
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
                      data-ocid="auth.modal.signup.error_state"
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
                  data-ocid="auth.modal.signup.submit_button"
                >
                  {upLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />{" "}
                      Creating account...
                    </>
                  ) : (
                    "Create Account & Watch"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Sign In Tab */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="modal-signin-username"
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
                      id="modal-signin-username"
                      type="text"
                      value={signInUsername}
                      onChange={(e) => setSignInUsername(e.target.value)}
                      placeholder="Enter your username"
                      autoComplete="username"
                      className="pl-9 bg-white/5 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-primary"
                      data-ocid="auth.modal.signin.input"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="modal-signin-password"
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
                        id="modal-signin-password"
                        value={signInPassword}
                        onChange={setSignInPassword}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        data-ocid="auth.modal.signin.password.input"
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
                      data-ocid="auth.modal.signin.error_state"
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
                  data-ocid="auth.modal.signin.submit_button"
                >
                  {signInLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />{" "}
                      Signing in...
                    </>
                  ) : (
                    "Sign In & Watch"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
