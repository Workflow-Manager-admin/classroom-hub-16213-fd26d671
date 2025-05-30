import React, { useState } from "react";
import "./App.css";

// PUBLIC_INTERFACE
// Basic session join form for new flow: enter nickname & class code
const JoinClassroom: React.FC<{ onJoin: (nickname: string, code: string) => void }> = ({
  onJoin,
}) => {
  const [nickname, setNickname] = useState("");
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !classCode.trim()) {
      setError("Enter both your nickname and a classroom code.");
      return;
    }
    if (!/^[a-zA-Z0-9]{6}$/.test(classCode)) {
      setError("Classroom code must be 6 alphanumeric characters.");
      return;
    }
    setError(null);
    onJoin(nickname.trim(), classCode.trim());
  };

  return (
    <main>
      <div className="container">
        <div className="hero">
          <div className="subtitle">Jump into a classroom instantly!</div>
          <h1 className="title">Classroom Insider</h1>
          <div className="description">
            Join a classroom by entering a 6-digit code and pick your nickname.
          </div>
          <form style={{ maxWidth: 350, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }} onSubmit={handleJoin}>
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
              />
            </label>
            <label>
              Classroom Code
              <input
                type="text"
                value={classCode}
                placeholder="E.g. A1B2C3"
                onChange={e => setClassCode(e.target.value.toUpperCase())}
                maxLength={6}
                style={{ width: "100%", borderRadius: 6, padding: 9, marginTop: 3, letterSpacing: 2 }}
                required
              />
            </label>
            {error && (
              <div style={{ color: "#FF6F61", background: "#FFE4E1", borderRadius: 6, padding: 7, margin: "6px 0", fontWeight: 500 }}>{error}</div>
            )}
            <button className="btn btn-large" style={{ marginTop: 8 }} type="submit">Join Classroom</button>
          </form>
        </div>
      </div>
    </main>
  );
};

// PUBLIC_INTERFACE
// Minimal placeholder for "dashboard"/classroom session after join (replace with full feature later)
const ClassroomSession: React.FC<{ nickname: string; classCode: string; onLeave: () => void }> = ({
  nickname,
  classCode,
  onLeave,
}) => (
  <div className="app">
    <nav className="navbar">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <div className="logo">
            <span className="logo-symbol">*</span> Classroom Insider
          </div>
          <button className="btn" onClick={onLeave} style={{ minWidth: 120 }}>
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

// PUBLIC_INTERFACE
// Root App manages session state (no authentication)
const App: React.FC = () => {
  const [session, setSession] = useState<{ nickname: string; classCode: string } | null>(null);

  return session ? (
    <ClassroomSession
      nickname={session.nickname}
      classCode={session.classCode}
      onLeave={() => setSession(null)}
    />
  ) : (
    <JoinClassroom onJoin={(nickname, classCode) => setSession({ nickname, classCode })} />
  );
};

export default App;
