"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { DAYS } from "@/lib/schedule";
import { ICON_OPTIONS } from "@/lib/icons";
import {
  buildOfferTag,
  DURATION_OPTIONS,
  offerToFormSchedule,
} from "@/lib/offer-schedule";
import type { ClassOffer } from "@/lib/types";
import { useAdminAuth } from "./AdminAuthProvider";
import {
  EMPTY_OFFER,
  normalizeColor,
  scrollToForm,
  type OfferFormState,
} from "./admin-shared";

export default function AdminClassCardsPage() {
  const { busy, setBusy, setError, showSuccess, refreshKey, refreshCounts } = useAdminAuth();
  const [offers, setOffers] = useState<ClassOffer[]>([]);
  const [offerForm, setOfferForm] = useState<OfferFormState>(EMPTY_OFFER);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);

  const loadOffers = useCallback(async () => {
    const response = await fetch("/api/admin/offers");
    if (response.status === 401) return;
    if (!response.ok) {
      setError("Could not load class cards.");
      return;
    }
    setOffers(await response.json());
  }, [setError]);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers, refreshKey]);

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
    void refreshCounts();
  };

  const handleEditOffer = (offer: ClassOffer) => {
    const parsed = offerToFormSchedule(offer);
    setEditingOfferId(offer.id);
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
    void refreshCounts();
  };

  const handleIconChange = (iconId: string) => {
    const icon = ICON_OPTIONS.find((item) => item.id === iconId) ?? ICON_OPTIONS[0];
    setOfferForm((current) => ({
      ...current,
      icon: icon.id,
      vb: icon.vb,
    }));
  };

  return (
    <section className="admin-card admin-card--wide">
      <div className="admin-card-head">
        <div>
          <p className="admin-card-kicker">Public page</p>
          <h2>Class cards</h2>
        </div>
        <span className="admin-count-pill">{offers.length}</span>
      </div>
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
            value={
              DURATION_OPTIONS.includes(offerForm.duration as (typeof DURATION_OPTIONS)[number])
                ? offerForm.duration
                : "custom"
            }
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

        {previewOfferTag && <p className="admin-tag-preview">Preview: {previewOfferTag}</p>}

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
                <button
                  className="admin-delete"
                  type="button"
                  onClick={() => void handleDeleteOffer(offer.id)}
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
