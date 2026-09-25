import React, { useState } from 'react';
import { BookOpen, Send, Check, Copy, FileDown, RotateCcw, ShieldAlert, Award, FileCheck2, Scale } from 'lucide-react';
import { CaseAnalysisResult } from '../types';
import { analyzeLegalCase } from '../lib/aiLegalEngine';
import { getStoredLawyerProfile } from '../lib/storage';
import { exportToWordDocument } from '../lib/exportDocx';
import { FileUploadArea } from './FileUploadArea';

export const LegalCaseAnalysis: React.FC = () => {
  const [title, setTitle] = useState('');
  const [caseType, setCaseType] = useState('مدني وتجاري');
  const [facts, setFacts] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CaseAnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  const lawyer = getStoredLawyerProfile();

  const handleFileUpload = (text: string, fileInfo: { fileName: string }) => {
    if (!title.trim()) {
      setTitle(fileInfo.fileName.replace(/\.[^/.]+$/, ''));
    }
    if (facts.trim()) {
      setFacts(prev => prev + '\n\n' + `[مرفق من ملف القضية: ${fileInfo.fileName}]\n` + text);
    } else {
      setFacts(text);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facts.trim()) return;

    setIsLoading(true);
    try {
      const data = await analyzeLegalCase(
        title.trim() || 'دراسة قضية ونزاع موضوعي',
        caseType,
        facts.trim()
      );
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `
دراسة وتحليل قضية: ${result.title}
النوع: ${result.caseType}

الملخص:
${result.summary}

نقاط القوة:
${result.strengths.map(s => `• ${s}`).join('\n')}

نقاط الضعف والثغرات:
${result.weaknesses.map(w => `• ${w}`).join('\n')}

القوانين المنطبقة:
${result.applicableLaws.map(l => `• ${l}`).join('\n')}

الدفوع الموصى بها:
${result.recommendedDefenses.map(d => `• ${d}`).join('\n')}

خارطة الإثبات:
${result.evidentiaryRoadmap.map(e => `• ${e}`).join('\n')}

المآل القضائي المقدر:
${result.estimatedOutcome}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportWord = () => {
    if (!result) return;
    const htmlContent = `
      <div style="font-size: 14pt; line-height: 2;">
        <h3 style="color: #1e3a8a;">دراسة وتحليل قضية: ${result.title} (${result.caseType})</h3>
        <p><strong>ملخص الواقعة:</strong> ${result.summary}</p>

        <h4 style="color: #15803d; margin-top: 15px;">نقاط القوة والمكاسب الاستراتيجية:</h4>
        <ul>${result.strengths.map(s => `<li>${s}</li>`).join('')}</ul>

        <h4 style="color: #b91c1c; margin-top: 15px;">نقاط الضعف والمخاطر الواجب تلافيها:</h4>
        <ul>${result.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>

        <h4 style="color: #1e3a8a; margin-top: 15px;">القوانين والمواد المنطبقة:</h4>
        <ul>${result.applicableLaws.map(l => `<li>${l}</li>`).join('')}</ul>

        <h4 style="color: #1e3a8a; margin-top: 15px;">الدفوع الإجرائية والموضوعية المقترحة:</h4>
        <ul>${result.recommendedDefenses.map(d => `<li>${d}</li>`).join('')}</ul>

        <h4 style="color: #1e3a8a; margin-top: 15px;">خارطة أدلة الإثبات والتحقيق القضائي:</h4>
        <ul>${result.evidentiaryRoadmap.map(e => `<li>${e}</li>`).join('')}</ul>

        <div style="background: #f0fdf4; border-right: 4px solid #16a34a; padding: 10px; margin-top: 20px;">
          <strong>التقدير القضائي لمآل النزاع:</strong> ${result.estimatedOutcome}
        </div>
      </div>
    `;
    exportToWordDocument(`دراسة قضية - ${result.title}`, htmlContent, lawyer);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          الفحص والتحليل القضائي الشامل
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mb-2">
          دراسة وتحليل القضايا
        </h1>
        <p className="text-sm text-slate-400">
          استخراج استراتيجية التقاضي المتكاملة: نقاط القوة والضعف، الدفوع الحاسمة، وخارطة أدلة الإثبات.
        </p>
      </div>

      {!result ? (
        <form onSubmit={handleAnalyze} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                عنوان أو موضوع القضية:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: دعوى فسخ عقد بيع عقاري مع التعويض"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                طبيعة النزاع والمحكمة المختصة:
              </label>
              <select
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="مدني وتجاري">مدني وتجاري</option>
                <option value="جنائي وجنح">جنائي وجنح وجنايات</option>
                <option value="أحوال شخصية وأسرة">أحوال شخصية وأسرة</option>
                <option value="قضاء إداري ومجلس دولة">قضاء إداري ومجلس دولة</option>
                <option value="عمال وتأمينات">عمال ومنازعات عمل</option>
                <option value="أمور وقتية ومستعجلة">قضاء مستعجل وأوامر أداء</option>
              </select>
            </div>
          </div>

          {/* File Upload for Case Documents */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              رفع ملف القضية أو محضر الشرطة أو الحكم (Word / PDF / صور وماسح ضوئي / نصوص):
            </label>
            <FileUploadArea
              compact
              onTextExtracted={handleFileUpload}
              label="انقر أو اسحب ملف وورد (.docx)، أو PDF، أو صورة محضر/حكم لاستخراج وقائع القضية تلقائياً"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              سرد وقائع القضية والمستندات المتاحة: <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={6}
              value={facts}
              onChange={(e) => setFacts(e.target.value)}
              placeholder="اكتب وقائع القضية بالتفصيل، وتواريخ الإجراءات السابقة إن وجدت، والمستندات التي يمتلكها الموكل..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-7 py-3 rounded-xl shadow-lg shadow-amber-500/20 text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  جاري تفكيك القضية واستخراج الدفوع...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 rotate-180" />
                  بدء التحليل القضائي الشامل
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-sm font-bold text-slate-200">
              تقرير فحص القضية: {result.title}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'تم النسخ' : 'نسخ التقرير'}
              </button>
              <button
                onClick={handleExportWord}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/20"
              >
                <FileDown className="w-3.5 h-3.5" />
                تصدير Word (.doc)
              </button>
              <button
                onClick={() => setResult(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                تحليل قضية أخرى
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-bold text-slate-400 mb-1">ملخص الوقائع والنزاع:</div>
              <p className="text-sm text-slate-200 leading-relaxed">{result.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4">
                <div className="text-sm font-bold text-emerald-300 flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-emerald-400" />
                  نقاط القوة الاستراتيجية
                </div>
                <ul className="space-y-2 text-xs text-slate-200">
                  {result.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4">
                <div className="text-sm font-bold text-rose-300 flex items-center gap-2 mb-3">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  نقاط الضعف والثغرات المحتملة
                </div>
                <ul className="space-y-2 text-xs text-slate-200">
                  {result.weaknesses.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4">
              <div className="text-sm font-bold text-amber-300 flex items-center gap-2 mb-3">
                <Scale className="w-4 h-4 text-amber-400" />
                الدفوع القضائية الحاسمة الموصى بها
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {result.recommendedDefenses.map((d, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">◄</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4">
              <div className="text-sm font-bold text-blue-300 flex items-center gap-2 mb-3">
                <FileCheck2 className="w-4 h-4 text-blue-400" />
                خارطة أدلة الإثبات والتحقيق القضائي
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {result.evidentiaryRoadmap.map((e, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 text-emerald-200 text-sm font-semibold">
              <div className="text-xs font-bold text-emerald-400 mb-1">التقدير القضائي لفرص النجاح:</div>
              {result.estimatedOutcome}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
