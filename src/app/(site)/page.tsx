import type { Metadata } from "next";
import GamePlayer from "@/components/GamePlayer";
import GameGrid from "@/components/GameGrid";
import SeoContent from "@/components/SeoContent";
import JsonLd from "@/components/JsonLd";
import { getHome } from "@/lib/api";
import { buildIframeSrc } from "@/lib/iframe";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHome();
  const title = home?.seo?.title;
  return {
    title: title ? { absolute: title } : undefined,
    description: home?.seo?.description,
    alternates: { canonical: SITE_URL + "/" },
    openGraph: {
      title: title || undefined,
      description: home?.seo?.description,
      url: SITE_URL + "/",
      images: home?.seo?.ogImage ? [home.seo.ogImage] : undefined,
    },
  };
}

export default async function HomePage() {
  const home = await getHome();

  if (!home) {
    return (
      <p className="rounded-2xl bg-amber-50 p-4 text-amber-800">
        Không kết nối được tới API backend. Hãy chạy backend (<code>npm run dev</code>{" "}
        trong thư mục <code>backend/</code>) và kiểm tra <code>BACKEND_URL</code>.
      </p>
    );
  }

  const { h1, defaultGame, mainGames, related, seoContentHtml } = home;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL + "/",
        }}
      />
      <section className="mb-7 text-center">

        <h1 className="mt-4 font-display text-3xl font-bold text-fire-water sm:text-4xl">
          {h1}
        </h1>

      </section>

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)_18rem] xl:grid-cols-[22rem_minmax(0,1fr)_22rem]">
        {/* Left: các phiên bản Lửa và Nước */}
        <aside className="order-2 min-w-0 lg:order-1">
          <GameGrid title="Các phiên bản" games={mainGames} variant="list" />
        </aside>

        {/* Center: khung game + nội dung SEO ngay bên dưới */}
        <div className="order-1 min-w-0 lg:order-2">
          {defaultGame ? (
            <GamePlayer
              src={buildIframeSrc(defaultGame.iframeUrl, "")}
              title={defaultGame.name}
              width={defaultGame.frameWidth}
              height={defaultGame.frameHeight}
            />
          ) : (
            <p className="rounded-2xl bg-amber-50 p-4 text-amber-800">
              Chưa có game mặc định. Hãy chạy <code>npm run seed</code> trong
              backend hoặc cấu hình trong Admin.
            </p>
          )}

          <SeoContent html={seoContentHtml ?? undefined} />
        </div>

        {/* Right: trò chơi tương tự */}
        <aside className="order-3 min-w-0">
          <GameGrid title="Trò chơi tương tự" games={related} variant="list" />
        </aside>
      </div>
    </>
  );
}
