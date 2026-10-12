"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMe, clearToken, getToken } from "@/lib/adminApi";
import LoginModal from "@/components/admin/LoginModal";

type AuthState = "checking" | "authed" | "guest";

const NAV = [
  { href: "/admin", label: "Game", exact: true },
  { href: "/admin/settings", label: "Trang chủ" },
  { href: "/admin/pages", label: "Trang tĩnh" },
  { href: "/admin/appearance", label: "Giao diện" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>("checking");

  const check = useCallback(() => {
    if (!getToken()) {
      setAuth("guest");
      return;
    }
    fetchMe()
      .then(() => setAuth("authed"))
      .catch(() => setAuth("guest"));
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  if (auth === "checking") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-400">
        Đang tải…
      </div>
    );
  }

  if (auth === "guest") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center">
        <div>
          <p className="mb-3 text-slate-500">Bạn cần đăng nhập để vào trang quản trị.</p>
          <button
            onClick={() => router.push("/")}
            className="text-sm font-medium text-slate-400 hover:text-slate-600"
          >
            ← Về trang chủ
          </button>
        </div>
        <LoginModal open onSuccess={() => setAuth("authed")} />
      </div>
    );
  }

  function logout() {
    clearToken();
    setAuth("guest");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
          <Link href="/admin" className="font-display text-lg font-bold text-fire-water">
            🔥💧 Admin
          </Link>
          <nav className="flex gap-1">
            {NAV.map((n) => {
              const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/" target="_blank" className="text-sm text-slate-500 hover:text-slate-800">
              Xem site ↗
            </Link>
            <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-700">
              Đăng xuất
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
