"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function UnlockLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const sp = useSearchParams();
  const qs = sp?.toString();
  const href = qs ? `/motion-control/unlock?${qs}` : "/motion-control/unlock";
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}