export type LegalCategory = 
  | 'civil'
  | 'criminal'
  | 'commercial'
  | 'family'
  | 'labor'
  | 'administrative'
  | 'real_estate'
  | 'constitutional'
  | 'general';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'guest';
  signedInAt: string;
}

export interface LawyerProfile {
  fullName: string;
  degree: 'محامٍ أمام محكمة النقض' | 'محامٍ بالاستئناف العالي ومجلس الدولة' | 'محامٍ أمام المحاكم الابتدائية' | 'محامٍ جدول عام';
  officeName: string;
  phone: string;
  email: string;
  governorate: string;
  address: string;
  specialization: string;
  bio: string;
  updatedAt: string;
}

export interface LibraryDocument {
  id: string;
  title: string;
  category: 'صحيفة دعوى' | 'مذكرة دفاع' | 'تقرير طعن نقض / إدارية' | 'إنذار رسمي' | 'صيغة عقد' | 'حكم قضائي ومبدأ نقض' | 'نموذج عام';
  description?: string;
  content: string; // نص النموذج أو المحرر القضائي الكامل
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  tags?: string[];
  createdAt: string;
}

export interface OwnerSettings {
  freeAccessMode: boolean; // زر إتاحة الاستخدام المجاني للتطبيق
  systemNotice: string;
  allowRegistrations: boolean;
  maintenanceMode: boolean;
  trialDays: number;
  lastUpdated: string;
}

export interface LegalConsultation {
  id: string;
  category: LegalCategory;
  categoryLabel: string;
  query: string;
  legalOpinion: string;
  statutoryArticles: { article: string; law: string; text: string }[];
  cassationPrinciples: string[];
  proceduralSteps: string[];
  risksAndRecommendations: string[];
  conclusion: string;
  createdAt: string;
}

export interface CaseAnalysisResult {
  id: string;
  title: string;
  caseType: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  applicableLaws: string[];
  recommendedDefenses: string[];
  evidentiaryRoadmap: string[];
  estimatedOutcome: string;
  createdAt: string;
}

export interface DeconstructionResult {
  id: string;
  opponentTitle: string;
  summary: string;
  formalDefects: string[]; // عيوب شكلية وإجرائية
  substantiveFlaws: string[]; // ثغرات موضوعية وتناقضات
  rebuttalArguments: string[]; // أوجه الرد والتفنيد
  counterEvidence: string[]; // أدلة الإثبات والرد المضاد
  suggestedCourtPleading: string; // صياغة الرد الشفوي / المكتوب
  createdAt: string;
}

export interface LegalDraftResult {
  id: string;
  documentType: 'مذكرة دفاع' | 'صحيفة دعوى' | 'إنذار رسمي على يد محضر' | 'تقرير طعن بالنقض' | 'عقد اتفاق وتصالح';
  court: string;
  caseNumber: string;
  year: string;
  circuit: string;
  plaintiff: string;
  defendant: string;
  subject: string;
  facts: string;
  legalPleadings: string[];
  requests: string[];
  fullDraftText: string;
  createdAt: string;
}
