import React, { useState } from 'react';
import { Scale, Send, FileDown, Copy, Check, Printer, RotateCcw, AlertTriangle, BookOpen, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { LegalCategory, LegalConsultation } from '../types';
import { generateLegalConsultation, CATEGORY_LABELS } from '../lib/aiLegalEngine';
import { getStoredLawyerProfile, saveConsultationToHistory } from '../lib/storage';
import { exportToWordDocument } from '../lib/exportDocx';
import { FileUploadArea } from './FileUploadArea';

export const LegalAdvisor: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<LegalCategory>('civil');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LegalConsultation | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const lawyer = getStoredLawyerProfile();

  const handleFileUpload = (text: string, fileInfo: { fileName: string }) => {
    if (query.trim()) {
      setQuery(prev => prev + '\n\n' + `[مرفق من مستند: ${fileInfo.fileName}]\n` + text);
    } else {
      setQuery(text);
    }
  };

  const handleConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setErrorMsg('يرجى كتابة وقائع المسألة أو الاستفسار القانوني أولاً.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const consultation = await generateLegalConsultation(query.trim(), category);
      setResult(consultation);
      saveConsultationToHistory(consultation);
    } catch (err) {
      console.error(err);
      setErrorMsg('حدث خطأ أثناء إعداد الاستشارة القانونية، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `
استشارة قانونية: ${result.categoryLabel}
التاريخ: ${new Date(result.createdAt).toLocaleDateString('ar-EG')}

الرأي والتحليل القانوني:
${result.legalOpinion}

السند القانوني المنطبق:
${result.statutoryArticles.map(s => `• ${s.article} من ${s.law}: ${s.text}`).join('\n')}

أهم مبادئ محكمة النقض:
${result.cassationPrinciples.map(p => `• ${p}`).join('\n')}

الخطوات الإجرائية والمواعيد:
${result.proceduralSteps.map(s => `• ${s}`).join('\n')}

المخاطر والتوصيات الاحترازية:
${result.risksAndRecommendations.map(r => `• ${r}`).join('\n')}

الخلاصة:
${result.conclusion}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportWord = () => {
    if (!result) return;
    const htmlContent = `
      <div style="font-size: 14pt; line-height: 2;">
        <h3 style="color: #1e3a8a; border-bottom: 2px solid #cbd5e1; padding-bottom: 5px;">الرأي القانوني المباشر في الموضوع</h3>
        <p style="text-align: justify;">${result.legalOpinion}</p>

        <h3 style="color: #1e3a8a; border-bottom: 2px solid #cbd5e1; padding-bottom: 5px; margin-top: 20px;">السند التشريعي والنصوص المنطبقة</h3>
        <ul>
          ${result.statutoryArticles.map(s => `<li><strong>${s.article} من ${s.law}:</strong> ${s.text}</li>`).join('')}
        </ul>

        <h3 style="color: #1e3a8a; border-bottom: 2px solid #cbd5e1; padding-bottom: 5px; margin-top: 20px;">ثالثاً: أحكام وقواعد محكمة النقض المؤيدة</h3>
        <ul>
          ${result.cassationPrinciples.map(p => `<li>${p}</li>`).join('')}
        </ul>

        <h3 style="color: #1e3a8a; border-bottom: 2px solid #cbd5e1; padding-bottom: 5px; margin-top: 20px;">رابعاً: الإجراءات الواجب اتخاذها والمواعيد القانونية</h3>
        <ol>
          ${result.proceduralSteps.map(s => `<li>${s}</li>`).join('')}
        </ol>

        <h3 style="color: #991b1b; border-bottom: 2px solid #fecaca; padding-bottom: 5px; margin-top: 20px;">خامساً: التحذيرات والتوصيات الوقائية</h3>
        <ul>
          ${result.risksAndRecommendations.map(r => `<li>${r}</li>`).join('')}
        </ul>

        <h3 style="color: #15803d; border-bottom: 2px solid #bbf7d0; padding-bottom: 5px; margin-top: 20px;">سادساً: خلاصة الرأي القانوني النهائي</h3>
        <p style="font-weight: bold; background: #f0fdf4; padding: 10px; border-right: 4px solid #16a34a;">${result.conclusion}</p>
      </div>
    `;

    exportToWordDocument(
      `استشارة قانونية - ${result.categoryLabel}`,
      htmlContent,
      lawyer
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setResult(null);
    setQuery('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Banner - Clean and dignified without distracting clickable cards */}
      <div className="mb-8 text-center sm:text-right">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
          <Scale className="w-3.5 h-3.5" />
          المستشار القانوني المؤصل بالتشريعات وأحكام النقض
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mb-2">
          المستشار القانوني الذكي
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          شاشة مخصصة لتقديم الرأي القانوني التأصيلي المدعوم بنصوص المواد وأحكام محكمة النقض والإجراءات التنفيذية بدون أي تشتيت.
        </p>
      </div>

      {/* Input Section - Shown when no result or alongside */}
      {!result ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600"></div>

          <form onSubmit={handleConsultation} className="space-y-6">
            {/* Category Selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                اختر فرع القانون المختص:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LegalCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key} className="bg-slate-900 text-slate-100">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload Area */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                إرفاق مستندات الاستشارة أو العقد أو الحكم (Word / PDF / صور وماسح ضوئي / نصوص):
              </label>
              <FileUploadArea
                compact
                onTextExtracted={handleFileUpload}
                label="انقر أو اسحب ملف وورد (.docx)، أو PDF، أو صورة وثيقة لاستخراج النص وإدراجه تلقائياً في الاستشارة"
              />
            </div>

            {/* Inquiry Textarea */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                وقائع المسألة أو السؤال القانوني:
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="اكتب وقائع القضية أو السؤال القانوني بالتفصيل هنا (مثال: مستأجر امتنع عن سداد الأجرة لمدة ثلاثة أشهر رغم إعلانه، ما الإجراء القانوني لطرده والمطالبة بالأجرة المتأخرة والتعويض؟)..."
                rows={6}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-y"
              />
              {errorMsg && (
                <p className="mt-2 text-xs font-semibold text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {errorMsg}
                </p>
              )}
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                يتم تأصيل الاستشارة وفق نصوص القوانين المصرية وأحدث أحكام محكمة النقض.
              </span>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    جاري إعداد التأصيل القانوني...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 rotate-180" />
                    طلب الاستشارة القانونية الفورية
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Result Box - Pure, clean, comprehensive legal opinion */
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-bold text-slate-200">
                النتيجة القانونية: {result.categoryLabel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                title="نسخ نص الاستشارة"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'تم النسخ' : 'نسخ الاستشارة'}
              </button>

              <button
                onClick={handleExportWord}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-colors"
                title="تصدير إلى ملف وورد مع ترويسة المحامي الرسمية"
              >
                <FileDown className="w-3.5 h-3.5" />
                تصدير Word (.doc)
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                title="طباعة"
              >
                <Printer className="w-3.5 h-3.5" />
                طباعة
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                title="بدء استشارة جديدة"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                استشارة جديدة
              </button>
            </div>
          </div>

          {/* Dedicated Result Card (مربع النتيجة للمستشار) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative space-y-6">
            {/* Header info */}
            <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div>
                {lawyer.fullName ? (
                  <>بواسطة: <span className="text-amber-400 font-semibold">{lawyer.fullName}</span> {lawyer.officeName && `(${lawyer.officeName})`}</>
                ) : (
                  <span className="text-amber-400 font-semibold">منظومة المستشار القضائي الذكي</span>
                )}
              </div>
              <div>
                تاريخ الاستشارة: {new Date(result.createdAt).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Question Recap */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-bold text-slate-400 mb-1">الوقائع والاستفسار المعروض:</div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">{result.query}</p>
            </div>

            {/* 1. Direct Legal Opinion */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <BookOpen className="w-5 h-5 text-amber-400" />
                الرأي القانوني المباشر في موضوع المسألة:
              </div>
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 text-slate-200 text-sm leading-loose text-justify font-sans">
                {result.legalOpinion}
              </div>
            </div>

            {/* 2. Statutory Articles */}
            {result.statutoryArticles && result.statutoryArticles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-base">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  النصوص والمواد القانونية المنطبقة
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {result.statutoryArticles.map((statute, idx) => (
                    <div key={idx} className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-3.5 text-xs sm:text-sm">
                      <div className="font-bold text-blue-300 mb-1 flex items-center justify-between">
                        <span>{statute.article}</span>
                        <span className="text-slate-400 font-normal">{statute.law}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed italic">
                        "{statute.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Cassation Court Principles */}
            {result.cassationPrinciples && result.cassationPrinciples.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-base">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  ثالثاً: مبادئ وأحكام محكمة النقض المصرية
                </div>
                <div className="space-y-2">
                  {result.cassationPrinciples.map((principle, idx) => (
                    <div key={idx} className="bg-purple-950/20 border border-purple-900/30 rounded-xl p-3.5 text-xs sm:text-sm text-purple-200/90 leading-relaxed flex items-start gap-2">
                      <span className="font-bold text-purple-400 mt-0.5">•</span>
                      <span>{principle}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Procedural Steps & Deadlines */}
            {result.proceduralSteps && result.proceduralSteps.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  رابعاً: الإجراءات الواجب اتخاذها والمواعيد القانونية
                </div>
                <div className="space-y-2">
                  {result.proceduralSteps.map((step, idx) => (
                    <div key={idx} className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-3.5 text-xs sm:text-sm text-emerald-200/90 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Risks and Precautions */}
            {result.risksAndRecommendations && result.risksAndRecommendations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  خامساً: المحاذير والتوصيات الاحترازية
                </div>
                <div className="space-y-2">
                  {result.risksAndRecommendations.map((risk, idx) => (
                    <div key={idx} className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-3.5 text-xs sm:text-sm text-amber-200/90 flex items-start gap-2">
                      <span className="font-bold text-amber-400">⚠️</span>
                      <span className="leading-relaxed">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Conclusion */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 text-emerald-200">
              <div className="text-xs font-bold text-emerald-400 mb-1">
                سادساً: خلاصة الرأي القانوني النهائي
              </div>
              <p className="text-sm font-semibold leading-relaxed">
                {result.conclusion}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
