import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../../../lib/auth";
import { isAdminUser } from "../../../../../../lib/admin";
import { updateOrderAdminNote } from "../../../../../../lib/orders";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!isAdminUser(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const body = (await request.json()) as { note?: string };
    if (!body.note) {
      return NextResponse.json({ error: "Note required" }, { status: 400 });
    }
    await updateOrderAdminNote(id, body.note);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
