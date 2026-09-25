// 1. مفتاح API
const GEMINI_API_KEY = 'AQ.Ab8RN6JZlqIN2xeafWSIHK1l6ZbJJMhXvVaW6adQMW2lX2670g';

// دالة الاتصال المباشر بـ Google Gemini API عبر Header
async function callGeminiApi(prompt: string): Promise<string> {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY.trim()
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('تفاصيل خطأ Gemini:', errorData);
    throw new Error(errorData?.error?.message || `خطأ سيرفر جوجل (${response.status})`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'لم يتم استلام رد من الذكاء الاصطناعي.';
}

// 2. التصنيفات القانونية
export const CATEGORY_LABELS: Record<string, string> = {
  civil: 'القانون المدني',
  criminal: 'القانون الجنائي',
  commercial: 'القانون التجاري',
  labor: 'قانون العمل',
  family: 'قانون الأحوال الشخصية',
  administrative: 'القانون الإداري',
  general: 'استشارة قانونية عامة'
};

// 3. دالة تقديم الاستشارات القانونية
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

// 4. دالة تحليل القضايا والملفات
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

// 5. دالة تفكيك مذكرات الخصوم
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

// 6. دالة صياغة العقود والعرائض
export async function draftLegalDocument(docType: string, details: string): Promise<string> {
  const fullPrompt = `أنت محامي محترف في صياغة العقود والعرائض والمذكرات القانونية.
نوع المستند المطلوب: ${docType}
التفاصيل والشروط الخاصة:
${details}

المطلوب: صياغة مستند قانوني متكامل بأسلوب صياغة قضائية رصينة تحتوي على جميع الديباجات والشروط والشكليات القانونية اللازمة.`;

  return await callGeminiApi(fullPrompt);
}
