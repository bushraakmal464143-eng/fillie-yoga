export const ICON_OPTIONS = [
  { id: "icon-yin", label: "Yin", vb: "0 0 48 48" },
  { id: "icon-vinyasa", label: "Vinyasa", vb: "0 0 48 48" },
  { id: "icon-pilates", label: "Pilates", vb: "0 0 48 48" },
  { id: "icon-heart-yin", label: "Heart Yin", vb: "0 0 48 48" },
  { id: "icon-sunset", label: "Sunset", vb: "0 0 24 24" },
  { id: "icon-pyramid", label: "Pyramid", vb: "0 0 24 24" },
  { id: "icon-calendar", label: "Calendar", vb: "0 0 24 24" },
] as const;

export function getIconMeta(iconId: string) {
  return ICON_OPTIONS.find((icon) => icon.id === iconId) ?? ICON_OPTIONS[0];
}
