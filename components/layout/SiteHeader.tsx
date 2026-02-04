// components/layout/SiteHeader.tsx
import Link from "next/link";
import Image from "next/image";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          {/* Logo SVG from /public */}
          <Image
            src="/emotional-chords-logo.svg"
            alt="Emotional Chords logo"
            width={160}
            height={60}
            priority
          />
        </Link>

        {/* Right side nav – keep or simplify as you wish */}
        <nav className="flex gap-3 text-sm text-neutral-700">
          <Link
            href="/emotions"
            className="rounded-full px-3 py-1 hover:bg-black/5"
          >
            Motion (Emotion)
          </Link>
          <Link
            href="/learn/paths-of-harmony"
            className="rounded-full px-3 py-1 hover:bg-black/5"
          >
            Why it works
          </Link>
          
        </nav>
      </div>
    </header>
  );
}