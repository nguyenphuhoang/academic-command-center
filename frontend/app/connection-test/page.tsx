"use client";

import { useState, useEffect } from "react";
import { Activity, Database, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

export default function ConnectionTest() {
  const [apiStatus, setApiStatus] = useState<"loading" | "success" | "error">("loading");
  const [supabaseStatus, setSupabaseStatus] = useState<"loading" | "success" | "error">("loading");
  const [apiMessage, setApiMessage] = useState<string>("Đang kết nối...");

  const checkConnection = async () => {
    setApiStatus("loading");
    setSupabaseStatus("loading");
    
    // 1. Check Backend API
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://academic-command-center.onrender.com";
      const res = await fetch(`${apiUrl}/api/health`);
      if (res.ok) {
        const data = await res.json();
        setApiStatus("success");
        setApiMessage(data.message || "Kết nối API thành công");
      } else {
        setApiStatus("error");
        setApiMessage("Lỗi kết nối HTTP");
      }
    } catch (_) {
      setApiStatus("error");
      setApiMessage("Không thể kết nối đến Backend (chưa khởi động?)");
    }

    // 2. Check Supabase from Frontend
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        setSupabaseStatus("error");
        return;
      }
      
      // Attempt to initialize to see if it doesn't crash
      createClient(supabaseUrl, supabaseKey);
      setSupabaseStatus("success");
    } catch (_) {
      setSupabaseStatus("error");
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Kiểm tra kết nối</h2>
          <p className="text-slate-500 mt-2">Xác minh trạng thái của các dịch vụ hệ thống.</p>
        </div>
        <button 
          onClick={checkConnection}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Tải lại
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-lg ${apiStatus === 'success' ? 'bg-emerald-100' : apiStatus === 'error' ? 'bg-red-100' : 'bg-slate-100'}`}>
              <Activity className={`w-6 h-6 ${apiStatus === 'success' ? 'text-emerald-600' : apiStatus === 'error' ? 'text-red-600' : 'text-slate-600'}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">Backend API (FastAPI)</h3>
              <p className="text-slate-500 text-sm">{process.env.NEXT_PUBLIC_API_URL || "https://academic-command-center.onrender.com"}</p>
            </div>
          </div>
          
          <div className="mt-auto pt-4 border-t border-slate-50 flex items-center gap-2">
            {apiStatus === 'loading' && <span className="text-slate-500 flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Đang kiểm tra...</span>}
            {apiStatus === 'success' && <span className="text-emerald-600 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> {apiMessage}</span>}
            {apiStatus === 'error' && <span className="text-red-600 flex items-center gap-2"><XCircle className="w-5 h-5" /> {apiMessage}</span>}
          </div>
        </div>

        {/* Supabase Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-lg ${supabaseStatus === 'success' ? 'bg-emerald-100' : supabaseStatus === 'error' ? 'bg-red-100' : 'bg-slate-100'}`}>
              <Database className={`w-6 h-6 ${supabaseStatus === 'success' ? 'text-emerald-600' : supabaseStatus === 'error' ? 'text-red-600' : 'text-slate-600'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">Supabase Database</h3>
              <p className="text-slate-500 text-sm">Biến môi trường (.env)</p>
            </div>
          </div>
          
          <div className="mt-auto pt-4 border-t border-slate-50 flex items-center gap-2">
            {supabaseStatus === 'loading' && <span className="text-slate-500 flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Đang kiểm tra...</span>}
            {supabaseStatus === 'success' && <span className="text-emerald-600 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Đã cấu hình Client</span>}
            {supabaseStatus === 'error' && <span className="text-red-600 flex items-center gap-2"><XCircle className="w-5 h-5" /> Thiếu Credentials</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
