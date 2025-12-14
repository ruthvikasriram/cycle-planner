"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { differenceInCalendarDays, parseISO } from "date-fns";

type CycleInfo = {
  cycleDay: number | null;
  phase: string;
};

type SettingsRow = {
  avg_cycle_length: number;
  last_period_start: string;
};

type DailyLogRow = {
  mood: number | null;
  energy: number | null;
  cycle_day: number | null;
  cycle_phase: string | null;
  date: string;
  flow: string | null;

};

function computeCycleInfo(
  lastPeriodStart: string | null,
  avgCycleLength: number | null,
  forDate: string
): CycleInfo {
  if (!lastPeriodStart || !avgCycleLength) {
    return { cycleDay: null, phase: "Unknown" };
  }

  const start = parseISO(lastPeriodStart);
  const current = parseISO(forDate);
  const diff = differenceInCalendarDays(current, start);

  if (diff < 0) return { cycleDay: null, phase: "Unknown" };

  const cycleDay = (diff % avgCycleLength) + 1;

  let phase = "Luteal";
  if (cycleDay >= 1 && cycleDay <= 5) phase = "Menstrual";
  else if (cycleDay <= 12) phase = "Follicular";
  else if (cycleDay <= 16) phase = "Ovulatory";

  return { cycleDay, phase };
}

export default function TodayPage() {
  const router = useRouter();

  const [settings, setSettings] = useState<SettingsRow | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [flow, setFlow] = useState<string>("none");

  const [cycleInfo, setCycleInfo] = useState<CycleInfo>({
    cycleDay: null,
    phase: "Unknown",
  });

  const [mood, setMood] = useState<number | "">("");
  const [energy, setEnergy] = useState<number | "">("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const todayIso = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Load settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("user_cycle_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle<SettingsRow>();

    if (settingsError) {
      console.error(settingsError.message);
    } else {
      setSettings(settingsData ?? null);
    }

    // Default date = today
    const defaultDate = todayIso;
    setSelectedDate(defaultDate);

    // Load log + compute phase for default date
    await loadForDate(defaultDate, settingsData ?? null);

    setLoading(false);
  }

  async function loadForDate(dateIso: string, settingsOverride?: SettingsRow | null) {
    const activeSettings = settingsOverride ?? settings;

    // Recompute cycle info for selected date
    const info = computeCycleInfo(
      activeSettings?.last_period_start ?? null,
      activeSettings?.avg_cycle_length ?? null,
      dateIso
    );
    setCycleInfo(info);

    // Load existing log for that date
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: log, error: logError } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", dateIso)
      .maybeSingle<DailyLogRow>();

    if (logError) {
      console.error("Error loading log:", logError.message);
      setMood("");
      setEnergy("");
      return;
    }

    if (log) {
      setMood(log.mood ?? "");
      setEnergy(log.energy ?? "");
      setFlow(log.flow ?? "none");

    } else {
      // No log yet for that day
      setMood("");
      setEnergy("");
      setFlow("none");

    }
  }

  function onChangeDate(newDate: string) {
    setSelectedDate(newDate);
    loadForDate(newDate);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function saveDailyLog() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Not logged in");
      return;
    }

    if (!selectedDate) {
      alert("Missing date");
      return;
    }

    // Optional: prevent logging future dates
    if (selectedDate > todayIso) {
      alert("Future logging is disabled. Pick today or a past date.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("daily_logs").upsert({
      user_id: user.id,
      date: selectedDate,
      mood: mood === "" ? null : mood,
      energy: energy === "" ? null : energy,
      cycle_day: cycleInfo.cycleDay,
      cycle_phase: cycleInfo.phase,
      flow,
    });

    setSaving(false);

    if (error) {
      alert("Error saving log: " + error.message);
    } else {
      alert(`Saved for ${selectedDate}.`);
    }
  }

  return (
    <div className="center-page">
      <div className="page-card page-card-wide">
        <div className="page-actions-row">
          <div>
            <h1 className="page-title" style={{ marginBottom: "0.1rem" }}>
              Daily log
            </h1>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>
              Pick any past day you missed and fill it in.
            </p>
          </div>
          <button onClick={handleLogout} className="logout-link">
            Log out
          </button>
        </div>

        {loading ? (
          <p className="analytics-small-text">Loading…</p>
        ) : (
          <>
            {/* Date picker */}
            <div className="field-group">
              <label className="field-label">Log date</label>
              <input
                type="date"
                className="field-input"
                value={selectedDate}
                max={todayIso} // prevents selecting future dates in UI
                onChange={(e) => onChangeDate(e.target.value)}
              />
              <div className="small-link-row" style={{ marginTop: "0.35rem" }}>
                Tip: you can backfill missed days here.
              </div>
            </div>

            {/* Cycle pills */}
            <div className="stats-pill-row">
              <div className="stats-pill">
                <strong>Cycle day:</strong> {cycleInfo.cycleDay ?? "—"}
              </div>
              <div className="stats-pill">
                <strong>Phase:</strong> {cycleInfo.phase}
              </div>
            </div>

            {/* Inputs */}
            <div className="field-group">
              <label className="field-label">Mood (1–5)</label>
              <input
                type="number"
                min={1}
                max={5}
                className="field-input"
                value={mood}
                onChange={(e) =>
                  setMood(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>

            <div className="field-group">
              <label className="field-label">Energy (1–5)</label>
              <input
                type="number"
                min={1}
                max={5}
                className="field-input"
                value={energy}
                onChange={(e) =>
                  setEnergy(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>
            <div className="field-group">
              <label className="field-label">Period flow</label>
              <select
              className="field-input"
              value={flow}
              onChange={(e) => setFlow(e.target.value)}
              >
                <option value="none">None</option>
                <option value="spotting">Spotting</option>
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="heavy">Heavy</option>
                </select>
                <div className="small-link-row" style={{ marginTop: "0.35rem" }}>
                  Tip: log flow even if mood/energy is blank.
                  </div>
                  </div>


            <button
              onClick={saveDailyLog}
              className="primary-btn"
              style={{ width: "100%", marginTop: "0.75rem" }}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save log"}
            </button>

            {!settings?.last_period_start && (
              <div className="small-link-row" style={{ marginTop: "0.75rem" }}>
                Your cycle phase will be more accurate after you set{" "}
                <a className="small-link" href="/settings">
                  Settings
                </a>
                .
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
