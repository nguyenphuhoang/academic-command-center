"use client";

import { useState } from "react";
import { Database, RefreshCcw, CheckCircle2, AlertCircle, ChevronLeft, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

export default function AdminSyncPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{count: number, class_code: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/admin/sync-students`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const errData = await res.json();
        setError(errData.detail || "Đồng bộ thất bại.");
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ.");
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
          <p className="text-slate-500 font-medium">Đồng bộ dữ liệu sinh viên từ file Excel</p>
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

          <p className="text-slate-600 mb-6 leading-relaxed">
            Hệ thống sẽ quét file <code className="bg-slate-100 px-2 py-1 rounded text-indigo-600 font-bold">DanhSachSVLHP_225NMG02.xlsx</code> trong thư mục gốc.
          </p>

          <ul className="space-y-3 mb-8 text-sm font-medium text-slate-500">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Lấy Mã lớp tại ô B5
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Lấy MSSV, Họ tên, Email từ dòng 9
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Tự động cập nhật nếu đã tồn tại (Upsert)
            </li>
          </ul>

          <button
            onClick={handleSync}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            {loading ? (
              <RefreshCcw className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Database className="w-6 h-6" />
                ĐỒNG BỘ NGAY
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
