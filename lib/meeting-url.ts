import type { ClassOffer, YogaClass } from "@/lib/types";

const DEFAULT_ZOOM =
  process.env.NEXT_PUBLIC_DEFAULT_ZOOM_URL?.trim() ||
  "https://us06web.zoom.us/j/84338725946?pwd=r4CFla2ftMXXULbCqV97lDhZs4iVm9.1";

export function normalizeMeetingUrl(url?: string | null): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Prefer session Zoom link, then matching class card, then studio default. */
export function resolveMeetingUrl(
  session: Pick<YogaClass, "type" | "meetingUrl"> | null | undefined,
  offers: ClassOffer[] = [],
): string | undefined {
  const fromSession = normalizeMeetingUrl(session?.meetingUrl);
  if (fromSession) return fromSession;

  const type = session?.type?.trim().toLowerCase() ?? "";
  if (type) {
    const match = offers.find((offer) => {
      const title = offer.title.trim().toLowerCase();
      return title === type || title.includes(type) || type.includes(title);
    });
    const fromOffer = normalizeMeetingUrl(match?.meetingUrl);
    if (fromOffer) return fromOffer;
  }

  const anyOffer = offers.find((offer) => normalizeMeetingUrl(offer.meetingUrl));
  const shared = normalizeMeetingUrl(anyOffer?.meetingUrl);
  if (shared) return shared;

  return normalizeMeetingUrl(DEFAULT_ZOOM);
}

export function withResolvedMeetingUrls(
  sessions: YogaClass[],
  offers: ClassOffer[],
): YogaClass[] {
  return sessions.map((session) => ({
    ...session,
    meetingUrl: resolveMeetingUrl(session, offers) ?? session.meetingUrl,
  }));
}
