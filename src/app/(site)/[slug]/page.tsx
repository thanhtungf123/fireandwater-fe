import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import GamePlayer from "@/components/GamePlayer";
import GameGrid from "@/components/GameGrid";
import SeoContent from "@/components/SeoContent";
import JsonLd from "@/components/JsonLd";
import { getGamePage, getStaticPage, getRedirect } from "@/lib/api";
import { buildIframeSrc } from "@/lib/iframe";
import { sanitizeRichText } from "@/lib/sanitize";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const gamePage = await getGamePage(slug);
  if (gamePage) {
    const { game } = gamePage;
    const title = game.seo?.title || game.name;
    return {
      title: game.seo?.title ? { absolute: title } : title,
      description: game.seo?.metaDescription,
      robots: game.seo?.robots === "noindex" ? { index: false } : undefined,
      alternates: { canonical: game.seo?.canonical || absoluteUrl(slug) },
      openGraph: {
        title,
        description: game.seo?.metaDescription,
        url: absoluteUrl(slug),
        images: game.seo?.ogImage
          ? [game.seo.ogImage]
          : game.thumbnail
            ? [game.thumbnail]
            : undefined,
      },
    };
  }

  const page = await getStaticPage(slug);
  if (page) {
    const title = page.seo?.title || page.title;
    return {
      title: page.seo?.title ? { absolute: title } : title,
      description: page.seo?.metaDescription,
      robots: page.seo?.robots === "noindex" ? { index: false } : undefined,
      alternates: { canonical: page.seo?.canonical || absoluteUrl(slug) },
    };
  }

  return {};
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;

  const gamePage = await getGamePage(slug);
  if (gamePage) {
    const { game, mainGames, related } = gamePage;
    return (
      <>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "VideoGame",
            name: game.name,
            url: absoluteUrl(slug),
            ...(game.thumbnail ? { image: game.thumbnail } : {}),
            genre: "Adventure",
            gamePlatform: "Web browser",
            applicationCategory: "Game",
            operatingSystem: "Web browser",
          }}
        />

        {/* Same layout as the homepage: centered title + 3-column player grid. */}
        <section className="mb-7 text-center">
          <nav className="text-sm text-slate-500">
            <Link href="/" className="transition hover:text-slate-800">
              Trang chủ
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-700">{game.name}</span>
          </nav>

          <h1 className="mt-4 font-display text-3xl font-bold text-fire-water sm:text-4xl">
            {game.name}
          </h1>
        </section>

        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)_18rem] xl:grid-cols-[22rem_minmax(0,1fr)_22rem]">
          {/* Left: các phiên bản Lửa và Nước */}
          <aside className="order-2 min-w-0 lg:order-1">
            <GameGrid title="Các phiên bản" games={mainGames} variant="list" />
          </aside>

          {/* Center: khung game + nội dung SEO ngay bên dưới */}
          <div className="order-1 min-w-0 lg:order-2">
            <GamePlayer
              src={buildIframeSrc(game.iframeUrl, game.slug)}
              title={game.name}
              width={game.frameWidth}
              height={game.frameHeight}
            />

            <SeoContent html={game.seoContentHtml} />
          </div>

          {/* Right: trò chơi tương tự */}
          <aside className="order-3 min-w-0">
            <GameGrid title="Trò chơi tương tự" games={related} variant="list" />
          </aside>
        </div>
      </>
    );
  }

  const page = await getStaticPage(slug);
  if (!page) {
    // No game/page at this slug — follow a 301 redirect if the slug changed.
    const redirect = await getRedirect(slug);
    if (redirect?.to) permanentRedirect(`/${redirect.to}/`);
  }
  if (page) {
    const clean = sanitizeRichText(page.contentHtml || "");
    return (
      <article className="mx-auto max-w-5xl rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
        <h1 className="mb-5 font-display text-2xl font-bold text-fire-water sm:text-3xl">
          {page.title}
        </h1>
        {clean ? (
          <div
            className="seo-content max-w-none"
            dangerouslySetInnerHTML={{ __html: clean }}
          />
        ) : (
          <p className="text-slate-500">Nội dung đang được cập nhật.</p>
        )}
      </article>
    );
  }

  notFound();
}
