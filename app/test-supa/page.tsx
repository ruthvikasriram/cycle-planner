"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function TestSupaPage() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    async function check() {
      try {
        const { data, error } = await supabase
          .from("user_cycle_settings")
          .select("*")
          .limit(1);

        if (error) {
          setStatus("Connected, but query error: " + error.message);
        } else {
          setStatus("Supabase connected. Query worked.");
        }
      } catch (e: any) {
        setStatus("Connection failed: " + e.message);
      }
    }
    check();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Supabase Test</h1>
      <p>{status}</p>
    </div>
  );
}
