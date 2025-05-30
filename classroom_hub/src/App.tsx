import React, { useEffect, useState } from "react";
import "./App.css";
import { SessionProvider, useSession, generateUUID, parseInviteLink, SessionData } from "./session";

// PUBLIC_INTERFACE
// Form for joining a classroom: persist nickname, temp user id between reloads, and UX edge cases
const JoinClassroom: React.FC = () => {
  const { setSession } = useSession();
  const [nickname, setNickname] = useState(() =>
    (typeof window !== "undefined" && window.localStorage.getItem("nickname")) || ""
  );
  const [classroomInput, setClassroomInput] = useState(""); // can be code or invite
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pre-fill class code from URL (?class=CODE or /join/CODE)
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    let code = params.get("class");
    if (!code) {
      const path = window.location.pathname;
      const pathMatch = path.match(/\/join\/([A-Z0-9]{6})/i);
      if (pathMatch) {
        code = pathMatch[1];
      }
    }
    if (code && /^[A-Z0-9]{6}$/i.test(code)) {
      setClassroomInput(code.toUpperCase());
    }
  }, []);

  // Save nickname persistently on edit
  useEffect(() => {
    if (nickname) {
      window.localStorage.setItem("nickname", nickname);
    }
  }, [nickname]);

  // PUBLIC_INTERFACE
  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const trimmedNick = nickname.trim();
    const trimmedInput = classroomInput.trim();
    if (trimmedNick.length < 2) {
      setError("Nickname must be at least 2 characters.");
      return;
    }
    if (!trimmedInput) {
      setError("Please enter a classroom code or invite link.");
      return;
    }
    // Defensive: parse for valid classCode
    const codeParsed = parseInviteLink(trimmedInput);
    if (!codeParsed) {
      setError("Classroom code or invite link is not valid (6 alphanumeric).");
      return;
    }
    setError(null);
    // Attempt to persist existing temp user id (for repeat browser joins)
    let tempUserId = window.localStorage.getItem("tempUserId");
    if (!tempUserId || typeof tempUserId !== "string" || tempUserId.length < 8) {
      tempUserId = generateUUID();
      window.localStorage.setItem("tempUserId", tempUserId);
    }
    const session: SessionData = {
      nickname: trimmedNick,
      classCode: codeParsed,
      userId: tempUserId,
    };
    setSession(session);
  }

  // UX: clear error on input change
  useEffect(() => {
    setError(null);
    // eslint-disable-next-line
  }, [nickname, classroomInput]);

  return (
    <main>
      <div className="container">
        <div className="hero">
          <div className="subtitle">Jump into a classroom instantly!</div>
          <h1 className="title">Classroom Insider</h1>
          <div className="description">
            Join a classroom by entering a 6-digit code, paste an invite link, or pick your nickname.<br />
            Example code: <b>A1B2C3</b> &nbsp;or link: <i>https://site.com/join/A1B2C3</i>
          </div>
          <form
            style={{
              maxWidth: 375,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
            onSubmit={handleJoin}
            autoComplete="off"
          >
            <label>
              Nickname
              <input
                type="text"
                placeholder="Choose your nickname"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                minLength={2}
                maxLength={20}
                style={{ width: "100%", borderRadius: 6, padding: 9, marginTop: 3 }}
                required
                autoFocus
                data-testid="nickname-input"
                autoComplete="nickname"
              />
            </label>
            <label>
              Classroom Code or Invite Link
              <input
                type="text"
                value={classroomInput}
                placeholder="E.g. A1B2C3 or paste invite link"
                onChange={e => setClassroomInput(e.target.value)}
                maxLength={60}
                style={{
                  width: "100%",
                  borderRadius: 6,
                  padding: 9,
                  marginTop: 3,
                  letterSpacing: 2,
                }}
                required
                data-testid="classcode-input"
                autoComplete="off"
              />
            </label>
            {error && (
              <div
                style={{
                  color: "#FF6F61",
                  background: "#FFE4E1",
                  borderRadius: 6,
                  padding: 7,
                  margin: "6px 0",
                  fontWeight: 500,
                }}
                data-testid="error-msg"
                aria-live="polite"
              >
                {error}
              </div>
            )}
            <button className="btn btn-large" style={{ marginTop: 8 }} type="submit">
              Join Classroom
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

// PUBLIC_INTERFACE
// Main classroom after join: shows active session, allows leaving session, and displays active user identity
const ClassroomSession: React.FC = () => {
  const { session, clearSession } = useSession();

  // Always run the hook at the top level!
  useEffect(() => {
    if (session) {
      if (session.nickname) {
        window.localStorage.setItem("nickname", session.nickname);
      }
      if (session.userId) {
        window.localStorage.setItem("tempUserId", session.userId);
      }
    }
  }, [session]);

  if (!session) return null;
  const { nickname, classCode, userId } = session;

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div className="logo">
              <span className="logo-symbol">*</span> Classroom Insider
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                fontSize: "1rem",
                fontWeight: 500,
                color: "#fff",
                background: "#4F8CFF",
                padding: "4px 14px",
                borderRadius: 16,
                letterSpacing: 1,
              }}>
                {nickname}
              </div>
              <button className="btn" onClick={clearSession} style={{ minWidth: 120 }}>
                Leave Session
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <div className="container">
          <div className="hero">
            <div className="subtitle">
              Welcome, <span style={{ color: "#4F8CFF" }}>{nickname}</span>!
            </div>
            <h1 className="title">Classroom: {classCode}</h1>
            <div className="description">
              <b>This is your session classroom! 🎉</b>
              <br />
              Your Anonymous ID (per browser): <span style={{
                color: "#999", background: "#222", fontSize: "0.96em", borderRadius: 4, padding: "2px 8px", marginLeft: 3
              }}>{userId?.slice(0, 8) + "…"}</span>
              <br /><br />
              (Here will be the chat, bulletin board, notebook, and group projects.)
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// PUBLIC_INTERFACE
// Root App manages session state: all logic is via SessionProvider/context, no authentication logic
const App: React.FC = () => {
  return (
    <SessionProvider>
      <AppInner />
    </SessionProvider>
  );
};

const AppInner: React.FC = () => {
  const { session } = useSession();
  return session ? <ClassroomSession /> : <JoinClassroom />;
};

export default App;
