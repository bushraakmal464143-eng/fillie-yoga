import type { Metadata } from "next";
import DistanceReiki from "@/components/DistanceReiki";

export const metadata: Metadata = {
  title: "Distance Reiki · Om At Home",
  description:
    "Distance Reiki with Om At Home — gentle energy healing you can receive from anywhere in the world. 30-minute sessions from $25.",
};

export default function ReikiPage() {
  return <DistanceReiki />;
}
