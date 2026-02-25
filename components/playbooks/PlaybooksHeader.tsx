

import React from "react";
import Link from "next/link";

export default function PlaybooksHeader() {
  return (
    <div className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold tracking-tight">
            EmotionalChords
          </Link>
          <span className="opacity-40">/</span>
          <Link
            href="/playbooks"
            className="text-sm font-medium opacity-90 hover:opacity-100"
          >
            Playbooks
          </Link>
        </div>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/playbooks" className="opacity-80 hover:opacity-100">
            Library
          </Link>
        </nav>
      </div>
    </div>
  );
}