import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { getOrderDetail } from "../../../../lib/orders";
import { getSignedUrl } from "../../../../lib/storage";

type Artifact = {
  id: string;
  storage_path: string;
  kind: string;
};

type OrderRecord = {
  email?: string | null;
  artifacts?: Artifact[] | null;
  [key: string]: unknown;
};

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const order = (await getOrderDetail(id)) as OrderRecord | null;
    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (order.email !== user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const artifacts = await Promise.all(
      (order.artifacts ?? []).map(async (artifact: Artifact) => {
        const signedUrl = await getSignedUrl("reports", artifact.storage_path);
        return { ...artifact, signed_url: signedUrl };
      })
    );

    return NextResponse.json({ order: { ...order, artifacts } }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
