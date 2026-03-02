import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { sanitizeKeyPart } from "@/lib/mcExperiment";

export const dynamic = "force-dynamic";
export const revalidate = 0;
function getRedis() {
  const url =
  process.env.UPSTASH_REDIS_REST_KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.UPSTASH_REDIS_URL ||
  process.env.REDIS_REST_URL ||
  process.env.REDIS_URL;

const token =
  process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.UPSTASH_REDIS_TOKEN ||
  process.env.REDIS_REST_TOKEN ||
  process.env.REDIS_TOKEN;

  if (!url || !token) {
    throw new Error("Missing Redis REST env vars.");
  }
  return new Redis({ url, token });
}

function authed(req: Request) {
  const token = process.env.METRICS_TOKEN;
  const auth = req.headers.get("authorization") || "";
  return Boolean(token) && auth === `Bearer ${token}`;
}

export async function GET(req: Request) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 });

  const url = new URL(req.url);
  const date = url.searchParams.get("date") || "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ ok: false, error: "date=YYYY-MM-DD required" }, { status: 400 });
  }

  const campaign = sanitizeKeyPart(url.searchParams.get("utm_campaign") || "none");
  const content = sanitizeKeyPart(url.searchParams.get("utm_content") || "none");
  const base = `ec:${date}:${campaign}:${content}`;

  const steps = ["mc_view", "unlock_view", "unlock_complete", "fa_view_unlocked", "fa_start_arc1"];
  const amounts = ["0", "9", "19", "39", "59", "79", "custom"];
  const intents = ["pay_now_if_possible", "pay_later_if_clicks", "free_or_browsing"];

  const keys = [
    ...steps.map((s) => `${base}:${s}`),
    ...amounts.map((a) => `${base}:pwyw_amount:${a}`),
    ...intents.map((i) => `${base}:pwyw_intent:${i}`),
  ];

  const redis = getRedis();
const vals = await redis.mget<number[]>(...keys);

  let i = 0;
  const out: any = {
    ok: true,
    date,
    campaign,
    content,
    steps: {},
    pwyw_amount_buckets: {},
    pwyw_intents: {},
  };

  for (const s of steps) out.steps[s] = Number(vals[i++] ?? 0);
  for (const a of amounts) out.pwyw_amount_buckets[a] = Number(vals[i++] ?? 0);
  for (const t of intents) out.pwyw_intents[t] = Number(vals[i++] ?? 0);

  return NextResponse.json(out);
}