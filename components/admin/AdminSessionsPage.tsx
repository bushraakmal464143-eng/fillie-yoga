"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { DAYS } from "@/lib/schedule";
import type { ClassOffer, YogaClass } from "@/lib/types";
import { useAdminAuth } from "./AdminAuthProvider";
import {
  EMPTY_SESSION,
  normalizeColor,
  scrollToForm,
  type SessionFormState,
} from "./admin-shared";

export default function AdminSessionsPage() {
  const { busy, setBusy, setError, showSuccess, refreshKey, refreshCounts } = useAdminAuth();
  const [offers, setOffers] = useState<ClassOffer[]>([]);
  const [sessions, setSessions] = useState<YogaClass[]>([]);
  const [sessionForm, setSessionForm] = useState<SessionFormState>(EMPTY_SESSION);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    const [offersRes, sessionsRes] = await Promise.all([
      fetch("/api/admin/offers"),
      fetch("/api/admin/sessions"),
    ]);

    if (offersRes.status === 401 || sessionsRes.status === 401) return;

    if (offersRes.ok) setOffers(await offersRes.json());
    if (sessionsRes.ok) {
      setSessions(await sessionsRes.json());
    } else {
      setError("Could not load schedule sessions.");
    }
  }, [setError]);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshKey]);

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
      setError(
        data?.error ??
          (isEditing ? "Could not update schedule session." : "Could not add schedule session."),
      );
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
    void refreshCounts();
  };

  const handleEditSession = (session: YogaClass) => {
    setEditingSessionId(session.id);
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
    void refreshCounts();
  };

  return (
    <section className="admin-card admin-card--wide">
      <div className="admin-card-head">
        <div>
          <p className="admin-card-kicker">Booking calendar</p>
          <h2>Schedule sessions</h2>
        </div>
        <span className="admin-count-pill">{sessions.length}</span>
      </div>
      <p>These appear on the Schedule page and in the booking app.</p>

      <form id="session-form" className="admin-form" onSubmit={handleAddSession}>
        {editingSessionId && (
          <p className="admin-editing-note">Editing: {sessionForm.type || "schedule session"}</p>
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
              onChange={(event) =>
                setSessionForm({ ...sessionForm, spots: Number(event.target.value) })
              }
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
            onChange={(event) =>
              setSessionForm({ ...sessionForm, special: event.target.checked })
            }
          />
          Special event session
        </label>
        <div className="admin-form-actions">
          <button className="admin-btn" type="submit" disabled={busy}>
            {editingSessionId ? "Save changes" : "Add schedule session"}
          </button>
          {editingSessionId && (
            <button
              className="admin-btn-secondary"
              type="button"
              onClick={handleCancelSessionEdit}
            >
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
                <button
                  className="admin-edit"
                  type="button"
                  onClick={() => handleEditSession(session)}
                >
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
  );
}
