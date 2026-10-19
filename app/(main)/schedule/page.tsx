import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

/** Schedule now lives on the Classes page. */
export default function SchedulePage() {
  redirect(ROUTES.classes);
}
