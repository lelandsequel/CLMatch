import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../lib/auth";
import { isAdminEmail } from "../../../lib/admin";

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      {
        user: { id: user.id, email: user.email },
        is_admin: isAdminEmail(user.email)
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
