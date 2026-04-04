import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createElement } from "react";
import type { ReactNode } from "react";
import { createActorWithConfig } from "../config";

const SESSION_TOKEN_KEY = "nn_session_token";
const USERNAME_KEY = "nn_username";

async function sha256Hex(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface AuthState {
  isLoggedIn: boolean;
  username: string | null;
  sessionToken: string | null;
  isLoading: boolean;
  login(
    username: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }>;
  signUp(
    username: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, validate stored session
  useEffect(() => {
    const storedToken = localStorage.getItem(SESSION_TOKEN_KEY);
    const storedUsername = localStorage.getItem(USERNAME_KEY);

    if (!storedToken || !storedUsername) {
      setIsLoading(false);
      return;
    }

    createActorWithConfig()
      .then((actor) => actor.validateSession(storedToken))
      .then((validUsername) => {
        if (validUsername) {
          setIsLoggedIn(true);
          setUsername(validUsername);
          setSessionToken(storedToken);
        } else {
          localStorage.removeItem(SESSION_TOKEN_KEY);
          localStorage.removeItem(USERNAME_KEY);
        }
      })
      .catch(() => {
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(USERNAME_KEY);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (uname: string, password: string) => {
    try {
      const hash = await sha256Hex(password);
      const actor = await createActorWithConfig();
      const token = await actor.login(uname, hash);
      if (!token) {
        return { success: false, error: "Invalid username or password" };
      }
      localStorage.setItem(SESSION_TOKEN_KEY, token);
      localStorage.setItem(USERNAME_KEY, uname);
      setIsLoggedIn(true);
      setUsername(uname);
      setSessionToken(token);
      return { success: true };
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Login failed. Please try again.";
      return { success: false, error: msg };
    }
  }, []);

  const signUp = useCallback(
    async (uname: string, password: string) => {
      try {
        const hash = await sha256Hex(password);
        const actor = await createActorWithConfig();
        const result = await actor.signUp(uname, hash);
        if ("err" in result) {
          return { success: false, error: result.err };
        }
        // Auto-login after successful signup
        const loginResult = await login(uname, password);
        return loginResult;
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Sign up failed. Please try again.";
        return { success: false, error: msg };
      }
    },
    [login],
  );

  const logout = useCallback(async () => {
    try {
      if (sessionToken) {
        const actor = await createActorWithConfig();
        await actor.logout(sessionToken);
      }
    } catch {
      // ignore errors on logout
    } finally {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(USERNAME_KEY);
      setIsLoggedIn(false);
      setUsername(null);
      setSessionToken(null);
    }
  }, [sessionToken]);

  const value: AuthState = {
    isLoggedIn,
    username,
    sessionToken,
    isLoading,
    login,
    signUp,
    logout,
  };

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
