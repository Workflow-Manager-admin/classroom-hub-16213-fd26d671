import React, { useEffect, useState } from "react";
import "./App.css";
import { SessionProvider, useSession, generateUUID, parseInviteLink, SessionData } from "./session";

// PUBLIC_INTERFACE
// Basic session join form for new flow: enter nickname & class code, or via invite link
const JoinClassroom: React.FC = () => {
  const { setSession } = useSession();
  const [nickname, setNickname] = useState("");
  const [classroomInput, setClassroomInput] = useState(""); // can be code or invite
  const [error, setError] = useState<string | null>(null);

  // On first load, try to pre-fill class code from URL (invite link: ?class=CODE or /join/CODE)
  useEffect(() => {
    // Try to parse invite link query param (?class=CODE)
    const params = new URLSearchParams(window.location.search);
    let code = params.get("class");
    if (!code) {
      // Check path: e.g., /join/CODE
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

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !classroomInput.trim()) {
      setError("Enter both your nickname and a classroom code or invite link.");
      return;
    }
    const codeParsed = parseInviteLink(classroomInput.trim());
    if (!codeParsed) {
      setError("Classroom code or invite link is not valid (6 alphanumeric).");
      return;
    }
    setError(null);
    // Generate temporary user ID
    const session: SessionData = {
      nickname: nickname.trim(),
      classCode: codeParsed,
      userId: generateUUID(),
    };
    setSession(session);
  };

  return (
    <main>
      <div className="container">
        <div className="hero">
          <div className="subtitle">Jump into a classroom instantly!</div>
          <h1 className="title">Classroom Insider</h1>
          <div className="description">
            Join a classroom by entering a 6-digit code, paste an invite link, or pick your nickname.<br/>
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
// Minimal placeholder for "dashboard"/classroom session after join (replace with full feature later)
const ClassroomSession: React.FC = () => {
  const { session, clearSession } = useSession();
  if (!session) return null;
  const { nickname, classCode } = session;

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div className="logo">
              <span className="logo-symbol">*</span> Classroom Insider
            </div>
            <button className="btn" onClick={clearSession} style={{ minWidth: 120 }}>
              Leave Session
            </button>
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
              (Here will be the chat, bulletin board, notebook, and group projects.)
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// PUBLIC_INTERFACE
// Root App manages session state, via SessionProvider/context/localStorage
const App: React.FC = () => {
  // Use SessionProvider at top; useSession for state
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
