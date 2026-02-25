"use client";

import React from "react";
import Link from "next/link";
import LandingLoopPreview from "@/components/playbooks/LandingLoopPreview";

export default function LandingPlaybooks() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          A hypnotic piano loop for when you don’t know what to play
        </h1>
        <p className="text-base opacity-80">
          Sit down. Start the left hand. Stay in motion.
        </p>
      </section>

      {/* Loop preview */}
      <section className="rounded-2xl border p-4">
        <LandingLoopPreview />

        <div className="mt-4 text-sm opacity-80">
          <p>The demo uses the left hand only.</p>
          <p className="mt-2">Nothing else is required to begin.</p>
          <p className="mt-2">
            <strong>Motion:</strong> Cycling Descent
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/playbooks/cycling-descent/purchase"
            className="rounded-full border px-4 py-2 text-sm hover:bg-black/5"
          >
            Get the playbook
          </Link>
        </div>
      </section>

      {/* Copy blocks */}
      <section className="space-y-6">
        <Block title="What this is">
          <p>
            A single hypnotic piano loop built around a steady left-hand motion.
          </p>
          <p className="mt-2">
            It is designed for moments when you don’t want to decide what to
            play, or where to go next.
          </p>
          <p className="mt-2">
            You place your hands.
            <br />
            The motion carries you.
          </p>
        </Block>

        <Block title="What you receive">
          <p>
            A complete, playable loop — already decided, already shaped.
          </p>

          <ul className="mt-3 list-disc pl-5 space-y-2">
            <li>
              the full left-hand motion, broken into clear, repeatable steps
            </li>
            <li>
              exact fingerings that keep the motion continuous and relaxed
            </li>
            <li>
              a guided practice page that carries you into the loop without
              effort
            </li>
            <li>
              optional right-hand guidance, introduced only after the left hand
              settles
            </li>
          </ul>

          <p className="mt-3">
            Nothing to plan. Nothing to choose.
            <br />
            You sit down and begin.
          </p>

          <p className="mt-3">
            A small, one-time purchase.
          </p>
        </Block>

        <Block title="A note">
          <p>
            Cycling Descent removes the need to decide where the music should
            go.
          </p>
          <p className="mt-2">
            If, at some point, the motion wants to slow, pause, or change on its
            own, let it.
          </p>
          <p className="mt-2">
            You don’t need to force anything for the loop to work.
          </p>
        </Block>

        <div className="pt-2">
          <Link
            href="/playbooks/cycling-descent/purchase"
            className="rounded-full border px-4 py-2 text-sm hover:bg-black/5"
          >
            Get the playbook
          </Link>
        </div>
      </section>
    </div>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-2 text-sm font-semibold">{title}</div>
      <div className="text-sm leading-6 opacity-90">{children}</div>
    </div>
  );
}
