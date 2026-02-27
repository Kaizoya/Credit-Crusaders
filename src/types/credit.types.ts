export type ScoreCategory = "Poor" | "Fair" | "Good" | "Very Good" | "Excellent";

export type StatusLevel = "Good" | "Moderate" | "Risky";

export interface ScoreRange {
  min: number;
  max: number;
}

export interface PaymentBehaviour {
  latePaymentsLast3Months: number;
  latePaymentsLast6Months: number;
  maxDaysPastDue: number;
}

export interface CreditExposure {
  creditUtilizationPercent: number;
  totalOutstandingDebt: number;
}

export interface CreditActivity {
  hardInquiriesLast6Months: number;
}

export interface CreditHistory {
  creditHistoryLengthYears: number;
}

export interface ScoreBreakdown {
  paymentBehaviourScore: number;
  creditUtilizationScore: number;
  creditHistoryScore: number;
  hardInquiryScore: number;
  creditMixScore: number;
  weightedCompositePercent: number;
}

export interface MonthlySnapshot {
  month: string;
  score: number;
  weightedCompositePercent: number;
  creditUtilizationPercent: number;
}

export interface RiskFactors {
  paymentBehaviour: PaymentBehaviour;
  creditExposure: CreditExposure;
  creditActivity: CreditActivity;
  creditHistory: CreditHistory;
}

export interface CreditReport {
  requestId: string;
  pan: string;
  bureau: string;
  score: number;
  riskBand: string;
  scoreRange: ScoreRange;
  scoreBreakdown?: ScoreBreakdown;
  riskFactors: RiskFactors;
  monthlySnapshots?: MonthlySnapshot[];
  reportGeneratedAt: string;
}

export interface HistoryPoint {
  month: string;
  score: number;
}
