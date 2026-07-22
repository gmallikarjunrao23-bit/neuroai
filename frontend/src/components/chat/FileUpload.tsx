"use client";

import { useRef, useState } from "react";
import { Paperclip, X, FileText, Image, Upload } from "lucide-react";

interface FileItem {
  file: File;
  preview?: string;
  uploading?: boolean;
  uploaded?: boolean;
  url?: string;
  error?: boolean;
}

interface FileUploadProps {
  onFilesReady: (files: Array<{ name: string; url: string; type: string }>) => void;
  disabled?: boolean;
}

export function FileUpload({ onFilesReady, disabled }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<FileItem[]>([]);
  const API_BASE = "https://backend-production-87c9.up.railway.app";

  const uploadFile = async (fileItem: FileItem, index: number) => {
    const formData = new FormData();
    formData.append("file", fileItem.file);
    
    setItems(prev => prev.map((item, i) => i === index ? { ...item, uploading: true } : item));

    try {
      const res = await fetch(`${API_BASE}/api/v1/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("modelhub_token")}` },
        body: formData
      });
      const data = await res.json();
      
      if (data.url) {
        setItems(prev => prev.map((item, i) => i === index ? { 
          ...item, uploading: false, uploaded: true, url: data.url 
        } : item));
        
        // Notify parent
        const readyFiles = items.map((item, i) => {
          if (i === index) return { name: item.file.name, url: data.url, type: item.file.type };
          if (item.uploaded && item.url) return { name: item.file.name, url: item.url, type: item.file.type };
          return null;
        }).filter(Boolean) as Array<{ name: string; url: string; type: string }>;
        
        // Also add previously uploaded files
        const allReady = items
          .filter((_, i) => i !== index)
          .filter(item => item.uploaded && item.url)
          .map(item => ({ name: item.file.name, url: item.url!, type: item.file.type }));
        
        allReady.push({ name: fileItem.file.name, url: data.url, type: fileItem.file.type });
        onFilesReady(allReady);
      } else {
        setItems(prev => prev.map((item, i) => i === index ? { ...item, uploading: false, error: true } : item));
      }
    } catch {
      setItems(prev => prev.map((item, i) => i === index ? { ...item, uploading: false, error: true } : item));
    }
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newItems = files.map(file => {
      const item: FileItem = { file };
      if (file.type.startsWith("image/")) {
        item.preview = URL.createObjectURL(file);
      }
      return item;
    });
    
    const startIndex = items.length;
    setItems(prev => [...prev, ...newItems]);
    
    // Upload each file
    newItems.forEach((item, idx) => {
      uploadFile(item, startIndex + idx);
    });
    
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    const remaining = items.filter((_, i) => i !== index);
    setItems(remaining);
    
    // Update parent with remaining files
    const readyFiles = remaining
      .filter(item => item.uploaded && item.url)
      .map(item => ({ name: item.file.name, url: item.url!, type: item.file.type }));
    onFilesReady(readyFiles);
  };

  return (
    <>
      <input ref={inputRef} type="file" multiple 
        accept="image/*,.pdf,.doc,.docx,.txt,.py,.js,.ts,.jsx,.tsx,.css,.html,.json,.md,.csv,.xlsx,.ppt,.pptx" 
        onChange={handleSelect} className="hidden" />

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-2 max-w-full">
          {items.map((item, i) => (
            <div key={i} className="relative group">
              {item.preview && item.uploading ? (
                <div className="w-16 h-16 rounded-lg bg-secondary border border-border flex items-center justify-center animate-pulse">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
              ) : item.preview && item.uploaded ? (
                <div className="relative">
                  <img src={item.preview} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => removeFile(i)} className="p-0.5 rounded-full bg-red-500 text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : item.uploading ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs text-muted-foreground">
                  <Upload className="w-3 h-3 animate-bounce" />
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary border border-border text-xs text-muted-foreground group">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="max-w-[80px] truncate">{item.file.name}</span>
                  <button onClick={() => removeFile(i)} className="text-muted-foreground/50 hover:text-red-400 transition-colors ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {item.uploaded && !item.preview && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
              {item.error && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center">
                  <X className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button onClick={() => inputRef.current?.click()} disabled={disabled}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40" title="Attach files">
        <Paperclip className="w-5 h-5" />
      </button>
    </>
  );
}
