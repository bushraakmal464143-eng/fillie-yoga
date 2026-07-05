import type { Metadata } from "next";
import Schedule from "@/components/Schedule";

export const metadata: Metadata = {
  title: "Schedule · Om At Home",
  description:
    "View the weekly live class schedule for Om At Home — Yin, Vinyasa, Pilates, and more across every timezone.",
};

export default function SchedulePage() {
  return <Schedule />;
}
