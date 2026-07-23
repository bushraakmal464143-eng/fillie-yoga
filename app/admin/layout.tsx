import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import "./admin.css";
import AdminAuthProvider from "@/components/admin/AdminAuthProvider";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin · Om At Home",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
