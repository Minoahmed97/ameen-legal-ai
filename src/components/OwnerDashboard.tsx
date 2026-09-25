import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2, 
  Users, 
  Scale, 
  FileText, 
  Activity, 
  Bell, 
  Save, 
  Sparkles,
  Lock,
  Unlock,
  AlertCircle,
  Crown,
  Trash2
} from 'lucide-react';
import { OwnerSettings } from '../types';
import { getStoredOwnerSettings, saveStoredOwnerSettings, toggleFreeAccessMode, purgeAllStoredData } from '../lib/storage';

export const OwnerDashboard: React.FC = () => {
  const [settings, setSettings] = useState<OwnerSettings>(getStoredOwnerSettings());
  const [systemNotice, setSystemNotice] = useState(settings.systemNotice);
  const [trialDays, setTrialDays] = useState(settings.trialDays);
  const [allowRegistrations, setAllowRegistrations] = useState(settings.allowRegistrations);
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'info' | 'warning'; message: string } | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      const current = getStoredOwnerSettings();
      setSettings(current);
      setSystemNotice(current.systemNotice);
      setTrialDays(current.trialDays);
      setAllowRegistrations(current.allowRegistrations);
    };

    window.addEventListener('owner-settings-updated', handleUpdate);
    return () => window.removeEventListener('owner-settings-updated', handleUpdate);
  }, []);

  // Primary toggle handler for Free Access Mode
  const handleToggleFreeAccess = () => {
    const newStatus = toggleFreeAccessMode();
    setSettings(prev => ({ ...prev, freeAccessMode: newStatus }));

    if (newStatus) {
      setActionAlert({
        type: 'success',
        message: '✓ تم تشغيل الاستخدام المجاني بنجاح! يمكن لجميع المحامين استخدام كافة الميزات بلا قيود.',
      });
    } else {
      setActionAlert({
        type: 'warning',
        message: '⚠️ تم إيقاف الاستخدام المجاني الشامل وتفعيل نظام الاشتراكات.',
      });
    }

    setTimeout(() => {
      setActionAlert(null);
    }, 6000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: OwnerSettings = {
      ...settings,
      systemNotice,
      trialDays: Number(trialDays),
      allowRegistrations,
      lastUpdated: new Date().toISOString(),
    };
    saveStoredOwnerSettings(updated);
    setActionAlert({
      type: 'success',
      message: '✓ تم حفظ إعدادات لوحة المالك والإشعار العام بنجاح.',
    });
    setTimeout(() => setActionAlert(null), 5000);
  };

  const handlePurgeAll = () => {
    if (window.confirm('هل أنت متأكد من تفريغ وحذف كافة البيانات المحفوظة على التطبيق نهائياً؟')) {
      purgeAllStoredData();
      setActionAlert({
        type: 'success',
        message: '✓ تم حذف وتفريغ كافة البيانات المحفوظة بنجاح والتطبيق الآن خالٍ ونظيف تماماً.',
      });
      setTimeout(() => setActionAlert(null), 6000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            منطقة الإدارة المركزية السرية (المالك فقط)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
            لوحة تحكم المالك
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            إدارة الاستخدام المجاني للتطبيق، حذف وتفريغ البيانات المحفوظة، وبث التنبيهات العامة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePurgeAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-xs font-bold transition-colors cursor-pointer"
            title="تفريغ كافة البيانات والقضايا المحفوظة فوراً"
          >
            <Trash2 className="w-3.5 h-3.5" />
            تفريغ كافة بيانات التطبيق
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionAlert && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-xl ${
            actionAlert.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
              : actionAlert.type === 'warning'
              ? 'bg-amber-950/90 border-amber-500/60 text-amber-200'
              : 'bg-blue-950/90 border-blue-500/60 text-blue-200'
          }`}
        >
          {actionAlert.type === 'success' ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
          )}
          <div className="font-bold text-sm sm:text-base leading-relaxed">
            {actionAlert.message}
          </div>
        </div>
      )}

      {/* 1. MASTER FREE ACCESS TOGGLE */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 border-2 border-purple-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-purple-500 via-amber-400 to-emerald-400"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Crown className="w-6 h-6 text-amber-400" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
                  زر تشغيل / إيقاف الاستخدام المجاني للتطبيق
                </h2>
                <div className="text-xs text-purple-300 font-semibold">
                  Global Free Access Master Switch
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              تحكم بلمسة واحدة في إتاحة التطبيق مجاناً لجميع الزوار والمحامين أو تقييده بنظام الاشتراكات. التغيير يسرى فورياً.
            </p>

            <div className="pt-1 flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400">الحالة الراهنة:</span>
              {settings.freeAccessMode ? (
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-lg shadow-emerald-500/20">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  ● الاستخدام المجاني متاح وشغال حالياً للجميع
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black bg-rose-500/20 text-rose-300 border border-rose-500/50">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                  ○ الاستخدام المجاني معطل (يتطلب اشتراكاً)
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end justify-center shrink-0 border-t lg:border-t-0 lg:border-r border-slate-800 pt-4 lg:pt-0 lg:pr-6">
            <button
              onClick={handleToggleFreeAccess}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-sm sm:text-base shadow-2xl transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] ${
                settings.freeAccessMode
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-600/30'
              }`}
            >
              {settings.freeAccessMode ? (
                <>
                  <Unlock className="w-6 h-6 text-slate-950" />
                  <div className="text-right">
                    <div>الاستخدام المجاني مفعّل الآن</div>
                    <div className="text-xs font-normal opacity-85">اضغط هنا لإيقافه وتفعيل الاشتراكات</div>
                  </div>
                  <ToggleRight className="w-7 h-7 text-slate-950 ml-2" />
                </>
              ) : (
                <>
                  <Lock className="w-6 h-6 text-purple-200" />
                  <div className="text-right">
                    <div>الاستخدام المجاني متوقف</div>
                    <div className="text-xs font-normal opacity-85">اضغط هنا لتفعيل الاستخدام المجاني فوراً</div>
                  </div>
                  <ToggleLeft className="w-7 h-7 text-purple-200 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. System Settings & Owner Account Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broadcaster */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3 mb-5 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            بث إشعار عام أعلى التطبيق لكافة المستخدمين
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                نص الإشعار الشريطي (اتركه فارغاً لإخفائه):
              </label>
              <input
                type="text"
                value={systemNotice}
                onChange={(e) => setSystemNotice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="اكتب التنبيه أو الإعلان هنا..."
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                يظهر هذا النص فوراً في شريط علوي بارز أعلى المنظومة
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 text-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                حفظ وبث الإشعار
              </button>
            </div>
          </form>
        </div>

        {/* Owner Credentials & System Health Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            بيانات اعتماد المالك والمنظومة
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[11px]">البريد المعتمد للمالك:</div>
              <div className="text-amber-300 font-bold font-mono">aminahmed515@gmail.com</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[11px]">رمز حماية لوحة المالك:</div>
              <div className="text-purple-300 font-bold font-mono tracking-wider">2219970</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-slate-400 text-[11px]">حالة المحرك القضائي والذكاء الاصطناعي:</div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>جاهز ونشط (Gemini Pro + Fallback)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
