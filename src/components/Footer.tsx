import Link from "next/link";
import { getSiteChrome } from "@/lib/api";

export default async function Footer() {
  const chrome = await getSiteChrome();
  const year = new Date().getFullYear();
  const links = chrome?.footerLinks ?? [];
  const text = chrome?.footerText || `© ${year} Lửa và Nước.`;
  const title = chrome?.headerTitle || "Lửa và Nước";

  return (
    <footer className="mt-20 border-t border-white/60 bg-white/50 backdrop-blur-sm">
      <div className="flex w-full flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2 font-display font-semibold text-slate-700">
          <span>🔥💧</span>
          <span>{title}</span>
        </div>
        {links.length > 0 && (
          <nav className="flex flex-wrap gap-5">
            {links.map((l, i) =>
              l.url.startsWith("/") ? (
                <Link key={i} href={l.url} className="transition hover:text-slate-900">
                  {l.label}
                </Link>
              ) : (
                <a key={i} href={l.url} className="transition hover:text-slate-900">
                  {l.label}
                </a>
              )
            )}
          </nav>
        )}
        <p className="text-slate-400">{text}</p>
      </div>
    </footer>
  );
}
