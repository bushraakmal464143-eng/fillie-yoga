import type { Metadata } from "next";
import "../globals.css";
import "./admin.css";
import AdminPanel from "@/components/AdminPanel";

export const metadata: Metadata = {
  title: "Admin · Om At Home",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPanel />;
}
