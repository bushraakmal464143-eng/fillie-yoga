export const ROUTES = {
  home: "/",
  classes: "/classes",
  schedule: "/schedule",
  teacher: "/teacher",
  pricing: "/pricing",
  reiki: "/reiki",
  dowsing: "/dowsing",
  admin: "/admin",
  adminClassCards: "/admin/class-cards",
  adminSessions: "/admin/sessions",
  adminPricing: "/admin/pricing",
  adminMembers: "/admin/members",
  adminSubscriptions: "/admin/subscriptions",
  adminBookings: "/admin/bookings",
  adminSubscribers: "/admin/subscribers",
  adminClasses: "/admin/classes",
  sunset: "/#sunset",
  bookApp: "/#book-app",
  wellness: "/#wellness",
  features: "/#features",
} as const;

/** Public contact email used for wellness session requests. */
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "filliefaragi@gmail.com";
