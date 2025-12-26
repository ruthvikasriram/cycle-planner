"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { computePhase } from "../../lib/cycle";

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
  notes: string | null;
};

export default function TodayClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [settings, setSettings] = useState<SettingsRow | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [mood, setMood] = useState<number | "">("");
  const [energy, setEnergy] = useState<number | "">("");
  const [flow, setFlow] = useState<string>("none");
  const [notes, setNotes] = useState<string>("");

  const [cycleInfo, setCycleInfo] = useState<CycleInfo>({
    cycleDay: null,
    phase: "Unknown",
  });

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

    const fromUrl = searchParams.get("date");
    const defaultDate =
      fromUrl && /^\d{4}-\d{2}-\d{2}$/.test(fromUrl)
        ? fromUrl
        : todayIso;

    setSelectedDate(defaultDate);
    await loadForDate(defaultDate, settingsData ?? null);

    setLoading(false);
  }

  async function loadForDate(
    dateIso: string,
    settingsOverride?: SettingsRow | null
  ) {
    const activeSettings = settingsOverride ?? settings;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: log, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", dateIso)
      .maybeSingle<DailyLogRow>();

    if (error) {
      console.error("Error loading log:", error.message);
      setMood("");
      setEnergy("");
      setFlow("none");
      setNotes("");
      return;
    }

    if (log) {
      setMood(log.mood ?? "");
      setEnergy(log.energy ?? "");
      setFlow(log.flow ?? "none");
      setNotes(log.notes ?? "");
    } else {
      setMood("");
      setEnergy("");
      setFlow("none");
      setNotes("");
    }

    const phaseRes = computePhase({
      dateISO: dateIso,
      lastPeriodStartISO: activeSettings?.last_period_start ?? null,
      avgCycleLength: activeSettings?.avg_cycle_length ?? null,
      flow: log?.flow ?? "none",
    });

    setCycleInfo({
      cycleDay: phaseRes.cycleDay,
      phase:
        phaseRes.phase +
        (phaseRes.phaseSource === "estimated"
          ? " (estimated)"
          : phaseRes.phaseSource === "logged"
          ? " (logged)"
          : ""),
    });
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

    if (!user || !selectedDate) return;

    if (selectedDate > todayIso) {
      alert("Future logging is disabled.");
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
      notes: notes.trim() === "" ? null : notes.trim(),
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
            <h1 className="page-title">Daily log</h1>
            <p className="page-subtitle">
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
            <div className="field-group">
              <label className="field-label">Log date</label>
              <input
                type="date"
                className="field-input"
                value={selectedDate}
                max={todayIso}
                onChange={(e) => onChangeDate(e.target.value)}
              />
            </div>

            <div className="stats-pill-row">
              <div className="stats-pill">
                <strong>Cycle day:</strong> {cycleInfo.cycleDay ?? "—"}
              </div>
              <div className="stats-pill">
                <strong>Phase:</strong> {cycleInfo.phase}
              </div>
            </div>

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
            </div>

            <div className="field-group">
              <label className="field-label">Notes (optional)</label>
              <textarea
                className="field-input"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What impacted your mood or energy today?"
              />
            </div>

            <button
              onClick={saveDailyLog}
              className="primary-btn"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save log"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
