import { HttpAgent } from "@icp-sdk/core/agent";
import type { Identity } from "@icp-sdk/core/agent";
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { createActor } from "../backend";
import { loadConfig } from "../config";
import {
  InternetIdentityProvider,
  useInternetIdentity,
} from "./useInternetIdentity";

interface AuthState {
  isLoggedIn: boolean;
  username: string | null;
  isLoading: boolean;
  needsUsername: boolean;
  identity: Identity | undefined;
  login: () => void;
  logout: () => void;
  setUsername: (name: string) => void;
}

const AuthContext = createContext<AuthState | null>(null);

async function fetchUsernameForIdentity(
  identity: Identity,
): Promise<string | null> {
  try {
    const config = await loadConfig();
    const agent = new HttpAgent({ host: config.backend_host, identity });
    const actor = createActor(config.backend_canister_id, { agent });
    return await actor.getUsernameByPrincipal();
  } catch {
    return null;
  }
}

function AuthStateProvider({ children }: { children: ReactNode }) {
  const { identity, login, clear, isInitializing } = useInternetIdentity();

  const [username, setUsernameState] = useState<string | null>(null);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const lastCheckedIdentity = useRef<Identity | undefined>(undefined);

  // When identity changes, fetch the username from backend
  useEffect(() => {
    if (!identity) {
      setUsernameState(null);
      lastCheckedIdentity.current = undefined;
      return;
    }

    // Avoid re-fetching for the same identity
    if (lastCheckedIdentity.current === identity) {
      return;
    }

    lastCheckedIdentity.current = identity;
    setUsernameLoading(true);

    fetchUsernameForIdentity(identity)
      .then((name) => {
        setUsernameState(name);
      })
      .finally(() => {
        setUsernameLoading(false);
      });
  }, [identity]);

  const logout = useCallback(() => {
    setUsernameState(null);
    lastCheckedIdentity.current = undefined;
    clear();
  }, [clear]);

  const setUsername = useCallback((name: string) => {
    setUsernameState(name);
  }, []);

  const hasIdentity = !!identity;
  const isLoading = isInitializing || (hasIdentity && usernameLoading);
  const isLoggedIn = hasIdentity && !usernameLoading && !!username;
  const needsUsername = hasIdentity && !usernameLoading && !username;

  const value: AuthState = {
    isLoggedIn,
    username,
    isLoading,
    needsUsername,
    identity,
    login,
    logout,
    setUsername,
  };

  return createElement(AuthContext.Provider, { value }, children);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return createElement(
    InternetIdentityProvider,
    null,
    createElement(AuthStateProvider, null, children),
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
