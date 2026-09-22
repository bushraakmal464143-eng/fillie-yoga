"use client";

import { useCallback, useEffect } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { useAuth } from "@/components/providers/AuthProvider";

const PENDING_SUBSCRIBE_KEY = "omathome_pending_subscribe";

export function markPendingSubscribe() {
  try {
    sessionStorage.setItem(PENDING_SUBSCRIBE_KEY, "1");
  } catch {
    // ignore
  }
}

export function consumePendingSubscribe(): boolean {
  try {
    const pending = sessionStorage.getItem(PENDING_SUBSCRIBE_KEY) === "1";
    if (pending) sessionStorage.removeItem(PENDING_SUBSCRIBE_KEY);
    return pending;
  } catch {
    return false;
  }
}

/**
 * Join Class: open login/signup if logged out; start Stripe checkout if logged in.
 * After auth completes, resumes checkout automatically.
 */
export function useJoinClass() {
  const { user, authReady, openAuth } = useAuth();
  const {
    subscribe,
    subscribed,
    checkoutLoading,
    goToBookApp,
    setActiveTab,
  } = useApp();

  useEffect(() => {
    if (!user || !authReady) return;
    if (!consumePendingSubscribe()) return;

    if (subscribed) {
      setActiveTab("appschedule");
      goToBookApp();
      return;
    }

    void subscribe();
  }, [user, authReady, subscribed, subscribe, goToBookApp, setActiveTab]);

  const joinClass = useCallback(() => {
    if (!authReady) return;

    if (!user) {
      markPendingSubscribe();
      openAuth("login");
      return;
    }

    if (subscribed) {
      setActiveTab("appschedule");
      goToBookApp();
      return;
    }

    void subscribe();
  }, [authReady, user, subscribed, openAuth, subscribe, goToBookApp, setActiveTab]);

  return { joinClass, checkoutLoading };
}
