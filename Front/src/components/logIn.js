import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { validateEmail } from "../utils/validation";
import { Field, PasswordInput } from "./FormField";

export default function LogIn() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { notify } = useToast();

  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const errors = {
    email: validateEmail(email),
    password: password ? "" : "Password is required",
  };
  const show = (name) => (touched[name] ? errors[name] : "");

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched({ email: true, password: true });
    setServerError("");
    if (errors.email || errors.password) return;

    setLoading(true);
    try {
      const response = await api.post("/login", { email: email.trim().toLowerCase(), password });
      login(response.data);
      notify(`Welcome back, ${response.data.userName}! 🎶`, "success");
      navigate(location.state?.from || "/home", { replace: true });
    } catch (error) {
      setServerError(errorMessage(error, "Login failed. Please try again."));
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <span className="auth-emoji">🎧</span>
          <h1>Welcome back</h1>
          <p>Log in to turn your recordings into sheet music</p>
        </div>

        {serverError && (
          <div className="alert alert-error" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Field id="email" label="Email" error={show("email")}>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="name@example.com"
              autoComplete="email"
              value={email}
              maxLength={254}
              aria-invalid={Boolean(show("email"))}
              aria-describedby={show("email") ? "email-error" : undefined}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            />
          </Field>

          <Field id="password" label="Password" error={show("password")}>
            <PasswordInput
              id="password"
              placeholder="Your password"
              autoComplete="current-password"
              value={password}
              maxLength={64}
              error={show("password")}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            />
          </Field>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <span className="spinner" aria-label="Logging in" /> : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          New to NoteMe? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
