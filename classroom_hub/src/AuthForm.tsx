import React, { useState } from "react";
import { useAuth } from "./AuthContext";

/**
 * A single UI component for Login/Register functionality.
 * Features:
 *  - Toggle between Login and Register mode.
 *  - Playful, informal, student-friendly design and copy.
 *  - Form validation, error display.
 *  - Integrates with AuthContext (signUp, logIn).
 */
// PUBLIC_INTERFACE
export const AuthForm: React.FC = () => {
  const { signUp, logIn } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPwd, setRepeatPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form validation
  const validateFields = () => {
    if (!email.includes("@") || email.length < 4) {
      return "Oops! Please enter a valid email.";
    }
    if (password.length < 6) {
      return "Password needs to be at least 6 characters.";
    }
    if (mode === "register" && password !== repeatPwd) {
      return "Passwords don't match! Try again.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationErr = validateFields();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setLoading(true);

    if (mode === "login") {
      try {
        await logIn(email, password);
        // Do not show UI notification here; parent/route should handle
      } catch (err: any) {
        setError(
          err?.message ??
            "Couldn't log you in! Double check your email and password."
        );
      }
    } else {
      // Register mode
      try {
        await signUp(email, password);
      } catch (err: any) {
        if (
          typeof err.message === "string" &&
          err.message.toLowerCase().includes("already")
        ) {
          setError("Looks like you already have an account! Try logging in.");
        } else {
          setError(
            err?.message ??
              "Couldn't sign you up! Is your email correct? Is this email already used?"
          );
        }
      }
    }
    setLoading(false);
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError(null);
    setPassword("");
    setRepeatPwd("");
  };

  // Styling: Use CSS classes instead of inline styles for playful/authentication look
  return (
    <div className="auth-bg">
      <form className="auth-card" onSubmit={handleSubmit} autoComplete="off">
        <div className="auth-header">
          <span className="auth-icon">🎓</span>
          <h2 className="auth-title">
            {mode === "login" ? "Welcome Back!" : "Create Your Account"}
          </h2>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Ready for another adventure? Log in below!"
              : "Let's get you all set for a stellar classroom experience!"}
          </p>
        </div>

        <label className="auth-label">
          Email
          <input
            className="auth-input"
            type="email"
            placeholder="you@school.edu"
            value={email}
            autoComplete="username"
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </label>

        <label className="auth-label">
          Password
          <input
            className="auth-input"
            type="password"
            placeholder={mode === "login" ? "Your super-secret password" : "Pick a strong one!"}
            value={password}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </label>

        {mode === "register" && (
          <label className="auth-label">
            Repeat Password
            <input
              className="auth-input"
              type="password"
              placeholder="Just to be sure..."
              value={repeatPwd}
              autoComplete="new-password"
              onChange={(e) => setRepeatPwd(e.target.value)}
              disabled={loading}
              required
            />
          </label>
        )}

        {error && (
          <div className="auth-error-box" role="alert">
            {error}
          </div>
        )}

        <button className="auth-btn btn btn-large" type="submit" disabled={loading}>
          {loading
            ? mode === "login"
              ? "Logging in..."
              : "Registering..."
            : mode === "login"
            ? "Log Me In!"
            : "Sign Me Up!"}
        </button>

        {/* Toggle login/register */}
        <div className="auth-toggle-row">
          {mode === "login" ? (
            <>
              <span>No account?</span>
              <button
                type="button"
                className="auth-toggle-btn"
                onClick={toggleMode}
                disabled={loading}
              >
                Register
              </button>
            </>
          ) : (
            <>
              <span>Already joined?</span>
              <button
                type="button"
                className="auth-toggle-btn"
                onClick={toggleMode}
                disabled={loading}
              >
                Log In
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

// Styles: Playful, rounded, informal, uses bright theme and CSS variables for colors
const styles: { [key: string]: React.CSSProperties } = {
  bg: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #4F8CFF 0%, #FFE066 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    background: "rgba(255,255,255, 0.98)",
    borderRadius: "22px",
    boxShadow: "0 6px 32px 4px rgba(79,140,255,0.13)",
    padding: "36px 32px 20px",
    maxWidth: 390,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  header: {
    textAlign: "center" as const,
    marginBottom: 8
  },
  icon: {
    fontSize: 48,
    marginBottom: 6
  },
  title: {
    margin: "0 0 2px 0",
    color: "#4F8CFF",
    fontWeight: 800,
    fontSize: "2rem",
    letterSpacing: ".03em"
  },
  subtitle: {
    color: "#FF6F61",
    margin: 0,
    fontWeight: 500,
    fontSize: "1.05rem"
  },
  label: {
    fontWeight: 600,
    marginBottom: 3,
    color: "#3b3b3b",
    fontSize: ".98rem",
    display: "flex",
    flexDirection: "column",
    gap: 2
  },
  input: {
    marginTop: 2,
    marginBottom: 6,
    borderRadius: 8,
    border: "1.5px solid #4F8CFF",
    padding: "11px 10px",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.18s",
    fontWeight: 500
  },
  button: {
    marginTop: 3,
    marginBottom: 8,
    backgroundColor: "#4F8CFF",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "1.07rem",
    padding: "10px 0",
    cursor: "pointer",
    boxShadow: "0 2px 10px 0 #4F8CFF33"
  },
  toggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    fontSize: ".97rem",
    marginTop: 5
  },
  toggleBtn: {
    background: "none",
    color: "#FF6F61",
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "underline",
    outline: "none",
    padding: 0
  },
  errorBox: {
    color: "#fff",
    backgroundColor: "#FF6F61",
    borderRadius: "7px",
    padding: "10px 15px",
    fontWeight: 600,
    margin: "5px 0"
  }
};

export default AuthForm;
