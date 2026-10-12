"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import LoginModal from "@/components/admin/LoginModal";

/** Header "Đăng nhập" button that opens the login popup. */
export default function LoginButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm shadow-orange-500/30 transition hover:brightness-110"
      >
        Đăng nhập
      </button>
      <LoginModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          setOpen(false);
          router.push("/admin");
        }}
      />
    </>
  );
}
