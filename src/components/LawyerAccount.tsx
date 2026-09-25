import React, { useState, useEffect, useRef } from 'react';
import { UserCheck, Save, CheckCircle2, Phone, Briefcase, Building2, Trash2, Download, Upload, Database, ShieldCheck } from 'lucide-react';
import { LawyerProfile } from '../types';
import { 
  getStoredLawyerProfile, 
  saveStoredLawyerProfile, 
  EMPTY_LAWYER_PROFILE,
  exportAllAppDataAsJson,
  importAllAppDataFromJson,
  getLibraryDocuments,
  getConsultations,
  getDrafts
} from '../lib/storage';

export const LawyerAccount: React.FC = () => {
  const [profile, setProfile] = useState<LawyerProfile>(getStoredLawyerProfile());
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [backupStats, setBackupStats] = useState({ libraryCount: 0, consultationsCount: 0, draftsCount: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshStats = () => {
    setBackupStats({
      libraryCount: getLibraryDocuments().length,
      consultationsCount: getConsultations().length,
      draftsCount: getDrafts().length,
    });
  };

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(getStoredLawyerProfile());
      refreshStats();
    };
    refreshStats();
    window.addEventListener('lawyer-profile-updated', handleUpdate);
    window.addEventListener('library-docs-updated', handleUpdate);
    return () => {
      window.removeEventListener('lawyer-profile-updated', handleUpdate);
      window.removeEventListener('library-docs-updated', handleUpdate);
    };
  }, []);

  const handleChange = (field: keyof LawyerProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const success = saveStoredLawyerProfile(profile);
    if (success) {
      setIsSaved(true);
      setSaveMessage('✓ تم حفظ بياناتك بنجاح! ستظهر ترويستك في كافة المذكرات والاستشارات وملفات Word المصدرة.');
      setTimeout(() => {
        setIsSaved(false);
      }, 5000);
    }
  };

  const handleClearFields = () => {
    if (window.confirm('هل تريد مسح وتفريغ كافة الحقول؟')) {
      setProfile(EMPTY_LAWYER_PROFILE);
      saveStoredLawyerProfile(EMPTY_LAWYER_PROFILE);
      setIsSaved(true);
      setSaveMessage('✓ تم تفريغ الحقول بنجاح.');
      setTimeout(() => setIsSaved(false), 4000);
    }
  };

  const handleExportBackup = () => {
    const jsonStr = exportAllAppDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نسخة_احتياطية_المستشار_أمين_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importAllAppDataFromJson(content);
        if (ok) {
          setProfile(getStoredLawyerProfile());
          refreshStats();
          setIsSaved(true);
          setSaveMessage('✓ تم استيراد واسترجاع كافة البيانات بنجاح تام!');
          setTimeout(() => setIsSaved(false), 5000);
        } else {
          alert('تعذر استيراد الملف، تأكد من صحة ملف النسخة الاحتياطية.');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            بيانات وترويسة المحامي
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
            بيانات المحامي وترويسة المكتب
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            أدخل بياناتك الخاصة هنا (اختياري) لكي تظهر تلقائياً في ترويسة ملفات Word المصدرة والمذكرات القضائية.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearFields}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          تفريغ الحقول
        </button>
      </div>

      {/* Success Notification Banner */}
      {isSaved && (
        <div className="mb-6 bg-emerald-950/80 border-2 border-emerald-500/60 rounded-xl p-4 flex items-center gap-3 text-emerald-200 shadow-xl shadow-emerald-950/50 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-base text-emerald-300">تم الحفظ بنجاح!</div>
            <div className="text-xs sm:text-sm text-emerald-200/90">{saveMessage}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Inputs */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
            <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-400" />
              المعلومات المهنية والنقابية
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  اسم الأستاذ المحامي
                </label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="أدخل اسمك هنا..."
                />
              </div>

              {/* Degree */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  درجة القيد بالنقابة
                </label>
                <select
                  value={profile.degree}
                  onChange={(e) => handleChange('degree', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="محامٍ أمام محكمة النقض">محامٍ أمام محكمة النقض والدستورية والإدارية العليا</option>
                  <option value="محامٍ بالاستئناف العالي ومجلس الدولة">محامٍ بالاستئناف العالي ومجلس الدولة</option>
                  <option value="محامٍ أمام المحاكم الابتدائية">محامٍ أمام المحاكم الابتدائية</option>
                  <option value="محامٍ جدول عام">محامٍ جدول عام</option>
                </select>
              </div>
            </div>

            {/* Law Office Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                اسم المكتب أو الصرح القانوني
              </label>
              <input
                type="text"
                value={profile.officeName}
                onChange={(e) => handleChange('officeName', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="مكتب المحاماة والاستشارات القانونية..."
              />
            </div>

            <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3 pt-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              بيانات التواصل والعنوان (اختياري)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  رقم الهاتف / الواتساب
                </label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="010..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="example@lawyer.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  المحافظة / المدينة
                </label>
                <input
                  type="text"
                  value={profile.governorate}
                  onChange={(e) => handleChange('governorate', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="القاهرة / الجيزة / الإسكندرية..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  العنوان التفصيلي
                </label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="عنوان المكتب..."
                />
              </div>
            </div>

            {/* Primary Save Button */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                يمكنك التعديل أو الحفظ في أي وقت
              </span>

              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-black px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer text-sm"
              >
                <Save className="w-5 h-5" />
                حفظ بيانات المحامي
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-28">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              معاينة الترويسة في ملف Word
            </h3>

            <p className="text-xs text-slate-400 my-3 leading-relaxed">
              هكذا ستظهر بياناتك المسجلة تلقائياً في الترويسة العلوية لكافة ملفات Word المصدرة:
            </p>

            {/* Letterhead Preview Box */}
            <div className="bg-white text-slate-900 rounded-xl p-5 shadow-inner border border-slate-200 font-serif text-right space-y-4">
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                <div>
                  <div className="font-bold text-base text-slate-950">
                    {profile.fullName || '[اسم الأستاذ المحامي]'}
                  </div>
                  <div className="text-[11px] text-slate-700 font-sans">
                    {profile.degree}
                  </div>
                  <div className="text-[11px] text-amber-800 font-semibold font-sans mt-0.5">
                    {profile.officeName || '[اسم المكتب]'}
                  </div>
                </div>

                <div className="text-left font-sans text-[10px] text-slate-600 leading-tight">
                  <div>التاريخ: {new Date().toLocaleDateString('ar-EG')}</div>
                  <div>هاتف: {profile.phone || '............'}</div>
                  <div>{profile.governorate || 'مصر'}</div>
                </div>
              </div>

              {/* Sample Body Content */}
              <div className="text-center font-bold text-blue-900 text-xs py-2 border-y border-dashed border-slate-300">
                مذكرة بدفاع / عريضة دعوى
              </div>

              {/* Footer Preview */}
              <div className="border-t border-slate-300 pt-2 flex justify-between items-end text-[9px] text-slate-500 font-sans">
                <div>{profile.address || 'العنوان'}</div>
                <div className="text-left font-bold text-slate-800">
                  توقيع وصفة المحامي:
                  <br />
                  ..........................
                </div>
              </div>
            </div>

            {/* Data Safety & Backup Card */}
            <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>حفظ وسلامة البيانات والنسخ الاحتياطي</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                كافة مذكراتك ونماذج المكتبة واستشاراتك تُحفظ تلقائياً بأمان في متصفحك. يمكنك تنزيل نسخة احتياطية كاملة أو استرجاعها في أي وقت:
              </p>

              {/* Stats badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <div className="text-amber-400 font-bold text-sm">{backupStats.libraryCount}</div>
                  <div className="text-slate-400">نماذج مكتبة</div>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <div className="text-blue-400 font-bold text-sm">{backupStats.draftsCount}</div>
                  <div className="text-slate-400">مذكرات مصاغة</div>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <div className="text-emerald-400 font-bold text-sm">{backupStats.consultationsCount}</div>
                  <div className="text-slate-400">استشارات مؤصلة</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-3 rounded-xl border border-slate-700 text-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تصدير نسخة احتياطية كاملة (JSON)</span>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportBackup}
                  accept=".json,application/json"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800/60 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-3 rounded-xl border border-slate-700/80 text-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>استيراد واسترجاع بيانات محفوظة (JSON)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
