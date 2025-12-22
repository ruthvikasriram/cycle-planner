"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  format,
  getDay,
  parseISO,
} from "date-fns";

type LogEntry = {
  date: string; // "YYYY-MM-DD"
  mood: number | null;
  energy: number | null;
  cycle_day: number | null;
  cycle_phase: string | null;
  flow?: string | null; 
  notes?: string | null;

};

type MonthMeta = {
  key: string; // "YYYY-MM"
  label: string; // "Dec 2025"
};

function monthKeyFromISO(isoDate: string) {
  return isoDate.slice(0, 7); // "YYYY-MM"
}

function safeNumber(n: unknown): number | null {
  if (n === null || n === undefined) return null;
  const v = Number(n);
  return Number.isFinite(v) ? v : null;
}

function flowToLabel(flow?: string | null) {
  const f = (flow ?? "none").toLowerCase().trim();
  if (f === "spotting" || f === "light" || f === "medium" || f === "heavy")
    return f;
  return "none";
}

export default function AnalyticsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(""); // "YYYY-MM"
  const [selectedDate, setSelectedDate] = useState<string>(""); // "YYYY-MM-DD"
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadLogs() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Not logged in");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("daily_logs")
      .select("date,mood,energy,cycle_day,cycle_phase,flow,notes")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error loading logs:", error.message);
      alert("Error loading logs: " + error.message);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as LogEntry[];
    setLogs(rows);

    // Default selected month/date to latest logged day
    if (rows.length > 0) {
      const last = rows[rows.length - 1];
      setSelectedMonthKey(monthKeyFromISO(last.date));
      setSelectedDate(last.date);
      setSelectedLog(last);
      
    }

    setLoading(false);
  }

  // Build list of months available from logs
  const months: MonthMeta[] = useMemo(() => {
    const keys = new Set<string>();
    for (const l of logs) keys.add(monthKeyFromISO(l.date));

    const arr = Array.from(keys)
      .sort((a, b) => parseISO(a + "-01").getTime() - parseISO(b + "-01").getTime())
      .map((k) => ({
        key: k,
        label: format(parseISO(k + "-01"), "MMM yyyy"),
      }));

    return arr;
  }, [logs]);

  // Ensure selectedMonthKey is valid even if logs update
  useEffect(() => {
    if (!months.length) return;
    if (!selectedMonthKey) {
      setSelectedMonthKey(months[months.length - 1].key);
      return;
    }
    const exists = months.some((m) => m.key === selectedMonthKey);
    if (!exists) setSelectedMonthKey(months[months.length - 1].key);
  }, [months, selectedMonthKey]);

  // Map logs by date for quick lookup
  const logsByDate = useMemo(() => {
    const map: Record<string, LogEntry> = {};
    for (const l of logs) map[l.date] = l;
    return map;
  }, [logs]);

  // Selected month label + days in month
  const monthLabel = useMemo(() => {
    if (!selectedMonthKey) return "";
    return format(parseISO(selectedMonthKey + "-01"), "MMMM yyyy");
  }, [selectedMonthKey]);

  const daysInSelectedMonth: Date[] = useMemo(() => {
    if (!selectedMonthKey) return [];
    const first = parseISO(selectedMonthKey + "-01");
    return eachDayOfInterval({ start: startOfMonth(first), end: endOfMonth(first) });
  }, [selectedMonthKey]);

  // Daily chart data for selected month (x-axis: day of month)
  const dailyChartData = useMemo(() => {
    if (!selectedMonthKey) return [];
    return logs
      .filter((l) => monthKeyFromISO(l.date) === selectedMonthKey)
      .map((l) => ({
        date: l.date,
        day: Number(l.date.slice(8, 10)), // 1..31
        mood: safeNumber(l.mood),
        energy: safeNumber(l.energy),
        flow: flowToLabel(l.flow),
        
      }))
      .sort((a, b) => a.day - b.day);
  }, [logs, selectedMonthKey]);

  function handleDateChange(value: string) {
    setSelectedDate(value);
    setSelectedLog(logsByDate[value] ?? null);
    
    // If user picks a date in a different month, switch month automatically
    if (value && value.length >= 7) {
      const mk = value.slice(0, 7);
      if (mk !== selectedMonthKey) setSelectedMonthKey(mk);
    }
  }

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loading) {
    return (
      <div className="center-page">
        <div className="page-card">
          <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>
            Analytics
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Loading your data…
          </p>
        </div>
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="center-page">
        <div className="page-card">
          <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>
            Analytics
          </h1>
          <p className="page-subtitle">
            No logs yet. Save a few days in{" "}
            <a href="/today" className="small-link">
              Today
            </a>{" "}
            to see patterns here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-layout">
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>
            Analytics
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Daily mood &amp; energy trends by month, plus per-day inspection across years.
          </p>
        </div>
        <div className="small-link-row" style={{ alignSelf: "flex-end" }}>
          <a href="/today" className="small-link">
            Back to Today
          </a>
        </div>
      </div>

      {/* Day inspector */}
      <div
        className="analytics-card"
        style={{
          display: "flex",
          gap: "1.5rem",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <p className="analytics-small-title">Inspect a specific day</p>
          <p className="analytics-small-text">
            Choose any date. If you logged that day, you&apos;ll see mood, energy, phase, cycle
            day, and flow.
          </p>
        </div>

        <div>
          <input
            type="date"
            className="field-input"
            style={{ width: "auto", marginBottom: "0.5rem" }}
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
          />
          
          {selectedDate && selectedLog ? (
            <div className="analytics-small-text">
              <p>
                <strong>Mood:</strong> {selectedLog.mood ?? "—"} ·{" "}
                <strong>Energy:</strong> {selectedLog.energy ?? "—"}
              </p>
              <p>
                <strong>Phase:</strong> {selectedLog.cycle_phase ?? "—"} ·{" "}
                <strong>Cycle day:</strong> {selectedLog.cycle_day ?? "—"}
              </p>
              <p>
                <strong>Flow:</strong> {flowToLabel(selectedLog.flow)}
              </p>{selectedLog.notes && (
  <p>
    <strong>Notes:</strong> {selectedLog.notes}
  </p>
)}
            </div>
          ) : selectedDate ? (
            <p className="analytics-small-text">No entry logged for this date.</p>
          ) : null}
          
        </div>
      </div>

      {/* Month selector */}
      <div className="analytics-card">
        <p className="analytics-small-title" style={{ marginBottom: "0.4rem" }}>
          Browse months
        </p>
        <p className="analytics-small-text" style={{ marginBottom: "0.75rem" }}>
          Pick a month to update charts and calendar.
        </p>

        <div className="month-pill-row">
          {months.map((m) => (
            <button
              key={m.key}
              className={
                "month-pill" + (m.key === selectedMonthKey ? " month-pill--active" : "")
              }
              onClick={() => setSelectedMonthKey(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <p className="analytics-small-text" style={{ fontWeight: 600 }}>
          {monthLabel}
        </p>
      </div>

      {/* Charts + Calendar */}
      <div className="analytics-two-col">
        {/* LEFT: charts */}
        <div className="analytics-card">
          <p className="analytics-small-title">Mood across the month</p>
          <p className="analytics-small-text" style={{ marginBottom: "0.75rem" }}>
            Daily mood (1–5) for {monthLabel}.
          </p>

          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 5]} />
                <Tooltip labelFormatter={(label) => `Day ${label}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="mood"
                  name="Mood"
                  stroke="#e11d48"
                  strokeWidth={2}
                  dot
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ height: 18 }} />

          <p className="analytics-small-title">Energy across the month</p>
          <p className="analytics-small-text" style={{ marginBottom: "0.75rem" }}>
            Daily energy (1–5) for {monthLabel}.
          </p>

          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 5]} />
                <Tooltip labelFormatter={(label) => `Day ${label}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="energy"
                  name="Energy"
                  stroke="#fb923c"
                  strokeWidth={2}
                  dot
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ height: 18 }} />

          <p className="analytics-small-title">Flow notes</p>
          <p className="analytics-small-text">
            Flow is shown in the calendar on days you logged it (spotting/light/medium/heavy).
          </p>
        </div>

        {/* RIGHT: calendar */}
        <div className="analytics-card">
          <p className="analytics-small-title">Monthly calendar</p>
          <p className="analytics-small-text" style={{ marginBottom: "0.75rem" }}>
            Logged days are highlighted. Click a day in the date picker above to inspect details.
          </p>

          <div className="calendar-weekday-row">
            {weekdayLabels.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {(() => {
              if (!daysInSelectedMonth.length) return null;

              const firstDay = getDay(daysInSelectedMonth[0]); // 0-6
              const blanks = Array.from({ length: firstDay });

              return (
                <>
                  {blanks.map((_, idx) => (
                    <div key={`blank-${idx}`} />
                  ))}

                  {daysInSelectedMonth.map((day) => {
                    const iso = format(day, "yyyy-MM-dd");
                    const log = logsByDate[iso] ?? null;
                    const hasLog = !!log;
                    const flow = hasLog ? flowToLabel(log?.flow) : "none";

                    return (
                      <div
                        key={iso}
                        className={
                          "calendar-cell" + (hasLog ? " calendar-cell--logged" : "")
                        }
                        title={iso}
                        onClick={() => router.push(`/today?date=${iso}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="calendar-day">{format(day, "d")}</div>

                        {hasLog && (
                          <div className="calendar-meta">
                            M {log?.mood ?? "·"} · E {log?.energy ?? "·"}
                          </div>
                        )}

                        {hasLog && log?.cycle_phase && (
                          <div className="calendar-phase">{log.cycle_phase}</div>
                        )}

                        {hasLog && flow !== "none" && (
                          <div className="calendar-phase">flow: {flow}</div>
                        )}
                      </div>
                    );
                  })}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
