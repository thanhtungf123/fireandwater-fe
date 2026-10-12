import Header from "@/components/Header";
import Footer from "@/components/Footer";

/** Public site chrome: fire/water background, header and footer. */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-app min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-blob bg-blob-fire" />
        <div className="bg-blob bg-blob-water" />
      </div>
      <Header />
      <main className="px-4 py-8 sm:px-6">{children}</main>
      <Footer />
    </div>
  );
}
