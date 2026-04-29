"use client";

import { useState } from "react";
import { Database, RefreshCcw, CheckCircle2, AlertCircle, ChevronLeft, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

export default function AdminSyncPage() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{count: number, class_code: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

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

      const targetUrl = `${API_URL}/api/admin/sync-students`;
      const res = await fetch(targetUrl, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const errText = await res.text();
        let detail = "Đồng bộ thất bại.";
        try {
          const errData = JSON.parse(errText);
          detail = errData.detail || detail;
        } catch(e) {}
        setError(`${detail} (URL: ${targetUrl})`);
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ hoặc lỗi CORS.");
    } finally {
      setLoading(false);
      fetchAllStudents();
    }
  };

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

  useState(() => {
    fetchAllStudents();
  });

  // Group students by class_code
  const groupedStudents = allStudents.reduce((acc, student) => {
    const code = student.class_code || "CHƯA PHÂN LỚP";
    if (!acc[code]) acc[code] = [];
    acc[code].push(student);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen bg-slate-50">
      <header className="flex items-center gap-4 mb-10">
        <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hệ Thống Quản Trị</h1>
          <p className="text-slate-500 font-medium">Cập nhật danh sách sinh viên từ file Excel phòng đào tạo</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="flex items-center gap-4 mb-6 text-indigo-600">
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Dữ liệu nguồn</h2>
          </div>

          <div className="mb-6">
            <label 
              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
                file ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <RefreshCcw className={`w-10 h-10 mb-3 ${file ? 'text-indigo-500 animate-spin-slow' : 'text-slate-300'}`} />
                {file ? (
                  <p className="text-sm font-bold text-indigo-600 text-center px-4 truncate max-w-full">
                    {file.name}
                  </p>
                ) : (
                  <>
                    <p className="mb-2 text-sm text-slate-500 font-bold">Bấm để chọn file Excel</p>
                    <p className="text-xs text-slate-400">Hỗ trợ .xlsx hoặc .xls</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept=".xlsx,.xls" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mb-8">
            <p className="text-xs text-indigo-600 font-black uppercase tracking-widest mb-1">Công nghệ thông minh</p>
            <p className="text-slate-600 text-xs leading-relaxed">
              Hệ thống tự động quét tìm Mã lớp và danh sách sinh viên dựa trên cấu trúc file thực tế. Không cần điều chỉnh file mẫu.
            </p>
          </div>

          <button
            onClick={handleSync}
            disabled={loading || !file}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            {loading ? (
              <RefreshCcw className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Database className="w-6 h-6" />
                ĐỒNG BỘ DỮ LIỆU
              </>
            )}
          </button>
        </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4 text-slate-800">
                <div className="p-3 bg-slate-100 rounded-2xl">
                  <Database className="w-8 h-8 text-slate-600" />
                </div>
                <h2 className="text-xl font-bold">Danh sách đã nạp</h2>
              </div>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-black px-3 py-1 rounded-full uppercase">
                {allStudents.length} Sinh viên
              </span>
            </div>

            {fetching ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-30">
                <RefreshCcw className="w-10 h-10 animate-spin mb-4" />
                <p className="font-bold">Đang tải dữ liệu...</p>
              </div>
            ) : Object.keys(groupedStudents).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                <Database className="w-16 h-16 mb-4" />
                <p className="font-bold">Chưa có dữ liệu nào được nạp</p>
                <p className="text-sm">Vui lòng chọn file Excel và bấm Đồng bộ ở bên trái</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {Object.entries(groupedStudents).map(([code, students]) => (
                  <div key={code} className="border border-slate-100 rounded-3xl overflow-hidden">
                    <div className="bg-slate-50 px-6 py-3 flex items-center justify-between border-b border-slate-100">
                      <span className="font-black text-slate-700 text-sm">{code}</span>
                      <span className="text-xs font-bold text-slate-400">{students.length} em</span>
                    </div>
                    <div className="p-4 space-y-2">
                      {students.slice(0, 5).map((s: any) => (
                        <div key={s.mssv} className="flex items-center justify-between text-sm">
                          <span className="text-slate-500 font-medium">{s.mssv}</span>
                          <span className="text-slate-800 font-bold">{s.name}</span>
                        </div>
                      ))}
                      {students.length > 5 && (
                        <p className="text-[10px] text-center text-slate-400 font-bold uppercase mt-2 pt-2 border-t border-slate-50">
                          ... và {students.length - 5} sinh viên khác
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-8 rounded-[2.5rem] animate-in shake-in duration-300">
            <div className="flex items-center gap-4 mb-4 text-red-600">
              <AlertCircle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Lỗi đồng bộ</h3>
            </div>
            <p className="text-red-900 font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
