import { LawyerProfile, OwnerSettings, LegalConsultation, CaseAnalysisResult, DeconstructionResult, LegalDraftResult, LibraryDocument, AuthUser } from '../types';

const AUTH_USER_KEY = 'codesec_auth_user_v3';
const LAWYER_PROFILE_KEY = 'codesec_lawyer_profile_v3';
const OWNER_SETTINGS_KEY = 'codesec_owner_settings_v3';
const CONSULTATIONS_KEY = 'codesec_consultations_v3';
const CASE_ANALYSES_KEY = 'codesec_case_analyses_v3';
const DECONSTRUCTIONS_KEY = 'codesec_deconstructions_v3';
const DRAFTS_KEY = 'codesec_drafts_v3';
const LIBRARY_DOCS_KEY = 'codesec_library_docs_v3';

// Clear any old stored data completely from previous versions
export function purgeAllStoredData(): void {
  try {
    const keysToRemove = [
      'codesec_lawyer_profile_v2',
      'codesec_owner_settings_v2',
      'codesec_consultations_v2',
      'codesec_case_analyses_v2',
      'codesec_deconstructions_v2',
      'codesec_drafts_v2',
      'codesec_lawyer_profile_v1',
      'codesec_consultations_v1',
      'codesec_case_analyses_v1',
      'codesec_drafts_v1',
      LAWYER_PROFILE_KEY,
      CONSULTATIONS_KEY,
      CASE_ANALYSES_KEY,
      DECONSTRUCTIONS_KEY,
      DRAFTS_KEY,
      LIBRARY_DOCS_KEY,
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent('lawyer-profile-updated', { detail: EMPTY_LAWYER_PROFILE }));
    window.dispatchEvent(new CustomEvent('library-docs-updated', { detail: [] }));
  } catch (e) {
    console.error('Error purging data:', e);
  }
}

// Initial profile preloaded with lawyer name
export const EMPTY_LAWYER_PROFILE: LawyerProfile = {
  fullName: 'المستشار أمين',
  degree: 'محامٍ بالاستئناف العالي ومجلس الدولة',
  officeName: 'مكتب المستشار أمين للمحاماة والاستشارات القانونية',
  phone: '',
  email: 'aminahmed515@gmail.com',
  governorate: 'القاهرة',
  address: '',
  specialization: 'قضايا مدنية وتجارية وإدارية ومجلس الدولة والنقض',
  bio: '',
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_OWNER_SETTINGS: OwnerSettings = {
  freeAccessMode: true, // الاستخدام المجاني متاح للجميع
  systemNotice: '',
  allowRegistrations: true,
  maintenanceMode: false,
  trialDays: 30,
  lastUpdated: new Date().toISOString(),
};

// ================= Lawyer Profile Storage =================
export function getStoredLawyerProfile(): LawyerProfile {
  try {
    const raw = localStorage.getItem(LAWYER_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...EMPTY_LAWYER_PROFILE, ...parsed };
    }
  } catch (e) {
    console.error('Error loading lawyer profile:', e);
  }
  return EMPTY_LAWYER_PROFILE;
}

export function saveStoredLawyerProfile(profile: LawyerProfile): boolean {
  try {
    const updated = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LAWYER_PROFILE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('lawyer-profile-updated', { detail: updated }));
    return true;
  } catch (e) {
    console.error('Error saving lawyer profile:', e);
    return false;
  }
}

