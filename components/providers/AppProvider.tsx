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
  booked: Set<number>;
  trialBooking: TrialBooking | null;
  appFilter: string;
  activeTab: AppTab;
  setAppFilter: (filter: string) => void;
  setActiveTab: (tab: AppTab) => void;
  refreshClasses: () => Promise<void>;
  goToBookApp: () => void;
  openTrial: () => void;
  subscribe: () => void;
  cancelSub: () => void;
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

  const subscribe = useCallback(() => {
    setSubscribed(true);
  }, []);

  const cancelSub = useCallback(() => {
    setSubscribed(false);
    setBooked((prev) => {
      const next = new Set<number>();
      if (trialBooking) next.add(trialBooking.classId);
      return next;
    });
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
