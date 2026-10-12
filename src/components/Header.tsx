import Link from "next/link";
import LoginButton from "./LoginButton";
import { getSiteChrome } from "@/lib/api";

/**
 * Header (spec §3 khối 01): logo + site title + configurable menu (pages flagged
 * "hiển thị trên header" + custom links) + login. Managed in Admin → Giao diện.
 */
export default async function Header() {
  const chrome = await getSiteChrome();
  const title = chrome?.headerTitle || "Lửa và Nước";
  const pages = chrome?.headerPages ?? [];
  const links = chrome?.headerLinks ?? [];

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-md">
      <div className="flex w-full items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          {chrome?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={chrome.logoUrl} alt={title} className="h-9 w-auto" />
          ) : (
            <span className="flex items-center">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-lg shadow-sm">🔥</span>
              <span className="grid h-9 w-9 -ml-5 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg shadow-sm">💧</span>
            </span>
          )}
          <span className="font-display text-xl font-bold text-fire-water">{title}</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 overflow-x-auto sm:flex">
          {pages.map((p) => (
            <Link
              key={p.slug}
              href={`/${p.slug}/`}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
            >
              {p.label}
            </Link>
          ))}
          {links.map((l, i) => (
            <a
              key={`link-${i}`}
              href={l.url}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className={pages.length || links.length ? "" : "ml-auto"}>
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
