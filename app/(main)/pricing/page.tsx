import type { Metadata } from "next";
import Pricing from "@/components/Pricing";
import { getPricing } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing · Om At Home",
  description:
    "Join Om At Home for $70/month — unlimited access to five daily live yoga classes with Fillie Faragi.",
};

export default async function PricingPage() {
  const plans = await getPricing();
  return <Pricing plans={plans} />;
}
