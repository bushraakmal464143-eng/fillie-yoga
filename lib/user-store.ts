import { promises as fs } from "fs";
import path from "path";
import { hashPassword } from "./user-auth";
import type { StoredUser, User } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "users.json");

type UserStore = {
  users: StoredUser[];
};

async function readStore(): Promise<UserStore> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw) as UserStore;
  } catch {
    return { users: [] };
  }
}

async function writeStore(store: UserStore): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const store = await readStore();
  const normalized = email.trim().toLowerCase();
  return store.users.find((user) => user.email === normalized) ?? null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const store = await readStore();
  return store.users.find((user) => user.id === id) ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  const store = await readStore();
  const email = input.email.trim().toLowerCase();

  if (store.users.some((user) => user.email === email)) {
    throw new Error("EMAIL_EXISTS");
  }

  const user: StoredUser = {
    id: `user-${crypto.randomUUID()}`,
    name: input.name.trim(),
    email,
    createdAt: Date.now(),
    passwordHash: await hashPassword(input.password),
  };

  store.users.push(user);
  await writeStore(store);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}
