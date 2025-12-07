"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SettingsPage() {
  const [avgCycle, setAvgCycle] = useState<number>(28);
  const [lastPeriod, setLastPeriod] = useState<string>("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_cycle_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setAvgCycle(data.avg_cycle_length);
      setLastPeriod(data.last_period_start);
    }
  }

  async function saveSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Not logged in");
      return;
    }

    const { error } = await supabase
      .from("user_cycle_settings")
      .upsert({
        user_id: user.id,
        avg_cycle_length: avgCycle,
        last_period_start: lastPeriod,
      });

    if (error) {
      alert(error.message);
    } else {
      alert("Settings saved");
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Cycle Settings</h1>

      <label className="block mb-1">Average cycle length (days)</label>
      <input
        type="number"
        className="border w-full p-2 mb-3"
        value={avgCycle}
        onChange={(e) => setAvgCycle(Number(e.target.value))}
      />

      <label className="block mb-1">Last period start date</label>
      <input
        type="date"
        className="border w-full p-2 mb-3"
        value={lastPeriod}
        onChange={(e) => setLastPeriod(e.target.value)}
      />

      <button
        onClick={saveSettings}
        className="bg-blue-600 text-white p-2 rounded"
      >
        Save
      </button>
    </div>
  );
}
