"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AuthModal() {
  const { authOpen, authMode, closeAuth, login, signup, openAuth } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authOpen) return;

    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
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
      if (password !== confirmPassword) {
        setBusy(false);
        setError("Passwords do not match.");
        return;
      }

      const signupError = await signup(name, email, password);
      setBusy(false);
      if (signupError) setError(signupError);
      return;
    }

    const loginError = await login(email, password);
    setBusy(false);
    if (loginError) setError(loginError);
  };

  return (
    <div className="auth-overlay" onClick={closeAuth}>
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
          {authMode === "login" ? "Welcome back" : "Join the community"}
        </h2>
        <p className="auth-subtitle">
          {authMode === "login"
            ? "Log in to book classes and manage your membership."
            : "Create your account to book trials and save your schedule."}
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
          {authMode === "signup" && (
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

          <div className="auth-field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              required
            />
          </div>

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

          {authMode === "signup" && (
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

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "Please wait…" : authMode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
