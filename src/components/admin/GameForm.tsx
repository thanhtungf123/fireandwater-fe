"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createGame,
  updateGame,
  listGames,
  ApiError,
  type AdminGame,
} from "@/lib/adminApi";
import { Button, Card, Field, Input, Select, Textarea } from "./ui";
import ImageField from "./ImageField";
import RichTextEditor from "./RichTextEditor";
import { GAME_ERRORS } from "@/lib/adminErrors";

const empty: Partial<AdminGame> = {
  name: "",
  slug: "",
  iframeUrl: "",
  thumbnail: "",
  frameWidth: 900,
  frameHeight: 510,
  group: "lua-va-nuoc",
  status: "draft",
  seoContentHtml: "",
  seo: { robots: "index" },
  related: { mode: "auto", limit: 8, gameIds: [] },
};

export default function GameForm({ initial }: { initial?: AdminGame }) {
  const router = useRouter();
  const [g, setG] = useState<Partial<AdminGame>>(initial ?? empty);
  const [allGames, setAllGames] = useState<AdminGame[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const isEdit = Boolean(initial?._id);

  useEffect(() => {
    listGames().then(setAllGames).catch(() => {});
  }, []);

  function clearError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }
  function set<K extends keyof AdminGame>(key: K, value: AdminGame[K]) {
    setG((prev) => ({ ...prev, [key]: value }));
    clearError(key as string);
  }
  function setSeo(key: string, value: unknown) {
    setG((prev) => ({ ...prev, seo: { ...prev.seo, [key]: value } }));
  }
  function setRelated(key: string, value: unknown) {
    setG((prev) => ({
      ...prev,
      related: { ...(prev.related ?? empty.related!), [key]: value },
    }));
  }

  /** Client-side checks so the user sees the problem before submitting. */
  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!g.name?.trim()) e.name = GAME_ERRORS.name_required.message;
    const url = g.iframeUrl?.trim();
    if (!url) {
      e.iframeUrl = GAME_ERRORS.iframe_required.message;
    } else if (!/^https:\/\//i.test(url)) {
      e.iframeUrl = "URL phải bắt đầu bằng https:// (vd: https://html5.gamedistribution.com/<id>/).";
    }
    if (g.slug && !/^[a-z0-9-]+$/.test(g.slug)) {
      e.slug = GAME_ERRORS.slug_invalid.message;
    }
    return e;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      setErr(null);
      return;
    }
    setBusy(true);
    setErr(null);
    setErrors({});
    try {
      if (isEdit) await updateGame(initial!._id, g);
      else await createGame(g);
      router.push("/admin");
    } catch (ex) {
      if (ex instanceof ApiError && GAME_ERRORS[ex.code]) {
        const fe = GAME_ERRORS[ex.code];
        setErrors({ [fe.field]: fe.message });
      } else if (ex instanceof ApiError) {
        setErr(`Lỗi: ${ex.code}`);
      } else {
        setErr("Có lỗi xảy ra. Kiểm tra backend đang chạy.");
      }
    } finally {
      setBusy(false);
    }
  }

  const manualIds = g.related?.gameIds ?? [];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          {isEdit ? "Sửa game" : "Thêm game"}
        </h1>
        <div className="flex gap-2">
          <Button variant="ghost" type="button" onClick={() => router.push("/admin")}>
            Hủy
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Đang lưu…" : "Lưu"}
          </Button>
        </div>
      </div>

      {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}

      <Card className="grid gap-4 sm:grid-cols-2">
        <Field label="Tên game" error={errors.name}>
          <Input value={g.name ?? ""} error={Boolean(errors.name)} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Slug" hint="Để trống sẽ tự tạo từ tên. Chữ thường, không dấu." error={errors.slug}>
          <Input value={g.slug ?? ""} error={Boolean(errors.slug)} onChange={(e) => set("slug", e.target.value)} placeholder="lua-va-nuoc-x" />
        </Field>
        <Field label="Nhóm">
          <Select value={g.group} onChange={(e) => set("group", e.target.value as AdminGame["group"])}>
            <option value="lua-va-nuoc">Phiên bản Lửa và Nước</option>
            <option value="tuong-tu">Trò chơi tương tự</option>
          </Select>
        </Field>
        <Field label="Trạng thái">
          <Select value={g.status} onChange={(e) => set("status", e.target.value as AdminGame["status"])}>
            <option value="draft">Nháp</option>
            <option value="published">Xuất bản</option>
            <option value="hidden">Ẩn</option>
          </Select>
        </Field>
        <Field label="URL iframe" hint="Chỉ domain đã được duyệt (vd: html5.gamedistribution.com)" error={errors.iframeUrl}>
          <Input value={g.iframeUrl ?? ""} error={Boolean(errors.iframeUrl)} onChange={(e) => set("iframeUrl", e.target.value)} placeholder="https://html5.gamedistribution.com/<id>/" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Khung rộng (px)">
            <Input type="number" value={g.frameWidth ?? 900} onChange={(e) => set("frameWidth", Number(e.target.value))} />
          </Field>
          <Field label="Khung cao (px)">
            <Input type="number" value={g.frameHeight ?? 510} onChange={(e) => set("frameHeight", Number(e.target.value))} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <ImageField label="Ảnh thumbnail" value={g.thumbnail} onChange={(url) => set("thumbnail", url)} />
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-slate-800">Game liên quan</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Chế độ">
            <Select value={g.related?.mode} onChange={(e) => setRelated("mode", e.target.value)}>
              <option value="auto">Tự động</option>
              <option value="manual">Thủ công</option>
            </Select>
          </Field>
          <Field label="Giới hạn hiển thị">
            <Input type="number" value={g.related?.limit ?? 8} onChange={(e) => setRelated("limit", Number(e.target.value))} />
          </Field>
        </div>
        {g.related?.mode === "manual" && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-slate-700">Chọn game hiển thị</p>
            <div className="grid max-h-56 grid-cols-1 gap-1 overflow-auto rounded-lg border border-slate-200 p-2 sm:grid-cols-2">
              {allGames
                .filter((x) => x._id !== initial?._id)
                .map((x) => {
                  const checked = manualIds.includes(x._id);
                  return (
                    <label key={x._id} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...manualIds, x._id]
                            : manualIds.filter((id) => id !== x._id);
                          setRelated("gameIds", next);
                        }}
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
        <h2 className="mb-3 font-semibold text-slate-800">Nội dung SEO</h2>
        <RichTextEditor value={g.seoContentHtml ?? ""} onChange={(html) => set("seoContentHtml", html)} />
      </Card>

      <Card className="grid gap-4 sm:grid-cols-2">
        <h2 className="sm:col-span-2 font-semibold text-slate-800">SEO kỹ thuật</h2>
        <Field label="SEO title">
          <Input value={g.seo?.title ?? ""} onChange={(e) => setSeo("title", e.target.value)} />
        </Field>
        <Field label="Canonical URL">
          <Input value={g.seo?.canonical ?? ""} onChange={(e) => setSeo("canonical", e.target.value)} placeholder="để trống = tự trỏ" />
        </Field>
        <Field label="Meta description">
          <Textarea rows={2} value={g.seo?.metaDescription ?? ""} onChange={(e) => setSeo("metaDescription", e.target.value)} />
        </Field>
        <Field label="Index">
          <Select value={g.seo?.robots ?? "index"} onChange={(e) => setSeo("robots", e.target.value)}>
            <option value="index">index (cho phép)</option>
            <option value="noindex">noindex (chặn)</option>
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <ImageField label="Ảnh chia sẻ (OG image)" value={g.seo?.ogImage} onChange={(url) => setSeo("ogImage", url)} />
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={() => router.push("/admin")}>Hủy</Button>
        <Button type="submit" disabled={busy}>{busy ? "Đang lưu…" : "Lưu"}</Button>
      </div>
    </form>
  );
}
