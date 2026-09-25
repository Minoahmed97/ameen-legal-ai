import React, { useState } from 'react';
import { FileText, Send, Check, Copy, FileDown, RotateCcw, ShieldCheck, AlertCircle, Sparkles, MessageSquare } from 'lucide-react';
import { DeconstructionResult } from '../types';
import { deconstructOpponentBrief } from '../lib/aiLegalEngine';
import { getStoredLawyerProfile } from '../lib/storage';
import { exportToWordDocument } from '../lib/exportDocx';
import { FileUploadArea } from './FileUploadArea';

export const OpponentBriefDeconstructor: React.FC = () => {
  const [opponentTitle, setOpponentTitle] = useState('');
  const [briefSnippet, setBriefSnippet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DeconstructionResult | null>(null);
  const [copied, setCopied] = useState(false);

  const lawyer = getStoredLawyerProfile();

  const handleFileUpload = (text: string, fileInfo: { fileName: string }) => {
    if (!opponentTitle.trim()) {
      setOpponentTitle(`مذكرة الخصم: ${fileInfo.fileName.replace(/\.[^/.]+$/, '')}`);
    }
    if (briefSnippet.trim()) {
      setBriefSnippet(prev => prev + '\n\n' + `[مرفق من ملف الخصم: ${fileInfo.fileName}]\n` + text);
    } else {
      setBriefSnippet(text);
    }
  };

  const handleDeconstruct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!briefSnippet.trim()) return;

    setIsLoading(true);
    try {
      const data = await deconstructOpponentBrief(
        briefSnippet.trim(),
        opponentTitle.trim() || 'مذكرة دفاع وكيل الخصم'
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
تفكيك وتفنيد مذكرة الخصم: ${result.opponentTitle}

ملخص ما استند إليه الخصم:
${result.summary}

العيوب الشكلية والإجرائية في دفاع الخصم:
${result.formalDefects.map(f => `• ${f}`).join('\n')}

الثغرات والتناقضات الموضوعية:
${result.substantiveFlaws.map(s => `• ${s}`).join('\n')}

أوجه الرد والتفنيد القانوني القاطع:
${result.rebuttalArguments.map(r => `• ${r}`).join('\n')}

الأدلة المضادة المطلوبة:
${result.counterEvidence.map(c => `• ${c}`).join('\n')}

صيغة المرافعة المقترحة أمام المحكمة:
${result.suggestedCourtPleading}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportWord = () => {
    if (!result) return;
    const htmlContent = `
      <div style="font-size: 14pt; line-height: 2;">
        <h3 style="color: #991b1b;">تفكيك وتفنيد مذكرة الخصم: ${result.opponentTitle}</h3>
        <p><strong>ملخص مذكرة الخصم:</strong> ${result.summary}</p>

        <h4 style="color: #1e3a8a; margin-top: 15px;">أولاً: الدفوع الشكلية والإجرائية لدحض دعوى الخصم:</h4>
        <ul>${result.formalDefects.map(f => `<li>${f}</li>`).join('')}</ul>

        <h4 style="color: #1e3a8a; margin-top: 15px;">ثانياً: الثغرات والتناقضات الموضوعية في كلام الخصم:</h4>
        <ul>${result.substantiveFlaws.map(s => `<li>${s}</li>`).join('')}</ul>

        <h4 style="color: #15803d; margin-top: 15px;">ثالثاً: حجج الرد والتفنيد القاطع بأحكام القانون والنقض:</h4>
        <ul>${result.rebuttalArguments.map(r => `<li>${r}</li>`).join('')}</ul>

        <h4 style="color: #1e3a8a; margin-top: 15px;">رابعاً: الأدلة والمستندات المضادة:</h4>
        <ul>${result.counterEvidence.map(c => `<li>${c}</li>`).join('')}</ul>

        <h4 style="color: #1e3a8a; margin-top: 20px;">خامساً: صيغة المرافعة والرد المكتوب أمام هيئة المحكمة الموقرة:</h4>
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 5px; font-style: italic;">
          ${result.suggestedCourtPleading.replace(/\n/g, '<br/>')}
        </div>
      </div>
    `;

    exportToWordDocument(`تفنيد مذكرة الخصم - ${result.opponentTitle}`, htmlContent, lawyer);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          كاشف ثغرات مذكرات الخصوم
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mb-2">
          تفكيك وتفنيد مذكرة الخصم
        </h1>
        <p className="text-sm text-slate-400">
          الصق نص مذكرة دفاع الخصم أو مقتطفات منها، ليقوم النظام بتفكيكها واستخراج العيوب الشكلية والموضوعية وصياغة ردود مفحمة.
        </p>
      </div>

      {!result ? (
        <form onSubmit={handleDeconstruct} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              صفة الخصم / عنوان المذكرة:
            </label>
            <input
              type="text"
              value={opponentTitle}
              onChange={(e) => setOpponentTitle(e.target.value)}
              placeholder="مثال: مذكرة دفاع المدعى عليه في الدعوى رقم ٥٤٠ لسنة ٢٠٢٦"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Real File Upload for Opponent's Brief / Evidence */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              رفع مذكرة الخصم أو حافظة مستنداته (Word / PDF / صور وماسح ضوئي / نصوص):
            </label>
            <FileUploadArea
              compact
              onTextExtracted={handleFileUpload}
              label="انقر أو اسحب ملف وورد (.docx)، أو PDF، أو صورة ضوئية لمذكرة الخصم لتفريغ محتواها وتحليله فوراً"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              نص مذكرة الخصم أو الدفوع التي تمسك بها: <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={8}
              value={briefSnippet}
              onChange={(e) => setBriefSnippet(e.target.value)}
              placeholder="انسخ والصق نص مذكرة الخصم أو الدفوع التي أثارها في الجلسة أو حافظة مستنداته..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-7 py-3 rounded-xl shadow-lg shadow-purple-600/20 text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري تفكيك مذكرة الخصم واستخراج الثغرات...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 rotate-180" />
                  تفكيك المذكرة واستخراج الردود القاطعة
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-sm font-bold text-slate-200">
              تقرير تفكيك: {result.opponentTitle}
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                تفكيك مذكرة أخرى
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-bold text-slate-400 mb-1">موجز ما تمسك به الخصم:</div>
              <p className="text-sm text-slate-200 leading-relaxed">{result.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4">
                <div className="text-sm font-bold text-rose-300 flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  العيوب الشكلية والإجرائية لدفاع الخصم
                </div>
                <ul className="space-y-2 text-xs text-slate-200">
                  {result.formalDefects.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4">
                <div className="text-sm font-bold text-amber-300 flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  الثغرات والتناقضات الموضوعية
                </div>
                <ul className="space-y-2 text-xs text-slate-200">
                  {result.substantiveFlaws.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4">
              <div className="text-sm font-bold text-emerald-300 flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                أوجه الرد والتفنيد القانوني الحاسم
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                {result.rebuttalArguments.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4">
              <div className="text-sm font-bold text-blue-300 flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                صيغة المرافعة المكتوبة المقترحة أمام المحكمة
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 leading-loose whitespace-pre-line font-serif">
                {result.suggestedCourtPleading}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
