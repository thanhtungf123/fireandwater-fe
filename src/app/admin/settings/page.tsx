"use client";

import { useEffect, useState } from "react";
import {
  getSettings,
  updateSettings,
  listGames,
  type AdminSettings,
  type AdminGame,
} from "@/lib/adminApi";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/admin/ui";
import ImageField from "@/components/admin/ImageField";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function SettingsPage() {
  const [s, setS] = useState<AdminSettings>({});
  const [games, setGames] = useState<AdminGame[]>([]);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([getSettings(), listGames("?status=published")]).then(
      ([setting, gs]) => {
        setS(setting ?? {});
        setGames(gs);
        setLoaded(true);
      }
    );
  }, []);

  function set<K extends keyof AdminSettings>(k: K, v: AdminSettings[K]) {
    setS((prev) => ({ ...prev, [k]: v }));
    setSaved(false);
  }
  function setRelated(k: string, v: unknown) {
    setS((prev) => ({
      ...prev,
      homeRelated: {
        ...(prev.homeRelated ?? { mode: "auto", limit: 8, gameIds: [] }),
        [k]: v,
      },
    }));
    setSaved(false);
  }

  async function onSave() {
    setBusy(true);
    try {
      await updateSettings(s);
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) return <p className="text-slate-400">Đang tải…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-900">Cài đặt trang chủ</h1>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600">Đã lưu ✓</span>}
          <Button onClick={onSave} disabled={busy}>{busy ? "Đang lưu…" : "Lưu"}</Button>
        </div>
      </div>

      <Card className="grid gap-4 sm:grid-cols-2">
        <Field label="Game iframe mặc định (ở trang chủ)">
          <Select
            value={s.homeDefaultGameId ?? ""}
            onChange={(e) => set("homeDefaultGameId", e.target.value || undefined)}
          >
            <option value="">— Chọn game —</option>
            {games.map((g) => (
              <option key={g._id} value={g._id}>{g.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Tiêu đề H1 trang chủ">
          <Input value={s.homeH1 ?? ""} onChange={(e) => set("homeH1", e.target.value)} />
        </Field>
        <label className="flex items-start gap-2 sm:col-span-2">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={s.homeShowGameTitle ?? true}
            onChange={(e) => set("homeShowGameTitle", e.target.checked)}
          />
          <span className="text-sm text-slate-700">
            Hiện tên game mặc định phía trên khung game
            <span className="block text-xs text-slate-400">
              Ví dụ: “Lửa và Nước 1 – Forest Temple”. Bỏ chọn nếu chỉ muốn hiện khung game.
            </span>
          </span>
        </label>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-slate-800">Khối “Trò chơi tương tự” (trang chủ)</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Chế độ">
            <Select value={s.homeRelated?.mode ?? "auto"} onChange={(e) => setRelated("mode", e.target.value)}>
              <option value="auto">Tự động</option>
              <option value="manual">Thủ công</option>
            </Select>
          </Field>
          <Field label="Giới hạn hiển thị">
            <Input type="number" value={s.homeRelated?.limit ?? 8} onChange={(e) => setRelated("limit", Number(e.target.value))} />
          </Field>
        </div>
        {s.homeRelated?.mode === "manual" && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-slate-700">Chọn game hiển thị</p>
            <div className="grid max-h-56 grid-cols-1 gap-1 overflow-auto rounded-lg border border-slate-200 p-2 sm:grid-cols-2">
              {games.map((x) => {
                const ids = s.homeRelated?.gameIds ?? [];
                const checked = ids.includes(x._id);
                return (
                  <label key={x._id} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setRelated(
                          "gameIds",
                          e.target.checked ? [...ids, x._id] : ids.filter((id) => id !== x._id)
                        )
                      }
                    />
                    <span className="truncate">{x.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-slate-800">Nội dung SEO trang chủ</h2>
        <RichTextEditor value={s.homeSeoContentHtml ?? ""} onChange={(html) => set("homeSeoContentHtml", html)} />
      </Card>

      <Card className="grid gap-4 sm:grid-cols-2">
        <h2 className="sm:col-span-2 font-semibold text-slate-800">SEO trang chủ</h2>
        <Field label="SEO title">
          <Input value={s.seoTitle ?? ""} onChange={(e) => set("seoTitle", e.target.value)} />
        </Field>
        <Field label="Meta description">
          <Textarea rows={2} value={s.seoDescription ?? ""} onChange={(e) => set("seoDescription", e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <ImageField label="Ảnh chia sẻ (OG image)" value={s.ogImage} onChange={(url) => set("ogImage", url)} />
        </div>
      </Card>
    </div>
  );
}
