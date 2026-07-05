import type { Metadata } from "next";
import Teacher from "@/components/Teacher";

export const metadata: Metadata = {
  title: "Teacher · Om At Home",
  description:
    "Meet Fillie Faragi — the teacher behind Om At Home's daily live virtual yoga classes.",
};

export default function TeacherPage() {
  return <Teacher />;
}
