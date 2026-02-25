// app/motion-control/(unlocked)/layout.tsx
import React from "react";
import Link from "next/link";

export default function UnlockedMotionControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        /* Hide the existing global site chrome on /motion-control/(unlocked) routes */
        header.sticky.top-0.z-50 {
          display: none !important;
        }
        footer.sticky.bottom-0.z-50 {
          display: none !important;
        }
      `}</style>

      <div className="min-h-screen">
        {/* Minimal local chrome (not global) */}
        <div className="mx-auto w-full max-w-5xl px-4 py-6">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/motion-control" className="text-sm underline opacity-80">
              ← Back to Containment
            </Link>
            <div className="text-xs uppercase tracking-wide opacity-60">Motion Control</div>
          </div>

          {children}
        </div>
      </div>
    </>
  );
}
