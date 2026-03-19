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

        <nav className="flex items-center gap-4 text-sm text-neutral-700">
  {/* Primary */}
  <Link
    href="/emotions"
    className="rounded-full px-3 py-1 font-medium hover:bg-black/5"
  >
    Emotion
  </Link>

  <Link
    href="/motion-control"
    className="rounded-full px-3 py-1 font-medium hover:bg-black/5"
  >
    Control
  </Link>

  {/* Secondary (lighter, underlined text) */}
  <Link
href="/learn"  
className="text-xs opacity-70 hover:opacity-100 hover:underline focus:underline"
>
  Learn
</Link>
</nav>
      </div>
    </header>
  );
}