"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

type SettingsRow = {
  avg_cycle_length: number;
  last_period_start: string;
};

export default function SettingsPage() {
  const [avgCycle, setAvgCycle] = useState<number>(28);
  const [lastPeriod, setLastPeriod] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_cycle_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle<SettingsRow>();

    if (!error && data) {
      setAvgCycle(data.avg_cycle_length);
      setLastPeriod(data.last_period_start);
    }

    setLoading(false);
  }

  async function saveSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Not logged in");
      return;
    }
    if (!lastPeriod || !avgCycle) {
      alert("Please fill both fields.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("user_cycle_settings").upsert({
      user_id: user.id,
      avg_cycle_length: avgCycle,
      last_period_start: lastPeriod,
    });

    setSaving(false);

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      alert("Settings saved");
    }
  }

  return (
    <div className="center-page">
      <div className="page-card page-card-wide">
        <div className="page-actions-row">
          <div>
            <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>
              Cycle settings
            </h1>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>
              These settings help the planner understand where you are in your cycle.
            </p>
          </div>
          <Link href="/today" className="small-link">
            Go to Today
          </Link>
        </div>

        {loading ? (
          <p className="analytics-small-text">Loading settings…</p>
        ) : (
          <>
            <div className="field-group">
              <label className="field-label">Average cycle length (days)</label>
              <input
                type="number"
                className="field-input"
                value={avgCycle}
                onChange={(e) => setAvgCycle(Number(e.target.value))}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Last period start date</label>
              <input
                type="date"
                className="field-input"
                value={lastPeriod}
                onChange={(e) => setLastPeriod(e.target.value)}
              />
            </div>

            <button
              onClick={saveSettings}
              className="primary-btn"
              style={{ width: "100%", marginTop: "0.75rem" }}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save settings"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
