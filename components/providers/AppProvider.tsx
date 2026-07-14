"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { startStripeCheckout } from "@/lib/checkout";
import { DEFAULT_OFFERS, DEFAULT_PRICING } from "@/lib/default-store";
import { buildClasses } from "@/lib/schedule";
import { getPrimaryPlan } from "@/lib/pricing";
import { ROUTES } from "@/lib/routes";
import type { AppTab, ClassOffer, PricingPlan, TrialBooking, YogaClass } from "@/lib/types";

type AppContextValue = {
  offers: ClassOffer[];
  allClasses: YogaClass[];
  pricing: PricingPlan[];
  primaryPlan: PricingPlan | null;
  classesLoaded: boolean;
  subscribed: boolean;
  checkoutLoading: boolean;
  checkoutError: string | null;
  cancelLoading: boolean;
  booked: Set<number>;
  trialBooking: TrialBooking | null;
  appFilter: string;
  activeTab: AppTab;
  setAppFilter: (filter: string) => void;
  setActiveTab: (tab: AppTab) => void;
  refreshClasses: () => Promise<void>;
  goToBookApp: () => void;
  openTrial: () => void;
  subscribe: (planId?: string) => Promise<void>;
  cancelSub: () => Promise<void>;
  toggleBook: (id: number) => void;
  submitTrial: (data: Omit<TrialBooking, "bookedAt">) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [offers, setOffers] = useState<ClassOffer[]>(DEFAULT_OFFERS);
  const [allClasses, setAllClasses] = useState<YogaClass[]>(buildClasses());
  const [pricing, setPricing] = useState<PricingPlan[]>(DEFAULT_PRICING);
  const [classesLoaded, setClassesLoaded] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [booked, setBooked] = useState<Set<number>>(new Set());
  const [trialBooking, setTrialBooking] = useState<TrialBooking | null>(null);
  const [appFilter, setAppFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<AppTab>("trial");
  const [hydrated, setHydrated] = useState(false);

  const refreshClasses = useCallback(async () => {
    const response = await fetch("/api/classes");
    if (!response.ok) return;
    const data = (await response.json()) as {
      offers: ClassOffer[];
      sessions: YogaClass[];
      pricing?: PricingPlan[];
    };
    setOffers(data.offers);
    setAllClasses(data.sessions);
    if (data.pricing?.length) setPricing(data.pricing);
    setClassesLoaded(true);
  }, []);

  const primaryPlan = useMemo(() => getPrimaryPlan(pricing), [pricing]);

  useEffect(() => {
    void refreshClasses();
  }, [refreshClasses]);

  useEffect(() => {
    const stored = localStorage.getItem("omathome_trial");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TrialBooking;
        setTrialBooking(parsed);
        setBooked(new Set([parsed.classId]));
      } catch {
        localStorage.removeItem("omathome_trial");
      }
    }

    if (localStorage.getItem("omathome_subscribed") === "1") {
      setSubscribed(true);
      setActiveTab("subscribe");
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      const sessionId = params.get("session_id");
      void (async () => {
        if (sessionId) {
          try {
            const response = await fetch(
              `/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`,
            );
            const data = (await response.json()) as {
              subscriptionId?: string;
            };
            if (response.ok && data.subscriptionId) {
              localStorage.setItem("omathome_subscription_id", data.subscriptionId);
            }
          } catch {
            // Keep local membership even if session lookup fails.
          }
        }
        setSubscribed(true);
        setActiveTab("subscribe");
        localStorage.setItem("omathome_subscribed", "1");
      })();

      params.delete("checkout");
      params.delete("session_id");
      const next = params.toString();
      const cleanUrl = `${window.location.pathname}${next ? `?${next}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", cleanUrl);
    }

    setHydrated(true);
  }, []);

  const goToBookApp = useCallback(() => {
    if (pathname === ROUTES.home) {
      document.getElementById("book-app")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    router.push(ROUTES.bookApp);
  }, [pathname, router]);

  const openTrial = useCallback(() => {
    setActiveTab("trial");
    goToBookApp();
  }, [goToBookApp]);

  const subscribe = useCallback(async (planId?: string) => {
    setCheckoutError(null);
    setCheckoutLoading(true);
    try {
      await startStripeCheckout(planId);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Checkout failed");
      setCheckoutLoading(false);
    }
  }, []);

  const cancelSub = useCallback(async () => {
    setCancelLoading(true);
    setCheckoutError(null);

    const subscriptionId = localStorage.getItem("omathome_subscription_id");
    if (subscriptionId) {
      try {
        const response = await fetch("/api/stripe/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptionId }),
        });
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        if (!response.ok) {
          setCheckoutError(data?.error ?? "Could not cancel subscription in Stripe.");
          setCancelLoading(false);
          return;
        }
      } catch {
        setCheckoutError("Could not cancel subscription. Please try again.");
        setCancelLoading(false);
        return;
      }
    }

    setSubscribed(false);
    localStorage.removeItem("omathome_subscribed");
    localStorage.removeItem("omathome_subscription_id");
    setBooked((prev) => {
      const next = new Set<number>();
      if (trialBooking) next.add(trialBooking.classId);
      return next;
    });
    setCancelLoading(false);
  }, [trialBooking]);

  const toggleBook = useCallback(
    (id: number) => {
      if (!subscribed) return;
      setBooked((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [subscribed],
  );

  const submitTrial = useCallback((data: Omit<TrialBooking, "bookedAt">) => {
    const booking: TrialBooking = { ...data, bookedAt: Date.now() };
    setTrialBooking(booking);
    localStorage.setItem("omathome_trial", JSON.stringify(booking));
    setBooked(new Set([booking.classId]));
  }, []);

  const value = useMemo(
    () => ({
      offers,
      allClasses,
      pricing,
      primaryPlan,
      classesLoaded,
      subscribed,
      checkoutLoading,
      checkoutError,
      cancelLoading,
      booked,
      trialBooking: hydrated ? trialBooking : null,
      appFilter,
      activeTab,
      setAppFilter,
      setActiveTab,
      refreshClasses,
      goToBookApp,
      openTrial,
      subscribe,
      cancelSub,
      toggleBook,
      submitTrial,
    }),
    [
      offers,
      allClasses,
      pricing,
      primaryPlan,
      classesLoaded,
      subscribed,
      checkoutLoading,
      checkoutError,
      cancelLoading,
      booked,
      trialBooking,
      hydrated,
      appFilter,
      activeTab,
      refreshClasses,
      goToBookApp,
      openTrial,
      subscribe,
      cancelSub,
      toggleBook,
      submitTrial,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
