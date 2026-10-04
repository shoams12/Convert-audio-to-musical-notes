import { useState } from "react";
import { PASSWORD_RULES, passwordStrength } from "../utils/validation";

export function Field({ id, label, error, hint, children }) {
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : (
        hint && <p className="field-hint">{hint}</p>
      )}
    </div>
  );
}

export function PasswordInput({ id, error, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-wrap">
      <input
        id={id}
        type={visible ? "text" : "password"}
        className="input"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        title={visible ? "Hide password" : "Show password"}
      >
        {visible ? "🙈" : "👁️"}
      </button>
    </div>
  );
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];

export function PasswordStrength({ password }) {
  const score = passwordStrength(password);
  return (
    <div className="strength" aria-live="polite">
      <div className={`strength-bar strength-${score}`}>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={i <= score ? "filled" : ""} />
        ))}
      </div>
      {score > 0 && <span className={`strength-label strength-text-${score}`}>{STRENGTH_LABELS[score]}</span>}
      <ul className="rules">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li key={rule.id} className={ok ? "ok" : ""}>
              <span aria-hidden="true">{ok ? "✓" : "○"}</span> {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
