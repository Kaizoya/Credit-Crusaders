import { useState } from "react";
import AppShell from "../components/layout/AppShell";
import { parseCreditReportDocument } from "../services/ocrApi";

function CreditReport() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedJson, setParsedJson] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setError(null);
    setParsedJson(null);

    try {
      const data = await parseCreditReportDocument(file);
      setParsedJson(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to parse the document.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <section className="min-w-0 space-y-5">
        <header className="glass rounded-2xl p-5">
          <h1 className="text-2xl font-bold text-white">Credit Report</h1>
          <p className="text-sm text-slate-400">Upload your report document and parse it into JSON.</p>
        </header>

        <div className="glass rounded-2xl p-5 shadow-glass">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <label className="flex flex-1 flex-col gap-2 text-sm text-slate-300">
              Browse Document
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(event) => {
                  const selected = event.target.files?.[0] ?? null;
                  setFile(selected);
                  setError(null);
                }}
                className="rounded-xl border border-stroke bg-panel/70 px-4 py-2 text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-blueGlow file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
            </label>

            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || loading}
              className="h-11 rounded-xl bg-blueGlow px-5 text-sm font-semibold text-white shadow-lg shadow-blueGlow/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Upload & Parse"}
            </button>
          </div>

          {file && <p className="mt-3 text-sm text-slate-400">Selected: {file.name}</p>}

          {error && (
            <div className="mt-4 rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}
        </div>

        {parsedJson && (
          <div className="glass min-w-0 rounded-2xl p-5 shadow-glass">
            <h2 className="mb-3 text-lg font-semibold text-white">Parsed JSON</h2>
            <pre className="max-w-full overflow-x-auto rounded-xl border border-stroke bg-panel/60 p-4 text-xs text-slate-200">
              {parsedJson}
            </pre>
          </div>
        )}
      </section>
    </AppShell>
  );
}

export default CreditReport;