// ================= Owner Settings Storage =================
export function getStoredOwnerSettings(): OwnerSettings {
  try {
    const raw = localStorage.getItem(OWNER_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_OWNER_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Error loading owner settings:', e);
  }
  return DEFAULT_OWNER_SETTINGS;
}

export function saveStoredOwnerSettings(settings: OwnerSettings): boolean {
  try {
    const updated = {
      ...settings,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(OWNER_SETTINGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('owner-settings-updated', { detail: updated }));
    return true;
  } catch (e) {
    console.error('Error saving owner settings:', e);
    return false;
  }
}

export function toggleFreeAccessMode(): boolean {
  const current = getStoredOwnerSettings();
  const nextValue = !current.freeAccessMode;
  const updated: OwnerSettings = {
    ...current,
    freeAccessMode: nextValue,
    lastUpdated: new Date().toISOString(),
  };
  saveStoredOwnerSettings(updated);
  return nextValue;
}

// ================= History Storage (Initialized Empty) =================
export function getConsultationsHistory(): LegalConsultation[] {
  try {
    const raw = localStorage.getItem(CONSULTATIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveConsultationToHistory(consultation: LegalConsultation): void {
  try {
    const list = getConsultationsHistory();
    const updated = [consultation, ...list.filter(c => c.id !== consultation.id)].slice(0, 50);
    localStorage.setItem(CONSULTATIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
}

export function getDraftsHistory(): LegalDraftResult[] {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveDraftToHistory(draft: LegalDraftResult): void {
  try {
    const list = getDraftsHistory();
    const updated = [draft, ...list.filter(d => d.id !== draft.id)].slice(0, 50);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
}

export function getCaseAnalysesHistory(): CaseAnalysisResult[] {
  try {
    const raw = localStorage.getItem(CASE_ANALYSES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveCaseAnalysisToHistory(item: CaseAnalysisResult): void {
  try {
    const list = getCaseAnalysesHistory();
    const updated = [item, ...list.filter(c => c.id !== item.id)].slice(0, 50);
    localStorage.setItem(CASE_ANALYSES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
}

export function getDeconstructionsHistory(): DeconstructionResult[] {
  try {
    const raw = localStorage.getItem(DECONSTRUCTIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveDeconstructionToHistory(item: DeconstructionResult): void {
  try {
    const list = getDeconstructionsHistory();
    const updated = [item, ...list.filter(d => d.id !== item.id)].slice(0, 50);
    localStorage.setItem(DECONSTRUCTIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
}

export const getConsultations = getConsultationsHistory;
export const getDrafts = getDraftsHistory;
export const getCaseAnalyses = getCaseAnalysesHistory;
export const getDeconstructions = getDeconstructionsHistory;

// ================= Legal Library Storage (المكتبة) =================
export function getLibraryDocuments(): LibraryDocument[] {
  try {
    const raw = localStorage.getItem(LIBRARY_DOCS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading library docs:', e);
  }
  return [];
}

export function saveLibraryDocument(doc: LibraryDocument): boolean {
  try {
    const list = getLibraryDocuments();
    const updated = [doc, ...list.filter(item => item.id !== doc.id)];
    localStorage.setItem(LIBRARY_DOCS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('library-docs-updated', { detail: updated }));
    return true;
  } catch (e) {
    console.error('Error saving library doc:', e);
    return false;
  }
}

export function deleteLibraryDocument(id: string): boolean {
  try {
    const list = getLibraryDocuments();
    const updated = list.filter(item => item.id !== id);
    localStorage.setItem(LIBRARY_DOCS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('library-docs-updated', { detail: updated }));
    return true;
  } catch (e) {
    console.error('Error deleting library doc:', e);
    return false;
  }
}

export function findMatchingLibraryDocuments(keywordOrTopic: string, categoryFilter?: string): LibraryDocument[] {
  const docs = getLibraryDocuments();
  if (!docs.length) return [];
  if (!keywordOrTopic && !categoryFilter) return docs;

  const normalized = keywordOrTopic.toLowerCase().trim();
  const tokens = normalized.split(/\s+/).filter(t => t.length > 2);

  return docs.filter(doc => {
    if (categoryFilter && categoryFilter !== 'الكل' && doc.category !== categoryFilter) {
      return false;
    }
    if (!tokens.length) return true;

    const haystack = `${doc.title} ${doc.description || ''} ${doc.content} ${(doc.tags || []).join(' ')}`.toLowerCase();
    return tokens.some(token => haystack.includes(token));
  });
}

// ================= User Authentication Storage =================
export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading auth user:', e);
  }
  return null;
}

export function saveStoredUser(user: AuthUser): void {
  try {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: user }));
  } catch (e) {
    console.error('Error saving auth user:', e);
  }
}

export function clearStoredUser(): void {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: null }));
  } catch (e) {
    console.error('Error clearing auth user:', e);
  }
}

// ================= Complete Data Backup & Restore =================
export function exportAllAppDataAsJson(): string {
  const payload = {
    version: '3.0',
    appName: 'المستشار أمين - المساعد الذكي',
    exportedAt: new Date().toISOString(),
    lawyerProfile: getStoredLawyerProfile(),
    ownerSettings: getStoredOwnerSettings(),
    libraryDocuments: getLibraryDocuments(),
    consultations: getConsultations(),
    caseAnalyses: getCaseAnalyses(),
    deconstructions: getDeconstructions(),
    drafts: getDrafts(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importAllAppDataFromJson(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.lawyerProfile) saveStoredLawyerProfile(data.lawyerProfile);
    if (data.ownerSettings) saveStoredOwnerSettings(data.ownerSettings);
    if (Array.isArray(data.libraryDocuments)) {
      localStorage.setItem(LIBRARY_DOCS_KEY, JSON.stringify(data.libraryDocuments));
      window.dispatchEvent(new CustomEvent('library-docs-updated', { detail: data.libraryDocuments }));
    }
    if (Array.isArray(data.consultations)) {
      localStorage.setItem(CONSULTATIONS_KEY, JSON.stringify(data.consultations));
    }
    if (Array.isArray(data.caseAnalyses)) {
      localStorage.setItem(CASE_ANALYSES_KEY, JSON.stringify(data.caseAnalyses));
    }
    if (Array.isArray(data.deconstructions)) {
      localStorage.setItem(DECONSTRUCTIONS_KEY, JSON.stringify(data.deconstructions));
    }
    if (Array.isArray(data.drafts)) {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(data.drafts));
    }
    return true;
  } catch (e) {
    console.error('Error importing app data:', e);
    return false;
  }
}

