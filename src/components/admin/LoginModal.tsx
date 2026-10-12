"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { login, ApiError } from "@/lib/adminApi";
import { Button, Field, Input } from "./ui";

interface Props {
  open: boolean;
  onSuccess: () => void;
  /** Provide to make the popup dismissible (shows an X + backdrop click). */
  onClose?: () => void;
}

/** Popup login dialog. */
export default function LoginModal({ open, onSuccess, onClose }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Lock background scroll while the popup is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && onClose) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await login(username, password);
      onSuccess();
    } catch (e) {
      if (e instanceof ApiError && e.code === "invalid_credentials") {
        setErr("Sai tài khoản hoặc mật khẩu.");
      } else {
        setErr("Không đăng nhập được. Kiểm tra backend đang chạy.");
      }
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* card */}
      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-sm space-y-4 rounded-2xl border border-white/60 bg-white p-7 shadow-2xl animate-[popIn_.15s_ease-out]"
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        )}

        <div className="text-center">
          <div className="text-3xl">🔥💧</div>
          <h2 className="mt-2 font-display text-xl font-bold text-fire-water">
            Đăng nhập Admin
          </h2>
          <p className="text-sm text-slate-400">Lửa và Nước</p>
        </div>

        <Field label="Tài khoản">
          <Input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </Field>
        <Field label="Mật khẩu">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>

        {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}

        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Đang đăng nhập…" : "Đăng nhập"}
        </Button>
      </form>
    </div>,
    document.body
  );
}
