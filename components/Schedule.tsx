"use client";

import Classes from "@/components/Classes";
import { useApp } from "@/components/providers/AppProvider";

/** @deprecated Prefer the Classes page — kept for any leftover imports. */
export default function Schedule() {
  const { offers } = useApp();
  return <Classes offers={offers} />;
}
