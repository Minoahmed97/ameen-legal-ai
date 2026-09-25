const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('user_gemini_key') || '';
};

export async function askGeminiLegal(prompt: string) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('مفتاح Gemini API غير موجود');
  }

  // الرابط الرسمي الكامل للاتصال بـ Gemini API
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`خطأ في السيرفر: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'لم يتم استلام رد من الذكاء الاصطناعي.';
}
