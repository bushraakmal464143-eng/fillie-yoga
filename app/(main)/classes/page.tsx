import type { Metadata } from "next";
import Classes from "@/components/Classes";
import { getOffers } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Classes · Om At Home",
  description:
    "Yin Yoga Flow, Vinyasa Flow, Pilates, Heart Opening Yin, and Sunset Flow — five live classes daily with Fillie Faragi.",
};

export default async function ClassesPage() {
  const offers = await getOffers();
  return <Classes offers={offers} />;
}
