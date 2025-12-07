"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getCycleInfo } from "../../lib/cycleUtils";

type CycleInfo = {
  cycleDay: number;
  phase: string;
};

export default function TodayPage() {
  const [cycleInfo, setCycleInfo] = useState<CycleInfo | null>(null);
  const [mood, setMood] = useState<number>(3);
  const [energy, setEnergy] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCycleData();
  }, []);

  async function loadCycleData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Not logged in");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_cycle_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error loading cycle settings:", error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      alert("No cycle settings found. Please fill them in first.");
      // could redirect to /settings, but let's just warn for now
      setLoading(false);
      return;
    }

    const info = getCycleInfo(data.last_period_start, data.avg_cycle_length);
    setCycleInfo(info);
    setLoading(false);
  }

  async function saveDailyLog() {
    if (!cycleInfo) return;

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Not logged in");
      setSaving(false);
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("daily_logs").upsert({
      user_id: user.id,
      date: todayStr,
      mood,
      energy,
      cycle_day: cycleInfo.cycleDay,
      cycle_phase: cycleInfo.phase,
    });

    setSaving(false);

    if (error) {
      alert("Error saving log: " + error.message);
    } else {
      alert("Today's log saved");
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!cycleInfo) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold mb-2">Today</h1>
        <p>No cycle info available. Go to <a href="/settings" className="text-blue-600 underline">Settings</a> first.</p>
      </div>
    );
  }

  return (
  <div className="p-8 max-w-md mx-auto">
    {/* Header with logout */}
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-xl font-bold">Today</h1>
      <button
        onClick={handleLogout}
        className="text-sm text-red-600 underline"
      >
        Logout
      </button>
    </div>

    {/* Cycle info */}
    <p className="mb-1">
      Cycle Day: <b>{cycleInfo.cycleDay}</b>
    </p>
    <p className="mb-4">
      Phase: <b>{cycleInfo.phase}</b>
    </p>

    {/* Mood input */}
    <label className="block mb-1">Mood (1–5)</label>
    <input
      type="number"
      min={1}
      max={5}
      className="border w-full p-2 mb-3"
      value={mood}
      onChange={(e) => setMood(Number(e.target.value))}
    />

    {/* Energy input */}
    <label className="block mb-1">Energy (1–5)</label>
    <input
      type="number"
      min={1}
      max={5}
      className="border w-full p-2 mb-4"
      value={energy}
      onChange={(e) => setEnergy(Number(e.target.value))}
    />

    {/* Save button */}
    <button
      onClick={saveDailyLog}
      disabled={saving}
      className="bg-green-600 text-white p-2 rounded w-full disabled:opacity-60"
    >
      {saving ? "Saving..." : "Save Today’s Log"}
    </button>

    {/* Link to analytics */}
    <div className="mt-6 text-center">
      <a href="/analytics" className="text-blue-600 underline text-sm">
        View Analytics
      </a>
    </div>
  </div>
  );

  async function handleLogout() {
  await supabase.auth.signOut();
  window.location.href = "/login";
  }

}
