import type { Metadata } from "next";
import "../../globals.css";
import "../admin.css";
import AdminPricingPanel from "@/components/AdminPricingPanel";

export const metadata: Metadata = {
  title: "Pricing · Admin · Om At Home",
  robots: { index: false, follow: false },
};

export default function AdminPricingPage() {
  return <AdminPricingPanel />;
}
