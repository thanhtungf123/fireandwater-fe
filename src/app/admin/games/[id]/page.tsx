"use client";

import { use, useEffect, useState } from "react";
import GameForm from "@/components/admin/GameForm";
import { getGame, type AdminGame } from "@/lib/adminApi";

export default function EditGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [game, setGame] = useState<AdminGame | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getGame(id)
      .then(setGame)
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) return <p className="text-slate-500">Không tìm thấy game.</p>;
  if (!game) return <p className="text-slate-400">Đang tải…</p>;
  return <GameForm initial={game} />;
}
