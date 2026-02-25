"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type FormState = {
  primaryGoal: string;
  experience: string;
  when: string;
  priceExpectation: string;
};

const DEFAULTS: FormState = {
  primaryGoal: "",
  experience: "",
  when: "",
  priceExpectation: "",
};

function track(event: string, data?: Record<string, unknown>) {
  // Safe optional tracking hooks (won't crash if not installed)
  try {
    // GA4
    // @ts-expect-error - window typing
    if (typeof window !== "undefined" && window.gtag) window.gtag("event", event, data ?? {});
  } catch {}
  try {
    // Vercel Analytics
    // @ts-expect-error - window typing
    if (typeof window !== "undefined" && window.va?.track) window.va.track(event, data ?? {});
  } catch {}
}

export default function PurchaseHelpless() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    // minimal friction: require only 2 answers for now
    return Boolean(form.primaryGoal) && Boolean(form.experience);
  }, [form.primaryGoal, form.experience]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);

    track("playbook_purchase_intent_submit", {
      playbook: "cycling-descent",
      ...form,
    });

    // Store a lightweight unlock flag (NOT secure — just for testing intent funnel)
    try {
      localStorage.setItem(
        "ec_playbook_unlocked_cycling-descent",
        JSON.stringify({ at: Date.now(), form })
      );
    } catch {}

    // Redirect to practice page (still public for now)
    router.push("/playbooks/cycling-descent?unlocked=1");
  }

  // Track the “intent page view”
  React.useEffect(() => {
    track("playbook_purchase_intent_view", { playbook: "cycling-descent" });
  }, []);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <header className="mb-6">
        <div className="text-xs opacity-70">Playbooks / Cycling Descent</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Purchase Playbook</h1>
        <p className="mt-3 text-sm opacity-80">
          Thank you. This playbook is currently <span className="font-semibold">free</span> —
          but only if you answer a few short questions first.
        </p>
      </header>

      <section className="rounded-2xl border p-4">
        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="What are you hoping this loop will do for you? (required)">
            <select
              value={form.primaryGoal}
              onChange={(e) => update("primaryGoal", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Select one</option>
              <option value="decompress">Decompress / come down</option>
              <option value="focus">Focus / steady my mind</option>
              <option value="sleep">Help me fall asleep</option>
              <option value="mood">Shift mood without thinking</option>
              <option value="practice">Practice left-hand motion</option>
            </select>
          </Field>

          <Field label="How long have you played piano? (required)">
            <select
              value={form.experience}
              onChange={(e) => update("experience", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Select one</option>
              <option value="new">New / returning</option>
              <option value="1-2">1–2 years</option>
              <option value="3-5">3–5 years</option>
              <option value="6+">6+ years</option>
            </select>
          </Field>

          <Field label="When do you imagine using it most? (optional)">
            <select
              value={form.when}
              onChange={(e) => update("when", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Select one</option>
              <option value="evening">Evenings</option>
              <option value="morning">Mornings</option>
              <option value="work-break">Work breaks</option>
              <option value="late-night">Late night</option>
            </select>
          </Field>

          <Field label="What feels like a fair one-time price? (optional)">
            <select
              value={form.priceExpectation}
              onChange={(e) => update("priceExpectation", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Select one</option>
              <option value="1-3">£1–£3</option>
              <option value="4-7">£4–£7</option>
              <option value="8-12">£8–£12</option>
              <option value="13+">£13+</option>
              <option value="dont-know">Not sure</option>
            </select>
          </Field>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="rounded-full border px-5 py-2 text-sm hover:bg-black/5 disabled:opacity-50"
            >
              {submitting ? "Unlocking…" : "Continue (unlock free)"}
            </button>

            <Link href="/playbooks" className="text-sm opacity-70 hover:opacity-100">
              Back to Playbooks
            </Link>
          </div>

          <div className="text-xs opacity-60">
            This is a temporary checkout for testing interest. No payment collected.
          </div>
        </form>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium">{label}</div>
      {children}
    </label>
  );
}