"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSignup() {
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setBusy(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Signup successful. Please log in.");
      router.push("/login");
    }
  }

  return (
    <div className="center-page">
      <div className="page-card">
        <h1 className="page-title">Create your space</h1>
        <p className="page-subtitle">
          Make an account to start logging mood and energy across your cycle.
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
          onClick={handleSignup}
          className="primary-btn"
          style={{ width: "100%", marginTop: "0.75rem", marginBottom: "0.75rem" }}
          disabled={busy}
        >
          {busy ? "Creating account…" : "Sign up"}
        </button>

        <div className="small-link-row">
          Already have an account?{" "}
          <Link href="/login" className="small-link">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
