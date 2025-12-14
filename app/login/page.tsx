"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);

    if (error) {
      alert(error.message);
    } else {
      router.push("/today");
    }
  }

  return (
    <div className="center-page">
      <div className="page-card">
        <h1 className="page-title">Welcome back</h1>
        <p className="page-subtitle">
          Log in to see today&apos;s phase, log your day, and review your patterns.
        </p>

        <div className="field-group">
          <label className="field-label">Email</label>
          <input
            className="field-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label className="field-label">Password</label>
          <input
            className="field-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleLogin}
          className="primary-btn"
          style={{ width: "100%", marginTop: "0.75rem", marginBottom: "0.75rem" }}
          disabled={busy}
        >
          {busy ? "Logging in…" : "Log in"}
        </button>

        <div className="small-link-row">
          New here?{" "}
          <Link href="/signup" className="small-link">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
