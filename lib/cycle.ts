export type FlowLevel = "none" | "spotting" | "light" | "medium" | "heavy";

export type PhaseResult = {
  cycleDay: number | null;
  phase: "Menstrual" | "Follicular" | "Ovulatory" | "Luteal" | "Unknown";
  phaseSource: "logged" | "estimated" | "unknown";
};

function normalizeFlow(flow?: string | null): FlowLevel {
  const f = (flow ?? "none").toLowerCase().trim();
  if (f === "spotting" || f === "light" || f === "medium" || f === "heavy") return f;
  return "none";
}

function daysBetweenUTC(dateISO: string, startISO: string) {
  // Avoid timezone weirdness by forcing UTC midnight
  const a = new Date(dateISO + "T00:00:00Z").getTime();
  const b = new Date(startISO + "T00:00:00Z").getTime();
  return Math.floor((a - b) / (1000 * 60 * 60 * 24));
}

function estimatePhaseFromCycleDay(cycleDay: number) {

  if (cycleDay <= 12) return "Follicular" as const;
  if (cycleDay <= 16) return "Ovulatory" as const;
  return "Luteal" as const;
}

export function computePhase({
  dateISO,
  lastPeriodStartISO,
  avgCycleLength,
  flow,
}: {
  dateISO: string;                 // "YYYY-MM-DD"
  lastPeriodStartISO: string | null;
  avgCycleLength: number | null;
  flow?: string | null;            // from daily_logs.flow
}): PhaseResult {
  const f = normalizeFlow(flow);

  // Rule 1: Logged flow overrides all inference.
  if (f !== "none") {
    return {
      cycleDay: null,               
      phase: "Menstrual",
      phaseSource: "logged",
    };
  }

  // No flow logged → only estimate if settings exist
  if (!lastPeriodStartISO || !avgCycleLength || avgCycleLength <= 0) {
    return { cycleDay: null, phase: "Unknown", phaseSource: "unknown" };
  }

  const diff = daysBetweenUTC(dateISO, lastPeriodStartISO);
  if (diff < 0) return { cycleDay: null, phase: "Unknown", phaseSource: "unknown" };

  const cycleDay = (diff % avgCycleLength) + 1;
  const phase = estimatePhaseFromCycleDay(cycleDay);

  return { cycleDay, phase, phaseSource: "estimated" };
}
