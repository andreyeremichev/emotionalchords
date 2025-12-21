"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export type PracticeAccordionSection = {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  disabled?: boolean;
};

export default function PracticeAccordion(props: {
  sections: PracticeAccordionSection[];
  defaultOpenId: string;
}) {
  const { sections, defaultOpenId } = props;

  const [openId, setOpenId] = useState<string | null>(defaultOpenId);

  // Refs so we can scroll the opened section into view
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  const openSection = (id: string) => {
  setOpenId((prev) => (prev === id ? null : id));
};

  useEffect(() => {
  if (!openId) return;
  const el = refs.current[openId];
  if (!el) return;
  window.setTimeout(() => {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 50);
}, [openId]);

  const items = useMemo(() => sections, [sections]);

  return (
    <div className="space-y-3">
      {items.map((s) => {
        const isOpen = s.id === openId;
        const isDisabled = !!s.disabled;

        return (
          <div
            key={s.id}
            ref={(node) => {
              refs.current[s.id] = node;
            }}
            className={`rounded-2xl border border-black/10 bg-white shadow-sm ${
              isDisabled ? "opacity-70" : ""
            }`}
          >
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => openSection(s.id)}
              className={`w-full px-4 py-3 text-left rounded-2xl flex items-start justify-between gap-3 ${
                isDisabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <div>
                <div className="text-sm font-semibold text-neutral-900">
                  {s.title}
                </div>
                {s.subtitle && (
                  <div className="mt-1 text-xs text-neutral-600">
                    {s.subtitle}
                  </div>
                )}
              </div>

              <div className="mt-0.5 text-neutral-500">
                <span className="text-lg leading-none">
                  {isOpen ? "▾" : "▸"}
                </span>
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4">
                <div className="pt-2">{s.content}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}