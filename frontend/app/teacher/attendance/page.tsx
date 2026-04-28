import { useState, useEffect, useCallback } from "react";
import { MapPin, QrCode, Play, Loader2, CheckCircle2, AlertCircle, ChevronLeft, Users, Download, UserCheck } from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client for Realtime
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface ClassItem {
  id: string;
  ma_lop: string;
  ten_mon: string;
}

interface Session {
  id: string;
  class_id: string;
  status: string;
}

interface AttendanceRecord {
  id: string;
  mssv: string;
  timestamp: string;
  distance: number;
}

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingClasses, setFetchingClasses] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Fetch initial records when session is created
  const fetchRecords = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: false });
      
      if (!error && data) {
        setRecords(data);
      }
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch(`${API_URL}/api/classes`);
        if (res.ok) {
          const data = await res.json();
          setClasses(data);
        }
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      } finally {
        setFetchingClasses(false);
      }
    };
    fetchClasses();
  }, [API_URL]);

  // Real-time subscription
  useEffect(() => {
    if (!session) return;

    fetchRecords(session.id);

    // Subscribe to new attendance records
    const channel = supabase
      .channel(`session-${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "attendance_records",
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          const newRecord = payload.new as AttendanceRecord;
          setRecords((current) => [newRecord, ...current]);
          
          // Play a subtle sound if possible (optional)
          // new Audio('/beep.mp3').play().catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, fetchRecords]);

  const handleStartAttendance = () => {
    if (!selectedClassId) {
      setError("Vui lòng chọn lớp học.");
      return;
    }

    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Trình duyệt của bạn không hỗ trợ định vị GPS.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`${API_URL}/api/attendance/session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              class_id: selectedClassId,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            setSession(data);
          } else {
            const errData = await res.json();
            setError(errData.detail || "Không thể tạo buổi điểm danh.");
          }
        } catch (err) {
          setError("Lỗi kết nối máy chủ.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("Không thể lấy vị trí của bạn. Vui lòng bật GPS.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleExportExcel = () => {
    if (records.length === 0) return;
    
    const className = classes.find(c => c.id === session?.class_id)?.ten_mon || "Lop-Hoc";
    const csvContent = "data:text/csv;charset=utf-8," 
      + "STT,MSSV,Thời gian,Khoảng cách (m)\n"
      + records.map((r, index) => `${records.length - index},${r.mssv},${new Date(r.timestamp).toLocaleString("vi-VN")},${r.distance.toFixed(1)}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Diem-Danh-${className}-${new Date().toLocaleDateString("vi-VN")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate QR Code URL
  const qrUrl = session 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
        `${window.location.origin}/student/attendance?session_id=${session.id}`
      )}`
    : "";

  return (
    <div className="max-w-6xl mx-auto p-4 min-h-screen pb-20 bg-slate-50">
      <header className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Hệ Thống Điểm Danh</h1>
        </div>
        
        {session && (
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            Xuất file Excel
          </button>
        )}
      </header>

      {fetchingClasses ? (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
          <p className="text-slate-500 font-medium">Đang chuẩn bị dữ liệu lớp học...</p>
        </div>
      ) : !session ? (
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Chọn lớp điểm danh</h2>
            </div>
            
            <div className="space-y-3">
              {classes.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-slate-400 text-sm italic">Chưa có lớp học nào.</p>
                </div>
              ) : (
                classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`w-full p-5 rounded-[1.5rem] text-left border-2 transition-all duration-300 ${
                      selectedClassId === cls.id
                        ? "border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-500/10 scale-[1.02]"
                        : "border-slate-50 hover:border-slate-200 bg-slate-50/50"
                    }`}
                  >
                    <p className="font-black text-slate-900 text-lg leading-tight">{cls.ten_mon}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">{cls.ma_lop}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-5 rounded-[1.5rem] flex items-start gap-4 border border-red-100 animate-in shake-in duration-300">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <button
            onClick={handleStartAttendance}
            disabled={loading || classes.length === 0}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white py-5 rounded-[1.5rem] font-black text-xl shadow-2xl shadow-slate-300 transition-all flex items-center justify-center gap-4 active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <>
                <Play className="w-8 h-8 fill-current" />
                BẮT ĐẦU NGAY
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Info & QR */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 text-center relative overflow-hidden">
                <div className="mb-6 flex flex-col items-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-emerald-50/50">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">Đang Điểm Danh</h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">
                    Lớp: <span className="text-indigo-600 font-bold">{classes.find(c => c.id === session.class_id)?.ten_mon}</span>
                  </p>
                </div>

                <div className="bg-slate-50 p-6 rounded-[2rem] inline-block border border-slate-100 mb-6 shadow-inner">
                  <img src={qrUrl} alt="Attendance QR Code" className="w-56 h-56 mx-auto" />
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-slate-900 font-bold text-lg">Quét mã để nộp</p>
                  <p className="text-slate-400 text-xs px-4">
                    Tọa độ của bạn đã được khóa làm tâm điểm danh.
                  </p>
                </div>
              </div>

              <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl text-white text-center">
                <p className="text-indigo-100 font-bold uppercase tracking-widest text-xs mb-2">Số lượng hiện diện</p>
                <p className="text-7xl font-black">{records.length}</p>
                <p className="text-indigo-200 text-sm mt-2 font-medium">Sinh viên đã nộp</p>
              </div>

              <button
                onClick={() => setSession(null)}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-4 rounded-2xl font-bold transition-all"
              >
                Kết thúc buổi học
              </button>
            </div>

            {/* Right Column: Live Grid */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <UserCheck className="w-6 h-6 text-indigo-600" />
                  Danh sách sinh viên
                </h3>
                <span className="text-slate-400 text-sm font-bold bg-slate-100 px-4 py-1.5 rounded-full">
                  Real-time Active
                </span>
              </div>

              {records.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] h-96 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold text-lg">Đang chờ sinh viên đầu tiên...</p>
                  <p className="text-slate-400 text-sm mt-1">Danh sách sẽ tự động cập nhật khi có người quét mã.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      className="bg-white p-5 rounded-[1.5rem] shadow-md border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 fade-in duration-500 hover:shadow-xl hover:scale-[1.05] transition-all group"
                    >
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <UserCheck className="w-6 h-6 text-indigo-600 group-hover:text-white" />
                      </div>
                      <p className="font-black text-slate-900 text-lg tracking-tight">{record.mssv}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                        {new Date(record.timestamp).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                      <div className="mt-3 px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase">
                        Distance: {record.distance.toFixed(1)}m
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
