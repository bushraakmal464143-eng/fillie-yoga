"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ROUTES } from "@/lib/routes";
import { featuresToText, formatPlanPeriod, textToFeatures } from "@/lib/pricing";
import type { PricingPlan } from "@/lib/types";

const EMPTY_PRICING = {
  name: "",
  price: 70,
  currency: "$",
  period: "mo",
  sectionLabel: "Membership",
  sectionTitle: "One mat, unlimited access",
  featuresText: "",
  ctaText: "Join the global community",
  trialCtaText: "Or try a free class first",
  subscribeCtaText: "Subscribe for $70/month",
  note: "No contracts · Cancel any time",
  highlighted: true,
};

export default function AdminPricingPanel() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pricing, setPricing] = useState<PricingPlan[]>([]);
  const [pricingForm, setPricingForm] = useState(EMPTY_PRICING);
  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const showSuccess = (message: string) => {
    setSuccess(message);
    setError("");
    window.setTimeout(() => setSuccess(""), 3000);
  };

  const scrollToForm = (id: string) => {
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const loadData = useCallback(async () => {
    const pricingRes = await fetch("/api/admin/pricing");
    if (pricingRes.status === 401) {
      setAuthenticated(false);
      return;
    }
    setAuthenticated(true);
    setPricing(await pricingRes.json());
  }, []);

  useEffect(() => {
    void (async () => {
      const authRes = await fetch("/api/admin/auth");
      const authData = (await authRes.json()) as { authenticated: boolean };
      if (!authData.authenticated) {
        setAuthenticated(false);
        return;
      }
      await loadData();
    })();
  }, [loadData]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    const response = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setBusy(false);
    if (!response.ok) {
      setError("Incorrect password.");
      return;
    }

    setPassword("");
    await loadData();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
    setPricing([]);
  };

  const buildPricingPayload = () => ({
    name: pricingForm.name,
    price: Number(pricingForm.price),
    currency: pricingForm.currency,
    period: pricingForm.period,
    sectionLabel: pricingForm.sectionLabel,
    sectionTitle: pricingForm.sectionTitle,
    features: textToFeatures(pricingForm.featuresText),
    ctaText: pricingForm.ctaText,
    trialCtaText: pricingForm.trialCtaText,
    subscribeCtaText: pricingForm.subscribeCtaText,
    note: pricingForm.note,
    highlighted: pricingForm.highlighted,
  });

  const handleAddPricing = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    const features = textToFeatures(pricingForm.featuresText);
    if (!pricingForm.name.trim() || !pricingForm.sectionTitle.trim() || !features.length) {
      setBusy(false);
      setError("Pricing plan needs a name, section title, and at least one feature.");
      return;
    }

    const isEditing = editingPricingId !== null;
    const payload = buildPricingPayload();

    const response = await fetch("/api/admin/pricing", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        isEditing ? { ...payload, id: editingPricingId } : payload,
      ),
    });

    setBusy(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? (isEditing ? "Could not update pricing plan." : "Could not add pricing plan."));
      return;
    }

    const saved = (await response.json()) as PricingPlan;
    setPricing((current) =>
      isEditing
        ? current.map((plan) => (plan.id === saved.id ? saved : plan))
        : [...current, saved],
    );
    setPricingForm(EMPTY_PRICING);
    setEditingPricingId(null);
    showSuccess(isEditing ? "Pricing plan updated." : "Pricing plan added.");
  };

  const handleEditPricing = (plan: PricingPlan) => {
    setEditingPricingId(plan.id);
    setPricingForm({
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      period: plan.period,
      sectionLabel: plan.sectionLabel,
      sectionTitle: plan.sectionTitle,
      featuresText: featuresToText(plan.features),
      ctaText: plan.ctaText,
      trialCtaText: plan.trialCtaText,
      subscribeCtaText: plan.subscribeCtaText,
      note: plan.note,
      highlighted: Boolean(plan.highlighted),
    });
    setError("");
    scrollToForm("pricing-form");
  };

  const handleCancelPricingEdit = () => {
    setEditingPricingId(null);
    setPricingForm(EMPTY_PRICING);
    setError("");
  };

  const handleDeletePricing = async (id: string) => {
    const response = await fetch(`/api/admin/pricing?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Could not delete pricing plan.");
      return;
    }
    setPricing((current) => current.filter((plan) => plan.id !== id));
    if (editingPricingId === id) handleCancelPricingEdit();
    showSuccess("Pricing plan deleted.");
  };

  if (authenticated === null) {
    return <div className="admin-page"><div className="admin-shell">Loading…</div></div>;
  }

  if (!authenticated) {
    return (
      <div className="admin-page">
        <form className="admin-login" onSubmit={handleLogin}>
          <h1>Admin panel</h1>
          <p>Sign in to manage pricing plans for Om At Home.</p>
          <div className="admin-field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter admin password"
              required
            />
          </div>
          {error && <p className="admin-error">{error}</p>}
          <button className="admin-btn" type="submit" disabled={busy} style={{ width: "100%", marginTop: "1rem" }}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="admin-hint">
            Default password is <strong>omathome</strong>. Change it with the{" "}
            <code>ADMIN_PASSWORD</code> environment variable.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <div className="admin-top admin-top--bar">
          {menuOpen && (
            <button
              type="button"
              className="admin-menu-overlay"
              aria-label="Close menu"
              onClick={closeMenu}
            />
          )}
          <div className="admin-brand">
            <span className="om">ॐ</span>
            <div>
              <p className="admin-kicker">Om At Home</p>
              <h1>Pricing admin</h1>
            </div>
          </div>
          <button
            className="admin-menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="admin-actions"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <div id="admin-actions" className={`admin-actions${menuOpen ? " is-open" : ""}`}>
            <Link href={ROUTES.admin} className="admin-btn-secondary" onClick={closeMenu}>
              Back to admin
            </Link>
            <Link href={ROUTES.adminClasses} className="admin-btn-secondary" onClick={closeMenu}>
              Classes
            </Link>
            <Link href={ROUTES.pricing} className="admin-btn-secondary" onClick={closeMenu}>
              View public pricing
            </Link>
            <button
              className="admin-btn-secondary"
              type="button"
              onClick={() => {
                closeMenu();
                void loadData();
              }}
            >
              Refresh
            </button>
            <button
              className="admin-btn-secondary"
              type="button"
              onClick={() => {
                closeMenu();
                void handleLogout();
              }}
            >
              Log out
            </button>
          </div>
        </div>

        {error && <p className="admin-error">{error}</p>}
        {success && <p className="admin-success">{success}</p>}

        <section className="admin-card admin-card--wide">
          <h2>Pricing plans</h2>
          <p>These appear on the Pricing page and in the booking app membership section.</p>

          <form id="pricing-form" className="admin-form" onSubmit={handleAddPricing}>
            {editingPricingId && (
              <p className="admin-editing-note">Editing: {pricingForm.name || "pricing plan"}</p>
            )}
            <div className="admin-row">
              <div className="admin-field">
                <label htmlFor="pricing-name">Plan name</label>
                <input
                  id="pricing-name"
                  value={pricingForm.name}
                  onChange={(event) => setPricingForm({ ...pricingForm, name: event.target.value })}
                  placeholder="e.g. Om At Home Monthly"
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="pricing-price">Price</label>
                <input
                  id="pricing-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={pricingForm.price}
                  onChange={(event) =>
                    setPricingForm({ ...pricingForm, price: Number(event.target.value) })
                  }
                  required
                />
              </div>
            </div>
            <div className="admin-row">
              <div className="admin-field">
                <label htmlFor="pricing-currency">Currency</label>
                <input
                  id="pricing-currency"
                  value={pricingForm.currency}
                  onChange={(event) => setPricingForm({ ...pricingForm, currency: event.target.value })}
                  placeholder="$"
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="pricing-period">Billing period</label>
                <input
                  id="pricing-period"
                  value={pricingForm.period}
                  onChange={(event) => setPricingForm({ ...pricingForm, period: event.target.value })}
                  placeholder="mo"
                  required
                />
              </div>
            </div>
            <div className="admin-row">
              <div className="admin-field">
                <label htmlFor="pricing-section-label">Page label</label>
                <input
                  id="pricing-section-label"
                  value={pricingForm.sectionLabel}
                  onChange={(event) =>
                    setPricingForm({ ...pricingForm, sectionLabel: event.target.value })
                  }
                  placeholder="Membership"
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="pricing-section-title">Page headline</label>
                <input
                  id="pricing-section-title"
                  value={pricingForm.sectionTitle}
                  onChange={(event) =>
                    setPricingForm({ ...pricingForm, sectionTitle: event.target.value })
                  }
                  placeholder="One mat, unlimited access"
                  required
                />
              </div>
            </div>
            <div className="admin-field">
              <label htmlFor="pricing-features">What&apos;s included (one per line)</label>
              <textarea
                id="pricing-features"
                value={pricingForm.featuresText}
                onChange={(event) =>
                  setPricingForm({ ...pricingForm, featuresText: event.target.value })
                }
                placeholder={"All five daily live classes\nYin, Vinyasa, Pilates & Heart Opening Yin"}
                required
              />
            </div>
            <div className="admin-row">
              <div className="admin-field">
                <label htmlFor="pricing-cta">Main button text</label>
                <input
                  id="pricing-cta"
                  value={pricingForm.ctaText}
                  onChange={(event) => setPricingForm({ ...pricingForm, ctaText: event.target.value })}
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="pricing-trial-cta">Trial button text</label>
                <input
                  id="pricing-trial-cta"
                  value={pricingForm.trialCtaText}
                  onChange={(event) =>
                    setPricingForm({ ...pricingForm, trialCtaText: event.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="admin-row">
              <div className="admin-field">
                <label htmlFor="pricing-subscribe-cta">Subscribe button text</label>
                <input
                  id="pricing-subscribe-cta"
                  value={pricingForm.subscribeCtaText}
                  onChange={(event) =>
                    setPricingForm({ ...pricingForm, subscribeCtaText: event.target.value })
                  }
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="pricing-note">Footnote</label>
                <input
                  id="pricing-note"
                  value={pricingForm.note}
                  onChange={(event) => setPricingForm({ ...pricingForm, note: event.target.value })}
                  placeholder="No contracts · Cancel any time"
                  required
                />
              </div>
            </div>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={pricingForm.highlighted}
                onChange={(event) =>
                  setPricingForm({ ...pricingForm, highlighted: event.target.checked })
                }
              />
              Featured plan (used in booking app)
            </label>
            <div className="admin-form-actions">
              <button className="admin-btn" type="submit" disabled={busy}>
                {editingPricingId ? "Save changes" : "Add pricing plan"}
              </button>
              {editingPricingId && (
                <button className="admin-btn-secondary" type="button" onClick={handleCancelPricingEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="admin-list-section">
            <h3 className="admin-list-heading">Saved pricing plans ({pricing.length})</h3>
            <div className="admin-list">
              {pricing.map((plan) => (
                <div
                  key={plan.id}
                  className={`admin-list-item${editingPricingId === plan.id ? " is-editing" : ""}`}
                >
                  <div>
                    <strong>
                      {plan.name}
                      {plan.highlighted ? " · Featured" : ""}
                    </strong>
                    <span>{formatPlanPeriod(plan)}</span>
                  </div>
                  <div className="admin-list-actions">
                    <button className="admin-edit" type="button" onClick={() => handleEditPricing(plan)}>
                      Edit
                    </button>
                    <button
                      className="admin-delete"
                      type="button"
                      onClick={() => void handleDeletePricing(plan.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
