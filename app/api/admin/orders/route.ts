import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { isAdminUser } from "../../../../lib/admin";
import { listOrders } from "../../../../lib/orders";

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!isAdminUser(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orders = await listOrders();
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
