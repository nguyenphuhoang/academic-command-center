"use client";

import { useState, useEffect, Suspense } from "react";
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

  // Check if already attended on this device
  useEffect(() => {
    if (typeof window !== "undefined" && sessionId) {
      const saved = localStorage.getItem(`attended_${sessionId}`);
      if (saved) {
        setSuccess(JSON.parse(saved));
      }
    }
  }, [sessionId]);

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
          const rawId = navigator.userAgent + window.screen.width + window.screen.height;
          const deviceId = btoa(rawId);

          const res = await fetch(`${API_URL}/api/attendance/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: sessionId,
              mssv: mssv,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              device_id: deviceId,
            }),
          });

          const data = await res.json();
          if (res.ok) {
            const successData = {
              message: data.message,
              distance: data.distance
            };
            setSuccess(successData);
            // Save to localStorage to prevent re-submitting for another MSSV
            localStorage.setItem(`attended_${sessionId}`, JSON.stringify(successData));
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
        <p className="text-xs text-slate-400 mt-6 italic">Thông tin đã được lưu trên thiết bị này.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-lg mx-auto">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 mx-auto">
          <User className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Điểm Danh Sinh Viên</h2>
        <p className="text-slate-500 font-medium mt-2">Vui lòng nhập MSSV chính xác để hệ thống ghi nhận.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-black text-slate-700 mb-3 ml-2 uppercase tracking-widest">MSSV của bạn</label>
          <div className="relative">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
            <input
              type="text"
              value={mssv}
              onChange={(e) => setMssv(e.target.value)}
              placeholder="VD: 20261234"
              className="w-full pl-14 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-2xl font-black placeholder:text-slate-300 shadow-inner"
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-6 rounded-3xl flex items-start gap-4 border border-red-100 animate-in shake-in duration-300 shadow-sm">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-6 rounded-3xl font-black text-xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-4 active:scale-95 touch-manipulation"
        >
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <>
              <MapPin className="w-8 h-8" />
              XÁC NHẬN ĐIỂM DANH
            </>
          )}
        </button>
        
        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest px-4">
          Hệ thống sẽ kiểm tra GPS trong bán kính 100m quanh giáo viên.
        </p>
      </form>
    </div>
  );
}

export default function StudentAttendancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:p-8">
      <Suspense fallback={
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest">Đang tải...</p>
        </div>
      }>
        <StudentAttendanceContent />
      </Suspense>
    </div>
  );
}
