"use client";

import { useEffect, useRef, useState } from "react";
import {
  getSettings,
  updateSettings,
  listPages,
  reorderPages,
  type AdminSettings,
  type SiteLink,
  type AdminPage,
} from "@/lib/adminApi";
import { Button, Card, Field, Input } from "@/components/admin/ui";
import ImageField from "@/components/admin/ImageField";

function LinkList({
  title,
  value,
  onChange,
}: {
  title: string;
  value: SiteLink[];
  onChange: (v: SiteLink[]) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">{title}</p>
      <div className="space-y-2">
        {value.map((l, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder="Nhãn (vd: Giới thiệu)"
              value={l.label}
              onChange={(e) => {
                const next = [...value];
                next[i] = { ...next[i], label: e.target.value };
                onChange(next);
              }}
            />
            <Input
              placeholder="URL (vd: /gioi-thieu/ hoặc https://…)"
              value={l.url}
              onChange={(e) => {
                const next = [...value];
                next[i] = { ...next[i], url: e.target.value };
                onChange(next);
              }}
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="shrink-0 rounded-lg border border-red-200 px-3 text-sm text-red-600 hover:bg-red-50"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...value, { label: "", url: "" }])}
          className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50"
        >
          + Thêm link
        </button>
      </div>
    </div>
  );
}

export default function AppearancePage() {
  const [s, setS] = useState<AdminSettings>({});
  const [headerPages, setHeaderPages] = useState<AdminPage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const dragSlug = useRef<string | null>(null);

  async function loadPages() {
    const list = await listPages();
    setHeaderPages(
      list.filter((p) => p.showInHeader).sort((a, b) => (a.headerOrder ?? 0) - (b.headerOrder ?? 0))
    );
  }

  useEffect(() => {
    Promise.all([getSettings(), listPages()]).then(([setting, list]) => {
      setS(setting ?? {});
      setHeaderPages(
        list.filter((p) => p.showInHeader).sort((a, b) => (a.headerOrder ?? 0) - (b.headerOrder ?? 0))
      );
      setLoaded(true);
    });
  }, []);

  function set<K extends keyof AdminSettings>(k: K, v: AdminSettings[K]) {
    setS((prev) => ({ ...prev, [k]: v }));
    setSaved(false);
  }

  async function onSave() {
    setBusy(true);
    try {
      await updateSettings({
        headerTitle: s.headerTitle,
        logoUrl: s.logoUrl,
        faviconUrl: s.faviconUrl,
        footerText: s.footerText,
        footerLinks: (s.footerLinks ?? []).filter((l) => l.label && l.url),
        headerLinks: (s.headerLinks ?? []).filter((l) => l.label && l.url),
      });
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  function onDropHeader(targetSlug: string) {
    const from = dragSlug.current;
    dragSlug.current = null;
    if (!from || from === targetSlug) return;
    setHeaderPages((list) => {
      const arr = [...list];
      const fi = arr.findIndex((x) => x.slug === from);
      const ti = arr.findIndex((x) => x.slug === targetSlug);
      const [moved] = arr.splice(fi, 1);
      arr.splice(ti, 0, moved);
      reorderPages(arr.map((x) => x.slug)).catch(() => loadPages());
      return arr;
    });
  }

  if (!loaded) return <p className="text-slate-400">Đang tải…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-900">Giao diện</h1>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600">Đã lưu ✓</span>}
          <Button onClick={onSave} disabled={busy}>{busy ? "Đang lưu…" : "Lưu"}</Button>
        </div>
      </div>

      <Card className="space-y-4">
        <h2 className="font-semibold text-slate-800">Thương hiệu</h2>
        <Field label="Tiêu đề header" hint="Chữ hiển thị cạnh logo">
          <Input value={s.headerTitle ?? ""} onChange={(e) => set("headerTitle", e.target.value)} placeholder="Lửa và Nước" />
        </Field>
        <ImageField label="Logo (để trống sẽ dùng biểu tượng 🔥💧)" value={s.logoUrl} onChange={(url) => set("logoUrl", url)} />
        <ImageField label="Favicon (ảnh vuông, hiển thị trên tab trình duyệt)" value={s.faviconUrl} onChange={(url) => set("faviconUrl", url)} />
      </Card>

      <Card className="space-y-4">
        <h2 className="font-semibold text-slate-800">Menu header</h2>
        <p className="text-sm text-slate-500">
          Các trang có bật “Hiển thị trên menu header” (trong tab <b>Trang tĩnh</b>) sẽ
          xuất hiện ở đây. Kéo để sắp xếp thứ tự.
        </p>
        {headerPages.length === 0 ? (
          <p className="text-sm text-slate-400">Chưa có trang nào bật hiển thị trên header.</p>
        ) : (
          <ul className="space-y-1">
            {headerPages.map((p) => (
              <li
                key={p.slug}
                draggable
                onDragStart={() => (dragSlug.current = p.slug)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropHeader(p.slug)}
                className="flex cursor-grab items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <span className="text-slate-300">⠿</span>
                <span className="font-medium text-slate-700">{p.headerLabel || p.title}</span>
                <span className="text-xs text-slate-400">/{p.slug}/</span>
              </li>
            ))}
          </ul>
        )}
        <LinkList
          title="Link tùy chỉnh thêm trên header (tùy chọn)"
          value={s.headerLinks ?? []}
          onChange={(v) => set("headerLinks", v)}
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="font-semibold text-slate-800">Footer</h2>
        <Field label="Dòng chữ footer (copyright / mô tả)">
          <Input value={s.footerText ?? ""} onChange={(e) => set("footerText", e.target.value)} />
        </Field>
        <LinkList
          title="Liên kết ở footer"
          value={s.footerLinks ?? []}
          onChange={(v) => set("footerLinks", v)}
        />
      </Card>
    </div>
  );
}
