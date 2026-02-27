import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/layout/AppShell";
import ScoreGauge from "../components/dashboard/ScoreGauge";
import MetricCard from "../components/cards/MetricCard";
import ScoreHistoryChart from "../components/charts/ScoreHistoryChart";
import { fetchCreditReport } from "../services/bureauApi";
import { supabase } from "../lib/supabase";
import { getSignupPanByEmail } from "../services/signupApi";
import { CreditReport } from "../types/credit.types";
import {
  formatCurrency,
  formatDate,
  generateScoreExplanation,
  generateScoreHistory,
  getCreditAgeStatus,
  getDebtStatus,
  getInquiryStatus,
  getLatePaymentStatus,
  getScoreCategory,
  getUtilizationStatus,
} from "../utils/scoreUtils";

const formatSnapshotMonth = (value: string) => {
  const parts = value.split("-");
  if (parts.length < 2) return value;
  const year = Number(parts[0]);
  const monthIndex = Number(parts[1]) - 1;
  if (Number.isNaN(year) || Number.isNaN(monthIndex)) return value;
  return new Date(year, monthIndex, 1).toLocaleString("en-US", { month: "short", year: "numeric" });
};

function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<CreditReport | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cachedReport = sessionStorage.getItem("creditReport");
    const cachedPan = sessionStorage.getItem("creditPan");
    let hasCachedReport = false;

    if (cachedReport) {
      try {
        const parsed = JSON.parse(cachedReport) as CreditReport;
        setReport(parsed);
        hasCachedReport = true;
      } catch {
        sessionStorage.removeItem("creditReport");
      }
    }

    const client = supabase;
    if (!client) {
      return () => {
        cancelled = true;
      };
    }

    const hydrateReportFromLoggedInUser = async () => {
      const {
        data: { session },
      } = await client.auth.getSession();

      const loggedInEmail = session?.user?.email;
      if (!loggedInEmail || cancelled) return;

      if (hasCachedReport || cancelled) return;

      let linkedPan = cachedPan?.trim().toUpperCase() ?? "";

      if (!linkedPan) {
        try {
          linkedPan = (await getSignupPanByEmail(loggedInEmail)) ?? "";
        } catch {
          linkedPan = "";
        }
      }

      if (linkedPan.trim().length !== 10 || cancelled) return;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchCreditReport(linkedPan);
        if (cancelled) return;

        setReport(data);
        sessionStorage.setItem("creditReport", JSON.stringify(data));
        sessionStorage.setItem("creditPan", linkedPan);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load your credit report.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void hydrateReportFromLoggedInUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const explanations = useMemo(() => {
    if (!report) return [];
    return generateScoreExplanation(report.riskFactors);
  }, [report]);

  const historyData = useMemo(() => {
    if (!report) return [];
    if (report.monthlySnapshots && report.monthlySnapshots.length > 0) {
      return report.monthlySnapshots.map((snapshot) => ({
        month: formatSnapshotMonth(snapshot.month),
        score: snapshot.score,
      }));
    }
    return generateScoreHistory(report.score, 6);
  }, [report]);

  const riskFactors = report?.riskFactors;
  const metrics = riskFactors
    ? [
        {
          label: "Credit Utilization",
          value: `${riskFactors.creditExposure.creditUtilizationPercent}%`,
          status: getUtilizationStatus(riskFactors.creditExposure.creditUtilizationPercent),
        },
        {
          label: "Hard Inquiries (6M)",
          value: `${riskFactors.creditActivity.hardInquiriesLast6Months}`,
          status: getInquiryStatus(riskFactors.creditActivity.hardInquiriesLast6Months),
        },
        {
          label: "Late Payments (6M)",
          value: `${riskFactors.paymentBehaviour.latePaymentsLast6Months}`,
          status: getLatePaymentStatus(riskFactors.paymentBehaviour.latePaymentsLast6Months),
        },
        {
          label: "Credit Age",
          value: `${riskFactors.creditHistory.creditHistoryLengthYears}y`,
          status: getCreditAgeStatus(riskFactors.creditHistory.creditHistoryLengthYears),
        },
        {
          label: "Outstanding Debt",
          value: formatCurrency(riskFactors.creditExposure.totalOutstandingDebt),
          status: getDebtStatus(riskFactors.creditExposure.totalOutstandingDebt),
        },
      ]
    : [];

  return (
    <AppShell>
      <section className="space-y-5">
        {error && (
          <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {!report && !loading && (
          <div className="glass rounded-2xl p-10 text-center text-slate-300">
            We could not load your credit report yet. Please complete login again from the email link.
          </div>
        )}

        {loading && !report && (
          <div className="glass rounded-2xl p-10 text-center text-slate-300">Loading credit report...</div>
        )}

        {report && (
          <div className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-[1.45fr_0.8fr]">
              <ScoreGauge score={report.score} min={report.scoreRange.min} max={report.scoreRange.max} />

              <aside className="glass rounded-2xl p-4 shadow-glass">
                <h3 className="mb-3 text-xl font-bold text-white">Quick Summary</h3>

                <div className="space-y-3">
                  <div className="rounded-xl border border-stroke bg-panel/60 p-3">
                    <p className="text-xs text-slate-400">Score Category</p>
                    <p className="text-2xl font-bold text-white">{getScoreCategory(report.score)}</p>
                  </div>

                  <div className="rounded-xl border border-stroke bg-panel/60 p-3">
                    <p className="text-xs text-slate-400">Risk Band</p>
                    <p className="text-2xl font-bold text-white">{report.riskBand}</p>
                  </div>

                  <div className="rounded-xl border border-stroke bg-panel/60 p-3">
                    <p className="text-xs text-slate-400">Last Updated</p>
                    <p className="text-sm font-semibold text-slate-200">{formatDate(report.reportGeneratedAt)}</p>
                  </div>
                </div>
              </aside>
            </div>

            {metrics.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {metrics.map((metric) => (
                  <MetricCard key={metric.label} label={metric.label} value={metric.value} status={metric.status} />
                ))}
              </div>
            )}

            <div className="glass rounded-2xl p-5 shadow-glass">
              <h3 className="mb-4 text-xl font-bold text-white">Score Explanation</h3>
              <ul className="space-y-3">
                {explanations.map((item) => (
                  <li key={item} className="rounded-xl border border-stroke bg-panel/50 p-3 text-sm text-slate-200">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <ScoreHistoryChart data={historyData} />
          </div>
        )}
      </section>
    </AppShell>
  );
}

export default Dashboard;
