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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [semester, setSemester] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async (id: string | number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa học phần này? Toàn bộ dữ liệu điểm danh liên quan sẽ bị xóa.")) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !semester) return;

    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, code, semester }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setName("");
        setCode("");
        setSemester("");
        fetchSubjects();
      } else {
        alert("Có lỗi xảy ra khi thêm môn học. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Error creating subject:", err);
      alert("Không thể kết nối đến máy chủ Backend.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Môn Học</h2>
          <p className="text-slate-500 mt-2">Quản lý danh sách các môn học bạn đang phụ trách.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          Thêm môn học
        </button>
      </header>

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
          <button
            onClick={() => {
              if (searchTerm) setSearchTerm("");
              else setIsModalOpen(true);
            }}
            className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
          >
            {searchTerm ? "Xóa tìm kiếm" : "+ Thêm môn học mới"}
          </button>
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
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Thêm Môn Học Mới</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    Tên môn học
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Cấu trúc dữ liệu và Giải thuật"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-1">
                    Mã môn học
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="VD: COMP1020"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="semester" className="block text-sm font-medium text-slate-700 mb-1">
                    Học kỳ
                  </label>
                  <input
                    id="semester"
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="VD: Học kỳ 1 - 2024"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Đang lưu...</>
                  ) : (
                    "Lưu môn học"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
