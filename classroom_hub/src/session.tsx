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

// Generate RFC4122 (v4) UUID (not cryptographically secure, but sufficient for temp user)
function generateUUID(): string {
  // https://stackoverflow.com/a/2117523
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Validate 6-character alphanumeric code
function parseInviteLink(input: string): string | null {
  // Accept full invite links like https://<site>/join/A1B2C3 or ?class=A1B2C3 or A1B2C3 alone
  const match = input.match(/([A-Z0-9]{6})/i);
  return match ? match[1].toUpperCase() : null;
}

// PUBLIC_INTERFACE
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionRaw] = useState<SessionData | null>(() => {
    // Try to load from localStorage/sessionStorage
    if (typeof window === 'undefined') return null;
    let sessionStr = window.localStorage.getItem(SESSION_KEY) ||
                     window.sessionStorage.getItem(SESSION_KEY);
    if (sessionStr) {
      try {
        const parsed = JSON.parse(sessionStr);
        if (parsed.nickname && parsed.classCode && parsed.userId) {
          return parsed as SessionData;
        }
      } catch {
        // Ignore parse errors; fallback to null
      }
    }
    return null;
  });

  // PUBLIC_INTERFACE
  function setSession(s: SessionData | null) {
    setSessionRaw(s);
    if (s) {
      try {
        const json = JSON.stringify(s);
        window.localStorage.setItem(SESSION_KEY, json);
        window.sessionStorage.setItem(SESSION_KEY, json);
      } catch {}
    } else {
      window.localStorage.removeItem(SESSION_KEY);
      window.sessionStorage.removeItem(SESSION_KEY);
    }
  }

  // PUBLIC_INTERFACE
  function clearSession() {
    setSession(null);
  }

  // Keep storage in sync if session changes
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
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}

export { generateUUID, parseInviteLink };
