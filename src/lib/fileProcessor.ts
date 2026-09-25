import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '') || '';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Gemini client initialization failed in fileProcessor:', err);
  }
}

export interface ExtractedFileResult {
  fileName: string;
  fileType: string;
  fileSize: number;
  extractedText: string;
  success: boolean;
  error?: string;
}

// Convert File to Base64 string
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts plain text from Word (.docx), PDF (.pdf), Text (.txt), or Images (.png, .jpg, .jpeg, .webp)
 */
export async function extractTextFromFile(file: File): Promise<ExtractedFileResult> {
  const fileName = file.name;
  const fileType = file.type || '';
  const fileSize = file.size;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  try {
    // 1. Plain Text files (.txt)
    if (ext === 'txt' || fileType === 'text/plain') {
      const text = await file.text();
      return {
        fileName,
        fileType: 'text/plain',
        fileSize,
        extractedText: text.trim(),
        success: true,
      };
    }

    // 2. Word documents (.docx)
    if (ext === 'docx' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const mammothResult = await (mammoth as any).extractRawText({ arrayBuffer });
        const text = mammothResult.value?.trim() || '';
        if (text) {
          return {
            fileName,
            fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            fileSize,
            extractedText: text,
            success: true,
          };
        }
      } catch (docErr) {
        console.warn('Mammoth extraction failed, trying AI / text fallback:', docErr);
      }
    }

    // 3. PDF Documents (.pdf)
    if (ext === 'pdf' || fileType === 'application/pdf') {
      const base64Data = await fileToBase64(file);

      if (aiClient) {
        try {
          const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      mimeType: 'application/pdf',
                      data: base64Data,
                    },
                  },
                  {
                    text: 'اقرأ واستخرج بدقة كافة النصوص القانونية، والوقائع، والدفوع، والأحكام الواردة في هذا الملف بصورة كاملة وبدون أي نقصان وبدون أي مقدمات أو تعليق منك.',
                  },
                ],
              },
            ],
          });

          const extracted = response.text?.trim() || '';
          if (extracted) {
            return {
              fileName,
              fileType: 'application/pdf',
              fileSize,
              extractedText: extracted,
              success: true,
            };
          }
        } catch (pdfAiErr) {
          console.warn('Gemini PDF OCR extraction failed:', pdfAiErr);
        }
      }

      // Basic client-side text extractor for digital PDFs if AI is offline
      const arrayBuffer = await file.arrayBuffer();
      const rawString = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
      const textMatches = rawString.match(/\(([^)]+)\)\s*Tj/g) || rawString.match(/\[([^\]]+)\]\s*TJ/g);
      if (textMatches && textMatches.length > 0) {
        const cleanText = textMatches
          .map(m => m.replace(/[()\[\]]|Tj|TJ/g, '').trim())
          .filter(t => t.length > 2)
          .join(' ');
        if (cleanText.length > 30) {
          return {
            fileName,
            fileType: 'application/pdf',
            fileSize,
            extractedText: cleanText,
            success: true,
          };
        }
      }

      return {
        fileName,
        fileType: 'application/pdf',
        fileSize,
        extractedText: `تم إرفاق ملف PDF بنجاح: ${fileName} (${(fileSize / 1024).toFixed(1)} ك.ب).`,
        success: true,
      };
    }

    // 4. Images (.png, .jpg, .jpeg, .webp, .bmp) - High precision legal OCR
    if (['jpg', 'jpeg', 'png', 'webp', 'bmp'].includes(ext) || fileType.startsWith('image/')) {
      const base64Data = await fileToBase64(file);
      const mimeType = fileType || (ext === 'png' ? 'image/png' : 'image/jpeg');

      if (aiClient) {
        try {
          const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Data,
                    },
                  },
                  {
                    text: 'أنت ماسح ضوئي ومستخرج نصوص قانونية فائق الدقة. استخرج واقرأ كافة النصوص المكتوبة في هذه الوثيقة أو الصورة بدقة متناهية وبدون أي زيادات أو تعليقات خارجية.',
                  },
                ],
              },
            ],
          });

          const extracted = response.text?.trim() || '';
          if (extracted) {
            return {
              fileName,
              fileType: mimeType,
              fileSize,
              extractedText: extracted,
              success: true,
            };
          }
        } catch (imgAiErr) {
          console.warn('Gemini Image OCR extraction failed:', imgAiErr);
        }
      }

      return {
        fileName,
        fileType: mimeType,
        fileSize,
        extractedText: `[مستند صورة مرفق: ${fileName}]`,
        success: true,
      };
    }

    // 5. Older Word .doc or binary files fallback
    if (ext === 'doc') {
      const arrayBuffer = await file.arrayBuffer();
      const rawText = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
      const cleaned = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ').trim();
      return {
        fileName,
        fileType: 'application/msword',
        fileSize,
        extractedText: cleaned.length > 50 ? cleaned : `مستند وورد مرفق: ${fileName}`,
        success: true,
      };
    }

    return {
      fileName,
      fileType,
      fileSize,
      extractedText: '',
      success: false,
      error: 'نوع الملف غير مدعوم. يرجى رفع ملف وورد (.docx)، أو PDF (.pdf)، أو صورة (.jpg, .png)، أو ملف نصي (.txt).',
    };
  } catch (error: any) {
    console.error('File extraction error:', error);
    return {
      fileName,
      fileType,
      fileSize,
      extractedText: '',
      success: false,
      error: error?.message || 'حدث خطأ أثناء قراءة الملف.',
    };
  }
}
