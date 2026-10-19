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
    cancelTrial,
    primaryPlan,
    setActiveTab,
    goToBookApp,
  } = useApp();
  const { user } = useAuth();
  const [classId, setClassId] = useState("");
  const [busy, setBusy] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);
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

  useEffect(() => {
    if (!user) return;
    const { pending, classType } = consumePendingTrial();
    if (!pending) return;
    openTrialModal(classType);
  }, [user, openTrialModal]);

  if (!trialModalOpen) return null;

  const bookedClass = trialBooking
    ? allClasses.find((c) => c.id === trialBooking.classId)
    : undefined;

  const firstName = (trialBooking?.name || user?.name || "friend").trim().split(/\s+/)[0];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    const id = parseInt(classId, 10);
    if (!id) {
      setError("Please choose a class time.");
      return;
    }
    const selectedClass = allClasses.find((c) => c.id === id);
    if (!selectedClass) {
      setError("Please choose a class time.");
      return;
    }
    setBusy(true);
    setError("");
    const bookError = await submitTrial({
      name: user.name,
      email: user.email,
      classId: id,
      classType: selectedClass.type,
      day: selectedClass.day,
      time: selectedClass.time,
      duration: selectedClass.duration,
      meetingUrl: selectedClass.meetingUrl,
    });
    if (bookError) setError(bookError);
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
          {trialBooking
            ? "Your trial lesson is booked"
            : trialClassType
              ? `Book ${trialClassType}`
              : "Book your free trial"}
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
          <div className="trial-success-panel">
            <div className="trial-success-mark" aria-hidden="true">
              ✓
            </div>
            <p className="trial-success-hello">
              Hi {firstName}, your trial lesson is booked.
            </p>
            <p className="trial-success-note">
              A confirmation email was sent to{" "}
              <strong>{trialBooking?.email || user?.email || "your inbox"}</strong> with the class
              day, time, and how to join. Check your spam folder if you don&apos;t see it.
            </p>
            {bookedClass && (
              <div className="trial-modal-class trial-modal-class--success">
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
            )}
            {bookedClass?.meetingUrl && (
              <a
                className="join-meet-btn trial-modal-join"
                href={bookedClass.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Zoom meeting
              </a>
            )}
            <button
              className="trial-success-btn"
              type="button"
              onClick={() => {
                closeTrialModal();
                setActiveTab("subscribe");
                goToBookApp();
              }}
            >
              View membership · {primaryPlan ? formatPlanPeriod(primaryPlan) : "$70/mo"}
            </button>
            <button
              className="trial-cancel-btn"
              type="button"
              disabled={cancelBusy}
              onClick={() => {
                void (async () => {
                  setCancelBusy(true);
                  setError("");
                  const cancelError = await cancelTrial();
                  setCancelBusy(false);
                  if (cancelError) {
                    setError(cancelError);
                    return;
                  }
                  setClassId("");
                })();
              }}
            >
              {cancelBusy ? "Canceling…" : "Cancel trial lesson"}
            </button>
            {error && <p className="auth-error">{error}</p>}
          </div>
        ) : (
          <>
            <p className="auth-subtitle">
              {trialClassType
                ? `Pick a time for ${trialClassType}. One free session — no payment needed.`
                : "Choose a live class with Fillie Faragi. One free session — no payment needed."}
            </p>
            <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
              <div className="auth-field">
                <label>Signed in as</label>
                <p className="trial-signed-in">
                  <span className="trial-signed-in__name">{user?.name}</span>
                  <span className="trial-signed-in__email">{user?.email}</span>
                </p>
              </div>

              <div className="auth-field">
                <label id="trial-class-list-label">
                  {trialClassType ? "Choose a time" : "Choose a class"}
                </label>
                {availableClasses.length === 0 ? (
                  <p className="auth-error">
                    No schedule times found for this class yet. Ask admin to add sessions.
                  </p>
                ) : (
                  <div
                    className="trial-class-list"
                    role="listbox"
                    aria-labelledby="trial-class-list-label"
                    aria-activedescendant={classId ? `trial-option-${classId}` : undefined}
                  >
                    {availableClasses.map((c) => {
                      const selected = String(c.id) === classId;
                      return (
                        <button
                          key={c.id}
                          id={`trial-option-${c.id}`}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          className={`trial-class-option${selected ? " is-selected" : ""}`}
                          onClick={() => {
                            setClassId(String(c.id));
                            setError("");
                          }}
                        >
                          <span
                            className="trial-class-option__icon"
                            style={{ background: c.bg, color: c.color }}
                            aria-hidden="true"
                          >
                            <ClassIcon type={c.type} color={c.color} offers={offers} />
                          </span>
                          <span className="trial-class-option__body">
                            {!trialClassType && (
                              <span className="trial-class-option__title">{c.type}</span>
                            )}
                            <span className="trial-class-option__meta">
                              {c.day} · {c.time}
                            </span>
                            <span className="trial-class-option__duration">{c.duration}</span>
                          </span>
                          <span className="trial-class-option__check" aria-hidden="true">
                            {selected ? "✓" : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {error && <p className="auth-error">{error}</p>}
              <button
                className="auth-submit"
                type="submit"
                disabled={busy || !user || availableClasses.length === 0}
              >
                {busy ? "Booking…" : "Confirm free trial"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
