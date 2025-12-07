"use client";

import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getUser();
      setLoggedIn(!!data.user);
    }
    check();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="max-w-lg w-full p-8 border border-slate-800 rounded-xl bg-slate-900/60">
        <h1 className="text-2xl font-bold mb-3">
          Cycle-Aware Wellness Planner
        </h1>
        <p className="text-sm text-slate-300 mb-6">
          Track mood and energy across your cycle, understand your phases, and
          see patterns over time with simple, data-driven insights.
        </p>

        <div className="space-y-2 mb-6">
          {loggedIn ? (
            <>
              <Link
                href="/today"
                className="block w-full text-center bg-green-600 hover:bg-green-500 text-white py-2 rounded-md text-sm font-medium"
              >
                Go to Today
              </Link>
              <Link
                href="/analytics"
                className="block w-full text-center border border-slate-600 hover:border-slate-400 py-2 rounded-md text-sm font-medium"
              >
                View Analytics
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md text-sm font-medium"
              >
                Create an account
              </Link>
              <Link
                href="/login"
                className="block w-full text-center border border-slate-600 hover:border-slate-400 py-2 rounded-md text-sm font-medium"
              >
                Log in
              </Link>
            </>
          )}
        </div>

        <p className="text-xs text-slate-400">
          Built as a cycle-aware daily planner: log mood &amp; energy, track your
          phase, and visualize patterns to make your routines kinder and smarter.
        </p>
      </div>
    </main>
  );
}
