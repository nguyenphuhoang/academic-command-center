"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  CheckSquare, 
  FileText, 
  ArrowRight, 
  Plus, 
  Clock, 
  Loader2,
  Calendar,
  LayoutGrid,
  FileBox,
  ClipboardList
} from "lucide-react";

interface DashboardData {
  stats: {
    subjects: number;
    tasks_pending: number;
    documents: number;
  };
  recent_tasks: Array<{
    id: string | number;
    title: string;
    deadline: string;
    status: string;
    subjects: {
      name: string;
    };
  }>;
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/api/dashboard/summary`);
        if (res.ok) {
          const dashboardData = await res.json();
          setData(dashboardData);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Trung Tâm Chỉ Huy</h2>
          <p className="text-slate-500 mt-2 text-lg">Chào mừng Giảng viên quay trở lại. Đây là tóm tắt công việc của bạn.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/tasks" className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-semibold">
            <Plus className="w-5 h-5" />
            Tạo việc mới
          </Link>
        </div>
      </header>
      
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="relative group bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <LayoutGrid className="w-24 h-24 text-indigo-600" />
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-500 uppercase tracking-widest text-xs">Môn học</h3>
          </div>
          <p className="text-5xl font-black text-slate-900">{data?.stats.subjects || 0}</p>
          <div className="mt-6 flex items-center text-indigo-600 font-bold text-sm">
            Xem danh sách <ArrowRight className="w-4 h-4 ml-1" />
          </div>
          <Link href="/subjects" className="absolute inset-0 z-10" />
        </div>

        <div className="relative group bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-amber-500/5 transition-all overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <ClipboardList className="w-24 h-24 text-amber-600" />
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
              <CheckSquare className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-500 uppercase tracking-widest text-xs">Việc cần làm</h3>
          </div>
          <p className="text-5xl font-black text-slate-900">{data?.stats.tasks_pending || 0}</p>
          <div className="mt-6 flex items-center text-amber-600 font-bold text-sm">
            Kiểm tra checklist <ArrowRight className="w-4 h-4 ml-1" />
          </div>
          <Link href="/tasks" className="absolute inset-0 z-10" />
        </div>

        <div className="relative group bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileBox className="w-24 h-24 text-emerald-600" />
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-500 uppercase tracking-widest text-xs">Tài liệu</h3>
          </div>
          <p className="text-5xl font-black text-slate-900">{data?.stats.documents || 0}</p>
          <div className="mt-6 flex items-center text-emerald-600 font-bold text-sm">
            Vào kho lưu trữ <ArrowRight className="w-4 h-4 ml-1" />
          </div>
          <Link href="/archive" className="absolute inset-0 z-10" />
        </div>
      </div>
      
      {/* Two Column Layout for Recent Tasks & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Clock className="w-6 h-6 text-indigo-500" />
              Công việc sắp tới
            </h3>
            <Link href="/tasks" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
              Xem tất cả
            </Link>
          </div>
          
          <div className="space-y-6">
            {!data?.recent_tasks.length ? (
              <div className="py-12 text-center">
                <p className="text-slate-400 italic">Thật tuyệt! Bạn không có công việc nào sắp tới.</p>
              </div>
            ) : (
              data.recent_tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-5 p-4 rounded-3xl hover:bg-slate-50 transition-colors group">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-md transition-all">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{task.title}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                      <span className="font-semibold text-indigo-600">{task.subjects.name}</span>
                      <span>•</span>
                      <span>Hạn: {new Date(task.deadline).toLocaleDateString('vi-VN')}</span>
                    </p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${
                    task.status === 'Đang thực hiện' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Links / Resources */}
        <div className="space-y-8">
          <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white shadow-xl shadow-indigo-200">
            <h3 className="text-xl font-bold mb-6">Truy cập nhanh</h3>
            <div className="grid grid-cols-1 gap-4">
              <Link href="/subjects" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all font-semibold">
                Danh sách lớp
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/tasks" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all font-semibold">
                Quản lý tiến độ
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/archive" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all font-semibold">
                Tài liệu giảng dạy
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Trạng thái hệ thống</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Database</span>
                <span className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Storage</span>
                <span className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">API Gateway</span>
                <span className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
