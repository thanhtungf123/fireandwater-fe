import Link from "next/link";
import type { GameDTO } from "@/lib/api";
import GameThumb from "./GameThumb";

interface GameGridProps {
  title: string;
  games: GameDTO[];
  /**
   * "grid" (default): responsive 2–4 column grid.
   * "list": compact vertical list for a side column — 2–3 cols on mobile,
   * single column on large screens.
   */
  variant?: "grid" | "list";
}

/** Extract a part number from the name/slug for the badge, if any. */
function partNumber(g: GameDTO): string | null {
  const m = g.slug.match(/(\d+)/) || g.name.match(/(\d+)/);
  return m ? m[1] : null;
}

/**
 * Thumbnail + name grid (spec §3 khối 04). Cards are plain links to the game
 * page URL — they never embed an iframe. Hidden entirely when empty.
 */
export default function GameGrid({ title, games, variant = "grid" }: GameGridProps) {
  if (!games.length) return null;

  const listClasses =
    variant === "list"
      ? "grid grid-cols-2 gap-3"
      : "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <section className={variant === "list" ? "" : "mt-12"}>
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-slate-900">
        <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-orange-500 to-blue-600" />
        {title}
      </h2>

      <ul className={listClasses}>
        {games.map((g) => {
          const num = partNumber(g);
          return (
            <li key={g.id}>
              <Link
                href={`/${g.slug}/`}
                className="group block overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <GameThumb src={g.thumbnail} alt={g.name} />
                  {num && (
                    <span className="absolute left-2 top-2 grid h-7 min-w-7 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500 px-1.5 text-sm font-bold text-white shadow">
                      {num}
                    </span>
                  )}
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-black/70 to-transparent py-2 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    ▶ Chơi ngay
                  </span>
                </div>
                <div className="p-2.5">
                  <p className="line-clamp-2 text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                    {g.name}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
