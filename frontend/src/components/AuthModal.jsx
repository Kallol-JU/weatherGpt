import { useEffect, useRef, useState } from "react";
import { CloudSun, X } from "lucide-react";
import { login, register } from "../services/api";
import { useDialog } from "../hooks/useDialog";
import Stepper, { Step } from "./Stepper";
import "./AuthModal.css";

const SECTORS = [
  {
    value: "Urban & General",
    label: "Urban & General (Commuter, office, student)",
  },
  { value: "Agriculture", label: "Agriculture & Farming" },
  { value: "Fisheries & Maritime", label: "Fisheries & Maritime" },
  {
    value: "Construction & Labor",
    label: "Construction & Outdoor Labor",
  },
  { value: "Logistics & Transport", label: "Logistics & Transport" },
  { value: "Public Safety", label: "Public Safety & Relief Work" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STEPPER_TOKENS = {
  "--stepper-ink": "var(--ink)",
  "--stepper-muted": "var(--ink-muted)",
  "--stepper-faint": "color-mix(in srgb, var(--ink) 22%, transparent)",
  "--stepper-well": "color-mix(in srgb, var(--ink) 6%, transparent)",
  "--stepper-track": "color-mix(in srgb, var(--ink) 12%, transparent)",
  "--stepper-tile": "var(--surface-2)",
  "--stepper-tile-edge": "var(--rule)",
  "--stepper-tile-highlight": "transparent",
  "--stepper-tile-shadow": "none",
  "--stepper-hover-fill": "color-mix(in srgb, var(--ink) 4%, transparent)",
  "--stepper-ring": "var(--focus)",
};

function isValidEmail(value) {
  return EMAIL_RE.test(value.trim());
}

function isValidPhone(value) {
  return /^\+?\d{7,15}$/.test(value.trim().replace(/[\s-]/g, ""));
}

function friendlyError(message) {
  if (!message) return "Something went wrong. Please try again.";
  if (/already exists/i.test(message)) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (/invalid credentials/i.test(message)) {
    return "Email or password is incorrect.";
  }
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(message)) {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  return message;
}

function firstErrorField(errorMap) {
  return Object.keys(errorMap).find((key) => key !== "form");
}

export function AuthModal({ onClose, onAuth, dark = true }) {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sector, setSector] = useState("Urban & General");
  const [customDomain, setCustomDomain] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const dialogRef = useRef(null);
  const fieldRefs = useRef({});
  const pendingFocusRef = useRef(null);
  const aliveRef = useRef(true);

  useDialog(true, onClose, dialogRef);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (mode === "login") {
        fieldRefs.current.email?.focus();
        return;
      }

      const pending = pendingFocusRef.current;
      pendingFocusRef.current = null;

      if (pending) {
        fieldRefs.current[pending]?.focus();
        return;
      }

      const firstField = step === 1 ? "name" : step === 2 ? "sector" : "email";
      fieldRefs.current[firstField]?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [mode, step]);

  function resetCardScroll() {
    const card = dialogRef.current;
    if (!card) return;
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    card.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  function clearError(field) {
    setErrors((previous) => {
      if (!previous[field] && !previous.form) return previous;
      const next = { ...previous };
      delete next[field];
      delete next.form;
      return next;
    });
  }

  function stepErrors(stepNumber) {
    const found = {};

    if (stepNumber === 1) {
      const cleanName = name.trim();
      if (cleanName.length < 2) {
        found.name = "Enter your full name.";
      } else if (cleanName.length > 80) {
        found.name = "Keep your name under 80 characters.";
      }

      if (!phone.trim()) {
        found.phone = "Enter your phone number.";
      } else if (!isValidPhone(phone)) {
        found.phone = "Enter a valid phone number (7-15 digits).";
      }
    }

    if (stepNumber === 2) {
      if (!SECTORS.some((entry) => entry.value === sector)) {
        found.sector = "Choose a sector.";
      }
      if (customDomain.trim().length > 50) {
        found.customDomain = "Keep this under 50 characters.";
      }
    }

    if (stepNumber === 3) {
      if (!isValidEmail(email)) {
        found.email = "Enter a valid email address.";
      }
      if (password.length < 6) {
        found.password = "Use at least 6 characters.";
      }
      if (!confirmPassword) {
        found.confirmPassword = "Confirm your password.";
      } else if (confirmPassword !== password) {
        found.confirmPassword = "Passwords do not match.";
      }
    }

    return found;
  }

  function focusField(field) {
    if (!field) return;
    requestAnimationFrame(() => {
      fieldRefs.current[field]?.focus();
    });
  }

  function showErrors(errorMap) {
    setErrors(errorMap);
    focusField(firstErrorField(errorMap));
  }

  function goToStep(next) {
    if (next < 1 || next > 3 || next === step) return;
    setErrors({});
    pendingFocusRef.current = null;
    setStep(next);
    resetCardScroll();
  }

  function handleStepNext(event) {
    if (loading) {
      event.preventDefault();
      return;
    }

    const found = stepErrors(step);
    if (Object.keys(found).length > 0) {
      event.preventDefault();
      showErrors(found);
    }
  }

  function handleRegisterSubmit(event) {
    event.preventDefault();
    if (loading) return;

    const found = stepErrors(step);
    if (Object.keys(found).length > 0) {
      showErrors(found);
      return;
    }

    if (step < 3) {
      goToStep(step + 1);
      return;
    }

    submitRegistration();
  }

  function handleRegisterKeyDown(event) {
    if (event.key !== "Enter") return;
    if (event.target.tagName === "BUTTON" || event.target.tagName === "TEXTAREA") {
      return;
    }
    event.preventDefault();
    handleRegisterSubmit(event);
  }

  async function submitRegistration() {
    if (loading) return;

    const allErrors = {
      ...stepErrors(1),
      ...stepErrors(2),
      ...stepErrors(3),
    };

    if (Object.keys(allErrors).length > 0) {
      const targetStep =
        allErrors.name || allErrors.phone
          ? 1
          : allErrors.sector || allErrors.customDomain
            ? 2
            : 3;

      if (targetStep === step) {
        showErrors(allErrors);
      } else {
        pendingFocusRef.current = firstErrorField(allErrors);
        setErrors(allErrors);
        setStep(targetStep);
        resetCardScroll();
      }
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const data = await register(
        name.trim(),
        email.trim(),
        password,
        phone.trim(),
        sector,
        customDomain.trim(),
      );
      if (!aliveRef.current) return;
      onAuth(data);
    } catch (err) {
      if (!aliveRef.current) return;
      setErrors({ form: friendlyError(err.message) });
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }

  async function submitLogin(event) {
    event.preventDefault();
    if (loading) return;

    const found = {};
    if (!isValidEmail(email)) found.email = "Enter a valid email address.";
    if (!password) found.password = "Enter your password.";

    if (Object.keys(found).length > 0) {
      showErrors(found);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const data = await login(email.trim(), password);
      if (!aliveRef.current) return;
      onAuth(data);
    } catch (err) {
      if (!aliveRef.current) return;
      setErrors({ form: friendlyError(err.message) });
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }

  function switchMode(nextMode) {
    if (loading || nextMode === mode) return;

    setMode(nextMode);
    setStep(1);
    setErrors({});
    setPassword("");
    setConfirmPassword("");
    pendingFocusRef.current = null;
    resetCardScroll();
  }

  const isLogin = mode === "login";

  return (
    <div className="modal-layer" onMouseDown={onClose}>
      <div
        className={`auth-card ${isLogin ? "auth-card--login" : "auth-card--register"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        ref={dialogRef}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <header className="auth-head">
          <span className="auth-mark" aria-hidden="true">
            <CloudSun size={17} />
          </span>
          <div className="auth-head__copy">
            <h2 id="auth-title">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p>
              {isLogin
                ? "Sign in to keep your history and alerts in sync."
                : "Three short steps. You can go back at any time."}
            </p>
          </div>
        </header>

        {isLogin ? (
          <form className="auth-form auth-form--login" onSubmit={submitLogin} noValidate>
            {errors.form && (
              <p className="auth-alert" role="alert">
                {errors.form}
              </p>
            )}

            <div className="auth-fields">
              <div className={`auth-field ${errors.email ? "has-error" : ""}`}>
                <label htmlFor="auth-email">Email</label>
                <input
                  id="auth-email"
                  ref={(element) => {
                    fieldRefs.current.email = element;
                  }}
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearError("email");
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={254}
                  required
                  disabled={loading}
                  aria-invalid={errors.email ? "true" : undefined}
                  aria-describedby={errors.email ? "auth-email-error" : undefined}
                />
                {errors.email && (
                  <p className="auth-field-error" id="auth-email-error">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className={`auth-field ${errors.password ? "has-error" : ""}`}>
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  ref={(element) => {
                    fieldRefs.current.password = element;
                  }}
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearError("password");
                  }}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  aria-invalid={errors.password ? "true" : undefined}
                  aria-describedby={
                    errors.password ? "auth-password-error" : undefined
                  }
                />
                {errors.password && (
                  <p className="auth-field-error" id="auth-password-error">
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : (
          <form
            className="auth-form"
            onSubmit={handleRegisterSubmit}
            onKeyDown={handleRegisterKeyDown}
            noValidate
          >
            <Stepper
              step={step}
              onStepChange={goToStep}
              onFinalStepCompleted={submitRegistration}
              indicator="numbers"
              orientation="horizontal"
              transition="slide"
              linear
              disableStepIndicators
              frame={false}
              width="100%"
              radius={12}
              theme={dark ? "dark" : "light"}
              accentColor="#2377ff"
              style={STEPPER_TOKENS}
              className="auth-stepper"
              backButtonText="Back"
              nextButtonText="Continue"
              completeButtonText={
                loading ? "Creating account…" : "Create account"
              }
              nextButtonProps={{
                disabled: loading,
                onClick: handleStepNext,
              }}
              backButtonProps={{ disabled: loading }}
            >
              <Step title="Profile">
                <div className="auth-step">
                  <h3>Your details</h3>
                  <p>We use this for your account and SMS alerts.</p>

                  <div className="auth-fields">
                    <div
                      className={`auth-field ${errors.name ? "has-error" : ""}`}
                    >
                      <label htmlFor="auth-name">Full name</label>
                      <input
                        id="auth-name"
                        ref={(element) => {
                          fieldRefs.current.name = element;
                        }}
                        className="form-input"
                        type="text"
                        value={name}
                        onChange={(event) => {
                          setName(event.target.value);
                          clearError("name");
                        }}
                        placeholder="e.g. Ananya Sen"
                        autoComplete="name"
                        maxLength={80}
                        required
                        disabled={loading}
                        aria-invalid={errors.name ? "true" : undefined}
                        aria-describedby={
                          errors.name ? "auth-name-error" : undefined
                        }
                      />
                      {errors.name && (
                        <p className="auth-field-error" id="auth-name-error">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div
                      className={`auth-field ${errors.phone ? "has-error" : ""}`}
                    >
                      <label htmlFor="auth-phone">Phone number</label>
                      <input
                        id="auth-phone"
                        ref={(element) => {
                          fieldRefs.current.phone = element;
                        }}
                        className="form-input"
                        type="tel"
                        value={phone}
                        onChange={(event) => {
                          setPhone(event.target.value);
                          clearError("phone");
                        }}
                        placeholder="+91 98765 43210"
                        autoComplete="tel"
                        inputMode="tel"
                        maxLength={20}
                        required
                        disabled={loading}
                        aria-invalid={errors.phone ? "true" : undefined}
                        aria-describedby={
                          errors.phone
                            ? "auth-phone-error"
                            : "auth-phone-hint"
                        }
                      />
                      {!errors.phone && (
                        <p className="auth-hint" id="auth-phone-hint">
                          Used for SMS hazard alerts.
                        </p>
                      )}
                      {errors.phone && (
                        <p className="auth-field-error" id="auth-phone-error">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Step>

              <Step title="Work">
                <div className="auth-step">
                  <h3>Your work</h3>
                  <p>This tunes advisories to your sector.</p>

                  <div className="auth-fields">
                    <div className="auth-field">
                      <label htmlFor="auth-sector">Sector</label>
                      <select
                        id="auth-sector"
                        ref={(element) => {
                          fieldRefs.current.sector = element;
                        }}
                        className="form-select"
                        value={sector}
                        onChange={(event) => {
                          setSector(event.target.value);
                          clearError("sector");
                        }}
                        disabled={loading}
                        aria-invalid={errors.sector ? "true" : undefined}
                        aria-describedby={
                          errors.sector ? "auth-sector-error" : undefined
                        }
                      >
                        {SECTORS.map((entry) => (
                          <option key={entry.value} value={entry.value}>
                            {entry.label}
                          </option>
                        ))}
                      </select>
                      {errors.sector && (
                        <p className="auth-field-error" id="auth-sector-error">
                          {errors.sector}
                        </p>
                      )}
                    </div>

                    <div
                      className={`auth-field ${errors.customDomain ? "has-error" : ""}`}
                    >
                      <label htmlFor="auth-domain">Role or domain (optional)</label>
                      <input
                        id="auth-domain"
                        ref={(element) => {
                          fieldRefs.current.customDomain = element;
                        }}
                        className="form-input"
                        type="text"
                        value={customDomain}
                        onChange={(event) => {
                          setCustomDomain(event.target.value);
                          clearError("customDomain");
                        }}
                        placeholder="e.g. rice farmer, port pilot"
                        autoComplete="off"
                        maxLength={50}
                        disabled={loading}
                        aria-invalid={
                          errors.customDomain ? "true" : undefined
                        }
                        aria-describedby={
                          errors.customDomain
                            ? "auth-domain-error"
                            : "auth-domain-hint"
                        }
                      />
                      {!errors.customDomain && (
                        <p className="auth-hint" id="auth-domain-hint">
                          Optional. Helps tailor advisories to your work.
                        </p>
                      )}
                      {errors.customDomain && (
                        <p className="auth-field-error" id="auth-domain-error">
                          {errors.customDomain}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Step>

              <Step title="Account">
                <div className="auth-step">
                  <h3>Account access</h3>
                  <p>You use this email and password to sign in.</p>

                  <div className="auth-fields">
                    <div
                      className={`auth-field ${errors.email ? "has-error" : ""}`}
                    >
                      <label htmlFor="auth-email">Email</label>
                      <input
                        id="auth-email"
                        ref={(element) => {
                          fieldRefs.current.email = element;
                        }}
                        className="form-input"
                        type="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          clearError("email");
                        }}
                        placeholder="you@example.com"
                        autoComplete="email"
                        inputMode="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        maxLength={254}
                        required
                        disabled={loading}
                        aria-invalid={errors.email ? "true" : undefined}
                        aria-describedby={
                          errors.email ? "auth-email-error" : undefined
                        }
                      />
                      {errors.email && (
                        <p className="auth-field-error" id="auth-email-error">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div
                      className={`auth-field ${errors.password ? "has-error" : ""}`}
                    >
                      <label htmlFor="auth-password">Password</label>
                      <input
                        id="auth-password"
                        ref={(element) => {
                          fieldRefs.current.password = element;
                        }}
                        className="form-input"
                        type="password"
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          clearError("password");
                        }}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        minLength={6}
                        required
                        disabled={loading}
                        aria-invalid={errors.password ? "true" : undefined}
                        aria-describedby={
                          errors.password
                            ? "auth-password-error"
                            : "auth-password-hint"
                        }
                      />
                      {!errors.password && (
                        <p className="auth-hint" id="auth-password-hint">
                          At least 6 characters.
                        </p>
                      )}
                      {errors.password && (
                        <p
                          className="auth-field-error"
                          id="auth-password-error"
                        >
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div
                      className={`auth-field ${errors.confirmPassword ? "has-error" : ""}`}
                    >
                      <label htmlFor="auth-confirm-password">
                        Confirm password
                      </label>
                      <input
                        id="auth-confirm-password"
                        ref={(element) => {
                          fieldRefs.current.confirmPassword = element;
                        }}
                        className="form-input"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => {
                          setConfirmPassword(event.target.value);
                          clearError("confirmPassword");
                        }}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        required
                        disabled={loading}
                        aria-invalid={
                          errors.confirmPassword ? "true" : undefined
                        }
                        aria-describedby={
                          errors.confirmPassword
                            ? "auth-confirm-password-error"
                            : undefined
                        }
                      />
                      {errors.confirmPassword && (
                        <p
                          className="auth-field-error"
                          id="auth-confirm-password-error"
                        >
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  {errors.form && (
                    <p className="auth-alert" role="alert">
                      {errors.form}
                    </p>
                  )}
                </div>
              </Step>
            </Stepper>
          </form>
        )}

        <button
          type="button"
          className="switch-auth"
          onClick={() => switchMode(isLogin ? "register" : "login")}
          disabled={loading}
        >
          {isLogin ? "New to WeatherGPT? " : "Already have an account? "}
          <strong>{isLogin ? "Create an account" : "Sign in"}</strong>
        </button>
      </div>
    </div>
  );
}

export default AuthModal;
