import { Redis } from "@upstash/redis";
export type McIntent =
  | "pay_now_if_possible"
  | "pay_later_if_clicks"
  | "free_or_browsing";

export type AmountBucket = "0" | "9" | "19" | "39" | "59" | "79" | "custom";
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
    throw new Error(
      "Missing Redis REST env vars. Need UPSTASH_REDIS_REST_URL+UPSTASH_REDIS_REST_TOKEN or REDIS_URL+REDIS_TOKEN."
    );
  }

  return new Redis({ url, token });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function utcDateYYYYMMDD(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function sanitizeKeyPart(input: unknown): string {
  const s = String(input ?? "").toLowerCase().trim();
  if (!s) return "none";
  const out = s.replace(/[^a-z0-9_-]+/g, "-").replace(/-+/g, "-").slice(0, 80);
  return out.length ? out : "none";
}

export function pickCampaignContent(searchParams: Record<string, any>) {
  const campaign = sanitizeKeyPart(searchParams?.utm_campaign);
  const content = sanitizeKeyPart(searchParams?.utm_content);
  return { campaign, content };
}

export function preservedQuery(searchParams: Record<string, any>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams ?? {})) {
    if (v == null) continue;
    if (typeof v === "string" && v.length) sp.set(k, v);
    else if (Array.isArray(v)) for (const item of v) if (item) sp.append(k, item);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

function baseKey(date: string, campaign: string, content: string) {
  return `ec:${date}:${campaign}:${content}`;
}

export async function incrStep(searchParams: Record<string, any>, step: string) {
  const redis = getRedis();
  const date = utcDateYYYYMMDD();
  const { campaign, content } = pickCampaignContent(searchParams);
  await redis.incr(`${baseKey(date, campaign, content)}:${step}`);
}
export async function incrAmount(searchParams: Record<string, any>, bucket: AmountBucket) {
  const redis = getRedis();
  const date = utcDateYYYYMMDD();
  const { campaign, content } = pickCampaignContent(searchParams);
  await redis.incr(`${baseKey(date, campaign, content)}:pwyw_amount:${bucket}`);
}

export async function incrIntent(searchParams: Record<string, any>, intent: McIntent) {
  const redis = getRedis();
  const date = utcDateYYYYMMDD();
  const { campaign, content } = pickCampaignContent(searchParams);
  await redis.incr(`${baseKey(date, campaign, content)}:pwyw_intent:${intent}`);
}