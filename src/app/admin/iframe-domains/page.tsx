"use client";

import { useEffect, useState } from "react";
import {
  listIframeDomains,
  addIframeDomain,
  deleteIframeDomain,
  ApiError,
  type IframeDomain,
} from "@/lib/adminApi";
import { Button, Card, Field, Input } from "@/components/admin/ui";

/** User-facing messages for the add-domain errors returned by the backend. */
const ADD_ERRORS: Record<string, string> = {
  domain_invalid:
    "Domain không hợp lệ. Nhập dạng host (vd: html5.gamemonetize.co) — bạn có thể dán cả link, hệ thống tự lấy domain.",
  domain_builtin: "Domain này đã có sẵn trong danh sách mặc định.",
  domain_exists: "Domain này đã có trong danh sách.",
};

export default function IframeDomainsPage() {
  const [baseline, setBaseline] = useState<string[]>([]);
  const [custom, setCustom] = useState<IframeDomain[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  async function reload() {
    const data = await listIframeDomains();
    setBaseline(data.baseline);
    setCustom(data.custom);
    setLoaded(true);
  }

  useEffect(() => {
    reload();
  }, []);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;
    setBusy(true);
    setError(null);
    setJustAdded(null);
    try {
      const created = await addIframeDomain(value);
      setInput("");
      setJustAdded(created.domain);
      await reload();
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "domain_invalid";
      setError(ADD_ERRORS[code] ?? "Không thêm được domain. Hãy thử lại.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(d: IframeDomain) {
    if (
      !confirm(
        `Xóa domain "${d.domain}"? Các game đang dùng link từ domain này sẽ không lưu lại được cho tới khi bạn thêm lại.`
      )
    )
      return;
    await deleteIframeDomain(d._id);
    await reload();
  }

  if (!loaded) return <p className="text-slate-400">Đang tải…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Nguồn game (whitelist iframe)
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Chỉ những domain trong danh sách này mới được dùng làm link nhúng game.
          Thêm domain ở đây là áp dụng ngay — không cần sửa code hay deploy lại.
        </p>
      </div>

      {/* Add form */}
      <Card>
        <h2 className="mb-3 font-semibold text-slate-800">Thêm domain mới</h2>
        <form onSubmit={onAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field
              label="Domain hoặc link nhúng"
              error={error ?? undefined}
              hint="Vd: html5.gamemonetize.co — hoặc dán cả link, hệ thống tự lấy domain."
            >
              <Input
                value={input}
                error={Boolean(error)}
                placeholder="html5.gamemonetize.co"
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(null);
                }}
              />
            </Field>
          </div>
          <Button type="submit" disabled={busy || !input.trim()}>
            {busy ? "Đang thêm…" : "Thêm"}
          </Button>
        </form>
        {justAdded && (
          <p className="mt-2 text-sm text-green-600">
            Đã thêm <span className="font-mono">{justAdded}</span> ✓ — giờ có thể
            dùng link từ domain này khi thêm/sửa game.
          </p>
        )}
      </Card>

      {/* Custom (deletable) domains */}
      <Card>
        <h2 className="mb-3 font-semibold text-slate-800">
          Domain đã thêm ({custom.length})
        </h2>
        {custom.length === 0 ? (
          <p className="text-sm text-slate-400">
            Chưa có domain nào do bạn thêm. Hãy thêm ở ô phía trên.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {custom.map((d) => (
              <li
                key={d._id}
                className="flex items-center justify-between py-2.5"
              >
                <span className="font-mono text-sm text-slate-800">
                  {d.domain}
                </span>
                <Button variant="danger" onClick={() => onDelete(d)}>
                  Xóa
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Built-in (locked) domains */}
      <Card>
        <h2 className="mb-1 font-semibold text-slate-800">
          Domain mặc định (có sẵn)
        </h2>
        <p className="mb-3 text-xs text-slate-400">
          Đây là các nguồn tin cậy được tích hợp sẵn, không xóa được.
        </p>
        <ul className="flex flex-wrap gap-2">
          {baseline.map((d) => (
            <li
              key={d}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-xs text-slate-600"
            >
              {d}
            </li>
          ))}
        </ul>
      </Card>

      {/* Instructions */}
      <Card className="bg-slate-50/60">
        <h2 className="mb-3 font-semibold text-slate-800">
          Hướng dẫn thêm nguồn game
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>
            Mở trang game ở nguồn bạn muốn (GameMonetize, Gameflare…) và lấy{" "}
            <b>link nhúng (embed)</b> của nó. Ví dụ:{" "}
            <span className="font-mono text-xs">
              https://html5.gamemonetize.co/&lt;id&gt;/
            </span>
            .
          </li>
          <li>
            Dán <b>link đó</b> (hoặc chỉ phần domain như{" "}
            <span className="font-mono text-xs">html5.gamemonetize.co</span>) vào
            ô “Thêm domain mới” ở trên rồi bấm <b>Thêm</b>. Hệ thống tự cắt lấy
            phần domain.
          </li>
          <li>
            Vào <b>Game → Sửa game</b>, dán link nhúng vào ô <b>URL iframe</b> và
            Lưu. Vì domain đã có trong whitelist nên sẽ không còn báo “Domain
            chưa được cho phép”.
          </li>
        </ol>

        <h3 className="mb-2 mt-5 font-semibold text-slate-800">Lưu ý quan trọng</h3>
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>
            Link phải là <b>https</b>. Domain so khớp <b>chính xác</b>:{" "}
            <span className="font-mono text-xs">www.gameflare.com</span> khác với{" "}
            <span className="font-mono text-xs">gameflare.com</span> — nếu dùng cả
            hai kiểu link thì thêm cả hai.
          </li>
          <li>
            Thêm domain ở đây chỉ giúp <b>lưu được game</b>. Việc game có chạy khi
            nhúng hay hiện “NOT AVAILABLE HERE” là do{" "}
            <b>nhà cung cấp</b> quyết định (một số nguồn khóa theo domain). Hãy{" "}
            <b>test thử 1 game</b> sau khi thêm. GameMonetize thường cho nhúng tự
            do; GameDistribution/Gameflare có thể khóa domain chưa đăng ký.
          </li>
          <li>
            Chỉ thêm những nguồn bạn <b>tin tưởng</b>. Iframe cho phép trang ngoài
            chạy nội dung bên trong site của bạn, nên whitelist là lớp bảo vệ —
            tránh thêm domain lạ.
          </li>
        </ul>
      </Card>
    </div>
  );
}
