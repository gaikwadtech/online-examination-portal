"use client";

import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";

type RowPayload = {
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
};

export default function BulkUploadExcel({ onBack }: { onBack: () => void }) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [rowsCount, setRowsCount] = useState<number>(0);
  const [validCount, setValidCount] = useState<number>(0);
  const [invalidCount, setInvalidCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Helper to choose message color by contents
  const messageColorClass = (msg: string | null) => {
    if (!msg) return "bg-gray-50 text-gray-800";
    const lower = msg.toLowerCase();
    if (lower.includes("error") || lower.includes("failed") || lower.includes("invalid")) return "bg-rose-50 text-rose-800";
    if (lower.includes("inserted") || lower.includes("import finished") || lower.includes("valid rows")) return "bg-emerald-50 text-emerald-800";
    return "bg-yellow-50 text-yellow-800";
  };

  const downloadTemplate = () => {
    const csv = `category,question,option1,option2,option3,option4,correctIndex
Mathematics,What is 2 + 2?,1,2,3,4,4
Science,What is water formula?,CO2,H2O,O2,N2,2
`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "questions-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseFileToRows = async (file: File): Promise<{ rows: RowPayload[]; errors: string[] }> => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const raw: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    const rows: RowPayload[] = [];
    const errors: string[] = [];

    raw.forEach((r, idx) => {
      const category = String(r["category"] ?? r["Category"] ?? "").trim();
      const question = String(r["question"] ?? r["Question"] ?? r["text"] ?? "").trim();

      const options: string[] = [];
      for (let i = 1; i <= 20; i++) {
        const v =
          r[`option${i}`] ??
          r[`Option ${i}`] ??
          r[`Option${i}`] ??
          r[`opt${i}`] ??
          "";
        if (v !== undefined && String(v).trim() !== "") options.push(String(v).trim());
      }

      let correctRaw = r["correctIndex"] ?? r["correctindex"] ?? r["correct"] ?? r["CorrectIndex"] ?? "";
      let correctIndex: number | null = null;
      if (correctRaw !== "" && correctRaw !== undefined) {
        const n = Number(correctRaw);
        if (!Number.isNaN(n)) correctIndex = n;
      }

      const localErrors: string[] = [];
      if (!category) localErrors.push("category missing");
      if (!question) localErrors.push("question missing");
      if (options.length < 2) localErrors.push("need at least 2 options");

      if (correctIndex === null) {
        localErrors.push("correctIndex missing");
      } else {
        // treat spreadsheet correctIndex as 1-based
        if (correctIndex > 0 && correctIndex <= options.length) {
          correctIndex = correctIndex - 1;
        }
        if (!(Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < options.length)) {
          localErrors.push("correctIndex out of range");
        }
      }

      if (localErrors.length) {
        errors.push(`Row ${idx + 2}: ${localErrors.join("; ")}`);
      } else {
        rows.push({
          category,
          question,
          options,
          correctIndex: correctIndex as number,
        });
      }
    });

    return { rows, errors };
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    setRowsCount(0);
    setValidCount(0);
    setInvalidCount(0);
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);

    try {
      const { rows, errors } = await parseFileToRows(f);
      setRowsCount(rows.length + errors.length);
      setValidCount(rows.length);
      setInvalidCount(errors.length);

      if (errors.length) {
        setMessage(`Parsing completed — ${rows.length} valid, ${errors.length} invalid. First error: ${errors[0]}`);
      } else {
        setMessage(`Parsing completed — ${rows.length} valid rows`);
      }

      // store temporarily for import
      (window as any).__bulkParsedRows = rows;
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to parse file: " + (err?.message ?? String(err)));
    }
  };

  const importParsed = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const rows: RowPayload[] = (window as any).__bulkParsedRows ?? [];
      if (!rows || rows.length === 0) {
        setMessage("No parsed rows available. Please select an Excel/CSV file first.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/questions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: rows }),
      });

      const body = await res.json().catch(() => ({ error: "Invalid JSON response" }));

      if (!res.ok) {
        setMessage(`Server error: ${body?.error ?? res.statusText}`);
      } else {
        const inserted = body.insertedCount ?? body.insertedIds?.length ?? rows.length;
        const errors = body.errors ?? [];
        setMessage(`Import finished. Inserted: ${inserted}. ${errors.length ? `Errors: ${errors.length}` : ""}`);
        (window as any).__bulkParsedRows = [];
        setRowsCount(0);
        setValidCount(0);
        setInvalidCount(0);
        setFileName(null);

        // also clear file input so selecting same file again will trigger onChange
        if (fileRef.current) fileRef.current.value = "";
      }
    } catch (err: any) {
      setMessage("Network error: " + (err?.message ?? String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    (window as any).__bulkParsedRows = [];
    setFileName(null);
    setRowsCount(0);
    setValidCount(0);
    setInvalidCount(0);
    setMessage(null);

    // RESET the file input value to allow selecting same file again
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-2xl font-semibold text-slate-900">Bulk Upload (Excel / CSV)</h3>
          <p className="text-sm text-slate-600 mt-1">Upload multiple questions at once. Use the template to format your file.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded shadow"
            aria-label="Back to Questions"
          >
            Back
          </button>
        </div>
      </div>

      <div className="rounded-md border border-slate-100 p-4 mb-4 bg-slate-50">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow-sm"
          >
            Download Template (CSV)
          </button>

          {/* nicer file input */}
          <label className="inline-flex items-center gap-2 bg-white border rounded px-3 py-2 cursor-pointer hover:shadow">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={onFileChange}
              className="hidden"
            />
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 0 0 2 2h14M16 3v4M8 3v4m8 4H8"/></svg>
            <span className="text-sm text-slate-700">Choose file</span>
          </label>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-sm text-slate-700">
              {fileName ? (
                <>
                  <div className="font-medium text-slate-900">{fileName}</div>
                  <div className="text-xs text-slate-500">{rowsCount} rows — <span className="font-semibold text-emerald-700">{validCount} valid</span>, <span className="font-semibold text-rose-700">{invalidCount} invalid</span></div>
                </>
              ) : <span className="text-sm text-slate-500">No file selected</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={importParsed}
          disabled={loading || validCount === 0}
          className={`px-4 py-2 rounded text-white shadow ${loading || validCount === 0 ? "bg-slate-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
        >
          {loading ? "Importing..." : `Import ${validCount} row(s)`}
        </button>

        <button
          onClick={handleClear}
          className="px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-800"
        >
          Clear
        </button>

        <div className="ml-auto text-sm text-slate-600">
          Tip: <span className="font-mono">correctIndex</span> in the spreadsheet is <strong>1-based</strong> (1 = first option).
        </div>
      </div>

      {message && (
        <div className={`mt-3 p-3 rounded ${messageColorClass(message)}`}>
          <div className="text-sm">{message}</div>
        </div>
      )}

      {/* optional quick status badges */}
      <div className="mt-4 flex gap-2 items-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded text-sm">
          <strong>{validCount}</strong>
          <span>valid</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-800 px-3 py-1 rounded text-sm">
          <strong>{invalidCount}</strong>
          <span>invalid</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-700 px-3 py-1 rounded text-sm">
          <strong>{rowsCount}</strong>
          <span>total</span>
        </div>
      </div>
    </div>
  );
}
