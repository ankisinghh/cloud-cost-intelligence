import { useState } from "react";
import { api } from "../services/apiClient";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";

export interface Recommendation {
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  recommendation: string;
}

export function UploadForm({
  onUploaded,
  onInsights,
  onSummary,
}: {
  onUploaded: () => void;
  onInsights?: (insights: Recommendation[]) => void;
  onSummary?: (summary: unknown) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setErr(null);
    setSuccess(false);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const response = await api.post("/api/datasets/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Extract and pass insights from response
      const uploadedInsights = response.data?.insights || [];
      if (onInsights && uploadedInsights.length > 0) {
        onInsights(uploadedInsights);
      }
      if (onSummary && response.data?.summary) {
        onSummary(response.data.summary);
      }

      setFile(null);
      (e.target as HTMLFormElement).reset();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onUploaded();
    } catch (e: any) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Upload billing CSV or JSON
        </label>
        <div className="relative">
          <input
            type="file"
            accept=".csv,.json,text/csv,application/json"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <div className="text-center">
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">
                {file ? file.name : "Click to select a file"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Max 10 MB • CSV or JSON
              </p>
            </div>
          </label>
        </div>
      </div>

      {err && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-4 w-4" />
          {err}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <CheckCircle className="h-4 w-4" />
          File imported successfully!
        </div>
      )}

      <button
        type="submit"
        disabled={!file || busy}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {busy ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Importing…
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            Import billing file
          </>
        )}
      </button>
    </form>
  );
}
