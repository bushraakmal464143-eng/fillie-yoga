import type { Metadata } from "next";
import "../../globals.css";
import "../admin.css";
import AdminClassesPanel from "@/components/AdminClassesPanel";

export const metadata: Metadata = {
  title: "Classes · Admin · Om At Home",
  robots: { index: false, follow: false },
};

export default function AdminClassesPage() {
  return <AdminClassesPanel />;
}
