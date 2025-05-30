import React from "react";
import "./App.css";
import "./auth-styles.scss";
import { AuthProvider, useAuth } from "./AuthContext";
import AuthForm from "./AuthForm";

// Dashboard placeholder component for signed-in users
const Dashboard: React.FC = () => {
  const { currentUser, logOut } = useAuth();

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div className="logo">
              <span className="logo-symbol">*</span> Classroom Insider
            </div>
            <button className="btn" onClick={logOut} style={{ minWidth: 100 }}>
              Log Out
            </button>
          </div>
        </div>
      </nav>
      <main>
        <div className="container">
          <div className="hero">
            <div className="subtitle">
              Welcome, <span style={{ color: "#4F8CFF" }}>{currentUser?.email}</span>!
            </div>
            <h1 className="title">Dashboard</h1>
            <div className="description">
              You are signed in to <b>Classroom Insider</b> 🎉<br />
              (This is where your classrooms, chat, and group projects will show up.)
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  // Wrap with AuthProvider to access user state
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

// Extract UI logic for switching between auth and dashboard
const MainContent: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // User not logged in: show authentication form
    return <AuthForm />;
  }

  // User is signed in: show dashboard placeholder
  return <Dashboard />;
};

export default App;
