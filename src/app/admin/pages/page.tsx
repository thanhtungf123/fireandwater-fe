"use client";

import { useEffect, useState } from "react";
import {
  listPages,
  createPage,
  updatePage,
  deletePage,
  ApiError,
  type AdminPage,
} from "@/lib/adminApi";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/admin/ui";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { slugify } from "@/lib/slug";
import { PAGE_ERRORS } from "@/lib/adminErrors";

type Draft = AdminPage & { _new?: boolean };

const blankDraft = (): Draft => ({
  _new: true,
  slug: "",
  title: "",
  headerLabel: "",
  showInHeader: false,
  status: "published",
  contentHtml: "",
  seo: { robots: "index" },
});

export default function PagesPage() {
  const [pages, setPages] = useState<AdminPage[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function load(selectSlug?: string) {
    const list = await listPages();
    setPages(list);
    if (selectSlug) {
      const p = list.find((x) => x.slug === selectSlug);
      if (p) setDraft({ ...p });
    }
  }
  useEffect(() => {
    listPages().then((list) => {
      setPages(list);
      if (list[0]) setDraft({ ...list[0] });
    });
  }, []);

  function edit<K extends keyof Draft>(k: K, v: Draft[K]) {
    setDraft((d) => (d ? { ...d, [k]: v } : d));
    setMsg(null);
    setErr(null);
    setErrors((prev) => {
      if (!prev[k as string]) return prev;
      const next = { ...prev };
      delete next[k as string];
      return next;
    });
  }
  function editSeo(k: string, v: unknown) {
    setDraft((d) => (d ? { ...d, seo: { ...d.seo, [k]: v } } : d));
    setMsg(null);
  }

  function validate(d: Draft): Record<string, string> {
    const e: Record<string, string> = {};
    if (!d.title?.trim()) e.title = PAGE_ERRORS.title_required.message;
    const slug = d._new || d.slug ? slugify(d.slug || "") : d.slug;
    if (!slug) e.slug = "Chưa có slug. Nhập đường dẫn, vd: gioi-thieu-su-kien.";
    else if (!/^[a-z0-9-]+$/.test(slug)) e.slug = PAGE_ERRORS.slug_invalid.message;
    return e;
  }

  async function onSave() {
    if (!draft) return;
    const clientErrors = validate(draft);
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      setErr(null);
      setMsg(null);
      return;
    }
    setBusy(true);
    setErr(null);
    setMsg(null);
    setErrors({});
    try {
      if (draft._new) {
        const created = await createPage(draft);
        await load(created.slug);
      } else {
        const saved = await updatePage(draft.slug, draft);
        await load(saved.slug);
      }
      setMsg("Đã lưu ✓");
    } catch (e) {
      if (e instanceof ApiError && PAGE_ERRORS[e.code]) {
        const fe = PAGE_ERRORS[e.code];
        setErrors({ [fe.field]: fe.message });
      } else {
        setErr(e instanceof ApiError ? `Lỗi: ${e.code}` : "Có lỗi xảy ra.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!draft || draft._new) return;
    if (!confirm(`Xóa trang "${draft.title || draft.slug}"?`)) return;
    await deletePage(draft.slug);
    const list = await listPages();
    setPages(list);
    setDraft(list[0] ? { ...list[0] } : null);
  }

  const urlPreview = draft?.slug ? `/${slugify(draft.slug)}/` : "—";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-900">Trang tĩnh</h1>
        <Button onClick={() => setDraft(blankDraft())}>+ Tạo trang mới</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {pages.map((p) => (
            <button
              key={p.slug}
              onClick={() => setDraft({ ...p })}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                draft && !draft._new && draft.slug === p.slug
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="flex items-center gap-1.5">
                {p.title || p.slug}
                {p.showInHeader && <span title="Hiện trên header">📌</span>}
              </span>
              <span className="block text-xs opacity-60">/{p.slug}/</span>
            </button>
          ))}
          {pages.length === 0 && <p className="px-2 text-sm text-slate-400">Chưa có trang.</p>}
        </nav>

        {draft && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">
                {draft._new ? "Tạo trang mới" : `Sửa: ${draft.title || draft.slug}`}
              </h2>
              <div className="flex items-center gap-3">
                {msg && <span className="text-sm text-green-600">{msg}</span>}
                {!draft._new && (
                  <Button variant="danger" onClick={onDelete}>Xóa</Button>
                )}
                <Button onClick={onSave} disabled={busy}>{busy ? "Đang lưu…" : "Lưu"}</Button>
              </div>
            </div>

            {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}

            <Card className="space-y-4">
              <Field
                label="Slug (chữ thường, số, gạch ngang)"
                hint={`URL: ${urlPreview}`}
                error={errors.slug}
              >
                <Input
                  value={draft.slug}
                  error={Boolean(errors.slug)}
                  onChange={(e) => edit("slug", e.target.value)}
                  placeholder="gioi-thieu-su-kien"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tiêu đề (thẻ title / SEO)">
                  <Input value={draft.seo?.title ?? ""} onChange={(e) => editSeo("title", e.target.value)} />
                </Field>
                <Field label="Nhãn hiển thị trên header" hint="Ngắn gọn, vd: Giới thiệu — để trống sẽ dùng H1">
                  <Input value={draft.headerLabel ?? ""} onChange={(e) => edit("headerLabel", e.target.value)} placeholder="About" />
                </Field>
              </div>

              <Field label="Meta Description">
                <Textarea rows={2} value={draft.seo?.metaDescription ?? ""} onChange={(e) => editSeo("metaDescription", e.target.value)} />
              </Field>

              <Field label="H1 (tiêu đề hiển thị)" error={errors.title}>
                <Input value={draft.title} error={Boolean(errors.title)} onChange={(e) => edit("title", e.target.value)} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Trạng thái">
                  <Select value={draft.status} onChange={(e) => edit("status", e.target.value as AdminPage["status"])}>
                    <option value="published">Xuất bản</option>
                    <option value="hidden">Ẩn</option>
                  </Select>
                </Field>
                <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.showInHeader)}
                    onChange={(e) => edit("showInHeader", e.target.checked)}
                  />
                  Hiển thị trên menu header
                </label>
              </div>
            </Card>

            <Card>
              <p className="mb-2 text-sm font-medium text-slate-700">Nội dung</p>
              <RichTextEditor value={draft.contentHtml ?? ""} onChange={(html) => edit("contentHtml", html)} />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
