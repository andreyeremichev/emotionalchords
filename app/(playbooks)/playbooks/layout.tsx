// app/(playbooks)/playbooks/layout.tsx
import React from "react";
import PlaybooksHeader from "@/components/playbooks/PlaybooksHeader";
import PlaybooksFooter from "@/components/playbooks/PlaybooksFooter";

export default function PlaybooksLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        /* Hide the existing global site chrome on /playbooks only */
        header.sticky.top-0.z-50 {
          display: none !important;
        }
        footer.sticky.bottom-0.z-50 {
          display: none !important;
        }
      `}</style>

      <div className="min-h-screen">
        <PlaybooksHeader />
        <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
        <PlaybooksFooter />
      </div>
    </>
  );
}