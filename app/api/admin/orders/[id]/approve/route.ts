import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../../../lib/auth";
import { isAdminUser } from "../../../../../../lib/admin";
import { findOrderById, updateOrderStatus } from "../../../../../../lib/orders";
import { sendEmail } from "../../../../../../lib/email";
import { getLatestQcResult } from "../../../../../../lib/qc/persist";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(request);
    if (!isAdminUser(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const override = searchParams.get("override") === "1";
    const qc = await getLatestQcResult(id);
    if (qc?.hard_fail && !override) {
      return NextResponse.json({ error: "QC hard fail. Override required." }, { status: 400 });
    }

    await updateOrderStatus(id, "approved_manual");
    await updateOrderStatus(id, "delivered");
    const order = await findOrderById(id);

    if (order) {
      await sendEmail({
        to: order.email,
        subject: "Your C&L Job Match report is ready",
        html: "<p>Your report is ready. Log in to your dashboard to download your assets.</p>"
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
