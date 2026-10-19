"use client";

import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { normalizeMeetingUrl } from "@/lib/meeting-url";

const PENDING_JOIN_KEY = "omathome_pending_join";
const PENDING_JOIN_URL_KEY = "omathome_pending_join_url";

function markPendingJoin(meetingUrl?: string) {
  try {
    sessionStorage.setItem(PENDING_JOIN_KEY, "1");
    if (meetingUrl?.trim()) {
      sessionStorage.setItem(PENDING_JOIN_URL_KEY, meetingUrl.trim());
    } else {
      sessionStorage.removeItem(PENDING_JOIN_URL_KEY);
    }
  } catch {
    // ignore
  }
}

function consumePendingJoin(): { pending: boolean; meetingUrl?: string } {
  try {
    const pending = sessionStorage.getItem(PENDING_JOIN_KEY) === "1";
    const meetingUrl = sessionStorage.getItem(PENDING_JOIN_URL_KEY) || undefined;
    if (pending) {
      sessionStorage.removeItem(PENDING_JOIN_KEY);
      sessionStorage.removeItem(PENDING_JOIN_URL_KEY);
    }
    return { pending, meetingUrl };
  } catch {
    return { pending: false };
  }
}

function openZoom(meetingUrl?: string) {
  const href = normalizeMeetingUrl(meetingUrl);
  if (!href) return false;
  window.open(href, "_blank", "noopener,noreferrer");
  return true;
}

/**
 * Join Class gate:
 * 1) Not logged in → ask to log in / sign up
 * 2) Logged in, no membership → buy subscription first
 * 3) Subscribed → open Zoom / schedule
 */
export function useJoinClass() {
  const { user, authReady, openAuth } = useAuth();
  const {
    subscribe,
    subscribed,
    checkoutLoading,
    checkoutError,
    goToBookApp,
    setActiveTab,
  } = useApp();
  const [joinHint, setJoinHint] = useState("");

  useEffect(() => {
    if (!user || !authReady) return;
    const { pending, meetingUrl } = consumePendingJoin();
    if (!pending) return;

    if (subscribed) {
      if (!openZoom(meetingUrl)) {
        setActiveTab("appschedule");
        goToBookApp();
      }
      setJoinHint("");
      return;
    }

    setJoinHint("You're logged in. Subscribe to unlock live classes, then you can join on Zoom.");
    setActiveTab("subscribe");
    goToBookApp();
    void subscribe();
  }, [user, authReady, subscribed, subscribe, goToBookApp, setActiveTab]);

  const joinClass = useCallback(
    (meetingUrl?: string) => {
      if (!authReady) return;

      if (!user) {
        markPendingJoin(meetingUrl);
        setJoinHint("");
        openAuth(
          "login",
          "Please log in or sign up first. After that, subscribe to join live classes.",
        );
        return;
      }

      if (!subscribed) {
        markPendingJoin(meetingUrl);
        setJoinHint("Please subscribe first — then you can join live classes on Zoom.");
        setActiveTab("subscribe");
        goToBookApp();
        void subscribe();
        return;
      }

      if (openZoom(meetingUrl)) {
        setJoinHint("");
        return;
      }

      setActiveTab("appschedule");
      goToBookApp();
    },
    [authReady, user, subscribed, openAuth, subscribe, goToBookApp, setActiveTab],
  );

  return {
    joinClass,
    checkoutLoading,
    joinHint: joinHint || checkoutError || "",
  };
}

/** Kept for Pricing CTA — marks intent to subscribe after auth. */
export function markPendingSubscribe() {
  markPendingJoin();
}

export function consumePendingSubscribe(): boolean {
  return consumePendingJoin().pending;
}
