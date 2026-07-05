"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { DAYS } from "@/lib/schedule";
import { ICON_OPTIONS } from "@/lib/icons";
import { ROUTES } from "@/lib/routes";
import {
  buildOfferTag,
  DURATION_OPTIONS,
  offerToFormSchedule,
} from "@/lib/offer-schedule";
import { featuresToText, formatPlanPeriod, textToFeatures } from "@/lib/pricing";
import type { ClassOffer, PricingPlan, YogaClass } from "@/lib/types";

const EMPTY_OFFER = {
  title: "",
  desc: "",
  duration: "45 min",
  days: [] as string[],
  times: ["09:00"],
  customTag: "",
  useCustomTag: false,
  icon: "icon-yin",
  vb: "0 0 48 48",
  iconBg: "#8e44ad1a",
  iconColor: "#7b3fa0",
  tagBg: "#8e44ad15",
  tagColor: "#7b3fa0",
  special: false,
};

const EMPTY_SESSION = {
  day: "Monday",
  type: "",
  time: "",
  duration: "45 min",
  bg: "#2980B922",
  color: "#1E6FA8",
  spots: 8,
  special: false,
  note: "",
};

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

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [offers, setOffers] = useState<ClassOffer[]>([]);
  const [sessions, setSessions] = useState<YogaClass[]>([]);
  const [pricing, setPricing] = useState<PricingPlan[]>([]);
  const [offerForm, setOfferForm] = useState(EMPTY_OFFER);
  const [sessionForm, setSessionForm] = useState(EMPTY_SESSION);
  const [pricingForm, setPricingForm] = useState(EMPTY_PRICING);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
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

  const normalizeColor = (color: string) => (color.length === 7 ? color : "#7b3fa0");

  const loadData = useCallback(async () => {
    const [offersRes, sessionsRes, pricingRes] = await Promise.all([
      fetch("/api/admin/offers"),
      fetch("/api/admin/sessions"),
      fetch("/api/admin/pricing"),
    ]);

    if (
      offersRes.status === 401 ||
      sessionsRes.status === 401 ||
      pricingRes.status === 401
    ) {
      setAuthenticated(false);
      return;
    }

    setAuthenticated(true);
    setOffers(await offersRes.json());
    setSessions(await sessionsRes.json());
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
    setOffers([]);
    setSessions([]);
    setPricing([]);
  };

  const handleAddOffer = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    const isEditing = editingOfferId !== null;
    const existing = isEditing ? offers.find((offer) => offer.id === editingOfferId) : null;
    const times = offerForm.times.filter(Boolean);

    const schedule = {
      duration: offerForm.duration,
      days: offerForm.days,
      times,
    };

    const tag =
      offerForm.special && offerForm.useCustomTag
        ? offerForm.customTag.trim()
        : buildOfferTag(schedule);

    if (!tag) {
      setBusy(false);
      setError("Choose a duration, at least one day, and at least one time.");
      return;
    }

    const payload = {
      title: offerForm.title,
      desc: offerForm.desc,
      icon: offerForm.icon,
      vb: offerForm.vb,
      iconBg: offerForm.iconBg,
      iconColor: offerForm.iconColor,
      tagBg: offerForm.tagBg,
      tagColor: offerForm.tagColor,
      special: offerForm.special,
      tag,
      schedule: offerForm.special && offerForm.useCustomTag ? undefined : schedule,
    };

    const response = await fetch("/api/admin/offers", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        isEditing
          ? { ...payload, id: editingOfferId, key: existing?.key }
          : payload,
      ),
    });

    setBusy(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? (isEditing ? "Could not update class card." : "Could not add class card."));
      return;
    }

    const saved = (await response.json()) as ClassOffer;
    setOffers((current) =>
      isEditing
        ? current.map((offer) => (offer.id === saved.id ? saved : offer))
        : [...current, saved],
    );
    setOfferForm(EMPTY_OFFER);
    setEditingOfferId(null);
    showSuccess(isEditing ? "Class card updated." : "Class card added.");
  };

  const handleEditOffer = (offer: ClassOffer) => {
    const parsed = offerToFormSchedule(offer);
    setEditingOfferId(offer.id);
    setEditingSessionId(null);
    setEditingPricingId(null);
    setSessionForm(EMPTY_SESSION);
    setPricingForm(EMPTY_PRICING);
    setOfferForm({
      title: offer.title,
      desc: offer.desc,
      duration: parsed.duration,
      days: parsed.days,
      times: parsed.times,
      customTag: parsed.customTag,
      useCustomTag: parsed.useCustomTag,
      icon: offer.icon,
      vb: offer.vb,
      iconBg: offer.iconBg,
      iconColor: normalizeColor(offer.iconColor),
      tagBg: offer.tagBg,
      tagColor: normalizeColor(offer.tagColor),
      special: Boolean(offer.special),
    });
    setError("");
    scrollToForm("offer-form");
    document.getElementById("offer-title")?.focus();
  };

  const toggleOfferDay = (day: string) => {
    setOfferForm((current) => {
      const hasDay = current.days.includes(day);
      const days = hasDay ? current.days.filter((item) => item !== day) : [...current.days, day];
      return { ...current, days };
    });
  };

  const setAllOfferDays = (selected: boolean) => {
    setOfferForm((current) => ({
      ...current,
      days: selected ? DAYS.slice() : [],
    }));
  };

  const updateOfferTime = (index: number, value: string) => {
    setOfferForm((current) => {
      const times = [...current.times];
      times[index] = value;
      return { ...current, times };
    });
  };

  const addOfferTime = () => {
    setOfferForm((current) => ({ ...current, times: [...current.times, "09:00"] }));
  };

  const removeOfferTime = (index: number) => {
    setOfferForm((current) => ({
      ...current,
      times: current.times.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const previewOfferTag =
    offerForm.special && offerForm.useCustomTag
      ? offerForm.customTag
      : buildOfferTag({
          duration: offerForm.duration,
          days: offerForm.days,
          times: offerForm.times.filter(Boolean),
        });

  const handleCancelOfferEdit = () => {
    setEditingOfferId(null);
    setOfferForm(EMPTY_OFFER);
    setError("");
  };

  const handleDeleteOffer = async (id: string) => {
    const response = await fetch(`/api/admin/offers?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!response.ok) return;
    setOffers((current) => current.filter((offer) => offer.id !== id));
    if (editingOfferId === id) handleCancelOfferEdit();
  };

  const handleAddSession = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    const isEditing = editingSessionId !== null;
    const payload = {
      ...sessionForm,
      spots: Number(sessionForm.spots),
      note: sessionForm.note || undefined,
    };

    const response = await fetch("/api/admin/sessions", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEditing ? { ...payload, id: editingSessionId } : payload),
    });

    setBusy(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? (isEditing ? "Could not update schedule session." : "Could not add schedule session."));
      return;
    }

    const saved = (await response.json()) as YogaClass;
    setSessions((current) =>
      isEditing
        ? current.map((session) => (session.id === saved.id ? saved : session))
        : [...current, saved],
    );
    setSessionForm(EMPTY_SESSION);
    setEditingSessionId(null);
    showSuccess(isEditing ? "Schedule session updated." : "Schedule session added.");
  };

  const handleEditSession = (session: YogaClass) => {
    setEditingSessionId(session.id);
    setEditingOfferId(null);
    setEditingPricingId(null);
    setOfferForm(EMPTY_OFFER);
    setPricingForm(EMPTY_PRICING);
    setSessionForm({
      day: session.day,
      type: session.type,
      time: session.time,
      duration: session.duration,
      bg: session.bg,
      color: normalizeColor(session.color),
      spots: session.spots,
      special: Boolean(session.special),
      note: session.note ?? "",
    });
    setError("");
    scrollToForm("session-form");
    document.getElementById("session-day")?.focus();
  };

  const handleCancelSessionEdit = () => {
    setEditingSessionId(null);
    setSessionForm(EMPTY_SESSION);
    setError("");
  };

  const handleDeleteSession = async (id: number) => {
    const response = await fetch(`/api/admin/sessions?id=${id}`, { method: "DELETE" });
    if (!response.ok) return;
    setSessions((current) => current.filter((session) => session.id !== id));
    if (editingSessionId === id) handleCancelSessionEdit();
  };

  const handleIconChange = (iconId: string) => {
    const icon = ICON_OPTIONS.find((item) => item.id === iconId) ?? ICON_OPTIONS[0];
    setOfferForm((current) => ({
      ...current,
      icon: icon.id,
      vb: icon.vb,
    }));
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
    setEditingOfferId(null);
    setEditingSessionId(null);
    setOfferForm(EMPTY_OFFER);
    setSessionForm(EMPTY_SESSION);
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
          <p>Sign in to manage class cards and schedule sessions for Om At Home.</p>
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
        <div className="admin-top">
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
              <h1>Class admin</h1>
              <p>Manage what appears on your Classes page, schedule, and pricing.</p>
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
            <Link href={ROUTES.classes} className="admin-btn-secondary" onClick={closeMenu}>
              View classes page
            </Link>
            <Link href={ROUTES.pricing} className="admin-btn-secondary" onClick={closeMenu}>
              View pricing page
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

        <div className="admin-grid">
          <section className="admin-card">
            <h2>Class cards</h2>
            <p>These appear on the public Classes page as overview cards.</p>

            <form id="offer-form" className="admin-form" onSubmit={handleAddOffer}>
              {editingOfferId && (
                <p className="admin-editing-note">Editing: {offerForm.title || "class card"}</p>
              )}
              <div className="admin-field">
                <label htmlFor="offer-title">Title</label>
                <input
                  id="offer-title"
                  value={offerForm.title}
                  onChange={(event) => setOfferForm({ ...offerForm, title: event.target.value })}
                  placeholder="e.g. Restorative Yoga"
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="offer-desc">Description</label>
                <textarea
                  id="offer-desc"
                  value={offerForm.desc}
                  onChange={(event) => setOfferForm({ ...offerForm, desc: event.target.value })}
                  placeholder="Short description for the class card"
                  required
                />
              </div>
              <div className="admin-field">
                <label htmlFor="offer-duration">Duration</label>
                <select
                  id="offer-duration"
                  value={DURATION_OPTIONS.includes(offerForm.duration as (typeof DURATION_OPTIONS)[number]) ? offerForm.duration : "custom"}
                  onChange={(event) => {
                    const value = event.target.value;
                    setOfferForm({
                      ...offerForm,
                      duration: value === "custom" ? offerForm.duration : value,
                    });
                  }}
                  disabled={offerForm.special && offerForm.useCustomTag}
                >
                  {DURATION_OPTIONS.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
                    </option>
                  ))}
                  <option value="custom">Custom</option>
                </select>
                {!DURATION_OPTIONS.includes(offerForm.duration as (typeof DURATION_OPTIONS)[number]) && (
                  <input
                    className="admin-inline-input"
                    value={offerForm.duration}
                    onChange={(event) => setOfferForm({ ...offerForm, duration: event.target.value })}
                    placeholder="e.g. 50 min"
                    disabled={offerForm.special && offerForm.useCustomTag}
                  />
                )}
              </div>

              <div className="admin-field">
                <div className="admin-field-top">
                  <label>Days</label>
                  <button
                    className="admin-link-btn"
                    type="button"
                    onClick={() => setAllOfferDays(offerForm.days.length !== DAYS.length)}
                    disabled={offerForm.special && offerForm.useCustomTag}
                  >
                    {offerForm.days.length === DAYS.length ? "Clear all" : "Select all days"}
                  </button>
                </div>
                <div className="admin-day-grid">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`admin-day-chip${offerForm.days.includes(day) ? " is-selected" : ""}`}
                      onClick={() => toggleOfferDay(day)}
                      disabled={offerForm.special && offerForm.useCustomTag}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-field">
                <div className="admin-field-top">
                  <label>Times</label>
                  <button
                    className="admin-link-btn"
                    type="button"
                    onClick={addOfferTime}
                    disabled={offerForm.special && offerForm.useCustomTag}
                  >
                    + Add time
                  </button>
                </div>
                <div className="admin-time-list">
                  {offerForm.times.map((time, index) => (
                    <div key={`${index}-${time}`} className="admin-time-row">
                      <input
                        type="time"
                        value={time}
                        onChange={(event) => updateOfferTime(index, event.target.value)}
                        disabled={offerForm.special && offerForm.useCustomTag}
                        required={!offerForm.special || !offerForm.useCustomTag}
                      />
                      {offerForm.times.length > 1 && (
                        <button
                          className="admin-link-btn"
                          type="button"
                          onClick={() => removeOfferTime(index)}
                          disabled={offerForm.special && offerForm.useCustomTag}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {offerForm.special && (
                <div className="admin-field">
                  <label className="admin-check">
                    <input
                      type="checkbox"
                      checked={offerForm.useCustomTag}
                      onChange={(event) =>
                        setOfferForm({ ...offerForm, useCustomTag: event.target.checked })
                      }
                    />
                    Use custom schedule text (for special events)
                  </label>
                  {offerForm.useCustomTag && (
                    <input
                      className="admin-inline-input"
                      value={offerForm.customTag}
                      onChange={(event) => setOfferForm({ ...offerForm, customTag: event.target.value })}
                      placeholder="e.g. Once every 3 months · Live"
                      required
                    />
                  )}
                </div>
              )}

              {previewOfferTag && (
                <p className="admin-tag-preview">Preview: {previewOfferTag}</p>
              )}

              <div className="admin-row">
                <div className="admin-field">
                  <label htmlFor="offer-icon">Icon</label>
                  <select
                    id="offer-icon"
                    value={offerForm.icon}
                    onChange={(event) => handleIconChange(event.target.value)}
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon.id} value={icon.id}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label htmlFor="offer-color">Accent color</label>
                  <input
                    id="offer-color"
                    type="color"
                    value={offerForm.iconColor}
                    onChange={(event) => {
                      const color = event.target.value;
                      setOfferForm({
                        ...offerForm,
                        iconColor: color,
                        tagColor: color,
                        iconBg: `${color}1a`,
                        tagBg: `${color}15`,
                      });
                    }}
                  />
                </div>
              </div>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={offerForm.special}
                  onChange={(event) =>
                    setOfferForm({
                      ...offerForm,
                      special: event.target.checked,
                      useCustomTag: event.target.checked ? offerForm.useCustomTag : false,
                    })
                  }
                />
                Mark as special event
              </label>
              <div className="admin-form-actions">
                <button className="admin-btn" type="submit" disabled={busy}>
                  {editingOfferId ? "Save changes" : "Add class card"}
                </button>
                {editingOfferId && (
                  <button className="admin-btn-secondary" type="button" onClick={handleCancelOfferEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="admin-list-section">
              <h3 className="admin-list-heading">Saved class cards ({offers.length})</h3>
              <div className="admin-list">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className={`admin-list-item${editingOfferId === offer.id ? " is-editing" : ""}`}
                >
                  <div>
                    <strong>{offer.title}</strong>
                    <span>{offer.tag}</span>
                  </div>
                  <div className="admin-list-actions">
                    <button className="admin-edit" type="button" onClick={() => handleEditOffer(offer)}>
                      Edit
                    </button>
                    <button className="admin-delete" type="button" onClick={() => void handleDeleteOffer(offer.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </section>

          <section className="admin-card">
            <h2>Schedule sessions</h2>
            <p>These appear on the Schedule page and in the booking app.</p>

            <form id="session-form" className="admin-form" onSubmit={handleAddSession}>
              {editingSessionId && (
                <p className="admin-editing-note">
                  Editing: {sessionForm.type || "schedule session"}
                </p>
              )}
              <div className="admin-row">
                <div className="admin-field">
                  <label htmlFor="session-day">Day</label>
                  <select
                    id="session-day"
                    value={sessionForm.day}
                    onChange={(event) => setSessionForm({ ...sessionForm, day: event.target.value })}
                  >
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label htmlFor="session-time">Time</label>
                  <input
                    id="session-time"
                    value={sessionForm.time}
                    onChange={(event) => setSessionForm({ ...sessionForm, time: event.target.value })}
                    placeholder="e.g. 6:00 PM"
                    required
                  />
                </div>
              </div>
              <div className="admin-field">
                <label htmlFor="session-type">Class type</label>
                <input
                  id="session-type"
                  list="class-type-options"
                  value={sessionForm.type}
                  onChange={(event) => setSessionForm({ ...sessionForm, type: event.target.value })}
                  placeholder="Must match a class card title"
                  required
                />
                <datalist id="class-type-options">
                  {offers.map((offer) => (
                    <option key={offer.id} value={offer.title} />
                  ))}
                </datalist>
              </div>
              <div className="admin-row">
                <div className="admin-field">
                  <label htmlFor="session-duration">Duration</label>
                  <input
                    id="session-duration"
                    value={sessionForm.duration}
                    onChange={(event) => setSessionForm({ ...sessionForm, duration: event.target.value })}
                    required
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="session-spots">Spots</label>
                  <input
                    id="session-spots"
                    type="number"
                    min={1}
                    value={sessionForm.spots}
                    onChange={(event) => setSessionForm({ ...sessionForm, spots: Number(event.target.value) })}
                  />
                </div>
              </div>
              <div className="admin-field">
                <label htmlFor="session-note">Note (optional)</label>
                <input
                  id="session-note"
                  value={sessionForm.note}
                  onChange={(event) => setSessionForm({ ...sessionForm, note: event.target.value })}
                  placeholder="e.g. Next: Sep 2026"
                />
              </div>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={sessionForm.special}
                  onChange={(event) => setSessionForm({ ...sessionForm, special: event.target.checked })}
                />
                Special event session
              </label>
              <div className="admin-form-actions">
                <button className="admin-btn" type="submit" disabled={busy}>
                  {editingSessionId ? "Save changes" : "Add schedule session"}
                </button>
                {editingSessionId && (
                  <button className="admin-btn-secondary" type="button" onClick={handleCancelSessionEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="admin-list-section">
              <h3 className="admin-list-heading">Saved sessions ({sessions.length})</h3>
              <div className="admin-list">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`admin-list-item${editingSessionId === session.id ? " is-editing" : ""}`}
                >
                  <div>
                    <strong>{session.type}</strong>
                    <span>
                      {session.day} · {session.time} · {session.duration}
                    </span>
                  </div>
                  <div className="admin-list-actions">
                    <button className="admin-edit" type="button" onClick={() => handleEditSession(session)}>
                      Edit
                    </button>
                    <button
                      className="admin-delete"
                      type="button"
                      onClick={() => void handleDeleteSession(session.id)}
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

        <section className="admin-card admin-card--wide">
          <h2>Pricing offers</h2>
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
