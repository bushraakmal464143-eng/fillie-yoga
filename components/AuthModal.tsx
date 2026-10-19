"use client";

import { FormEvent, useEffect, useState } from "react";
import PasswordInput from "@/components/PasswordInput";
import { useAuth } from "@/components/providers/AuthProvider";

type SignupStep = "details" | "verify";
type ForgotStep = "request" | "reset";

export default function AuthModal() {
  const {
    authOpen,
    authMode,
    authMessage,
    closeAuth,
    login,
    sendSignupCode,
    verifySignupCode,
    sendPasswordResetCode,
    resetPassword,
    openAuth,
  } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [signupStep, setSignupStep] = useState<SignupStep>("details");
  const [forgotStep, setForgotStep] = useState<ForgotStep>("request");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authOpen) return;

    setSignupStep("details");
    setForgotStep("request");
    setError("");
    setCode("");
    setPassword("");
    setConfirmPassword("");

    if (authMode === "signup") {
      setName("");
      setEmail("");
    } else if (authMode === "forgot") {
      setName("");
    }
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

  const isSignupVerify = authMode === "signup" && signupStep === "verify";
  const isForgotRequest = authMode === "forgot" && forgotStep === "request";
  const isForgotReset = authMode === "forgot" && forgotStep === "reset";

  const title =
    authMode === "login"
      ? "Welcome back"
      : authMode === "forgot"
        ? isForgotReset
          ? "Choose a new password"
          : "Forgot password"
        : isSignupVerify
          ? "Check your email"
          : "Join the community";

  const subtitle =
    authMode === "login"
      ? "Log in to book classes and manage your membership."
      : authMode === "forgot"
        ? isForgotReset
          ? `Enter the code we sent to ${email || "your email"} and your new password.`
          : "Enter your account email and we’ll send a reset code."
        : isSignupVerify
          ? `Enter the 6-digit code we sent to ${email || "your email"}.`
          : "Create your account — we'll email you a verification code.";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (authMode === "forgot") {
        if (forgotStep === "request") {
          const sendError = await sendPasswordResetCode(email);
          if (sendError) {
            setError(sendError);
            return;
          }
          setForgotStep("reset");
          return;
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        const resetError = await resetPassword(email, code, password);
        if (resetError) setError(resetError);
        return;
      }

      if (authMode === "signup") {
        if (signupStep === "details") {
          if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
          }

          const sendError = await sendSignupCode(name, email, password);
          if (sendError) {
            setError(sendError);
            return;
          }
          setSignupStep("verify");
          return;
        }

        const verifyError = await verifySignupCode(name, email, password, code);
        if (verifyError) setError(verifyError);
        return;
      }

      const loginError = await login(email, password);
      if (loginError) setError(loginError);
    } finally {
      setBusy(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setBusy(true);
    try {
      if (authMode === "forgot") {
        const sendError = await sendPasswordResetCode(email);
        if (sendError) setError(sendError);
        return;
      }

      const sendError = await sendSignupCode(name, email, password);
      if (sendError) setError(sendError);
    } finally {
      setBusy(false);
    }
  };

  const submitLabel = busy
    ? "Please wait…"
    : authMode === "login"
      ? "Log in"
      : authMode === "forgot"
        ? isForgotReset
          ? "Update password"
          : "Send reset code"
        : isSignupVerify
          ? "Verify & log in"
          : "Send verification code";

  return (
    <div className="auth-overlay" onClick={closeAuth} role="presentation">
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="auth-close" type="button" aria-label="Close" onClick={closeAuth}>
          ×
        </button>

        <p className="auth-eyebrow">Om At Home</p>
        <h2 id="auth-modal-title" className="auth-title">
          {title}
        </h2>
        <p className="auth-subtitle">{subtitle}</p>

        {authMode !== "forgot" && (
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
        )}

        <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
          {authMode === "signup" && !isSignupVerify && (
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

          {(authMode === "login" ||
            (authMode === "signup" && !isSignupVerify) ||
            isForgotRequest) && (
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

          {(authMode === "login" || (authMode === "signup" && !isSignupVerify)) && (
            <div className="auth-field">
              <label htmlFor="auth-password">Password</label>
              <PasswordInput
                id="auth-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={
                  authMode === "login" ? "Your password" : "At least 6 characters"
                }
                autoComplete={authMode === "login" ? "current-password" : "new-password"}
                required
                minLength={authMode === "login" ? undefined : 6}
              />
            </div>
          )}

          {authMode === "signup" && !isSignupVerify && (
            <div className="auth-field">
              <label htmlFor="auth-confirm">Confirm password</label>
              <PasswordInput
                id="auth-confirm"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
          )}

          {(isSignupVerify || isForgotReset) && (
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

          {isForgotReset && (
            <>
              <div className="auth-field">
                <label htmlFor="auth-password">New password</label>
                <PasswordInput
                  id="auth-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
              <div className="auth-field">
                <label htmlFor="auth-confirm">Confirm password</label>
                <PasswordInput
                  id="auth-confirm"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
            </>
          )}

          {authMode === "login" && (
            <button
              className="auth-forgot-link"
              type="button"
              onClick={() => openAuth("forgot")}
            >
              Forgot password?
            </button>
          )}

          {authMessage && <p className="auth-success">{authMessage}</p>}
          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={busy}>
            {submitLabel}
          </button>

          {(isSignupVerify || isForgotReset) && (
            <button
              className="auth-resend"
              type="button"
              disabled={busy}
              onClick={() => void handleResendCode()}
            >
              Resend code
            </button>
          )}

          {isSignupVerify && (
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

          {authMode === "forgot" && (
            <button
              className="auth-resend"
              type="button"
              disabled={busy}
              onClick={() => {
                if (isForgotReset) {
                  setForgotStep("request");
                  setCode("");
                  setPassword("");
                  setConfirmPassword("");
                  setError("");
                  return;
                }
                openAuth("login");
              }}
            >
              {isForgotReset ? "← Use a different email" : "← Back to log in"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
