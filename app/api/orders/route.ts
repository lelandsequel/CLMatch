import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../../lib/auth";
import { listOrdersForEmail } from "../../../lib/orders";
import { getSignedUrl } from "../../../lib/storage";

type Artifact = {
  id: string;
  storage_path: string;
  kind: string;
};

type OrderRecord = {
  artifacts?: Artifact[] | null;
  [key: string]: unknown;
};

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = (await listOrdersForEmail(user.email)) as OrderRecord[];
    const hydrated = await Promise.all(
      orders.map(async (order) => {
        const artifacts = await Promise.all(
          (order.artifacts ?? []).map(async (artifact: Artifact) => {
            const signedUrl = await getSignedUrl("reports", artifact.storage_path);
            return { ...artifact, signed_url: signedUrl };
          })
        );
        return { ...order, artifacts };
      })
    );

    return NextResponse.json({ orders: hydrated }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
