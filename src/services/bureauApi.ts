import axios, { AxiosError } from "axios";
import { CreditReport } from "../types/credit.types";

const bureauApi = axios.create({
  baseURL: import.meta.env.VITE_BUREAU_BASE_URL ?? "https://4d2ab22d-f915-495b-8055-e37c452d22cc.mock.pstmn.io",
  timeout: 12000,
  headers: {
    "Content-Type": "application/json",
  },
});

function shouldRetry(error: AxiosError): boolean {
  if (error.code === "ECONNABORTED") return true;
  if (!error.response) return true;
  return error.response.status >= 500;
}

export async function fetchCreditReport(pan: string, signal?: AbortSignal): Promise<CreditReport> {
  const sanitizedPan = pan.trim().toUpperCase();

  let attempt = 0;
  const maxAttempts = 2;

  while (attempt < maxAttempts) {
    try {
      const response = await bureauApi.get<CreditReport>(`/report/${sanitizedPan}`, { signal });
      return response.data;
    } catch (error) {
      attempt += 1;
      const axiosError = error as AxiosError;

      if (signal?.aborted) {
        throw new Error("Request cancelled.");
      }

      if (!shouldRetry(axiosError) || attempt >= maxAttempts) {
        throw new Error("Unable to fetch credit report. Please verify PAN and try again.");
      }
    }
  }

  throw new Error("Unable to fetch credit report. Please try again.");
}
