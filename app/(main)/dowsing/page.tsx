import type { Metadata } from "next";
import AskTheRods from "@/components/AskTheRods";

export const metadata: Metadata = {
  title: "Ask the Rods · Om At Home",
  description:
    "Ask the Rods with Om At Home — live or recorded dowsing sessions with Fillie Faragi. From $10.",
};

export default function DowsingPage() {
  return <AskTheRods />;
}
