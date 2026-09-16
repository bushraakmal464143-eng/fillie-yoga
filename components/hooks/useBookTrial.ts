"use client";

import { useCallback } from "react";
import { markPendingTrial } from "@/components/TrialModal";
import { useApp } from "@/components/providers/AppProvider";
import { useAuth } from "@/components/providers/AuthProvider";

/** Opens login if logged out, otherwise opens the free-trial details popup. */
export function useBookTrial() {
  const { user, authReady, openAuth } = useAuth();
  const { openTrialModal } = useApp();

  return useCallback(
    (classType?: string) => {
      if (!authReady) return;
      if (!user) {
        markPendingTrial(classType);
        openAuth("login");
        return;
      }
      openTrialModal(classType ?? null);
    },
    [authReady, user, openAuth, openTrialModal],
  );
}
