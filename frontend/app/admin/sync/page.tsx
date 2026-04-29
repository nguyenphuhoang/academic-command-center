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

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://academic-command-center.onrender.com").replace(/\/$/, "");

  const fetchAllStudents = async () => {
    setAllStudents([]); // Reset state to empty to avoid stale data
    setFetching(true);
    try {
      // Su dung version ngau nhien cuc manh de pha vo moi loai cache
      const v = Math.random().toString(36).substring(7);
      const res = await fetch(`${API_URL}/api/admin/students?v=${v}&t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
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
        // Doi 1.5 giay de Database kịp cập nhật hoàn toàn
        setTimeout(() => {
          fetchAllStudents();
        }, 1500);
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
    // API trả về mssv, name, ma_lop (phẳng)
    const code = student.ma_lop || "SINH VIÊN TỰ DO";
    if (!acc[code]) acc[code] = [];
    acc[code].push(student);
    return acc;
  }, {});

  const [studentSearch, setStudentSearch] = useState("");

  const filteredGroupedStudents = Object.entries(groupedStudents).reduce((acc: any, [code, students]) => {
    const filtered = students.filter(s => 
      s.mssv.toLowerCase().includes(studentSearch.toLowerCase()) || 
      (s.name && s.name.toLowerCase().includes(studentSearch.toLowerCase()))
    );
    if (filtered.length > 0) acc[code] = filtered;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen bg-slate-50">
      <header className="flex items-center gap-4 mb-10">
        <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hệ Thống Quản Trị v2.0</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Left: Upload */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 h-fit">
          <div className="mb-8">
            <label className={`flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all ${
              file ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
            }`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <RefreshCcw className={`w-12 h-12 mb-4 ${file ? 'text-indigo-500 animate-spin-slow' : 'text-slate-300'}`} />
                {file ? (
                  <p className="text-sm font-bold text-indigo-600 truncate max-w-full">{file.name}</p>
                ) : (
                  <>
                    <p className="text-sm text-slate-500 font-bold mb-1">Chọn file Excel sinh viên</p>
                    <p className="text-xs text-slate-400">(.xlsx hoặc .xls)</p>
                  </>
                )}
              </div>
              <input type="file" className="hidden" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>

            <button
              onClick={handleSync}
              disabled={loading || !file}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white py-5 rounded-3xl font-black shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 mt-8"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "ĐỒNG BỘ NGAY"}
            </button>
          </div>
        </div>

        {/* Right: History */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 min-h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">
              <Database className="w-6 h-6 text-slate-400" />
              Kho dữ liệu
            </h2>
          </div>

          <div className="mb-6">
            <input 
              type="text"
              placeholder="Tìm MSSV hoặc Tên..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-300 transition-all"
            />
          </div>

          {fetching ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
          ) : Object.keys(filteredGroupedStudents).length === 0 ? (
            <div className="text-center py-20 opacity-20 font-bold text-slate-400">Chưa có dữ liệu</div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.entries(filteredGroupedStudents).map(([code, students]: [string, any]) => (
                <div key={code} className="border border-slate-100 rounded-2xl overflow-hidden text-sm">
                  <div className="bg-slate-50 px-4 py-2 flex justify-between font-bold text-slate-600">
                    <span>{code}</span>
                    <span>{students.length}</span>
                  </div>
                  <div className="p-3 space-y-1">
                    {students.slice(0, 10).map((s: any) => (
                      <div key={s.mssv} className="flex justify-between text-xs opacity-70">
                        <span>{s.mssv}</span>
                        <span className="font-medium">{s.name}</span>
                      </div>
                    ))}
                    {students.length > 10 && <p className="text-[9px] text-center opacity-30">... và {students.length - 10} em khác</p>}
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
