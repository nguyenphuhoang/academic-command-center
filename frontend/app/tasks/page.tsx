"use client";

import { useState, useEffect } from "react";
import { Plus, CheckSquare, Square, X, Loader2, Calendar, BookOpen } from "lucide-react";

interface Subject {
  id: string | number;
  name: string;
  code?: string;
}

interface Task {
  id: string | number;
  title: string;
  deadline: string;
  status: string;
  subject_id: string | number;
  subjects?: {
    name: string;
  };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  // Form states
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("Chưa bắt đầu");
  const [subjectId, setSubjectId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://academic-command-center.onrender.com";
      const [tasksRes, subjectsRes] = await Promise.all([
        fetch(`${apiUrl}/api/tasks`),
        fetch(`${apiUrl}/api/subjects`)
      ]);

      if (tasksRes.ok && subjectsRes.ok) {
        const tasksData = await tasksRes.json();
        const subjectsData = await subjectsRes.json();
        setTasks(tasksData);
        setSubjects(subjectsData);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Tất cả" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline || !status || !subjectId) return;

    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://academic-command-center.onrender.com";
      const res = await fetch(`${apiUrl}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          deadline,
          status,
          subject_id: subjectId.toString()
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setTitle("");
        setDeadline("");
        setStatus("Chưa bắt đầu");
        setSubjectId("");
        fetchData();
      } else {
        alert("Có lỗi xảy ra khi thêm công việc.");
      }
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === "Hoàn thành" ? "Đang thực hiện" : "Hoàn thành";
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://academic-command-center.onrender.com";
      const res = await fetch(`${apiUrl}/api/tasks/${task.id}?status=${encodeURIComponent(newStatus)}`, {
        method: "PATCH",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Công việc</h2>
          <p className="text-slate-500 mt-2">Theo dõi và quản lý các công việc giảng dạy và nghiên cứu.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          Thêm công việc
        </button>
      </header>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-6 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-6 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-slate-600 font-medium appearance-none"
        >
          <option value="Tất cả">Tất cả trạng thái</option>
          <option value="Chưa bắt đầu">Chưa bắt đầu</option>
          <option value="Đang thực hiện">Đang thực hiện</option>
          <option value="Hoàn thành">Hoàn thành</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
          <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <CheckSquare className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {searchTerm || statusFilter !== "Tất cả" ? "Không tìm thấy công việc" : "Chưa có công việc nào"}
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            {searchTerm || statusFilter !== "Tất cả" ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm." : "Bắt đầu quản lý thời gian của bạn bằng cách thêm công việc đầu tiên."}
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("Tất cả");
            }}
            className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id.toString()}
              className={`bg-white rounded-2xl p-5 shadow-sm border transition-all flex items-center gap-5 ${task.status === 'Hoàn thành' ? 'bg-slate-50/50 border-slate-100' : 'border-slate-100 hover:border-indigo-200 hover:shadow-md'}`}
            >
              <button
                onClick={() => toggleTaskStatus(task)}
                className={`flex-shrink-0 transition-all ${task.status === 'Hoàn thành' ? 'text-indigo-600 scale-110' : 'text-slate-200 hover:text-indigo-400'}`}
              >
                {task.status === 'Hoàn thành' ? <CheckSquare className="w-7 h-7" /> : <Square className="w-7 h-7" />}
              </button>

              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-slate-900 text-lg truncate ${task.status === 'Hoàn thành' ? 'line-through text-slate-400 font-medium' : ''}`}>
                  {task.title}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm">
                  <span className="flex items-center gap-1.5 text-indigo-600 font-bold">
                    <BookOpen className="w-4 h-4" />
                    {(task as any).subjects?.name || "Chưa phân loại"}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <Calendar className="w-4 h-4" />
                    {new Date(task.deadline).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight ${task.status === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-700' :
                    task.status === 'Đang thực hiện' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                  }`}>
                  {task.status}
                </span>
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
              <h3 className="text-xl font-bold text-slate-900">Thêm Công Việc Mới</h3>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên việc</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Chấm bài tập lớn"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Môn học</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900"
                    required
                  >
                    <option value="">Chọn môn học</option>
                    {subjects.map(s => (
                      <option key={s.id.toString()} value={s.id.toString()}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hạn chót</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900"
                    >
                      <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                      <option value="Đang thực hiện">Đang thực hiện</option>
                      <option value="Hoàn thành">Hoàn thành</option>
                    </select>
                  </div>
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
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Lưu công việc"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
