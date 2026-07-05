import type { YogaClass } from "./types";

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const TUE_THU = new Set(["Tuesday", "Thursday"]);

function pseudoRandom(seed: number): number {
  return ((seed * 9301 + 49297) % 233280) / 233280;
}

export const TYPE_ICONS: Record<string, { id: string; vb: string }> = {
  "Vinyasa Flow": { id: "icon-vinyasa", vb: "0 0 48 48" },
  Pilates: { id: "icon-pilates", vb: "0 0 48 48" },
  "Yin Yoga Flow": { id: "icon-yin", vb: "0 0 48 48" },
  "Heart Opening Yin": { id: "icon-heart-yin", vb: "0 0 48 48" },
  "Sunset Flow: Live from Giza": { id: "icon-sunset", vb: "0 0 24 24" },
};

export function buildClasses(): YogaClass[] {
  const list: YogaClass[] = [];
  let cid = 1;

  DAYS.forEach((day) => {
    const daily = [
      {
        type: "Vinyasa Flow",
        bg: "#2980B922",
        color: "#1E6FA8",
        time: "5:30 AM",
        duration: "45 min",
      },
      {
        type: "Vinyasa Flow",
        bg: "#2980B922",
        color: "#1E6FA8",
        time: "9:00 AM",
        duration: "45 min",
      },
      {
        type: "Pilates",
        bg: "#27AE6022",
        color: "#1E7A4A",
        time: "11:00 AM",
        duration: "35 min",
      },
      {
        type: "Yin Yoga Flow",
        bg: "#8E44AD22",
        color: "#7B3FA0",
        time: "2:00 PM",
        duration: "45 min",
      },
      {
        type: "Yin Yoga Flow",
        bg: "#8E44AD22",
        color: "#7B3FA0",
        time: "4:00 PM",
        duration: "45 min",
      },
    ];

    daily.forEach((session) => {
      list.push({
        id: cid,
        day,
        special: false,
        ...session,
        spots: Math.floor(pseudoRandom(cid) * 12) + 4,
      });
      cid += 1;
    });

    if (TUE_THU.has(day)) {
      list.push({
        id: cid,
        day,
        special: false,
        type: "Heart Opening Yin",
        bg: "#C0392B22",
        color: "#C0392B",
        time: "7:00 AM",
        duration: "45 min",
        spots: Math.floor(pseudoRandom(cid) * 8) + 4,
      });
      cid += 1;
    }
  });

  list.push({
    id: cid,
    day: "Saturday",
    special: true,
    type: "Sunset Flow: Live from Giza",
    bg: "#D4A01722",
    color: "#D4A017",
    time: "Quarterly",
    duration: "90 min",
    spots: 500,
    note: "Next: Sep 2026",
  });

  return list;
}

export const ALL_CLASSES = buildClasses();

export const FLAG_CODES = [
  { code: "us", name: "United States" },
  { code: "gb", name: "United Kingdom" },
  { code: "au", name: "Australia" },
  { code: "in", name: "India" },
  { code: "br", name: "Brazil" },
  { code: "za", name: "South Africa" },
  { code: "jp", name: "Japan" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
] as const;
