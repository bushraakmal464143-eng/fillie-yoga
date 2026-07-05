import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/user-store";
import { setUserSession, toPublicUser } from "@/lib/user-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  try {
    const user = await createUser({ name, email, password });
    const response = NextResponse.json({ user: toPublicUser(user) });
    setUserSession(response, user.id);
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }
}
