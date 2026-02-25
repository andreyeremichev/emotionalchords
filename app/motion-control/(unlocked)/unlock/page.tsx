"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PRICE_OPTIONS: Array<{ label: string; value: number }> = [
    { label: "I wouldn’t pay", value: 0 },
  { label: "$9", value: 9 },
  { label: "$19", value: 19 },
  { label: "$39", value: 39 },
  { label: "$59", value: 59 },
  { label: "$79+", value: 79 },

];

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore (private mode / blocked storage)
  }
}

export default function MotionControlUnlockPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);

  const selectedLabel = useMemo(() => {
    const hit = PRICE_OPTIONS.find((o) => o.value === selected);
    return hit?.label ?? "";
  }, [selected]);

  function unlockNow() {
  if (selected === null) return;

  // Mock unlock (DB wiring later)
  safeSet("mc_unlocked", "1");
  safeSet("mc_intent_price", String(selected));
  safeSet("mc_intent_price_label", selectedLabel);

  router.push("/motion-control/full-arc?unlocked=1");
}

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-sm uppercase tracking-wide opacity-70">Motion Control</div>
      <h1 className="mt-2 text-3xl font-semibold">Unlock Full Arc</h1>
      <p className="mt-3 leading-7 opacity-90">
  If your playing keeps sounding the same, it’s usually because intensity isn’t controlled —
  it either collapses into resolution or drifts with no direction.
  Full Arc is a closed set of motion blocks and transitions that keep the line moving on purpose.
</p>

      {/* What you get */}
      <section className="mt-8 rounded-2xl border p-5">
  <h2 className="text-xl font-semibold">What this fixes</h2>

  <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 opacity-90">
    <li><span className="font-medium">Early resolution:</span> you stop “landing by accident” and can sustain pressure</li>
    <li><span className="font-medium">Drift:</span> you widen the sound without losing the thread</li>
    <li><span className="font-medium">Flat intensity:</span> you can thin out or land cleanly instead of fading</li>
  </ul>

  <div className="mt-4 leading-7 opacity-90">
    You get a finite, closed structure: <span className="font-medium">4 motion blocks</span> +{" "}
    <span className="font-medium">7 fixed arcs</span>, with beat-accurate highlighting and deterministic LH behavior.
  </div>
</section>

      {/* Not for beginners */}
      <section className="mt-6 rounded-2xl border p-5">
        <h2 className="text-xl font-semibold">Who this is for</h2>
        <div className="mt-3 space-y-1 leading-7 opacity-90">
  <div>This is designed for you if:</div>
  <ul className="list-disc pl-5">
    <li>Triads are comfortable</li>
    <li>You can keep a steady pulse</li>
    <li>Your main problem is <span className="font-medium">structure</span>: you resolve early, drift, or can’t switch intensity</li>
  </ul>
  <div className="pt-2">
    If you’re still learning basic chord shapes, stay with{" "}
    <Link className="underline" href="/motion-control">
      Containment
    </Link>
    .
  </div>
</div>
      </section>

      {/* Price form */}
      <section className="mt-6 rounded-2xl border p-5">
        <h2 className="text-xl font-semibold">Price </h2>
        <p className="mt-2 leading-7 opacity-90">
  If this actually fixes your “everything sounds the same” loop, what price would feel fair?
  <span className="opacity-70"> (Pick the closest.)</span>
</p>

        <div className="mt-4 space-y-2">
          {PRICE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-3 rounded-xl border p-3"
            >
              <input
                type="radio"
                name="mc_price"
                value={opt.value}
                checked={selected === opt.value}
                onChange={() => setSelected(opt.value)}
              />
              <span className="text-sm font-medium">{opt.label}</span>
            </label>
          ))}
        </div>

        <button
  onClick={unlockNow}
  disabled={selected === null}
  className="mt-5 inline-flex w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium disabled:opacity-50"
>
  Unlock Full Arc
</button>

        <div className="mt-2 text-xs opacity-70">
  Your choice unlocks access and helps us price this correctly.
</div>
      </section>
    </main>
  );
}