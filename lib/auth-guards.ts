import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

//Central auth guard for routes to easily perform a sessions or admin check
type AuthedSession = Session & { user: Session["user"] & { email: string } };

type GuardResult<S> =
  | { session: S; error?: undefined }
  | { session?: undefined; error: NextResponse };

export async function requireAuth(): Promise<GuardResult<AuthedSession>> {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }
  return { session: session as AuthedSession };
}

export async function requireAdmin(): Promise<GuardResult<Session>> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  }
  return { session };
}
