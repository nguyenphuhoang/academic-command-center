"use client";

import { useState } from "react";
import { Database, RefreshCcw, CheckCircle2, AlertCircle, ChevronLeft, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

export default function AdminSyncPage() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{count: number, class_code: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    }
  };

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

          <ul className="space-y-3 mb-8 text-sm font-medium text-slate-500">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Tự động lấy Mã lớp tại ô B5
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Lấy danh sách sinh viên từ dòng 9
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Cập nhật thông tin MSSV, Họ tên
            </li>
          </ul>

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

        <div className="space-y-6">
          {result && (
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] animate-in zoom-in duration-300">
              <div className="flex items-center gap-4 mb-4 text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
                <h3 className="text-xl font-bold">Đồng bộ thành công!</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white/50 p-4 rounded-2xl">
                  <p className="text-xs text-emerald-600/70 font-black uppercase tracking-widest mb-1">Mã lớp</p>
                  <p className="text-2xl font-black text-emerald-900">{result.class_code}</p>
                </div>
                <div className="bg-white/50 p-4 rounded-2xl">
                  <p className="text-xs text-emerald-600/70 font-black uppercase tracking-widest mb-1">Số lượng sinh viên</p>
                  <p className="text-2xl font-black text-emerald-900">{result.count} em</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 p-8 rounded-[2.5rem] animate-in shake-in duration-300">
              <div className="flex items-center gap-4 mb-4 text-red-600">
                <AlertCircle className="w-8 h-8" />
                <h3 className="text-xl font-bold">Lỗi đồng bộ</h3>
              </div>
              <p className="text-red-900 font-medium">{error}</p>
            </div>
          )}
          
          {!result && !error && !loading && (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 text-center text-slate-400">
              <RefreshCcw className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold">Chưa có hoạt động nào</p>
              <p className="text-sm">Vui lòng nhấn nút Đồng bộ ở bên trái</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
