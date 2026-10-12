"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  listGames,
  deleteGame,
  reorderGames,
  type AdminGame,
} from "@/lib/adminApi";
import { Button } from "@/components/admin/ui";

const STATUS_LABEL: Record<AdminGame["status"], { text: string; cls: string }> = {
  published: { text: "Xuất bản", cls: "bg-green-100 text-green-700" },
  draft: { text: "Nháp", cls: "bg-amber-100 text-amber-700" },
  hidden: { text: "Ẩn", cls: "bg-slate-200 text-slate-600" },
};

export default function AdminGamesPage() {
  const [games, setGames] = useState<AdminGame[]>([]);
  const [loading, setLoading] = useState(true);
  const dragId = useRef<string | null>(null);

  async function load() {
    setLoading(true);
    setGames(await listGames());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function onDelete(g: AdminGame) {
    if (!confirm(`Xóa game "${g.name}"? Hành động không thể hoàn tác.`)) return;
    await deleteGame(g._id);
    setGames((list) => list.filter((x) => x._id !== g._id));
  }

  function onDrop(targetId: string) {
    const from = dragId.current;
    dragId.current = null;
    if (!from || from === targetId) return;
    setGames((list) => {
      const arr = [...list];
      const fi = arr.findIndex((x) => x._id === from);
      const ti = arr.findIndex((x) => x._id === targetId);
      const [moved] = arr.splice(fi, 1);
      arr.splice(ti, 0, moved);
      reorderGames(arr.map((x) => x._id)).catch(() => load());
      return arr;
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-900">Quản lý game</h1>
        <Link href="/admin/games/new">
          <Button>+ Thêm game</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-400">Đang tải…</p>
      ) : games.length === 0 ? (
        <p className="text-slate-400">Chưa có game nào.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="w-10 p-3"></th>
                <th className="p-3">Tên</th>
                <th className="p-3">Nhóm</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr
                  key={g._id}
                  draggable
                  onDragStart={() => (dragId.current = g._id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(g._id)}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="cursor-grab p-3 text-center text-slate-300" title="Kéo để sắp xếp">⠿</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={g.thumbnail || ""}
                        alt=""
                        className="h-10 w-14 rounded object-cover"
                        onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                      />
                      <div>
                        <div className="font-medium text-slate-800">{g.name}</div>
                        <div className="text-xs text-slate-400">/{g.slug}/</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-slate-600">
                    {g.group === "lua-va-nuoc" ? "Phiên bản" : "Tương tự"}
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_LABEL[g.status].cls}`}>
                      {STATUS_LABEL[g.status].text}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/games/${g._id}`}>
                        <Button variant="ghost">Sửa</Button>
                      </Link>
                      <Button variant="danger" onClick={() => onDelete(g)}>Xóa</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
