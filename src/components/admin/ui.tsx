"use client";

import type { ReactNode } from "react";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 flex items-start gap-1 text-xs font-medium text-red-600">
          <span>⚠</span>
          <span>{error}</span>
        </span>
      ) : (
        hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>
      )}
    </label>
  );
}

const baseInput =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2";
const okInput = "border-slate-200 focus:border-slate-400 focus:ring-slate-200";
const errInput = "border-red-400 focus:border-red-500 focus:ring-red-200";

type WithError = { error?: boolean };

export function Input({
  error,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & WithError) {
  return (
    <input
      {...props}
      aria-invalid={error || undefined}
      className={`${baseInput} ${error ? errInput : okInput} ${className}`}
    />
  );
}

export function Textarea({
  error,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & WithError) {
  return (
    <textarea
      {...props}
      aria-invalid={error || undefined}
      className={`${baseInput} ${error ? errInput : okInput} ${className}`}
    />
  );
}

export function Select({
  error,
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & WithError) {
  return (
    <select
      {...props}
      aria-invalid={error || undefined}
      className={`${baseInput} ${error ? errInput : okInput} ${className}`}
    />
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const styles = {
    primary:
      "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm hover:brightness-110",
    ghost: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    danger: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
  }[variant];
  return (
    <button
      {...props}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${styles} ${className}`}
    />
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
