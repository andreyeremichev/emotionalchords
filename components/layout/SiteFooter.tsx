// components/layout/SiteFooter.tsx
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      className={[
        // Mobile: keep it visible (prevents "glimpse then vanish")
        "sticky bottom-0 z-50",
        // Visual
        "border-t border-black/10 bg-white",
      ].join(" ")}
    >
      <div className="mx-auto max-w-5xl px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] text-xs text-neutral-600 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} EmotionalChords.app</div>

          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              href="/about"
              className="underline underline-offset-2 hover:text-black"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="underline underline-offset-2 hover:text-black"
            >
              Contact
            </Link>
            <Link
              href="/terms"
              className="underline underline-offset-2 hover:text-black"
            >
              Terms & Privacy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}