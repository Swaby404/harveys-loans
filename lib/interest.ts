export const RATE_SCHEDULE: Record<number, number> = {
  1: 0.08,
  2: 0.15,
  3: 0.25,
  4: 0.30,
};

export function getRateForWeek(missedWeek: number): number {
  return RATE_SCHEDULE[Math.min(missedWeek, 4)] ?? 0.30;
}

export function calculateCompoundBalance(
  originalBalance: number,
  missedWeeks: number
): { newBalance: number; appliedRate: number; interestCharged: number } {
  if (missedWeeks === 0) {
    return { newBalance: originalBalance, appliedRate: 0, interestCharged: 0 };
  }
  const appliedRate = getRateForWeek(missedWeeks);
  const interestCharged = originalBalance * appliedRate;
  const newBalance = originalBalance + interestCharged;
  return { newBalance, appliedRate, interestCharged };
}

export function applyWeeklyInterest(
  currentBalance: number,
  missedWeeks: number
): { newBalance: number; appliedRate: number; interestCharged: number } {
  const appliedRate = getRateForWeek(missedWeeks);
  const interestCharged = parseFloat((currentBalance * appliedRate).toFixed(2));
  const newBalance = parseFloat((currentBalance + interestCharged).toFixed(2));
  return { newBalance, appliedRate, interestCharged };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export const INTEREST_SCHEDULE_DISPLAY = [
  { week: 1, rate: "8%", label: "1st Week Missed", color: "text-yellow-600" },
  { week: 2, rate: "15%", label: "2nd Week Missed", color: "text-orange-500" },
  { week: 3, rate: "25%", label: "3rd Week Missed", color: "text-red-500" },
  { week: 4, rate: "30%", label: "4th Week Missed", color: "text-red-700" },
];

export const PROCESSING_FEE = 20;
export const MIN_LOAN = 50;
export const MAX_LOAN = 5000;
