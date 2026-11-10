"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { useApp } from "@/context/AppContext";

function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/listings";
}

function LoginForm() {
  const { login, notify } = useApp();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [validated, setValidated] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) return setValidated(true);
    setBusy(true);
    try {
      await login(username, password);
      notify("success", "Welcome Back to WanderNest!");
      router.push(next);
    } catch (err) {
      notify("error", (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,#7C3AED,#F59E0B)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.8rem" }}>
            <i className="fa-solid fa-compass-drafting" style={{ color: "white", fontSize: "1.5rem" }}></i>
          </div>
          <div className="brand-name">WanderNest</div>
        </div>
        <h2 className="auth-title">Welcome back! 👋</h2>
        <p className="auth-subtitle">Sign in to manage your listings and reviews</p>

        <form noValidate className={`needs-validation${validated ? " was-validated" : ""}`} onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input type="text" className="form-control" placeholder="Enter your username" required
              autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="Enter your password" required
              autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-auth" disabled={busy}>{busy ? "Logging in…" : "Log In"}</button>
        </form>

        <div className="auth-divider">— or —</div>
        <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#6B7280" }}>
          Don&apos;t have an account? <Link href="/signup" className="auth-link">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
