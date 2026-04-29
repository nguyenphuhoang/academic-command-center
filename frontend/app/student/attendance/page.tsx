"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, User, Loader2, CheckCircle2, AlertCircle, FileText, Download, BookOpen } from "lucide-react";

function StudentAttendanceContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [mssv, setMssv] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{message: string, distance: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://academic-command-center.onrender.com";

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
              distance: data.distance,
              subject_id: data.subject_id
            };
            setSuccess(successData);
            if (data.subject_id) {
              fetchSubjectDocs(data.subject_id);
            }
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

  const [docs, setDocs] = useState<any[]>([]);

  const fetchSubjectDocs = async (sid: string) => {
    try {
      const res = await fetch(`${API_URL}/api/documents?subject_id=${sid}`);
      if (res.ok) {
        const data = await res.json();
        setDocs(data);
      }
    } catch (err) {
      console.error("Failed to fetch docs:", err);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center animate-in zoom-in duration-500 max-w-2xl w-full mx-auto">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8 mx-auto shadow-inner">
          <CheckCircle2 className="w-14 h-14 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Điểm Danh Thành Công!</h2>
        <p className="text-slate-500 font-medium mb-8">Hệ thống đã ghi nhận sự hiện diện của bạn.</p>
        
        <div className="flex justify-center gap-4 mb-10">
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm flex-1">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Khoảng cách</p>
            <p className="text-3xl font-black text-indigo-600">{success.distance.toFixed(1)}m</p>
          </div>
        </div>

        {/* Tài liệu môn học section */}
        <div className="text-left border-t border-slate-100 pt-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Tài liệu học tập</h3>
          </div>

          <div className="space-y-4">
            {docs.length > 0 ? (
              docs.map((doc: any) => (
                <a 
                  key={doc.id} 
                  href={doc.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-5 bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 border border-slate-100 rounded-3xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{doc.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{doc.file_type || "Tài liệu"}</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </a>
              ))
            ) : (
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-dashed border-slate-200 text-center">
                <p className="text-sm text-slate-400 font-bold">Chưa có tài liệu nào được tải lên cho môn học này.</p>
              </div>
            )}
          </div>
        </div>

        <p className="text-[10px] text-slate-400 mt-10 italic font-medium uppercase tracking-widest">Thông tin đã được lưu trên thiết bị này.</p>
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
