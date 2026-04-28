"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, User, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

function StudentAttendanceContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [mssv, setMssv] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{message: string, distance: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) {
      setError("Thiếu mã buổi điểm danh. Vui lòng quét lại mã QR.");
      return;
    }
    if (!mssv) {
      setError("Vui lòng nhập MSSV.");
      return;
    }

    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ GPS.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`${API_URL}/api/attendance/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: sessionId,
              mssv: mssv,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          });

          const data = await res.json();
          if (res.ok) {
            setSuccess({
              message: data.message,
              distance: data.distance
            });
          } else {
            setError(data.detail || "Điểm danh thất bại.");
          }
        } catch (err) {
          setError("Lỗi kết nối máy chủ.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("Không thể lấy vị trí. Vui lòng bật GPS và cho phép truy cập.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  if (success) {
    return (
      <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 mx-auto">
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Thành công!</h2>
        <p className="text-slate-600 mb-6">{success.message}</p>
        <div className="bg-slate-50 p-4 rounded-2xl inline-block border border-slate-100">
          <p className="text-xs text-slate-400 uppercase font-black">Khoảng cách</p>
          <p className="text-2xl font-bold text-indigo-600">{success.distance.toFixed(1)}m</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Điểm Danh Sinh Viên</h2>
        <p className="text-slate-500 text-sm mt-1">Vui lòng nhập MSSV và cho phép truy cập vị trí.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">MSSV của bạn</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={mssv}
              onChange={(e) => setMssv(e.target.value)}
              placeholder="VD: 20261234"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all text-lg font-medium"
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 border border-red-100 animate-in shake-in duration-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <MapPin className="w-6 h-6" />
              Xác nhận điểm danh
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function StudentAttendancePage() {
  return (
    <div className="max-w-md mx-auto p-4 min-h-screen flex items-center justify-center bg-slate-50 pb-12">
      <Suspense fallback={
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
          <p className="text-slate-500">Đang khởi tạo...</p>
        </div>
      }>
        <StudentAttendanceContent />
      </Suspense>
    </div>
  );
}
