import type { Metadata } from "next";
import "../../globals.css";
import "../admin.css";
import AdminSubscribersPanel from "@/components/AdminSubscribersPanel";

export const metadata: Metadata = {
  title: "Subscribers · Admin · Om At Home",
  robots: { index: false, follow: false },
};

export default function AdminSubscribersPage() {
  return <AdminSubscribersPanel />;
}
