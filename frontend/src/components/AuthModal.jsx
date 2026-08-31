import { useState } from "react";
import { login, register } from "../services/api";

export function AuthModal({ onClose, onAuth }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(""); // Added phone state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data =
        mode === "login"
          ? await login(email, password)
          : // Pass phone to the register function
            await register(name, email, password, phone);
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-layer" onMouseDown={onClose}>
      <div className="auth-card" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <div className="auth-icon">✦</div>
        <h2>
          {mode === "login" ? "Welcome back" : "Create your WeatherGPT account"}
        </h2>
        <p>
          {mode === "login"
            ? "Sign in to use live AI weather chat and history."
            : "Sign up to access AI features and receive emergency SMS weather alerts."}
        </p>
        <form onSubmit={submit}>
          {mode === "register" && (
            <>
              <input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number (e.g., +919876543210)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <div className="form-error">{error}</div>}
          <button className="primary-btn" disabled={loading}>
            {loading
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
        <button
          className="switch-auth"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login"
            ? "Don't have an account? Create one"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
