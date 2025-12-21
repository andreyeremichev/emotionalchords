export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-white/70">
      <div className="mx-auto max-w-5xl px-4 py-4 text-xs text-neutral-500 sm:px-6">
        © {new Date().getFullYear()} EmotionalChords.app
      </div>
    </footer>
  );
}