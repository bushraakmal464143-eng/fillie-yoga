"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AdminBooking,
  AdminLoginEvent,
  AdminMember,
  AdminSubscription,
} from "@/lib/admin-members";
import { useAdminAuth } from "./AdminAuthProvider";

export type MembersActivityData = {
  members: AdminMember[];
  logins: AdminLoginEvent[];
  subscriptions: AdminSubscription[];
  bookings: AdminBooking[];
  note: string;
  loading: boolean;
};

export function useMembersActivity() {
  const { setError, refreshKey } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Omit<MembersActivityData, "loading">>({
    members: [],
    logins: [],
    subscriptions: [],
    bookings: [],
    note: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/members");
    if (response.status === 401) {
      setLoading(false);
      return;
    }

    if (!response.ok) {
      setData({
        members: [],
        logins: [],
        subscriptions: [],
        bookings: [],
        note: "Could not load member activity.",
      });
      setError("Could not load member activity.");
      setLoading(false);
      return;
    }

    const membersData = (await response.json()) as {
      members?: AdminMember[];
      logins?: AdminLoginEvent[];
      subscriptions?: AdminSubscription[];
      bookings?: AdminBooking[];
      supabaseConfigured?: boolean;
    };

    setData({
      members: membersData.members ?? [],
      logins: membersData.logins ?? [],
      subscriptions: membersData.subscriptions ?? [],
      bookings: membersData.bookings ?? [],
      note: membersData.supabaseConfigured
        ? ""
        : "Connect Supabase to track member logins and purchases.",
    });
    setLoading(false);
  }, [setError]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  return { ...data, loading };
}
