import { DAYS } from "./schedule";
import type { OfferSchedule } from "./types";

export type { OfferSchedule };

export const DURATION_OPTIONS = ["35 min", "45 min", "60 min", "90 min"] as const;

export const DAY_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const SHORT_TO_DAY = Object.fromEntries(
  Object.entries(DAY_SHORT).map(([full, short]) => [short.toLowerCase(), full]),
);

export function timeInputToDisplay(value: string): string {
  if (!value) return "";
  const [hourPart, minutePart] = value.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;

  const period = hour >= 12 ? "pm" : "am";
  const hour12 = hour % 12 || 12;
  if (minute === 0) return `${hour12}${period}`;
  return `${hour12}:${minute.toString().padStart(2, "0")}${period}`;
}

export function displayTimeToInput(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";

  const detailed = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
  if (detailed) {
    let hour = Number(detailed[1]);
    const minute = Number(detailed[2]);
    const period = detailed[3];
    if (period === "pm" && hour < 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  }

  const compact = trimmed.match(/^(\d{1,2}):(\d{2})(am|pm)$/);
  if (compact) {
    let hour = Number(compact[1]);
    const minute = Number(compact[2]);
    const period = compact[3];
    if (period === "pm" && hour < 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  }

  const simple = trimmed.match(/^(\d{1,2})(am|pm)$/);
  if (simple) {
    let hour = Number(simple[1]);
    const period = simple[2];
    if (period === "pm" && hour < 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:00`;
  }

  return "";
}

function formatDaysLabel(days: string[]): string {
  if (days.length === 7) return "";
  return days.map((day) => DAY_SHORT[day] ?? day).join(" & ");
}

export function buildOfferTag(schedule: OfferSchedule): string {
  const duration = schedule.duration.trim();
  const times = schedule.times.filter(Boolean).map(timeInputToDisplay);
  const timesLabel = times.join(" & ");

  if (!duration || !timesLabel) return "";

  if (schedule.days.length === 0 || schedule.days.length === 7) {
    return `${duration} · ${timesLabel} daily`;
  }

  const daysLabel = formatDaysLabel(schedule.days);
  return `${duration} · ${daysLabel} ${timesLabel}`;
}

export function parseOfferTag(tag: string): { schedule: OfferSchedule; customTag: string } {
  const customPatterns = /every|quarterly|live/i;
  if (customPatterns.test(tag) && !/\d+\s*min/i.test(tag)) {
    return {
      schedule: { duration: "45 min", days: DAYS.slice(), times: ["12:00"] },
      customTag: tag,
    };
  }

  const durationMatch = tag.match(/(\d+\s*min)/i);
  const duration = durationMatch?.[1] ?? "45 min";
  const daily = /\bdaily\b/i.test(tag);

  const days: string[] = [];
  if (!daily) {
    Object.entries(SHORT_TO_DAY).forEach(([short, full]) => {
      const pattern = new RegExp(`\\b${short}\\b`, "i");
      if (pattern.test(tag)) days.push(full);
    });
  } else {
    days.push(...DAYS);
  }

  const timeMatches = [
    ...tag.matchAll(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/gi),
  ].map((match) => displayTimeToInput(match[1]));

  return {
    schedule: {
      duration,
      days: days.length ? days : [...DAYS],
      times: timeMatches.length ? timeMatches : ["09:00"],
    },
    customTag: tag,
  };
}

export function offerToFormSchedule(offer: {
  tag: string;
  schedule?: OfferSchedule;
  special?: boolean;
}) {
  if (offer.schedule) {
    return {
      duration: offer.schedule.duration,
      days: [...offer.schedule.days],
      times: offer.schedule.times.length ? [...offer.schedule.times] : ["09:00"],
      customTag: offer.tag,
      useCustomTag: Boolean(offer.special),
    };
  }

  const parsed = parseOfferTag(offer.tag);
  return {
    ...parsed.schedule,
    customTag: parsed.customTag,
    useCustomTag: Boolean(offer.special),
  };
}
