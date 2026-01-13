import { NextResponse } from "next/server";
import { createOrder, createIntake, findOrderBySession } from "../../../../lib/orders";
import { uploadBuffer } from "../../../../lib/storage";
import { processOrder } from "../../../../lib/processing/processOrder";
import { getTier } from "../../../../lib/pricing";

export const runtime = "nodejs";

function parseCsv(value: string | null) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const sessionId = String(formData.get("session_id") ?? "");
    const tierId = String(formData.get("tier") ?? "offer_farming_report");
    const fullName = String(formData.get("full_name") ?? "");
    const email = String(formData.get("email") ?? "");
    const resumeFile = formData.get("resume");
    const tier = getTier(tierId);

    if (!email || !fullName || !(resumeFile instanceof File) || !tier) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const devMode = process.env.STRIPE_DISABLED === "true";
    let order = sessionId ? await findOrderBySession(sessionId) : null;

    if (!order && devMode) {
      const includedFeatures = { ...tier.flags, includesPivotPathways: tier.includesPivotPathways };
      order = await createOrder({
        email,
        full_name: fullName,
        stripe_session_id: sessionId || null,
        stripe_payment_status: devMode ? "paid" : null,
        tier_id: tier.id,
        price_usd: tier.priceUSD,
        included_features: includedFeatures,
        max_jobs: tier.limits.maxJobs,
        status: "draft"
      });
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const arrayBuffer = await resumeFile.arrayBuffer();
    const resumeBuffer = Buffer.from(arrayBuffer);
    const resumePath = `intakes/${order.id}/${resumeFile.name}`;

    await uploadBuffer("intakes", resumePath, arrayBuffer, resumeFile.type || "application/pdf");

    const preferences = {
      remote_only: String(formData.get("remote_only")) === "true",
      contract_ok: String(formData.get("contract_ok")) === "true",
      preferred_titles: parseCsv(String(formData.get("target_titles") ?? "")),
      industries_prefer: parseCsv(String(formData.get("industries_prefer") ?? "")),
      industries_avoid: parseCsv(String(formData.get("industries_avoid") ?? "")),
      salary_min: Number(formData.get("salary_min") ?? "") || undefined,
      geo: ""
    };

    const intake = await createIntake({
      order_id: order.id,
      resume_storage_path: resumePath,
      linkedin_url: String(formData.get("linkedin_url") ?? ""),
      target_titles: parseCsv(String(formData.get("target_titles") ?? "")),
      seniority: String(formData.get("seniority") ?? "IC"),
      preferences,
      target_job_url: String(formData.get("target_job_url") ?? ""),
      target_jd: String(formData.get("target_jd") ?? ""),
      resume_profile_json: null
    });

    await processOrder({
      orderId: order.id,
      intakeId: intake.id,
      fullName,
      email,
      tierId: order.tier_id ?? tier.id,
      resumeFileName: resumeFile.name,
      resumeBuffer,
      targetTitles: parseCsv(String(formData.get("target_titles") ?? "")),
      preferences,
      target_job_url: String(formData.get("target_job_url") ?? ""),
      target_jd: String(formData.get("target_jd") ?? "")
    });

    return NextResponse.json({ success: true, order_id: order.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
