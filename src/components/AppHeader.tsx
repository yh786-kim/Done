import Link from "next/link";
import { ChevronLeft } from "./icons";

export default function AppHeader({
  title,
  back,
  right,
}: {
  title: string;
  back?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-1 border-b border-border bg-card px-3 pb-3 pt-3">
      {back ? (
        <Link
          href={back}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted active:bg-background"
          aria-label="뒤로"
        >
          <ChevronLeft size={18} />
        </Link>
      ) : (
        <div className="w-9" />
      )}
      <h1 className="flex-1 text-center text-base font-bold">{title}</h1>
      <div className="flex min-w-9 justify-end">{right}</div>
    </header>
  );
}
