import { differenceInDays, parseISO } from "date-fns";

export function getCycleInfo(lastPeriod: string, avgLength: number) {
  const today = new Date();
  const last = parseISO(lastPeriod); // last period start
  const days = differenceInDays(today, last);

  // keep it always positive & within cycle length
  const cycleDay = ((days % avgLength) + avgLength) % avgLength + 1;

  let phase = "Unknown";

  if (cycleDay >= 1 && cycleDay <= 5) phase = "Menstrual";
  else if (cycleDay <= 13) phase = "Follicular";
  else if (cycleDay <= 16) phase = "Ovulatory";
  else phase = "Luteal";

  return { cycleDay, phase };
}
