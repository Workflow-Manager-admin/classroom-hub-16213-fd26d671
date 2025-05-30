import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

// PUBLIC_INTERFACE
// Session context shape
export interface SessionData {
  nickname: string;
  classCode: string;
  userId: string;
}

interface SessionContextType {
  session: SessionData | null;
  setSession: (s: SessionData | null) => void;
  clearSession: () => void;
}

// PUBLIC_INTERFACE
const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_KEY = "classroomHubSession";

// PUBLIC_INTERFACE
/**
 * Generate RFC4122 (v4) UUID (not cryptographically secure, but sufficient for temp user)
 */
function generateUUID(): string {
  // https://stackoverflow.com/a/2117523
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// PUBLIC_INTERFACE
/**
 * Validate and extract a 6-character classroom code from any "code", invite link, or query param string.
 * Accepts:
 *   - A1B2C3
 *   - https://site.com/join/A1B2C3
 *   - ?class=A1B2C3
 */
function parseInviteLink(input: string): string | null {
  const match = input.match(/([A-Z0-9]{6})/i);
  return match ? match[1].toUpperCase() : null;
}

// PUBLIC_INTERFACE
/**
 * Provides session context and handles session persistence for join/classroom flows.
 * Ensures no Firebase/auth code leakage and only local/sessionStorage is used.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionRaw] = useState<SessionData | null>(() => {
    // Try to load from localStorage/sessionStorage (persistent, no external auth!).
    if (typeof window === 'undefined') return null;
    let sessionStr = window.localStorage.getItem(SESSION_KEY) ||
                     window.sessionStorage.getItem(SESSION_KEY);
    if (sessionStr) {
      try {
        const parsed = JSON.parse(sessionStr);
        // Defensive: fully validate structure
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          typeof parsed.nickname === "string" &&
          typeof parsed.classCode === "string" &&
          typeof parsed.userId === "string" &&
          parsed.nickname.length >= 2 &&
          /^[A-Z0-9]{6}$/i.test(parsed.classCode) &&
          parsed.userId.length >= 8 // check valid uuid shape
        ) {
          return parsed as SessionData;
        }
      } catch {
        // Ignore parse errors; fallback to null
      }
    }
    return null;
  });

  /**
   * Set session state and persist to localStorage/sessionStorage.
   * Defensive: validates object contents.
   */
  // PUBLIC_INTERFACE
  function setSession(s: SessionData | null) {
    setSessionRaw(s);
    if (s) {
      try {
        if (
          typeof s.nickname !== "string" ||
          s.nickname.length < 2 ||
          typeof s.classCode !== "string" ||
          !/^[A-Z0-9]{6}$/i.test(s.classCode) ||
          typeof s.userId !== "string" ||
          s.userId.length < 8
        ) {
          // Don't persist improperly shaped session - fail silently
          return;
        }
        const json = JSON.stringify(s);
        window.localStorage.setItem(SESSION_KEY, json);
        window.sessionStorage.setItem(SESSION_KEY, json);
      } catch {}
    } else {
      window.localStorage.removeItem(SESSION_KEY);
      window.sessionStorage.removeItem(SESSION_KEY);
    }
  }

  /**
   * Clear the user session, local/sessionStorage.
   */
  // PUBLIC_INTERFACE
  function clearSession() {
    setSession(null);
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
  }

  // Defensive: syncs storage if session changes
  useEffect(() => {
    if (session) {
      setSession(session);
    } else {
      window.localStorage.removeItem(SESSION_KEY);
      window.sessionStorage.removeItem(SESSION_KEY);
    }
    // eslint-disable-next-line
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, setSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
}

// PUBLIC_INTERFACE
/**
 * Access classroom session context. Must be inside SessionProvider. Throws if used outside.
 */
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}

// Only exporting what is required for join/session flows.
export { generateUUID, parseInviteLink };
