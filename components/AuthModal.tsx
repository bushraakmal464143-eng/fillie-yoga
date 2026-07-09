"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

type SignupStep = "details" | "verify";

export default function AuthModal() {
  const {
    authOpen,
    authMode,
    authMessage,
    closeAuth,
    login,
    sendSignupCode,
    verifySignupCode,
    openAuth,
  } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [signupStep, setSignupStep] = useState<SignupStep>("details");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authOpen) return;

    setSignupStep("details");
    if (authMode === "signup") {
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setCode("");
    } else {
      setPassword("");
      setConfirmPassword("");
      setCode("");
    }
    setError("");
  }, [authOpen, authMode]);

  useEffect(() => {
    if (!authOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAuth();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [authOpen, closeAuth]);

  if (!authOpen) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    if (authMode === "signup") {
      if (signupStep === "details") {
        if (password !== confirmPassword) {
          setBusy(false);
          setError("Passwords do not match.");
          return;
        }

        const sendError = await sendSignupCode(name, email, password);
        setBusy(false);
        if (sendError) {
          setError(sendError);
          return;
        }
        setSignupStep("verify");
        return;
      }

      const verifyError = await verifySignupCode(name, email, password, code);
      setBusy(false);
      if (verifyError) setError(verifyError);
      return;
    }

    const loginError = await login(email, password);
    setBusy(false);
    if (loginError) setError(loginError);
  };

  const handleResendCode = async () => {
    setError("");
    setBusy(true);
    const sendError = await sendSignupCode(name, email, password);
    setBusy(false);
    if (sendError) {
      setError(sendError);
      return;
    }
  };

  const isVerifyStep = authMode === "signup" && signupStep === "verify";

  return (
    <div className="auth-overlay">
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button className="auth-close" type="button" aria-label="Close" onClick={closeAuth}>
          ×
        </button>

        <p className="auth-eyebrow">Om At Home</p>
        <h2 id="auth-modal-title" className="auth-title">
          {authMode === "login"
            ? "Welcome back"
            : isVerifyStep
              ? "Check your email"
              : "Join the community"}
        </h2>
        <p className="auth-subtitle">
          {authMode === "login"
            ? "Log in to book classes and manage your membership."
            : isVerifyStep
              ? `Enter the 6-digit code we sent to ${email || "your email"}.`
              : "Create your account — we'll email you a verification code."}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab${authMode === "login" ? " is-active" : ""}`}
            onClick={() => openAuth("login")}
          >
            Log in
          </button>
          <button
            type="button"
            className={`auth-tab${authMode === "signup" ? " is-active" : ""}`}
            onClick={() => openAuth("signup")}
          >
            Sign up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {authMode === "signup" && !isVerifyStep && (
            <div className="auth-field">
              <label htmlFor="auth-name">Full name</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jane Smith"
                autoComplete="name"
                required
              />
            </div>
          )}

          {!isVerifyStep && (
            <div className="auth-field">
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@gmail.com"
                autoComplete="email"
                required
              />
            </div>
          )}

          {!isVerifyStep && (
            <div className="auth-field">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={authMode === "signup" ? "At least 6 characters" : "Your password"}
                autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                required
                minLength={authMode === "signup" ? 6 : undefined}
              />
            </div>
          )}

          {authMode === "signup" && !isVerifyStep && (
            <div className="auth-field">
              <label htmlFor="auth-confirm">Confirm password</label>
              <input
                id="auth-confirm"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
          )}

          {isVerifyStep && (
            <div className="auth-field">
              <label htmlFor="auth-code">Verification code</label>
              <input
                id="auth-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6,8}"
                maxLength={8}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                autoComplete="one-time-code"
                required
              />
            </div>
          )}

          {authMessage && <p className="auth-success">{authMessage}</p>}
          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy
              ? "Please wait…"
              : authMode === "login"
                ? "Log in"
                : isVerifyStep
                  ? "Verify & log in"
                  : "Send verification code"}
          </button>

          {isVerifyStep && (
            <button
              className="auth-resend"
              type="button"
              disabled={busy}
              onClick={() => void handleResendCode()}
            >
              Resend code
            </button>
          )}

          {isVerifyStep && (
            <button
              className="auth-resend"
              type="button"
              disabled={busy}
              onClick={() => {
                setSignupStep("details");
                setCode("");
                setError("");
              }}
            >
              ← Back to sign up
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
