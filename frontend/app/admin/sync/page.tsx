"use client";

import { useState, useEffect } from "react";
import { 
  Database, RefreshCcw, CheckCircle2, AlertCircle, 
  ChevronLeft, FileSpreadsheet, Loader2, FileDown, 
  UserCheck 
} from "lucide-react";
import Link from "next/link";

export default function AdminSyncPage() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{count: number, class_code: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

  const fetchAllStudents = async () => {
    setFetching(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/students`);
      if (res.ok) {
        const data = await res.json();
        setAllStudents(data);
      }
    } catch (e) {
      console.error("Failed to fetch students", e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAllStudents();
  }, []);

  const handleSync = async () => {
    if (!file) {
      setError("Vui lòng chọn một file Excel trước.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/admin/sync-students`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        fetchAllStudents();
      } else {
        const errData = await res.json().catch(() => ({ detail: "Đồng bộ thất bại" }));
        setError(errData.detail || "Đồng bộ thất bại.");
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ hoặc lỗi CORS.");
    } finally {
      setLoading(false);
    }
  };

  const groupedStudents: Record<string, any[]> = allStudents.reduce((acc: Record<string, any[]>, student: any) => {
    const code = student.class_code || "CHƯA PHÂN LỚP";
    if (!acc[code]) acc[code] = [];
    acc[code].push(student);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen bg-slate-50">
      <header className="flex items-center gap-4 mb-10">
        <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hệ Thống Quản Trị</h1>
          <p className="text-slate-500 font-medium">Cập nhật danh sách sinh viên từ file Excel</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Left: Upload */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="flex items-center gap-4 mb-6 text-indigo-600">
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Nạp dữ liệu</h2>
          </div>

          <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-3xl cursor-pointer transition-all mb-6 ${
            file ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400'
          }`}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              <RefreshCcw className={`w-10 h-10 mb-3 ${file ? 'text-indigo-500 animate-spin-slow' : 'text-slate-300'}`} />
              {file ? (
                <p className="text-sm font-bold text-indigo-600 truncate max-w-full">{file.name}</p>
              ) : (
                <p className="text-sm text-slate-500 font-bold">Bấm để chọn file Excel</p>
              )}
            </div>
            <input type="file" className="hidden" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>

          <button
            onClick={handleSync}
            disabled={loading || !file}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white py-4 rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "ĐỒNG BỘ NGAY"}
          </button>
        </div>

        {/* Right: History */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">
              <Database className="w-6 h-6 text-slate-400" />
              Kho dữ liệu
            </h2>
            <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full">
              {allStudents.length} SV
            </span>
          </div>

          {fetching ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
          ) : Object.keys(groupedStudents).length === 0 ? (
            <div className="text-center py-20 opacity-20 font-bold text-slate-400">Chưa có dữ liệu</div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.entries(groupedStudents).map(([code, students]) => (
                <div key={code} className="border border-slate-100 rounded-2xl overflow-hidden text-sm">
                  <div className="bg-slate-50 px-4 py-2 flex justify-between font-bold text-slate-600">
                    <span>{code}</span>
                    <span>{students.length}</span>
                  </div>
                  <div className="p-3 space-y-1">
                    {students.slice(0, 3).map((s: any) => (
                      <div key={s.mssv} className="flex justify-between text-xs opacity-70">
                        <span>{s.mssv}</span>
                        <span className="font-medium">{s.name}</span>
                      </div>
                    ))}
                    {students.length > 3 && <p className="text-[9px] text-center opacity-30">... và {students.length - 3} em khác</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-4 text-red-600 animate-in slide-in-from-bottom duration-300">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-100 p-6 rounded-3xl flex items-center gap-4 text-green-600 mt-4 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
          <p className="font-bold text-sm">Đã nạp {result.count} sinh viên vào lớp {result.class_code}</p>
        </div>
      )}
    </div>
  );
}
