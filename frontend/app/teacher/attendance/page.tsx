"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, QrCode, Play, Loader2, CheckCircle2, AlertCircle, ChevronLeft, Users, Download, UserCheck, Mail, Send, RefreshCw, FileDown } from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client for Realtime safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

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
  const [studentsStatus, setStudentsStatus] = useState<{present: any[], absent: any[]}>({present: [], absent: []});
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [success, setSuccess] = useState<{message: string, distance: number} | null>(null);
  const [fetchingClasses, setFetchingClasses] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [isSessionActive, setIsSessionActive] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchSessionStatus = useCallback(async (sessionId: string) => {
    setLoadingStatus(true);
    try {
      const res = await fetch(`${API_URL}/api/attendance/sessions/${sessionId}/status`);
      if (res.ok) {
        const data = await res.json();
        setStudentsStatus(data);
      }
    } catch (err) {
      console.error("Error fetching session status:", err);
    } finally {
      setLoadingStatus(false);
    }
  }, [API_URL]);

  const handleResetDevice = async (mssv: string) => {
    if (!confirm(`Bạn có chắc muốn reset khóa thiết bị cho MSSV ${mssv}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/students/${mssv}/reset-device`, { method: "PATCH" });
      if (res.ok) {
        alert(`Đã reset thiết bị cho ${mssv} thành công!`);
      } else {
        const err = await res.json();
        alert("Lỗi: " + err.detail);
      }
    } catch (e) {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  useEffect(() => {
    const fetchClassesFromStudents = async () => {
      try {
        // Lấy danh sách các mã lớp thực tế đang có sinh viên
        const res = await fetch(`${API_URL}/api/admin/students`);
        if (res.ok) {
          const allStudents = await res.json();
          // Lọc ra các mã lớp duy nhất
          const uniqueClasses = Array.from(new Set(allStudents.map((s: any) => s.class_code)))
            .map(code => ({
              id: code, // Dùng mã lớp làm ID luôn cho tiện
              ma_lop: code,
              ten_mon: `Lớp HP: ${code}`
            }));
          setClasses(uniqueClasses);
        }
      } catch (err) {
        console.error("Failed to fetch classes from students:", err);
      } finally {
        setFetchingClasses(false);
      }
    };
    fetchClassesFromStudents();
  }, [API_URL]);

  // Real-time subscription
  useEffect(() => {
    if (!session || !supabase) return;

    fetchSessionStatus(session.id);

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
        (payload: any) => {
          const newRecord = payload.new;
          setStudentsStatus((prev) => {
            // Kiểm tra xem sinh viên đã có trong danh sách hiện diện chưa
            const isAlreadyPresent = prev.present.some(s => s.mssv === newRecord.mssv);
            if (isAlreadyPresent) return prev;

            // Tìm sinh viên trong danh sách vắng
            const studentIdx = prev.absent.findIndex(s => s.mssv === newRecord.mssv);
            let studentInfo;

            if (studentIdx >= 0) {
              // Nếu có trong danh sách vắng, chuyển sang hiện diện
              studentInfo = { 
                ...prev.absent[studentIdx], 
                status: 'present', 
                distance: newRecord.distance, 
                timestamp: newRecord.created_at || new Date().toISOString() 
              };
              return {
                present: [studentInfo, ...prev.present],
                absent: prev.absent.filter((_, i) => i !== studentIdx)
              };
            } else {
              // Nếu KHÔNG có trong danh sách vắng (lỗi khớp mã lớp), vẫn cho hiện tên lên màn hình
              studentInfo = {
                mssv: newRecord.mssv,
                name: "Sinh viên mới (Lệch mã lớp)", // Sẽ được cập nhật nếu tìm thấy trong DB sau
                status: 'present',
                distance: newRecord.distance,
                timestamp: newRecord.created_at || new Date().toISOString()
              };
              return {
                ...prev,
                present: [studentInfo, ...prev.present]
              };
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, fetchSessionStatus]);

  // Countdown timer logic
  useEffect(() => {
    let timer: any;
    if (isSessionActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isSessionActive) {
      handleFinalizeSession();
    }
    return () => clearInterval(timer);
  }, [isSessionActive, timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFinalizeSession = async () => {
    if (!session) return;
    
    setLoading(true);
    setIsSessionActive(false);
    try {
      const res = await fetch(`${API_URL}/api/attendance/session/${session.id}/finalize`, {
        method: "POST",
      });
      
      if (res.ok) {
        const data = await res.json();
        // We keep the session in state but marked as inactive
        setSession({ ...session, status: "inactive" });
        
        alert(`Đã kết thúc buổi học!\n- Có mặt: ${data.present_count}\n- Vắng: ${data.absent_count}`);
      } else {
        const errData = await res.json();
        setError(errData.detail || "Không thể kết thúc buổi học.");
      }
    } catch (err) {
      console.error("Failed to finalize session:", err);
      setError("Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetDevice = async (mssv: string) => {
    if (!confirm(`Reset thiết bị cho sinh viên ${mssv}?\nSau khi reset, sinh viên có thể dùng máy mới để điểm danh.`)) return;
    try {
      const res = await fetch(`${API_URL}/api/students/${mssv}/reset-device`, { method: "PATCH" });
      if (res.ok) {
        alert(`✅ Đã reset thiết bị cho SV ${mssv}.`);
      } else {
        alert(`❌ Không thể reset. Vui lòng thử lại.`);
      }
    } catch {
      alert("Lỗi kết nối máy chủ.");
    }
  };

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
            setIsSessionActive(true);
            setTimeLeft(180); // Reset to 3 minutes
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

  const handleExportAbsentees = async () => {
    if (!session) return;
    try {
      const res = await fetch(`${API_URL}/api/attendance/sessions/${session.id}/export-absentees`);
      if (!res.ok) {
        alert("Có lỗi khi xuất file vắng mặt.");
        return;
      }
      
      const blob = await res.blob();
      const contentDisposition = res.headers.get('content-disposition');
      let filename = "Danh_sach_vang.xlsx";
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Lỗi khi tải báo cáo:", error);
      alert("Lỗi kết nối khi tải báo cáo.");
    }
  };

  const handleExportExcel = () => {
    if (studentsStatus.present.length === 0 && studentsStatus.absent.length === 0) return;
    
    const className = classes.find(c => c.id === session?.class_id)?.ten_mon || "Lop-Hoc";
    const csvContent = "data:text/csv;charset=utf-8," 
      + "STT,MSSV,Họ Tên,Trạng thái,Thời gian,Khoảng cách (m)\n"
      + [
          ...studentsStatus.present.map((r, index) => `${index + 1},${r.mssv},${r.name},Có mặt,${new Date(r.timestamp).toLocaleString("vi-VN")},${r.distance.toFixed(1)}`),
          ...studentsStatus.absent.map((r, index) => `${studentsStatus.present.length + index + 1},${r.mssv},${r.name},Vắng,,`)
        ].join("\n");
    
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
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportAbsentees}
              className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95"
            >
              <FileDown className="w-4 h-4" />
              Tải danh sách vắng (.xlsx)
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              Xuất file tổng
            </button>
          </div>
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

                <div className="bg-slate-50 p-6 rounded-[2rem] inline-block border border-slate-100 mb-6 shadow-inner relative">
                  {session.status === "active" ? (
                    <div className="relative">
                      <img src={qrUrl} alt="Attendance QR Code" className="w-56 h-56 mx-auto" />
                      {/* Floating Countdown Timer */}
                      <div className="absolute -top-3 -right-3 bg-red-600 text-white px-4 py-2 rounded-2xl text-sm font-black shadow-lg shadow-red-200 animate-pulse z-50 flex items-center gap-2 border-2 border-white">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  ) : (
                    <div className="w-56 h-56 flex flex-col items-center justify-center bg-slate-200 rounded-2xl">
                      <QrCode className="w-16 h-16 text-slate-400 mb-2" />
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Mã đã hết hạn</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-slate-900 font-bold text-lg">
                    {session.status === "active" ? "Quét mã để nộp" : "Phiên đã kết thúc"}
                  </p>
                  <p className="text-slate-400 text-xs px-4">
                    {session.status === "active" 
                      ? "Tọa độ của bạn đã được khóa làm tâm điểm danh."
                      : "Không nhận thêm dữ liệu điểm danh mới."}
                  </p>
                </div>
              </div>

              <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl text-white text-center">
                <p className="text-indigo-100 font-bold uppercase tracking-widest text-xs mb-2">Số lượng hiện diện</p>
                <p className="text-7xl font-black">{studentsStatus.present.length}</p>
                <p className="text-indigo-200 text-sm mt-2 font-medium">Trên tổng số {studentsStatus.present.length + studentsStatus.absent.length} sinh viên</p>
              </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleFinalizeSession}
                    disabled={loading || session.status !== "active"}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-100"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "KẾT THÚC PHIÊN"}
                  </button>
                  
                  <button
                    onClick={handleExportAbsentees}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                  >
                    <FileDown className="w-5 h-5" /> TẢI BÁO CÁO
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase text-center mt-2">
                  Bạn có thể tải báo cáo bất cứ lúc nào.
                </p>
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

              {loadingStatus ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] h-96 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold text-lg">Đang tải danh sách sinh viên...</p>
                </div>
              ) : studentsStatus.present.length === 0 && studentsStatus.absent.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] h-96 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <UserCheck className="w-8 h-8 text-red-300" />
                  </div>
                  <p className="text-slate-400 font-bold text-lg">Không có sinh viên nào trong danh sách lớp này.</p>
                  <p className="text-slate-400 text-sm">Vui lòng kiểm tra lại việc nạp file Excel sinh viên.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {studentsStatus.present.map((student) => (
                    <div
                      key={student.mssv}
                      className="bg-white p-5 rounded-[1.5rem] shadow-md border-2 border-emerald-500 flex flex-col items-center text-center relative group animate-in zoom-in-95 duration-500"
                    >
                      <button onClick={() => handleResetDevice(student.mssv)} className="absolute top-3 right-3 text-slate-300 hover:text-indigo-600 transition-colors z-10" title="Reset Device">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <p className="font-black text-slate-900 text-lg tracking-tight">{student.mssv}</p>
                      <p className="text-xs text-slate-500 font-bold mt-1 line-clamp-1" title={student.name}>{student.name}</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">
                        {new Date(student.timestamp).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                      <div className="mt-3 px-3 py-1 bg-emerald-50 rounded-lg text-[9px] font-black text-emerald-600 uppercase">
                        Distance: {student.distance.toFixed(1)}m
                      </div>
                    </div>
                  ))}

                  {studentsStatus.absent.map((student) => (
                    <div
                      key={student.mssv}
                      className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-200 flex flex-col items-center text-center relative group opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <button onClick={() => handleResetDevice(student.mssv)} className="absolute top-3 right-3 text-slate-400 hover:text-indigo-600 transition-colors z-10" title="Reset Device">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <div className="w-12 h-12 bg-slate-200 rounded-2xl flex items-center justify-center mb-3">
                        <UserCheck className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="font-black text-slate-500 text-lg tracking-tight">{student.mssv}</p>
                      <p className="text-xs text-slate-400 font-bold mt-1 line-clamp-1" title={student.name}>{student.name}</p>
                      <div className="mt-3 px-3 py-1 bg-slate-200 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                        Vắng mặt
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
