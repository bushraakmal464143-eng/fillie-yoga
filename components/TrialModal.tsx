"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ClassIcon } from "@/components/ClassIcon";
import { useApp } from "@/components/providers/AppProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatPlanPeriod } from "@/lib/pricing";

const PENDING_TRIAL_KEY = "omathome_pending_trial";
const PENDING_CLASS_KEY = "omathome_pending_class";

export function markPendingTrial(classType?: string) {
  try {
    sessionStorage.setItem(PENDING_TRIAL_KEY, "1");
    if (classType?.trim()) {
      sessionStorage.setItem(PENDING_CLASS_KEY, classType.trim());
    } else {
      sessionStorage.removeItem(PENDING_CLASS_KEY);
    }
  } catch {
    // ignore
  }
}

export function consumePendingTrial(): { pending: boolean; classType: string | null } {
  try {
    const pending = sessionStorage.getItem(PENDING_TRIAL_KEY) === "1";
    const classType = sessionStorage.getItem(PENDING_CLASS_KEY);
    if (pending) sessionStorage.removeItem(PENDING_TRIAL_KEY);
    sessionStorage.removeItem(PENDING_CLASS_KEY);
    return { pending, classType: classType?.trim() || null };
  } catch {
    return { pending: false, classType: null };
  }
}

export default function TrialModal() {
  const {
    trialModalOpen,
    trialClassType,
    closeTrialModal,
    openTrialModal,
    subscribed,
    trialBooking,
    allClasses,
    offers,
    submitTrial,
    primaryPlan,
    setActiveTab,
    goToBookApp,
  } = useApp();
  const { user } = useAuth();
  const [classId, setClassId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const availableClasses = useMemo(() => {
    const base = allClasses.filter((c) => !c.special);
    if (!trialClassType) return base;
    const needle = trialClassType.trim().toLowerCase();
    const matched = base.filter((c) => c.type.trim().toLowerCase() === needle);
    return matched.length ? matched : base.filter((c) => c.type.toLowerCase().includes(needle));
  }, [allClasses, trialClassType]);

  useEffect(() => {
    if (!trialModalOpen) return;
    setError("");
    setBusy(false);
    // Prefill the only matching time, or first option for that class.
    if (availableClasses.length === 1) {
      setClassId(String(availableClasses[0].id));
    } else if (
      availableClasses.length > 0 &&
      !availableClasses.some((c) => String(c.id) === classId)
    ) {
      setClassId("");
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTrialModal();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when modal opens / filter changes
  }, [trialModalOpen, closeTrialModal, availableClasses]);

  // After login/signup from a trial CTA, open the details popup.
  useEffect(() => {
    if (!user) return;
    const { pending, classType } = consumePendingTrial();
    if (!pending) return;
    openTrialModal(classType);
  }, [user, openTrialModal]);

  if (!trialModalOpen) return null;

  const selected = allClasses.find((c) => c.id === Number(classId));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    const id = parseInt(classId, 10);
    if (!id) {
      setError("Please choose a class time.");
      return;
    }
    setBusy(true);
    setError("");
    submitTrial({ name: user.name, email: user.email, classId: id });
    setBusy(false);
  };

  return (
    <div className="auth-overlay" onClick={closeTrialModal}>
      <div
        className="auth-modal trial-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trial-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="auth-close" type="button" aria-label="Close" onClick={closeTrialModal}>
          ×
        </button>

        <p className="auth-eyebrow">Free trial</p>
        <h2 id="trial-modal-title" className="auth-title">
          {trialClassType ? `Book ${trialClassType}` : "Book your free trial"}
        </h2>

        {subscribed ? (
          <>
            <p className="auth-subtitle">
              You already have an active membership with unlimited classes.
            </p>
            <button
              className="auth-submit"
              type="button"
              onClick={() => {
                closeTrialModal();
                setActiveTab("appschedule");
                goToBookApp();
              }}
            >
              View schedule
            </button>
          </>
        ) : trialBooking ? (
          <>
            <p className="auth-subtitle">
              Hi {trialBooking.name}, your free trial is booked. We&apos;ll send joining details to{" "}
              <strong>{trialBooking.email}</strong>.
            </p>
            {(() => {
              const bookedClass = allClasses.find((c) => c.id === trialBooking.classId);
              if (!bookedClass) return null;
              return (
                <div className="trial-modal-class">
                  <div
                    className="sc-badge"
                    style={{ background: bookedClass.bg, color: bookedClass.color }}
                  >
                    <ClassIcon type={bookedClass.type} color={bookedClass.color} offers={offers} />
                  </div>
                  <div>
                    <strong>{bookedClass.type}</strong>
                    <span>
                      {bookedClass.day} · {bookedClass.time} · {bookedClass.duration}
                    </span>
                  </div>
                </div>
              );
            })()}
            {(() => {
              const bookedClass = allClasses.find((c) => c.id === trialBooking.classId);
              if (!bookedClass?.meetingUrl) return null;
              return (
                <a
                  className="join-meet-btn trial-modal-join"
                  href={bookedClass.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join meeting
                </a>
              );
            })()}
            <button
              className="auth-submit"
              type="button"
              onClick={() => {
                closeTrialModal();
                setActiveTab("subscribe");
                goToBookApp();
              }}
            >
              View membership · {primaryPlan ? formatPlanPeriod(primaryPlan) : "$70/mo"}
            </button>
          </>
        ) : (
          <>
            <p className="auth-subtitle">
              {trialClassType
                ? `Pick a time for ${trialClassType}. One free session per person — no payment required.`
                : "Choose a live class with Fillie Faragi. One free session per person — no payment required."}
            </p>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label>Signed in as</label>
                <p className="trial-note" style={{ margin: 0 }}>
                  {user?.name} · {user?.email}
                </p>
              </div>
              <div className="auth-field">
                <label htmlFor="trial-modal-class">
                  {trialClassType ? "Choose a time" : "Choose a class"}
                </label>
                {availableClasses.length === 0 ? (
                  <p className="auth-error">
                    No schedule times found for this class yet. Ask admin to add sessions.
                  </p>
                ) : (
                  <select
                    id="trial-modal-class"
                    required
                    value={classId}
                    onChange={(event) => setClassId(event.target.value)}
                  >
                    <option value="">
                      {trialClassType ? "Select a time" : "Select a class"}
                    </option>
                    {availableClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.day} · {c.time} · {c.duration}
                        {!trialClassType ? ` · ${c.type}` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {selected && (
                <div className="trial-modal-class">
                  <div className="sc-badge" style={{ background: selected.bg, color: selected.color }}>
                    <ClassIcon type={selected.type} color={selected.color} offers={offers} />
                  </div>
                  <div>
                    <strong>{selected.type}</strong>
                    <span>
                      {selected.day} · {selected.time} · {selected.duration}
                    </span>
                  </div>
                </div>
              )}
              {error && <p className="auth-error">{error}</p>}
              <button
                className="auth-submit"
                type="submit"
                disabled={busy || !user || availableClasses.length === 0}
              >
                {busy ? "Booking…" : "Confirm free trial"}
              </button>
              <p className="trial-note">We&apos;ll email you a join link before class starts.</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
