import { NextResponse } from "next/server";
import { incrStep } from "@/lib/mcExperiment";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sp = Object.fromEntries(url.searchParams.entries());

  await incrStep(sp, "mc_view");

  const qs = url.searchParams.toString();
  const dest = `/motion-control${qs ? `?${qs}` : ""}`;
  return NextResponse.redirect(dest, 302);
}