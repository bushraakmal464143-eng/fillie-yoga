import type { Metadata } from "next";
import Classes from "@/components/Classes";
import { getOffers } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Classes & Schedule · Om At Home",
  description:
    "Explore Yin, Vinyasa, Pilates, Heart Opening Yin, and Sunset Flow — then pick a live class time from the weekly schedule with Fillie Faragi.",
};

export default async function ClassesPage() {
  const offers = await getOffers();
  return <Classes offers={offers} />;
}
