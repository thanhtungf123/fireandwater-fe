import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="font-display text-7xl font-bold text-fire-water">404</p>
      <p className="mt-3 text-slate-600">Không tìm thấy trang bạn yêu cầu.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/30 transition hover:brightness-110"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
