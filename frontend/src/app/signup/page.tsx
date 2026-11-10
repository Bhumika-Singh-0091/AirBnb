"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useApp } from "@/context/AppContext";

export default function SignupPage() {
  const { signup, notify } = useApp();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validated, setValidated] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) return setValidated(true);
    setBusy(true);
    try {
      await signup(username, email, password);
      notify("success", "Welcome to WanderNest");
      router.push("/listings");
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
        <h2 className="auth-title">Join WanderNest 🌍</h2>
        <p className="auth-subtitle">Create an account to list your place or book stays</p>

        <form noValidate className={`needs-validation${validated ? " was-validated" : ""}`} onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input type="text" className="form-control" placeholder="Choose a username" required
              autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <div className="valid-feedback">Looks good!</div>
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="your@email.com" required
              autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="Create a strong password" required
              autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-auth" disabled={busy}>{busy ? "Creating…" : "Create Account"}</button>
        </form>

        <div className="auth-divider">— or —</div>
        <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#6B7280" }}>
          Already have an account? <Link href="/login" className="auth-link">Log in</Link>
        </p>
      </div>
    </div>
  );
}
