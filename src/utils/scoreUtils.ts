import { HistoryPoint, RiskFactors, ScoreCategory, StatusLevel } from "../types/credit.types";

export function getScoreCategory(score: number): ScoreCategory {
  if (score <= 579) return "Poor";
  if (score <= 669) return "Fair";
  if (score <= 739) return "Good";
  if (score <= 799) return "Very Good";
  return "Excellent";
}

export function getScoreColor(score: number): string {
  if (score <= 579) return "#ff4d4f";
  if (score <= 669) return "#ff9f43";
  if (score <= 739) return "#f5d442";
  if (score <= 799) return "#7ed957";
  return "#22c55e";
}

export function getUtilizationStatus(percent: number): StatusLevel {
  if (percent <= 30) return "Good";
  if (percent <= 50) return "Moderate";
  return "Risky";
}

export function getInquiryStatus(count: number): StatusLevel {
  if (count <= 1) return "Good";
  if (count <= 2) return "Moderate";
  return "Risky";
}

export function getLatePaymentStatus(count: number): StatusLevel {
  if (count === 0) return "Good";
  if (count <= 2) return "Moderate";
  return "Risky";
}

export function getCreditAgeStatus(years: number): StatusLevel {
  if (years >= 5) return "Good";
  if (years >= 3) return "Moderate";
  return "Risky";
}

export function getDebtStatus(debt: number): StatusLevel {
  if (debt <= 150000) return "Good";
  if (debt <= 350000) return "Moderate";
  return "Risky";
}

export function generateScoreExplanation(riskFactors: RiskFactors): string[] {
  const notes: string[] = [];
  const utilization = riskFactors.creditExposure.creditUtilizationPercent;
  const latePayments = riskFactors.paymentBehaviour.latePaymentsLast6Months;
  const inquiries = riskFactors.creditActivity.hardInquiriesLast6Months;
  const historyYears = riskFactors.creditHistory.creditHistoryLengthYears;

  if (utilization > 30) {
    notes.push("Your credit utilization is above the ideal 30% threshold, which may be limiting your score.");
  }

  if (latePayments > 0) {
    notes.push("Recent late payments are negatively impacting your credit profile.");
  }

  if (inquiries > 2) {
    notes.push("Multiple hard inquiries may signal increased credit dependency.");
  }

  if (historyYears < 3) {
    notes.push("A longer credit history can improve score stability over time.");
  }

  if (notes.length === 0) {
    notes.push("Your profile shows strong repayment behaviour and low credit risk.");
  }

  return notes;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function generateScoreHistory(currentScore: number, points = 6): HistoryPoint[] {
  const now = new Date();
  const baseline = Math.max(300, currentScore - (points - 1) * 8);

  return Array.from({ length: points }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (points - 1 - index), 1);
    const growth = index * 8;
    const variance = (index % 2 === 0 ? 1 : -1) * 3;
    const score = Math.min(900, Math.max(300, baseline + growth + variance));

    return {
      month: month.toLocaleString("en-US", { month: "short", year: "numeric" }),
      score,
    };
  });
}

export function getStatusStyle(status: StatusLevel): string {
  if (status === "Good") return "bg-emerald-500/20 text-emerald-300 border-emerald-400/40";
  if (status === "Moderate") return "bg-amber-500/20 text-amber-300 border-amber-400/40";
  return "bg-rose-500/20 text-rose-300 border-rose-400/40";
}
