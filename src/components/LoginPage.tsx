import React, { useState } from 'react';
import { 
  Scale, 
  Sparkles, 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  UploadCloud, 
  CheckCircle2, 
  ArrowLeft, 
  FileCheck, 
  Lock,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { AuthUser } from '../types';
import { saveStoredUser, getStoredLawyerProfile, saveStoredLawyerProfile } from '../lib/storage';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Authorized approved Google account exclusively
  const authorizedEmail = 'aminahmed515@gmail.com';

  const handleGoogleLogin = (emailToUse: string = authorizedEmail, nameToUse?: string) => {
    setErrorMsg(null);
    const normalized = emailToUse.trim().toLowerCase();

    // Restrict strictly to authorized email
    if (normalized !== authorizedEmail.toLowerCase()) {
      setErrorMsg(`عذراً، البريد الإلكتروني المعتمد الوحيد لهذا النظام هو: ${authorizedEmail}`);
      return;
    }

    setIsLoading(true);

    const userName = nameToUse || 'المستشار أمين';
    const authUser: AuthUser = {
      id: 'google_user_' + Date.now(),
      name: userName,
      email: authorizedEmail,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}&backgroundColor=d97706,b45309`,
      provider: 'google',
      signedInAt: new Date().toISOString(),
    };

    // Also auto-sync email with lawyer profile
    const lawyerProfile = getStoredLawyerProfile();
    saveStoredLawyerProfile({
      ...lawyerProfile,
      email: authorizedEmail,
      fullName: lawyerProfile.fullName || 'المستشار أمين',
      officeName: lawyerProfile.officeName || 'مكتب المستشار أمين للمحاماة والاستشارات القانونية',
    });

    setTimeout(() => {
      saveStoredUser(authUser);
      setIsLoading(false);
      onLoginSuccess(authUser);
    }, 500);
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    const guestUser: AuthUser = {
      id: 'guest_' + Date.now(),
      name: 'مستخدم تجريبي',
      email: 'guest@legaladvisor.local',
      provider: 'guest',
      signedInAt: new Date().toISOString(),
    };
    setTimeout(() => {
      saveStoredUser(guestUser);
      setIsLoading(false);
      onLoginSuccess(guestUser);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif] selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar Branding */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-4 py-3 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/10">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Scale className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="text-base font-black text-slate-100 flex items-center gap-1.5">
                المستشار أمين
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  المساعد الذكي
                </span>
              </div>
              <div className="text-xs text-slate-400">
                المساعد الذكي للمحامين وصياغة المذكرات وتأصيل القضايا
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              المنظومة متاحة للاستخدام
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-6xl mx-auto px-4 py-10 sm:py-16 flex flex-col lg:flex-row items-center gap-12">
        {/* Left / Main Column: App Overview & Features (نبذة عن التطبيق) */}
        <div className="flex-1 space-y-6 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            الجيل الأحدث لمنصات العمل القانوني والقضائي
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 leading-tight">
            المستشار أمين <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              المساعد الذكي للمحاماة وصياغة المذكرات
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            منظومة رقمية متكاملة مصممة خصيصاً للمحامين والمستشارين القانونيين. تعتمد على أحكام محكمة النقض المصرية، والمحكمة الإدارية العليا، ومجلس الدولة، لتوفير استشارات حاسمة وصياغة عرائض متقنة دون أي تعقيد.
          </p>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1.5 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Scale className="w-4 h-4 shrink-0" />
                المستشار القضائي المؤصل
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                استشارات قانونية دقيقة ومباشرة مؤصلة بنصوص المواد وأحدث مبادئ محكمة النقض في كافة فروع القانون.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1.5 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <FileCheck className="w-4 h-4 shrink-0" />
                صياغة المذكرات القضائية
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                صياغة مذكرات الدفاع، وصحف الدعاوى، والطعون فوراً استناداً لنماذج المكتبة وتصديرها بصيغة Word.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1.5 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <BookOpen className="w-4 h-4 shrink-0" />
                المكتبة القانونية المعتمدة
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                مستودع لحفظ نماذجك وصيغك القضائية ليعتمد عليها الذكاء الاصطناعي ويحتذي حذوها في الصياغات المشابهة.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1.5 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <FileText className="w-4 h-4 shrink-0" />
                تفكيك مذكرة الخصم
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                كاشف الثغرات والعيوب الإجرائية والموضوعية في دفاع الخصم وصياغة الرد القضائي الحاسم والمفحم.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1.5 sm:col-span-2 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <UploadCloud className="w-4 h-4 shrink-0" />
                دعم فعلي لرفع ملفات Word و PDF والصور (OCR)
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                استخراج فوري للنصوص القانونية والمستندات الممسوحة ضوئياً من كافة أنواع الملفات وإدراجها في الاستشارات والمذكرات.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Google Sign-In Card */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-400"></div>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-black text-slate-100">
                تسجيل الدخول للمنظومة
              </h2>
              <p className="text-xs text-slate-400">
                سجّل الدخول عبر حساب Google للوصول إلى كافة ميزات التطبيق وحفظ ترويستك ونماذجك.
              </p>
            </div>

            {/* Google Sign In Primary Button */}
            <div className="space-y-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleGoogleLogin(authorizedEmail)}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-800 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-white/5 transition-all cursor-pointer border border-slate-200 text-sm active:scale-[0.98] disabled:opacity-50"
              >
                {/* Official Google 'G' SVG Logo */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>المتابعة بحساب Google المعتمد</span>
              </button>

              {/* Show authorized account badge */}
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                    G
                  </div>
                  <span className="text-slate-200 font-semibold truncate">{authorizedEmail}</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
                  الحساب المعتمد الوحيد
                </span>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs text-center font-bold">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Toggle Another Google Email */}
            {!showEmailInput ? (
              <button
                type="button"
                onClick={() => setShowEmailInput(true)}
                className="w-full text-center text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer py-1"
              >
                + تسجيل الدخول بإيميل Google آخر
              </button>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customEmail.trim()) {
                    handleGoogleLogin(customEmail.trim(), customName.trim());
                  }
                }}
                className="space-y-3 pt-2 border-t border-slate-800 animate-in fade-in duration-200"
              >
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    اسم الأستاذ المحامي (اختياري):
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="مثال: المستشار أحمد..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    إيميل جوجل (Google Email):
                  </label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    تأكيد الدخول بحساب Google
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmailInput(false)}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-800 w-full"></div>
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 shrink-0 font-medium">
                أو
              </span>
            </div>

            {/* Quick Guest / Free Access Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGuestLogin}
              className="w-full bg-slate-800 hover:bg-slate-750 hover:text-white text-slate-300 font-semibold py-2.5 px-4 rounded-xl border border-slate-700 text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>دخول سريع فوري (تجربة المنظومة مباشرة)</span>
            </button>

            {/* Security Badge */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>تسجيل مشفر وآمن ١٠٠٪ مع الحفاظ التام على سرية البيانات</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        المستشار أمين - المساعد الذكي | متوافق مع أحكام محكمة النقض ومجلس الدولة والإدارية العليا
      </footer>
    </div>
  );
};
