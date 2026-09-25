import React, { useEffect, useState } from 'react';
import { Scale, UserCheck, BookOpen, FileText, Sparkles, CheckCircle2, Library, LogOut } from 'lucide-react';
import { getStoredLawyerProfile, getStoredOwnerSettings } from '../lib/storage';
import { LawyerProfile, OwnerSettings, AuthUser } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  const [lawyer, setLawyer] = useState<LawyerProfile>(getStoredLawyerProfile());
  const [settings, setSettings] = useState<OwnerSettings>(getStoredOwnerSettings());

  useEffect(() => {
    const handleLawyerUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<LawyerProfile>;
      if (customEvent.detail) {
        setLawyer(customEvent.detail);
      } else {
        setLawyer(getStoredLawyerProfile());
      }
    };

    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<OwnerSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        setSettings(getStoredOwnerSettings());
      }
    };

    window.addEventListener('lawyer-profile-updated', handleLawyerUpdate);
    window.addEventListener('owner-settings-updated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('lawyer-profile-updated', handleLawyerUpdate);
      window.removeEventListener('owner-settings-updated', handleSettingsUpdate);
    };
  }, []);

  // Standard user navigation tabs - Library is restored with full prominence
  const navItems = [
    { id: 'advisor', label: 'المستشار القانوني', shortLabel: 'المستشار', icon: Scale },
    { id: 'drafting', label: 'صياغة المذكرات', shortLabel: 'الصياغة', icon: Sparkles },
    { id: 'library', label: 'المكتبة', shortLabel: 'المكتبة', icon: Library },
    { id: 'opponent_brief', label: 'تفكيك مذكرة الخصم', shortLabel: 'تفكيك خصم', icon: FileText },
    { id: 'case_analysis', label: 'دراسة وتحليل القضايا', shortLabel: 'دراسة قضية', icon: BookOpen },
    { id: 'lawyer_profile', label: 'بيانات المحامي', shortLabel: 'بياناتي', icon: UserCheck },
  ];

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        {/* Top Bar with Status and Jurisdiction */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-2 border-b border-slate-800/60 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold tracking-wide text-[11px] sm:text-xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>المستشار أمين</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline text-xs truncate">
              قوانين محكمة النقض ومجلس الدولة والإدارية العليا
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Free Access Mode Badge */}
            {settings.freeAccessMode ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="hidden xs:inline">الاستخدام</span> مجاني
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                اشتراكات
              </span>
            )}

            {/* Active Lawyer Badge */}
            <button
              onClick={() => setActiveTab('lawyer_profile')}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700/80 transition-colors px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-700 text-slate-200 text-[11px] sm:text-xs max-w-[120px] sm:max-w-[180px] truncate"
              title="انقر لتعديل بيانات المحامي"
            >
              <UserCheck className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="font-semibold truncate">{lawyer.fullName || 'أمين أحمد'}</span>
            </button>

            {/* User Account / Google Email & Logout */}
            {currentUser && (
              <div className="flex items-center gap-1">
                <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60 truncate max-w-[170px]" title={currentUser.email}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="truncate">{currentUser.email}</span>
                </span>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1 p-1 sm:px-2 sm:py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] sm:text-[11px] transition-colors cursor-pointer"
                    title="تسجيل الخروج"
                  >
                    <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">خروج</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Header Nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5 sm:py-3 gap-4">
            {/* Logo & Title */}
            <div 
              onClick={() => setActiveTab('advisor')} 
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/10 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-1.5 sm:gap-2">
                  المستشار أمين
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    المساعد الذكي
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-400 line-clamp-1">
                  {lawyer.officeName || 'المساعد الذكي للمحامين وصياغة المذكرات القضائية'}
                </div>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* High-End Mobile Bottom Navigation Bar (Optimized for iPhone & Android) */}
      <nav 
        aria-label="التنقل الرئيسي للهاتف"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 px-1 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="grid grid-cols-6 items-center justify-around gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
                  isActive
                    ? 'text-amber-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                style={{ minHeight: '44px' }}
              >
                {isActive && (
                  <span className="absolute -top-1 w-6 h-1 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"></span>
                )}
                <div className={`p-1 rounded-lg transition-transform ${isActive ? 'bg-amber-500/15 scale-110' : ''}`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                </div>
                <span className="text-[10px] tracking-tight leading-tight mt-0.5 truncate max-w-full">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
