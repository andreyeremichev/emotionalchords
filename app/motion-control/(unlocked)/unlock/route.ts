import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Retired: the PWYW pricing survey / answer-unlock flow.
// Full Arc is now open access. This route is kept so existing links keep working.
function dest(req: Request) {
  const url = new URL(req.url);
  const qs = url.searchParams.toString();
  return new URL(`/motion-control/full-arc${qs ? `?${qs}` : ""}`, req.url);
}

export async function GET(req: Request) {
  return NextResponse.redirect(dest(req), 302);
}

export async function POST(req: Request) {
  return NextResponse.redirect(dest(req), 303);
}
