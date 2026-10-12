"use client";

import { useState } from "react";
import { uploadImage, ApiError } from "@/lib/adminApi";

interface Props {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

/** Thumbnail / OG image field: upload to Cloudinary or paste a URL. */
export default function ImageField({ value, onChange, label }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (e) {
      if (e instanceof ApiError && e.code === "cloudinary_not_configured") {
        setErr("Chưa cấu hình Cloudinary trong backend/.env");
      } else {
        setErr("Tải ảnh thất bại. Bạn có thể dán URL ảnh trực tiếp.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {label && <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>}
      <div className="flex items-start gap-3">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl">🖼</div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
          />
          <input
            type="url"
            placeholder="hoặc dán URL ảnh…"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
          />
          {busy && <p className="text-xs text-slate-400">Đang tải lên…</p>}
          {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
      </div>
    </div>
  );
}
