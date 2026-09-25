export async function onRequestPost(context: { request: Request; env: { GEMINI_API_KEY?: string } }) {
  try {
    // 1. استقبال النص المبعوث من المتصفح
    const { prompt } = await context.request.json() as { prompt: string };

    // 2. قراءة المفتاح من سيرفر Cloudflare مباشرة
    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'مفتاح GEMINI_API_KEY غير معرف في إعدادات Cloudflare' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. الاتصال بسيرفر جوجل من السيرفر مباشرة وليس من المتصفح
    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(googleUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'حدث خطأ في السيرفر الداخلي' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
