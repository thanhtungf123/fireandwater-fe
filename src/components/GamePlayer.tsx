"use client";

import { useEffect, useRef, useState } from "react";

interface GamePlayerProps {
  src: string;
  title: string;
  width?: number;
  height?: number;
}

/** If the game hasn't loaded within this long, show a fallback notice. */
const LOAD_TIMEOUT_MS = 12000;

/**
 * Game iframe player (spec §3.1, §4) wrapped in a fire/water gradient ring:
 * - loads the game directly with a themed loading state
 * - fullscreen via the Fullscreen API with a graceful fallback message
 * - keeps aspect ratio, no distortion, no horizontal scroll on mobile
 */
export default function GamePlayer({
  src,
  title,
  width = 900,
  height = 510,
}: GamePlayerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [fsMessage, setFsMessage] = useState<string | null>(null);

  const aspect = `${width} / ${height}`;

  // If the provider refuses embedding (X-Frame-Options/CSP), onLoad may never
  // fire — fall back to a notice + source link instead of a blank frame.
  useEffect(() => {
    if (loaded) return;
    const t = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [loaded]);

  async function toggleFullscreen() {
    const el = wrapRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) await el.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      setFsMessage(
        "Trình duyệt từ chối toàn màn hình. Bạn có thể dùng phím F11 hoặc xoay ngang thiết bị."
      );
      setTimeout(() => setFsMessage(null), 5000);
    }
  }

  return (
    <div
      className="mx-auto w-full"
      // Cap width so the frame never gets taller than ~78vh, keeping aspect ratio.
      style={{ maxWidth: `calc(78vh * ${width} / ${height})` }}
    >
      <div className="player-ring">
        <div
          ref={wrapRef}
          className="relative w-full overflow-hidden rounded-[1.35rem] bg-slate-950"
          style={{ aspectRatio: aspect, maxHeight: "78vh" }}
        >
          {!loaded && !timedOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-white/80">
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.2s]" />
                  <span className="h-3 w-3 animate-bounce rounded-full bg-fuchsia-500 [animation-delay:-0.1s]" />
                  <span className="h-3 w-3 animate-bounce rounded-full bg-cyan-400" />
                </div>
                <span className="text-sm font-medium">Đang tải game…</span>
              </div>
            </div>
          )}
          {!loaded && timedOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950 p-6 text-center text-white/80">
              <div className="max-w-sm space-y-3">
                <div className="text-3xl">🚫</div>
                <p className="text-sm">
                  Game đang tải lâu hơn bình thường hoặc nguồn không cho phép nhúng
                  trực tiếp.
                </p>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-semibold text-white"
                >
                  ▶ Mở game ở cửa sổ mới
                </a>
                <button
                  type="button"
                  onClick={() => setTimedOut(false)}
                  className="block w-full text-xs text-white/50 underline"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}
          <iframe
            src={src}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="fullscreen; autoplay; gamepad; focus-without-user-activation"
            allowFullScreen
            scrolling="no"
            onLoad={() => setLoaded(true)}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <p className="text-xs text-slate-500">
          🎮 Di chuyển bằng <b>WASD</b> và <b>phím mũi tên</b>. Trên điện thoại có
          thể đổi điều khiển trong menu của game.
        </p>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="shrink-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-500/30 transition hover:brightness-110 active:scale-95"
        >
          ⛶ Toàn màn hình
        </button>
      </div>

      {fsMessage && (
        <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {fsMessage}
        </p>
      )}
    </div>
  );
}
