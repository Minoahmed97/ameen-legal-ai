import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Check, 
  Copy, 
  FileDown, 
  RotateCcw, 
  Building2, 
  Printer, 
  Scale, 
  Info, 
  BookOpen, 
  FolderKanban, 
  CheckCircle2, 
  X,
  FileText
} from 'lucide-react';
import { LegalDraftResult, LibraryDocument } from '../types';
import { draftLegalDocument } from '../lib/aiLegalEngine';
import { getStoredLawyerProfile, saveDraftToHistory, getLibraryDocuments, findMatchingLibraryDocuments } from '../lib/storage';
import { exportToWordDocument } from '../lib/exportDocx';
import { FileUploadArea } from './FileUploadArea';

export const LawyerStyleDrafting: React.FC = () => {
  const [docType, setDocType] = useState<LegalDraftResult['documentType']>('مذكرة دفاع');
  const [subjectOrFacts, setSubjectOrFacts] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LegalDraftResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Library Integration State
  const [libraryDocs, setLibraryDocs] = useState<LibraryDocument[]>(getLibraryDocuments());
  const [selectedLibraryDocId, setSelectedLibraryDocId] = useState<string>('');
  const [matchedDocs, setMatchedDocs] = useState<LibraryDocument[]>([]);

  const lawyer = getStoredLawyerProfile();

  useEffect(() => {
    const handleUpdate = () => {
      setLibraryDocs(getLibraryDocuments());
    };
    window.addEventListener('library-docs-updated', handleUpdate);
    return () => window.removeEventListener('library-docs-updated', handleUpdate);
  }, []);

  // Whenever subject or docType changes, look for smart matches in the library
  useEffect(() => {
    if (subjectOrFacts.trim().length > 5 || docType) {
      const matches = findMatchingLibraryDocuments(subjectOrFacts.trim());
      setMatchedDocs(matches.slice(0, 4));
    } else {
      setMatchedDocs([]);
    }
  }, [subjectOrFacts, docType]);

  const handleFileUpload = (text: string, fileInfo: { fileName: string }) => {
    // Append or set the extracted text into the facts/subject input
    if (subjectOrFacts.trim()) {
      setSubjectOrFacts(prev => prev + '\n\n' + `[مرفق من ملف: ${fileInfo.fileName}]\n` + text);
    } else {
      setSubjectOrFacts(text);
    }
  };

  const handleDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectOrFacts.trim()) return;

    // Selected template or auto matched from library
    let referenceContent: string | undefined = undefined;
    if (selectedLibraryDocId) {
      const found = libraryDocs.find(d => d.id === selectedLibraryDocId);
      if (found) referenceContent = found.content;
    } else if (matchedDocs.length > 0) {
      referenceContent = matchedDocs[0].content;
    }

    setIsLoading(true);
    try {
      const draft = await draftLegalDocument(docType, subjectOrFacts.trim(), referenceContent);
      setResult(draft);
      saveDraftToHistory(draft);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.fullDraftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportWord = () => {
    if (!result) return;
    const htmlContent = `
      <div style="font-size: 14pt; line-height: 2.1; font-family: 'Amiri', serif;">
        <div style="white-space: pre-line; text-align: justify;">
          ${result.fullDraftText.replace(/\n/g, '<br/>')}
        </div>
      </div>
    `;
    exportToWordDocument(
      `${result.documentType} - مسودة قضائية`,
      htmlContent,
      lawyer
    );
  };

  const activeReferenceDoc = libraryDocs.find(d => d.id === selectedLibraryDocId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
          <Scale className="w-3.5 h-3.5 text-amber-400" />
          معتمد على قوانين محكمة النقض ومجلس الدولة والمحكمة الإدارية العليا
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mb-2">
          صياغة المذكرات والعرائض القضائية
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          لا داعي لإدخال أسماء أطراف أو أرقام قضايا؛ فقط اكتب موضوع النزاع أو ارفع ملفات القضية (Word/PDF/صور)، وسيقوم النظام بتأليف العريضة والمرافعة القضائية فوراً بناءً على النماذج المشابهة المحفوظة في <strong>المكتبة</strong>، مع دمج أحكام محكمة النقض والإدارية العليا، لتتمكن من تصديرها لوورد وتعبئة بيانات أطرافك هناك كما تحب.
        </p>
      </div>

      {!result ? (
        <form onSubmit={handleDraft} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-300">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>ملاحظة للمحامي:</strong> لن يطلب منك البرنامج ملء أي بيانات شكلية للخصوم أو المحكمة هنا. اذكر فقط فكرة وموضوع النزاع وسيتكفل الذكاء الاصطناعي بكامل الصياغة القانونية وأحكام النقض ومجلس الدولة المنطبقة.
            </div>
          </div>

          {/* Real File Upload Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              رفع مستندات النزاع أو عقد أو حكم (Word / PDF / صور وماسح ضوئي / نصوص) لإدراجها تلقائياً:
            </label>
            <FileUploadArea
              compact
              onTextExtracted={handleFileUpload}
              label="انقر أو اسحب ملف وورد (.docx)، أو PDF، أو صورة محرر قضائي لاستخراج النص وإدراجه في موضوع الصياغة فوراً"
            />
          </div>

          {/* Reference Template from Library */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-amber-400" />
                الاستناد إلى نموذج قضائي مشابه من "المكتبة القانونية":
              </div>

              {libraryDocs.length > 0 && (
                <div className="text-[11px] text-slate-400">
                  {libraryDocs.length} نموذج محفوظ في مكتبتك
                </div>
              )}
            </div>

            {libraryDocs.length > 0 ? (
              <div>
                <select
                  value={selectedLibraryDocId}
                  onChange={(e) => setSelectedLibraryDocId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- الصياغة الذكية التلقائية (أو مطابقة أقرب نموذج مشابه آلياً) --</option>
                  {libraryDocs.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      [{doc.category}] {doc.title}
                    </option>
                  ))}
                </select>

                {activeReferenceDoc && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">سيتم احتذاء قالب وأسلوب وطلبات: <strong>{activeReferenceDoc.title}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedLibraryDocId('')}
                      className="p-1 text-slate-400 hover:text-white"
                      title="إلغاء التحديد اليدوي"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>المكتبة فارغة حالياً. يمكنك إضافة نماذجك المفضلة من تبويب "المكتبة" ليحتذي حذوها النظام دائماً.</span>
              </div>
            )}

            {/* Smart Suggested Matches from Library */}
            {!selectedLibraryDocId && matchedDocs.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  نماذج مشابهة عُثر عليها في مكتبتك تتوافق مع موضوعك:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matchedDocs.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedLibraryDocId(m.id)}
                      className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-[11px] border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3 h-3 text-amber-400" />
                      <span>{m.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              اختر نوع المحرر القضائي المطلوب صياغته:
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            >
              <option value="مذكرة دفاع">مذكرة دفاع ختامية (مدني / جنائي / تجاري / إداري)</option>
              <option value="صحيفة دعوى">صحيفة افتتاح دعوى أو عريضة دعوى قضائية</option>
              <option value="إنذار رسمي على يد محضر">إنذار رسمي على يد محضر (تكليف بالوفاء أو إعذار)</option>
              <option value="تقرير طعن بالنقض">تقرير وأسباب طعن بالنقض أو طعن أمام الإدارية العليا</option>
              <option value="عقد اتفاق وتصالح">عقد اتفاق وتصالح قضائي رسمي</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              اكتب موضوع النزاع أو ملخص ما تريد المطالبة به أو الدفع به: <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={7}
              value={subjectOrFacts}
              onChange={(e) => setSubjectOrFacts(e.target.value)}
              placeholder="مثال: إخلال مقاول بتسليم فيلا سكنية في الميعاد المحدد رغم استلام ٨٠٪ من المستحقات، ونريد المطالبة بالفسخ والشرط الجزائي والتعويض... أو: موظف تم نقله تعسفياً بقرار إداري مخالف للقانون ونريد دعوى إلغاء أمام القضاء الإداري مع الشق المستعجل..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed resize-y"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              يتم دمج نصوص القانون وقضاء محكمة النقض والإدارية العليا بأسلوب مرافعة رفيع.
            </span>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-8 py-3.5 rounded-xl shadow-lg shadow-amber-500/20 text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  جاري صياغة المحرر القضائي الشامل...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 rotate-180" />
                  صياغة المذكرة القضائية فوراً
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-sm font-bold text-slate-200">
              صيغة قضائية مكتملة: {result.documentType}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'تم النسخ' : 'نسخ النص'}
              </button>
              <button
                onClick={handleExportWord}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-colors"
                title="تصدير إلى وورد للتعديل وإضافة أرقام القضايا والأسماء مع ترويسة المحامي"
              >
                <FileDown className="w-3.5 h-3.5" />
                تصدير Word (.doc)
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                طباعة
              </button>
              <button
                onClick={() => setResult(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                صياغة جديدة
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl font-serif text-slate-200 leading-loose text-sm whitespace-pre-wrap selection:bg-amber-500/30">
            {result.fullDraftText}
          </div>
        </div>
      )}
    </div>
  );
};
