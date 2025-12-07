"use client";

import { useEffect, useState } from "react";
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

type LogEntry = {
  date: string;
  mood: number | null;
  energy: number | null;
  cycle_day: number | null;
  cycle_phase: string | null;
};

export default function AnalyticsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Not logged in");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error loading logs:", error.message);
      setLoading(false);
      return;
    }

    setLogs(data || []);
    setLoading(false);
  }

  if (loading) {
    return <div className="p-8">Loading analytics...</div>;
  }

  if (!logs.length) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold mb-2">Analytics</h1>
        <p>No logs yet. Go to <a href="/today" className="text-blue-600 underline">Today</a> and save a few days first.</p>
      </div>
    );
  }

  // Prepare data keyed by cycle day for charts
  const dataForChart = logs.map((log) => ({
    cycleDay: log.cycle_day ?? 0,
    mood: log.mood ?? 0,
    energy: log.energy ?? 0,
    date: log.date,
    phase: log.cycle_phase ?? "",
  }));

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Analytics</h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Mood vs Cycle Day</h2>
        <div className="w-full h-64 border rounded">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataForChart}>
              <CartesianGrid />
              <XAxis dataKey="cycleDay" label={{ value: "Cycle Day", position: "insideBottomRight", offset: -5 }} />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="mood" name="Mood" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Energy vs Cycle Day</h2>
        <div className="w-full h-64 border rounded">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataForChart}>
              <CartesianGrid />
              <XAxis dataKey="cycleDay" label={{ value: "Cycle Day", position: "insideBottomRight", offset: -5 }} />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="energy" name="Energy" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
