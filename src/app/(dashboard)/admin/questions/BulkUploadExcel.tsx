"use client";

import React, { useRef, useState, DragEvent } from "react";
import * as XLSX from "xlsx";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  ArrowLeft, 
  X, 
  FileText,
  AlertTriangle,
  Loader2
} from "lucide-react";

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
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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

  const processFile = async (f: File) => {
    setMessage(null);
    setRowsCount(0);
    setValidCount(0);
    setInvalidCount(0);
    setFileName(f.name);

    try {
      const { rows, errors } = await parseFileToRows(f);
      setRowsCount(rows.length + errors.length);
      setValidCount(rows.length);
      setInvalidCount(errors.length);

      if (errors.length) {
        setMessage({ 
          type: 'warning', 
          text: `Parsing completed with issues. ${rows.length} valid rows found. First error: ${errors[0]}` 
        });
      } else {
        setMessage({ 
          type: 'success', 
          text: `Successfully parsed ${rows.length} rows!` 
        });
      }

      // store temporarily for import
      (window as any).__bulkParsedRows = rows;
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: "Failed to parse file: " + (err?.message ?? String(err)) });
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const importParsed = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const rows: RowPayload[] = (window as any).__bulkParsedRows ?? [];
      if (!rows || rows.length === 0) {
        setMessage({ type: 'error', text: "No parsed rows available. Please select an Excel/CSV file first." });
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
        setMessage({ type: 'error', text: `Server error: ${body?.error ?? res.statusText}` });
      } else {
        const inserted = body.insertedCount ?? body.insertedIds?.length ?? rows.length;
        const errors = body.errors ?? [];
        setMessage({ 
          type: 'success', 
          text: `Import successful! Inserted: ${inserted}. ${errors.length ? `(${errors.length} skipped)` : ""}` 
        });
        
        (window as any).__bulkParsedRows = [];
        setRowsCount(0);
        setValidCount(0);
        setInvalidCount(0);
        setFileName(null);
        if (fileRef.current) fileRef.current.value = "";
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: "Network error: " + (err?.message ?? String(err)) });
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
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="max-w-6xl mx-auto p-8 min-h-screen">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <button 
            onClick={onBack} 
            className="flex items-center text-slate-500 hover:text-blue-600 transition-colors group mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Question Bank</span>
          </button>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bulk Question Upload</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Import multiple questions at once using our Excel/CSV template. Perfect for migrating large question sets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Template */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800 mb-1">Step 1: Get the Template</h3>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                  Download our formatted template file. Fill it with your questions, ensuring you follow the required column structure.
                  <br />
                  <span className="text-slate-400 text-xs mt-1 block">
                    Columns: category, question, option1-4, correctIndex (1-4)
                  </span>
                </p>
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" /> Download CSV Template
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Upload */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <UploadCloud className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Step 2: Upload Your File</h3>
                <p className="text-slate-600 text-sm">Drag and drop your filled Excel or CSV file here.</p>
              </div>
            </div>

            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center w-full h-64 rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group ${
                isDragOver 
                  ? "border-blue-500 bg-blue-50/50" 
                  : fileName 
                    ? "border-emerald-300 bg-emerald-50/30" 
                    : "border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-400"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={onFileChange}
                className="hidden"
              />
              
              {fileName ? (
                <div className="text-center animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-medium text-slate-900 mb-1">{fileName}</h4>
                  <p className="text-sm text-slate-500">File ready for processing</p>
                  <button 
                    onClick={(e) => { e.preventDefault(); handleClear(); }}
                    className="mt-4 text-xs font-medium text-red-500 hover:text-red-700 hover:underline"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div className="text-center p-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDragOver ? 'bg-blue-100 text-blue-600' : 'bg-white shadow-sm text-slate-400 group-hover:text-blue-500'}`}>
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-medium text-slate-700 mb-1">
                    {isDragOver ? "Drop file now!" : "Click or Drag File Here"}
                  </p>
                  <p className="text-sm text-slate-400">Supports .xlsx, .xls, .csv</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Right Column: Status & Action */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Processing Status
            </h3>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Total Rows</span>
                <span className="text-xl font-bold text-slate-800">{rowsCount}</span>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-700">Valid</span>
                <span className="text-xl font-bold text-emerald-700">{validCount}</span>
              </div>
              <div className="bg-rose-50 rounded-xl p-4 border border-rose-100 flex items-center justify-between">
                <span className="text-sm font-medium text-rose-700">Invalid</span>
                <span className="text-xl font-bold text-rose-700">{invalidCount}</span>
              </div>
            </div>

            {/* Message Area */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl text-sm flex gap-3 ${
                message.type === 'error' ? 'bg-red-50 text-red-800 border-red-100' :
                message.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-100' :
                'bg-emerald-50 text-emerald-800 border-emerald-100'
              } animate-in fade-in slide-in-from-bottom-2`}>
                {message.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
                {message.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0" />}
                {message.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0" />}
                <div>{message.text}</div>
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-slate-100 space-y-3">
              <button
                onClick={importParsed}
                disabled={loading || validCount === 0}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 ${
                  loading || validCount === 0 
                  ? "bg-slate-300 cursor-not-allowed shadow-none" 
                  : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 hover:-translate-y-0.5"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5" />
                    Import {validCount > 0 ? `${validCount} Questions` : "Questions"}
                  </>
                )}
              </button>

              {rowsCount > 0 && (
                <button
                  onClick={handleClear}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Clear & Start Over
                </button>
              )}
            </div>
            
            <p className="text-center text-xs text-slate-400 mt-4">
              Note: Invalid rows will be skipped automatically during import.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
