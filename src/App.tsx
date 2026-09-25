import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LegalAdvisor } from './components/LegalAdvisor';
import { LawyerAccount } from './components/LawyerAccount';
import { OwnerDashboard } from './components/OwnerDashboard';
import { LegalCaseAnalysis } from './components/LegalCaseAnalysis';
import { OpponentBriefDeconstructor } from './components/OpponentBriefDeconstructor';
import { LawyerStyleDrafting } from './components/LawyerStyleDrafting';
import { LegalLibrary } from './components/LegalLibrary';
import { LoginPage } from './components/LoginPage';
import { getStoredOwnerSettings, getStoredUser, clearStoredUser } from './lib/storage';
import { OwnerSettings, AuthUser } from './types';
import { Scale, Shield, Bell, Lock, KeyRound, X, Check } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser());
  const [activeTab, setActiveTab] = useState<string>('advisor');
  const [ownerSettings, setOwnerSettings] = useState<OwnerSettings>(getStoredOwnerSettings());
  
  // Only the authorized owner email can access or see the Owner Dashboard
  const isOwnerEmail = currentUser?.email?.toLowerCase() === 'aminahmed515@gmail.com';

  // Owner Password Protection State
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [ownerPasswordInput, setOwnerPasswordInput] = useState('');
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    if (!isOwnerEmail && activeTab === 'owner_dashboard') {
      setActiveTab('advisor');
    }
  }, [isOwnerEmail, activeTab]);

  useEffect(() => {
    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<OwnerSettings>;
      if (customEvent.detail) {
        setOwnerSettings(customEvent.detail);
      } else {
        setOwnerSettings(getStoredOwnerSettings());
      }
    };

    const handleAuthChange = (e: Event) => {
      const customEvent = e as CustomEvent<AuthUser | null>;
      setCurrentUser(customEvent.detail ?? getStoredUser());
    };

    window.addEventListener('owner-settings-updated', handleSettingsUpdate);
    window.addEventListener('auth-state-changed', handleAuthChange);
    return () => {
      window.removeEventListener('owner-settings-updated', handleSettingsUpdate);
      window.removeEventListener('auth-state-changed', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    clearStoredUser();
    setCurrentUser(null);
  };

  const handleOpenOwner = () => {
    if (!isOwnerEmail) return;
    if (isOwnerAuthenticated) {
      setActiveTab('owner_dashboard');
    } else {
      setIsOwnerModalOpen(true);
      setOwnerPasswordInput('');
      setAuthError(false);
    }
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (ownerPasswordInput.trim() === '2219970') {
      setIsOwnerAuthenticated(true);
      setIsOwnerModalOpen(false);
      setActiveTab('owner_dashboard');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // If user is not authenticated, render Login Page with app overview
  if (!currentUser) {
    return <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif] selection:bg-amber-500/30 selection:text-amber-200">
      {/* System Announcement Banner if set by Owner */}
      {ownerSettings.systemNotice && (
        <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-purple-900/90 border-b border-purple-700/50 py-2 px-4 text-center text-xs text-purple-200 font-medium flex items-center justify-center gap-2">
          <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{ownerSettings.systemNotice}</span>
        </div>
      )}

      {/* Main Header & Navigation */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Dynamic View Container */}
      <main className="flex-1 pb-24 md:pb-16">
        {activeTab === 'advisor' && <LegalAdvisor />}
        {activeTab === 'drafting' && <LawyerStyleDrafting />}
        {activeTab === 'library' && <LegalLibrary />}
        {activeTab === 'opponent_brief' && <OpponentBriefDeconstructor />}
        {activeTab === 'case_analysis' && <LegalCaseAnalysis />}
        {activeTab === 'lawyer_profile' && <LawyerAccount />}
        {activeTab === 'owner_dashboard' && isOwnerEmail && <OwnerDashboard />}
      </main>

      {/* Bottom Footer with Hidden Owner Link */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-400 mt-auto mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-300">المستشار أمين - المساعد الذكي</span>
            <span>- معتمد على أحكام محكمة النقض ومجلس الدولة والإدارية العليا</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <button
              onClick={() => setActiveTab('advisor')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              المستشار
            </button>
            <button
              onClick={() => setActiveTab('drafting')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              صياغة المذكرات
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              المكتبة
            </button>
            <button
              onClick={() => setActiveTab('lawyer_profile')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              بيانات المحامي
            </button>

            {/* Owner Dashboard link - ONLY rendered if logged in with aminahmed515@gmail.com */}
            {isOwnerEmail && (
              <button
                onClick={handleOpenOwner}
                className="opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[11px] text-purple-400 hover:text-purple-300 font-semibold cursor-pointer pt-0.5"
                title="لوحة المالك (محمية بكلمة سر)"
              >
                <Lock className="w-3 h-3 text-purple-400" />
                <span>لوحة المالك</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Password Modal for Owner Access (Password: 2219970) - only for owner email */}
      {isOwnerEmail && isOwnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                <KeyRound className="w-4 h-4 text-purple-400" />
                الدخول إلى لوحة المالك
              </div>
              <button
                onClick={() => setIsOwnerModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              هذه المنطقة مخصصة لإدارة المالك فقط. يرجى إدخال كلمة المرور المعتمدة للمتابعة:
            </p>

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div>
                <input
                  type="password"
                  autoFocus
                  required
                  value={ownerPasswordInput}
                  onChange={(e) => {
                    setOwnerPasswordInput(e.target.value);
                    setAuthError(false);
                  }}
                  placeholder="أدخل كلمة مرور المالك..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-center tracking-widest"
                />
                {authError && (
                  <p className="text-[11px] text-rose-400 font-semibold mt-2 text-center">
                    ❌ كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-purple-600/20 transition-colors cursor-pointer"
                >
                  تأكيد الدخول
                </button>
                <button
                  type="button"
                  onClick={() => setIsOwnerModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
