import { TYPE_ICONS } from "@/lib/schedule";
import type { ClassOffer } from "@/lib/types";

export function ClassIcon({
  type,
  color,
  offers = [],
}: {
  type: string;
  color: string;
  offers?: ClassOffer[];
}) {
  const offer = offers.find((item) => item.title === type);
  const icon = offer
    ? { id: offer.icon, vb: offer.vb }
    : (TYPE_ICONS[type] ?? TYPE_ICONS["Vinyasa Flow"]);

  return (
    <svg viewBox={icon.vb} aria-hidden="true" style={{ color }}>
      <use href={`#${icon.id}`} />
    </svg>
  );
}
