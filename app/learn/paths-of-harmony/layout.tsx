import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <section className="bg-[#faf7f3] text-neutral-900">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {children}
      </div>
    </section>
  );
}