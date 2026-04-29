"use client";

import { useState, useEffect } from "react";
import { Plus, BookOpen, X, Loader2, ArrowRight, ClipboardList, Trash2 } from "lucide-react";

import Link from "next/link";

interface Subject {
  id: string | number;
  name: string;
  code: string;
  semester: string;
  created_at?: string;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (id: string | number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa học phần này? Toàn bộ dữ liệu điểm danh liên quan sẽ bị xóa.")) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://academic-command-center.onrender.com";
      const res = await fetch(`${apiUrl}/api/classes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchSubjects();
      } else {
        alert("Không thể xóa lớp này. Có thể có dữ liệu ràng buộc.");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://academic-command-center.onrender.com";
      const res = await fetch(`${apiUrl}/api/classes`); // Lấy từ bảng classes thực tế
      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map((item: any) => ({
          id: item.id,
          name: item.ten_mon,
          code: item.ma_lop,
          semester: item.semester || "---"
        }));
        setSubjects(mappedData.reverse());
      }
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const filteredSubjects = subjects.filter(sub =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.code.toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <div className="max-w-6xl mx-auto relative">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-900 mb-1">Danh sách các học phần</h2>
        <p className="text-slate-500 font-medium">Các lớp học đã được đồng bộ từ hệ thống Excel.</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <input
          type="text"
          placeholder="Tìm kiếm môn học theo tên hoặc mã môn..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-6 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm text-slate-900"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
          <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {searchTerm ? "Không tìm thấy môn học" : "Chưa có môn học nào"}
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            {searchTerm ? `Không có kết quả nào cho "${searchTerm}"` : "Bạn chưa thêm môn học nào vào hệ thống. Hãy bắt đầu ngay!"}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
            >
              Xóa tìm kiếm
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSubjects.map((sub) => (
            <div key={sub.id || Math.random()} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-tight rounded-lg">
                    {sub.semester}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn việc bấm nhầm vào thẻ
                      handleDelete(sub.id);
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 group/btn"
                    title="Xóa học phần này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase">XÓA</span>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 mb-6">
                <h3 className="font-bold text-slate-900 text-lg mb-1 leading-tight">{sub.name}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{sub.code}</p>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-slate-50">
                <Link 
                  href={`/teacher/attendance?class_id=${sub.id}`}
                  className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:text-indigo-800 transition-colors flex items-center gap-2"
                >
                  <ClipboardList className="w-4 h-4" />
                  Điểm danh ngay
                </Link>
                <div className="h-4 w-[1px] bg-slate-100"></div>
                <button 
                  onClick={async (e) => {
                    e.preventDefault();
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://academic-command-center.onrender.com";
                    try {
                      const res = await fetch(`${apiUrl}/api/attendance/classes/${sub.id}/export-semester`);
                      if (res.ok) {
                        const blob = await res.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Bao_cao_HK_${sub.code}.xlsx`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                      } else {
                        alert("Chưa có dữ liệu điểm danh để xuất báo cáo.");
                      }
                    } catch (err) {
                      alert("Lỗi kết nối máy chủ.");
                    }
                  }}
                  className="text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-colors"
                >
                  Tải BC học kỳ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
