"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { featuresToText, formatPlanPeriod, textToFeatures } from "@/lib/pricing";
import type { PricingPlan } from "@/lib/types";
import { useAdminAuth } from "./AdminAuthProvider";
import {
  EMPTY_PRICING,
  scrollToForm,
  type PricingFormState,
} from "./admin-shared";

export default function AdminPricingPage() {
  const { busy, setBusy, setError, showSuccess, refreshKey, refreshCounts } = useAdminAuth();
  const [pricing, setPricing] = useState<PricingPlan[]>([]);
  const [pricingForm, setPricingForm] = useState<PricingFormState>(EMPTY_PRICING);
  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);

  const loadPricing = useCallback(async () => {
    const response = await fetch("/api/admin/pricing");
    if (response.status === 401) return;
    if (!response.ok) {
      setError("Could not load pricing plans.");
      return;
    }
    setPricing(await response.json());
  }, [setError]);

  useEffect(() => {
    void loadPricing();
  }, [loadPricing, refreshKey]);

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
      body: JSON.stringify(isEditing ? { ...payload, id: editingPricingId } : payload),
    });

    setBusy(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(
        data?.error ?? (isEditing ? "Could not update pricing plan." : "Could not add pricing plan."),
      );
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
    void refreshCounts();
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
    void refreshCounts();
  };

  return (
    <section className="admin-card admin-card--wide">
      <div className="admin-card-head">
        <div>
          <p className="admin-card-kicker">Membership</p>
          <h2>Pricing offers</h2>
        </div>
        <span className="admin-count-pill">{pricing.length}</span>
      </div>
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
            <button
              className="admin-btn-secondary"
              type="button"
              onClick={handleCancelPricingEdit}
            >
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
  );
}
