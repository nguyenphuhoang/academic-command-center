import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BookOpen, Archive, LayoutDashboard, Settings, CheckSquare, MapPin, UserPlus } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Academic Command Center",
  description: "Quản lý công việc dành cho Giảng viên",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden bg-slate-50">
          {/* Sidebar - Hidden on Mobile */}
          <aside className="hidden md:flex w-64 bg-slate-900 text-slate-100 flex-col flex-shrink-0">
            <div className="p-6">
              <Link href="/" className="group">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 group-hover:text-indigo-400 transition-colors">
                  <LayoutDashboard className="w-6 h-6 text-indigo-400" />
                  Command Center
                </h1>
              </Link>
            </div>
            <nav className="flex-1 px-4 space-y-2 mt-4">
              <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
                <LayoutDashboard className="w-5 h-5" />
                Tổng quan (Dashboard)
              </Link>
              <Link href="/subjects" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
                <BookOpen className="w-5 h-5" />
                Môn Học (Subjects)
              </Link>
              <Link href="/tasks" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
                <CheckSquare className="w-5 h-5" />
                Công việc (Tasks)
              </Link>
              <Link href="/archive" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
                <Archive className="w-5 h-5" />
                Lưu Trữ (Archive)
              </Link>
              <Link href="/teacher/attendance" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
                <MapPin className="w-5 h-5" />
                Điểm danh (Teacher)
              </Link>
              <Link href="/admin/sync" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
                <UserPlus className="w-5 h-5" />
                Cập nhật SV (Admin)
              </Link>
              <div className="pt-4 mt-4 border-t border-slate-800/50">
                <Link href="/connection-test" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors text-sm">
                  <Settings className="w-4 h-4" />
                  Kiểm tra Kết nối
                </Link>
              </div>
            </nav>
            
            {/* User Profile Placeholder */}
            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800/50">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs">
                  GV
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">Giảng Viên</p>
                  <p className="text-[10px] text-slate-500 truncate">Sẵn sàng làm việc</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content - Full width on Mobile */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
