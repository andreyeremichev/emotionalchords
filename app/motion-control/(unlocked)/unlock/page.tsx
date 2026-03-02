export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { incrStep, preservedQuery } from "@/lib/mcExperiment";

export default async function MotionControlUnlockPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const sp = (searchParams ?? {}) as Record<string, any>;

  await incrStep(sp, "unlock_view");

  const qs = preservedQuery(sp);
  const backHref = `/motion-control${qs}`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-sm uppercase tracking-wide opacity-70">Motion Control</div>
      <h1 className="mt-2 text-3xl font-semibold">Unlock Full Arc</h1>

      {/* REQUIRED DISCLOSURE ABOVE PWYW */}
      <section className="mt-5 rounded-2xl border p-4">
       <div className="text-sm font-semibold">
    No checkout yet — this is a pricing survey (PWYW).
  </div>

  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 opacity-90">
    <li>You get full access regardless of what you choose.</li>
    <li>No payment is processed in this experiment.</li>
    <li>We record only aggregated counts for pricing research (grouped by campaign parameters; no accounts, no email).</li>
  </ul>
      </section>
<div className="mt-3 text-xs opacity-70">
  Details:{" "}
  <Link className="underline underline-offset-2" href="/terms">
    Terms & Privacy
  </Link>
</div>
      <form className="mt-6 space-y-6" action={`/motion-control/unlock/submit${qs}`} method="POST">
        <section className="rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">Choose what you’d pay (USD)</h2>
          <p className="mt-2 leading-7 opacity-90">What would you pay for Full Arc today?</p>
          <p className="mt-1 text-sm opacity-80">
            $0 is genuinely okay. If it helps, you can support later when payments are enabled.
          </p>

          <div className="mt-4 grid gap-2">
            {[
              { label: "$0 (Free access)", value: "0" },
              { label: "$9", value: "9" },
              { label: "$19", value: "19" },
              { label: "$39 (Suggested)", value: "39" },
              { label: "$59", value: "59" },
              { label: "$79+", value: "79" },
              { label: "Other: $", value: "custom" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 rounded-xl border p-3">
                <input type="radio" name="amount_bucket" value={opt.value} required />
                <span className="text-sm font-medium">{opt.label}</span>
                {opt.value === "custom" ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="____"
                    aria-label="Other amount (not recorded)"
                    className="ml-2 w-24 rounded-md border px-2 py-1 text-sm"
                    name="custom_amount_display_only"
                  />
                ) : null}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border p-5">
          <h2 className="text-xl font-semibold">Which is closest?</h2>

          <div className="mt-4 grid gap-2">
            <label className="flex items-center gap-3 rounded-xl border p-3">
              <input type="radio" name="intent" value="pay_now_if_possible" required />
              <span className="text-sm font-medium">I’d pay this today if checkout existed.</span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border p-3">
              <input type="radio" name="intent" value="pay_later_if_clicks" required />
              <span className="text-sm font-medium">I’ll pay later if it clicks.</span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border p-3">
              <input type="radio" name="intent" value="free_or_browsing" required />
              <span className="text-sm font-medium">I’m choosing $0 / browsing for now.</span>
            </label>
          </div>

          <button
            type="submit"
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium"
          >
            Unlock Full Arc now
          </button>

          <div className="mt-2 text-xs opacity-70">
  Instant access. We record only aggregated counts for pricing research.
          </div>

          <div className="mt-4 text-sm">
            <Link className="underline opacity-80 hover:opacity-100" href={backHref}>
              Not for me → back to Containment
            </Link>
          </div>
        </section>
      </form>
    </main>
  );
}