import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "logins.json");

export type LoginEvent = {
  id: string;
  userId: string;
  name: string;
  email: string;
  action: "login" | "signup" | "logout";
  at: number;
  ip: string;
  userAgent: string;
};

type LoginStore = {
  events: LoginEvent[];
};

const MAX_EVENTS = 500;

async function readStore(): Promise<LoginStore> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw) as LoginStore;
  } catch {
    return { events: [] };
  }
}

async function writeStore(store: LoginStore): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2), "utf8");
}

export function getClientMeta(request: Request): { ip: string; userAgent: string } {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return { ip, userAgent };
}

export async function recordLoginEvent(input: {
  userId: string;
  name: string;
  email: string;
  action: LoginEvent["action"];
  ip: string;
  userAgent: string;
}): Promise<LoginEvent> {
  const store = await readStore();
  const event: LoginEvent = {
    id: `login-${crypto.randomUUID()}`,
    userId: input.userId,
    name: input.name,
    email: input.email,
    action: input.action,
    at: Date.now(),
    ip: input.ip,
    userAgent: input.userAgent,
  };

  store.events.unshift(event);
  if (store.events.length > MAX_EVENTS) {
    store.events = store.events.slice(0, MAX_EVENTS);
  }
  await writeStore(store);
  return event;
}

export async function listLoginEvents(limit = 100): Promise<LoginEvent[]> {
  const store = await readStore();
  return store.events.slice(0, limit);
}
