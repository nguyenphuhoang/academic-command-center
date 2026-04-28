"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Image as ImageIcon, 
  File, 
  Download, 
  Upload, 
  Plus, 
  X, 
  Loader2, 
  Search,
  BookOpen
} from "lucide-react";

interface Subject {
  id: string | number;
  name: string;
}

interface Document {
  id: string | number;
  name: string;
  file_url: string;
  file_type: string;
  subject_id: string | number;
  created_at: string;
  subjects?: {
    name: string;
  };
}

export default function ArchivePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Upload form states
  const [file, setFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const [docsRes, subjectsRes] = await Promise.all([
        fetch(`${apiUrl}/api/documents`),
        fetch(`${apiUrl}/api/subjects`)
      ]);
      
      if (docsRes.ok && subjectsRes.ok) {
        const docsData = await docsRes.json();
        const subjectsData = await subjectsRes.json();
        setDocuments(docsData);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Auto-fill name if empty
      if (!docName) {
        setDocName(selectedFile.name.split('.')[0]);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !docName || !subjectId) {
      alert("Vui lòng điền đầy đủ thông tin và chọn file.");
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", docName);
      formData.append("subject_id", subjectId);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/documents/upload`, {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        setIsUploadOpen(false);
        setFile(null);
        setDocName("");
        setSubjectId("");
        fetchData();
      } else {
        const error = await res.json();
        alert(`Lỗi upload: ${error.detail || "Không rõ nguyên nhân"}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="w-6 h-6 text-red-500" />;
    if (type.includes("word") || type.includes("officedocument")) return <FileText className="w-6 h-6 text-blue-500" />;
    if (type.includes("image")) return <ImageIcon className="w-6 h-6 text-emerald-500" />;
    return <File className="w-6 h-6 text-slate-400" />;
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.subjects?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Lưu Trữ Tài Liệu</h2>
          <p className="text-slate-500 mt-2">Quản lý bài giảng, tài liệu tham khảo và đề thi.</p>
        </div>
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Upload className="w-5 h-5" />
          Tải lên tài liệu
        </button>
      </header>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Tìm kiếm tài liệu theo tên hoặc môn học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
          <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy tài liệu</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            {searchTerm ? "Không có tài liệu nào khớp với tìm kiếm của bạn." : "Bạn chưa tải lên tài liệu nào. Hãy bắt đầu ngay!"}
          </p>
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
          >
            + Tải lên tài liệu đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                  {getFileIcon(doc.file_type)}
                </div>
                <a 
                  href={doc.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Tải về"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
              
              <h3 className="font-bold text-slate-900 mb-1 line-clamp-1" title={doc.name}>
                {doc.name}
              </h3>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-md flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {doc.subjects?.name || "N/A"}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
 
              <a 
                href={doc.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-600 rounded-xl font-semibold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all"
              >
                Xem chi tiết
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between p-8 border-b border-slate-50">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Tải Lên Tài Liệu</h3>
                <p className="text-slate-500 text-sm mt-1">Chọn file và gán vào môn học tương ứng.</p>
              </div>
              <button 
                onClick={() => setIsUploadOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-8">
              <div className="space-y-6">
                {/* Custom File Input */}
                <div className="relative">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Chọn tệp tin</label>
                  <div className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${file ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400'}`}>
                    <input 
                      type="file" 
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {file ? (
                      <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-indigo-500 mb-2" />
                        <span className="text-indigo-900 font-bold text-sm truncate max-w-[250px]">{file.name}</span>
                        <span className="text-indigo-400 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                          <Plus className="w-6 h-6 text-slate-400" />
                        </div>
                        <span className="text-slate-600 font-bold text-sm">Nhấn để chọn hoặc kéo thả file</span>
                        <span className="text-slate-400 text-xs mt-1">Hỗ trợ PDF, Word, Excel, Image</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tên hiển thị</label>
                  <input 
                    type="text" 
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="VD: Bài giảng Chương 1"
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Gán vào môn học</label>
                  <select 
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium transition-all appearance-none"
                    required
                  >
                    <option value="">Chọn môn học...</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="flex-1 px-6 py-3.5 text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-2xl font-bold transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-6 py-3.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold transition-all disabled:opacity-70 flex justify-center items-center gap-2 shadow-lg shadow-indigo-200"
                >
                  {uploading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Đang tải lên...</>
                  ) : (
                    <><Upload className="w-5 h-5" /> Tải lên ngay</>
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
