import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api";
import { useToast } from "../context/ToastContext";
import { LIMITS, validateEmail, validatePassword, validateUsername } from "../utils/validation";
import { Field, PasswordInput, PasswordStrength } from "./FormField";

export default function SignUp() {
  const navigate = useNavigate();
  const { notify } = useToast();

  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const errors = {
    username: validateUsername(form.username),
    email: validateEmail(form.email),
    password: validatePassword(form.password, { username: form.username, email: form.email }),
    confirm: !form.confirm ? "Please confirm your password" : form.confirm !== form.password ? "Passwords don't match" : "",
  };
  const show = (name) => (touched[name] ? errors[name] : "");
  const isValid = Object.values(errors).every((e) => !e);

  const update = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
  const blur = (name) => () => setTouched((t) => ({ ...t, [name]: true }));

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched({ username: true, email: true, password: true, confirm: true });
    setServerError("");
    if (!isValid) return;

    setLoading(true);
    const email = form.email.trim().toLowerCase();
    try {
      await api.post("/add_user", { userName: form.username.trim(), email, password: form.password });
      notify("Account created! Log in to get started 🎉", "success");
      navigate("/login", { state: { email } });
    } catch (error) {
      setServerError(errorMessage(error, "Sign up failed. Please try again."));
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <span className="auth-emoji">🎹</span>
          <h1>Create your account</h1>
          <p>Start turning your music into notes</p>
        </div>

        {serverError && (
          <div className="alert alert-error" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Field
            id="username"
            label="Username"
            error={show("username")}
            hint={`${LIMITS.usernameMin}-${LIMITS.usernameMax} characters, starting with a letter`}
          >
            <input
              id="username"
              className="input"
              placeholder="e.g. Yael"
              autoComplete="username"
              value={form.username}
              maxLength={LIMITS.usernameMax}
              aria-invalid={Boolean(show("username"))}
              aria-describedby={show("username") ? "username-error" : undefined}
              onChange={update("username")}
              onBlur={blur("username")}
            />
          </Field>

          <Field id="email" label="Email" error={show("email")}>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="name@example.com"
              autoComplete="email"
              value={form.email}
              maxLength={254}
              aria-invalid={Boolean(show("email"))}
              aria-describedby={show("email") ? "email-error" : undefined}
              onChange={update("email")}
              onBlur={blur("email")}
            />
          </Field>

          <Field id="password" label="Password" error={show("password")}>
            <PasswordInput
              id="password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              value={form.password}
              maxLength={LIMITS.passwordMax}
              error={show("password")}
              onChange={update("password")}
              onBlur={blur("password")}
            />
            <PasswordStrength password={form.password} />
          </Field>

          <Field id="confirm" label="Confirm password" error={show("confirm")}>
            <PasswordInput
              id="confirm"
              placeholder="Type your password again"
              autoComplete="new-password"
              value={form.confirm}
              maxLength={LIMITS.passwordMax}
              error={show("confirm")}
              onChange={update("confirm")}
              onBlur={blur("confirm")}
              onPaste={(e) => e.preventDefault()}
            />
          </Field>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <span className="spinner" aria-label="Creating account" /> : "Sign up"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
