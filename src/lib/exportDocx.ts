import { LawyerProfile } from '../types';

/**
 * Exports formatted legal text to a Microsoft Word document (.doc)
 * with full RTL support, clean formatting, and optional lawyer office header.
 */
export function exportToWordDocument(
  title: string,
  contentHtml: string,
  lawyer: LawyerProfile
) {
  const dateStr = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hasLawyerInfo = lawyer && lawyer.fullName && lawyer.fullName.trim().length > 0;

  const headerBlock = hasLawyerInfo
    ? `
      <table class="header-table">
        <tr>
          <td style="text-align: right;">
            <div class="header-lawyer">${lawyer.fullName}</div>
            <div class="header-sub">${lawyer.degree}</div>
            ${lawyer.officeName ? `<div class="header-sub">${lawyer.officeName}</div>` : ''}
          </td>
          <td style="text-align: left; vertical-align: top;">
            <div class="header-sub">التاريخ: ${dateStr}</div>
            ${lawyer.phone ? `<div class="header-sub">هاتف: ${lawyer.phone}</div>` : ''}
            ${lawyer.governorate ? `<div class="header-sub">${lawyer.governorate}</div>` : ''}
          </td>
        </tr>
      </table>
    `
    : `
      <table class="header-table">
        <tr>
          <td style="text-align: right;">
            <div class="header-lawyer">مذكرة قضائية / عريضة دعوى</div>
            <div class="header-sub">صياغة قانونية متوافقة مع أحكام محكمة النقض ومجلس الدولة</div>
          </td>
          <td style="text-align: left; vertical-align: top;">
            <div class="header-sub">التاريخ: ${dateStr}</div>
          </td>
        </tr>
      </table>
    `;

  const footerBlock = hasLawyerInfo
    ? `
      <table class="footer-table">
        <tr>
          <td style="text-align: right;">
            ${lawyer.address ? `<div>العنوان: ${lawyer.address}</div>` : ''}
            ${lawyer.email ? `<div>البريد: ${lawyer.email}</div>` : ''}
          </td>
          <td class="stamp-box">
            <div>توقيع وصفة المحامي:</div>
            <br/><br/>
            <div>................................................</div>
          </td>
        </tr>
      </table>
    `
    : `
      <table class="footer-table">
        <tr>
          <td style="text-align: right;"></td>
          <td class="stamp-box">
            <div>توقيع وكيل الطالب (محامٍ بالنقض والاستئناف ومجلس الدولة):</div>
            <br/><br/>
            <div>................................................</div>
          </td>
        </tr>
      </table>
    `;

  const fullHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body {
          font-family: 'Amiri', 'Traditional Arabic', 'Times New Roman', serif;
          direction: rtl;
          text-align: right;
          padding: 30px;
          color: #1a1a1a;
          line-height: 1.8;
        }
        .header-table {
          width: 100%;
          border-bottom: 2px solid #0f172a;
          margin-bottom: 25px;
          padding-bottom: 12px;
        }
        .header-lawyer {
          font-size: 18pt;
          font-weight: bold;
          color: #0f172a;
        }
        .header-sub {
          font-size: 11pt;
          color: #475569;
        }
        .doc-title {
          text-align: center;
          font-size: 18pt;
          font-weight: bold;
          color: #1e3a8a;
          margin: 20px 0;
          text-decoration: underline;
        }
        .content-box {
          font-size: 14pt;
          line-height: 2.1;
          margin-top: 15px;
        }
        .footer-table {
          width: 100%;
          margin-top: 40px;
          border-top: 1px solid #cbd5e1;
          padding-top: 15px;
          font-size: 10pt;
          color: #64748b;
        }
        .stamp-box {
          text-align: left;
          font-weight: bold;
          font-size: 12pt;
          color: #1e293b;
        }
      </style>
    </head>
    <body>
      ${headerBlock}

      <div class="doc-title">${title}</div>

      <div class="content-box">
        ${contentHtml}
      </div>

      ${footerBlock}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', fullHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = `${title.replace(/[\/\\?%*:|"<>]/g, '-')}.doc`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
