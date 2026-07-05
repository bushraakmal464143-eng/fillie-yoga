import { NextResponse } from "next/server";
import { readClassesStore } from "@/lib/store";

export async function GET() {
  const store = await readClassesStore();
  return NextResponse.json(store);
}
