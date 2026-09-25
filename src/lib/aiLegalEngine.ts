import { GoogleGenAI } from '@google/genai';

// دالة جلب مفتاح الـ API
const getApiKey = (): string => {
  return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('user_gemini_key') || '';
};

// دالة الاتصال المباشرة عبر المكتبة الرسمية
async function callGeminiApi(prompt: string): Promise<string> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('مفتاح Gemini API غير متوفر. يرجى إضافته في ملف .env أو إعدادات Cloudflare.');
  }

  // استخدام المكتبة الرسمية لتجنب أخطاء تركيب الـ URL و 404
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });

  return response.text || 'لم يتم استلام رد من الذكاء الاصطناعي.';
}

// 1. التصنيفات القانونية
export const CATEGORY_LABELS: Record<string, string> = {
  civil: 'القانون المدني',
  criminal: 'القانون الجنائي',
  commercial: 'القانون التجاري',
  labor: 'قانون العمل',
  family: 'قانون الأحوال الشخصية',
  administrative: 'القانون الإداري',
  general: 'استشارة قانونية عامة'
};

// 2. دالة الاستشارات القانونية
export async function generateLegalConsultation(prompt: string, category: string = 'general'): Promise<string> {
  const categoryLabel = CATEGORY_LABELS[category] || category;
  const fullPrompt = `أنت مستشار قانوني خبير ومتخصص في التشريعات والقوانين.
التخصص القانوني: ${categoryLabel}
استفسار المستخدم: ${prompt}

المطلوب: تقديم استشارة قانونية مفصلة ودقيقة تتضمن:
1. الرأي القانوني المباشر في الموضوع.
2. النصوص والمواد القانونية المنطبقة.
3. الإجراءات والخطوات العملية الواجب اتخاذها.`;

  return await callGeminiApi(fullPrompt);
}

// 3. دالة تحليل القضايا والملفات
export async function analyzeLegalCase(facts: string, documents: string = ''): Promise<string> {
  const fullPrompt = `أنت خبير قانوني متخصص في تحليل القضايا والملفات القضائية.
وقائع القضية:
${facts}

${documents ? `المستندات والأوراق المتاحة:\n${documents}` : ''}

المطلوب: تحليل القضية تحليلاً شاملاً يوضح:
- نقاط القوة ونقاط الضعف.
- الأسانيد القانونية والسوابق القضائية المتوقعة.
- التكييف القانوني الصحيح للواقعة.
- التوصيات والاستراتيجية الدفاعية المقترحة.`;

  return await callGeminiApi(fullPrompt);
}

// 4. دالة تفكيك مذكرات الخصوم
export async function deconstructOpponentBrief(briefText: string): Promise<string> {
  const fullPrompt = `أنت محامي نقض وباحث قانوني متمارس. قم بتفكيك مذكرة الخصم التالية وتحليلها:
نص مذكرة الخصم:
${briefText}

المطلوب:
1. تحديد الدفوع والدفاعات الرئيسية التي اعتمد عليها الخصم.
2. استخراج الثغرات والردود القانونية النافية لكل دفع.
3. اقتراح خطة التفنيد والدفاع المضاد.`;

  return await callGeminiApi(fullPrompt);
}

// 5. دالة صياغة العقود والعرائض
export async function draftLegalDocument(docType: string, details: string): Promise<string> {
  const fullPrompt = `أنت محامي محترف في صياغة العقود والعرائض والمذكرات القانونية.
نوع المستند المطلوب: ${docType}
التفاصيل والشروط الخاصة:
${details}

المطلوب: صياغة مستند قانوني متكامل بأسلوب صياغة قضائية رصينة تحتوي على جميع الديباجات والشروط والشكليات القانونية اللازمة.`;

  return await callGeminiApi(fullPrompt);
}
