import React from "react";

export default function PlaybooksFooter() {
  return (
    <div className="border-t">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 text-xs opacity-60">
        © {new Date().getFullYear()} EmotionalChords
      </div>
    </div>
  );
}