import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image, FileCode, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { extractTextFromFile, ExtractedFileResult } from '../lib/fileProcessor';

interface FileUploadAreaProps {
  onTextExtracted: (text: string, fileInfo: { fileName: string; fileType: string; fileSize: number }) => void;
  label?: string;
  compact?: boolean;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  onTextExtracted,
  label = 'رفع ملف وورد (Word) أو PDF أو صورة أو نص لقراءته واستخراجه تلقائياً',
  compact = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState<ExtractedFileResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const result = await extractTextFromFile(file);
      if (result.success && result.extractedText) {
        setCurrentFile(result);
        onTextExtracted(result.extractedText, {
          fileName: result.fileName,
          fileType: result.fileType,
          fileSize: result.fileSize,
        });
      } else {
        setErrorMsg(result.error || 'تعذر استخراج النص من هذا الملف، يرجى تجربة ملف آخر.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'حدث خطأ أثناء معالجة الملف.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentFile(null);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl transition-all cursor-pointer ${
          isDragging
            ? 'border-amber-400 bg-amber-500/10'
            : currentFile
            ? 'border-emerald-500/50 bg-emerald-950/20'
            : 'border-slate-700/80 hover:border-amber-500/50 bg-slate-950/50 hover:bg-slate-950'
        } ${compact ? 'p-3' : 'p-4 sm:p-5'}`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              currentFile ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-amber-400'
            }`}>
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
              ) : currentFile ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-200">
                {isProcessing
                  ? 'جاري قراءة واستخراج النصوص القانونية بدقة عالية...'
                  : currentFile
                  ? `تم استخراج محتوى: ${currentFile.fileName}`
                  : label}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-emerald-400 font-semibold">ملفات Word (.docx)</span>
                <span>•</span>
                <span className="text-blue-400 font-semibold">مستندات PDF (.pdf)</span>
                <span>•</span>
                <span className="text-purple-400 font-semibold">صور ومستندات ممسوحة (OCR)</span>
                <span>•</span>
                <span>نصوص (.txt)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentFile ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {(currentFile.fileSize / 1024).toFixed(0)} ك.ب
                </span>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                  title="إلغاء الملف المرفق"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors">
                اختر ملفاً أو اسحبه هنا
              </span>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mt-2 text-xs font-semibold text-rose-400 flex items-center gap-1.5 pt-2 border-t border-rose-900/30">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
