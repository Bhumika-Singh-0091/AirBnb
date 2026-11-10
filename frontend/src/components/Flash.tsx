"use client";

import { useApp } from "@/context/AppContext";

export default function Flash() {
  const { flash, dismissFlash } = useApp();
  if (!flash) return null;
  const ok = flash.type === "success";
  return (
    <div className={`alert ${ok ? "alert-success" : "alert-danger"} alert-dismissible fade show mt-3`} role="alert">
      <i className={`fa-solid ${ok ? "fa-circle-check" : "fa-circle-exclamation"} me-2`}></i>
      {flash.message}
      <button type="button" className="btn-close" aria-label="Close" onClick={dismissFlash}></button>
    </div>
  );
}
