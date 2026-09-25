import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Trash2, 
  FileText, 
  FileDown, 
  Copy, 
  Check, 
  BookOpen, 
  Sparkles, 
  Upload, 
  Scale, 
  X, 
  Eye,
  FileCode,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { LibraryDocument } from '../types';
import { 
  getLibraryDocuments, 
  saveLibraryDocument, 
  deleteLibraryDocument,
  getStoredLawyerProfile 
} from '../lib/storage';
import { exportToWordDocument } from '../lib/exportDocx';
import { FileUploadArea } from './FileUploadArea';

const CATEGORIES: LibraryDocument['category'][] = [
  'صحيفة دعوى',
  'مذكرة دفاع',
  'تقرير طعن نقض / إدارية',
  'إنذار رسمي',
  'صيغة عقد',
  'حكم قضائي ومبدأ نقض',
  'نموذج عام',
];

// Curated high-prestige Egyptian judicial precedent templates to seed if requested
const INITIAL_STARTER_TEMPLATES: Omit<LibraryDocument, 'id' | 'createdAt'>[] = [
  {
    title: 'صحيفة دعوى فسخ عقد بيع وإلزام بالتعويض والشرط الجزائي',
    category: 'صحيفة دعوى',
    description: 'نموذج دعوى فسخ عقد بيع عقاري للإخلال بالالتزام بالتسليم مع المطالبة بالتعويض وإعمال الشرط الجزائي وفقاً للمادتين ١٤٧ و ١٥٧ مدني.',
    content: `أنه في يوم ............ الموافق ...... / ...... / ٢٠٢٦
بناءً على طلب السيد / ....................................، المقيم في ....................................، ومحله المختار مكتب الأستاذ / .................................... المحامي بالنقض والاستئناف.
أنا ............ محضر محكمة ............ الجزئية قد انتقلت وأعلنت:
السيد / ....................................، المقيم في ....................................، مخاطباً مع / ....................

الموضوع:
طلب الحكم بفسخ عقد البيع المؤرخ ...... / ...... / ......... والمطالبة بالتعويض الاتفاقي والشرط الجزائي مع رد المبالغ المسددة والفوائد والمصروفات.

الوقائع:
بموجب عقد بيع ابتدائي مؤرخ ...... / ...... / ......... باع المعلن إليه للطالب ما هو عبارة عن العقار/الوحدة رقم (...) الكائنة في (...)، لقاء ثمن إجمالي قدره (...) جنيه سدد منه الطالب مبلغ (...) جنيه بمجلس العقد، والتزم المعلن إليه بتسليم المبيع في موعد غايته ...... / ...... / .........
وحيث حل الأجل المحدد للتسليم وامتنع المعلن إليه دون مسوغ، وأنذره الطالب رسمياً على يد محضر بموجب الإنذار رقم (...) محضرين (...) دون جدوى.

الأسانيد القانونية وقضاء محكمة النقض:
١- تنص المادة ١٤٧ من القانون المدني: "العقد شريعة المتعاقدين، فلا يجوز نقضه ولا تعديله إلا باتفاق الطرفين أو للأسباب التي يقررها القانون".
٢- تنص المادة ١٥٧ من القانون المدني: "في العقود الملزمة للجانبين، إذا لم يوف أحد المتعاقدين بالتزامه جاز للمتعاقد الآخر بعد إعذاره المدين أن يطالب بتنفيذ العقد أو بفسخه مع التعويض في الحالتين إن كان له مقتض".
٣- استقر قضاء محكمة النقض على أن: "الشرط الفاسخ الصريح يسلب القاضي كل سلطة تقديرية في صدد الفسخ، ولا يملك معه إلا التحقق من حصول المخالفة الموجبة له، فإذا ما تحقق وجب عليه الحكم بالفسخ" (الطعن رقم ٥١٢ لسنة ٥٤ ق جلسة ١٥/٣/١٩٨٨).

بناءً عليه:
أنا المحضر سالف الذكر قد أعلنت المعلن إليه بصورة من هذه الصحيفة وكلفته بالحضور أمام محكمة ............ الابتدائية الدائرة (...) بجلستها المنعقدة صباح يوم ............ الموافق ...... / ...... / ٢٠٢٦ لسماع الحكم:
أولاً: بفسخ عقد البيع المؤرخ ...... / ...... / .........
ثانياً: إلزام المعلن إليه برد كامل الثمن المقبوض وقدره (...) جنيهاً مع الفوائد القانونية من تاريخ المطالبة.
ثالثاً: إلزامه بأداء مبلغ (...) جنيهاً قيمة الشرط الجزائي والتعويض الجابر للأضرار، مع المصروفات ومقابل أتعاب المحاماة والنفاذ المعجل.`,
    tags: ['فسخ عقد', 'تعويض', 'شرط جزائي', 'مدني'],
  },
  {
    title: 'مذكرة دفاع في جنحة إصدار شيك بدون رصيد (الدفع بانقضاء الدعوى بالصلح أو انتفاء الركن المادي)',
    category: 'مذكرة دفاع',
    description: 'مذكرة دفاع متكاملة تتضمن الدفوع الجنائية المقررة بقانون التجارة رقم ١٧ لسنة ١٩٩٩ وقضاء محكمة النقض الجنائي.',
    content: `محكمة جنح ............ المستأنفة
مذكرة بدفاع:
السيد / ........................................................ (صفته: متهم / مستأنف)
ضــــــــــــــــد:
١- النيابة العامة (سلطة الاتهام)
٢- السيد / .................................................... (صفته: مدعٍ بالحق المدني)
في الجنحة رقم (...) لسنة (...) جنح مستأنف (...) والمحدد لنظرها جلسة: ...... / ...... / ٢٠٢٦

الوقائع:
أسندت النيابة العامة للمتهم أنه في يوم ...... / ...... / ......... أصدر بسوء نية للمدعي بالحق المدني شيكاً لا يقابله رصيد قائم وقابل للسحب، وطلبت عقابه بالمادة ٥٣٤ من قانون التجارة رقم ١٧ لسنة ١٩٩٩.

الدفوع وأوجه الدفاع الجنائي:
أولاً: الدفع بانقضاء الدعوى الجنائية بالصلح والتصالح عملاً بالمادة ٥٣٤ فقرة ثانية من قانون التجارة المعدلة بالقانون ١٥٦ لسنة ٢٠٠٤، وحيث قام المتهم بالوفاء بكامل قيمة الشيك بموجب إيداع رسمي بخزينة المحكمة / إنذار عرض مقبول ومستلم من المجني عليه.
ثانياً: الدفع بانتفاء القصد الجنائي لكون الشيك أداة ائتمان وضمان لمعاملة مدنية ثابتة ولم يُطرح للتداول النقدي، وإعمال ما استقر عليه قضاء النقض الجنائي من أن محكمة الموضوع ملزمة بتمحيص حقيقة المعاملة والدفاع الجوهري.

بناءً عليه:
يلتمس المتهم وموكله من عدالة المحكمة الموقرة:
أصلياً: القضاء بانقضاء الدعوى الجنائية بالتصالح وإلغاء الحكم المستأنف.
احتياطياً: براءة المتهم مما أسند إليه ورفض الدعوى المدنية.`,
    tags: ['شيك', 'جنح', 'تجارة', 'تصالح'],
  },
  {
    title: 'صحيفة دعوى إلغاء قرار إداري سلبي بالامتناع أمام محكمة القضاء الإداري بمجلس الدولة',
    category: 'تقرير طعن نقض / إدارية',
    description: 'صحيفة دعوى إلغاء قرار إداري مع طلب وقف التنفيذ المستعجل مستندة لأحكام المحكمة الإدارية العليا وقانون مجلس الدولة رقم ٤٧ لسنة ١٩٧٢.',
    content: `السيد الأستاذ المستشار / نائب رئيس مجلس الدولة ورئيس محكمة القضاء الإداري
تحية إجلال وتقدير وبعد،،،
يقدمه لعدالتكم: السيد / ....................................، المقيم في ....................................، ومحله المختار مكتب الأستاذ / .................................... المحامي المقبول لدى مجلس الدولة والإدارية العليا.
ضــــــــــــــــــــــــد:
١- السيد رئيس مجلس الوزراء (بصفته)
٢- السيد وزير .................................... (بصفته)
٣- السيد رئيس الهيئة العامة لـ .................................... (بصفته)

الموضوع:
طلب الحكم:
أولاً: بقبول الدعوى شكلاً.
ثانياً: وبصفة مستعجلة: بوقف تنفيذ القرار الإداري السلبي بالامتناع عن (...) مع ما يترتب على ذلك من آثار، وتنفيذ الحكم بمسودته دون إعلان.
ثالثاً: وفي الموضوع: بإلغاء القرار الإداري المطعون فيه مع إلزام جهة الإدارة بالمصروفات وأتعاب المحاماة.

الوقائع:
المدعي يعمل بوظيفة (...)، وقد استوفى كافة الشروط والضوابط القانونية المقررة لشغل وظيفة / صرف مستحقات / إلغاء النقل، وتقدم بتظلم رسمي قيد برقم (...) بتاريخ ...... / ...... / ......... وامتنعت جهة الإدارة عن إجابته دون مبرر قانوني سليم.

الأساس القانوني وقضاء المحكمة الإدارية العليا:
١- تنص المادة ١٠ من قانون مجلس الدولة رقم ٤٧ لسنة ١٩٧٢ على اختصاص محاكم مجلس الدولة بالفصل في طلبات إلغاء القرارات الإدارية النهائية الصادرة بالامتناع أو الرفض.
٢- توافر ركني الجدية والاستعجال في طلب وقف التنفيذ: حيث يترتب على استمرار القرار مساس بمركز المدعي الوظيفي وحقوقه المالية المستقرة مما يتعذر تداركه مستقبلاً.
٣- استقر قضاء المحكمة الإدارية العليا على أن: "القرار الإداري يجب أن يقوم على سبب يبرره صدقاً وحقاً في الواقع والقانون، فإن نكلت جهة الإدارة عن تقديم أسبابه أو شابه عيب إساءة استعمال السلطة تعين القضاء بإلغائه" (حكم المحكمة الإدارية العليا في الطعن رقم ١٢٤٠ لسنة ٤٢ ق).

بناءً عليه:
يلتمس المدعي تحديد أقرب جلسة أمام الدائرة المختصة بمحكمة القضاء الإداري للقضاء بالطلبات سالفة البيان.`,
    tags: ['مجلس الدولة', 'قضاء إداري', 'دعوى إلغاء', 'وقف تنفيذ'],
  }
];

interface LegalLibraryProps {
  onSelectForDrafting?: (templateText: string) => void;
}

export const LegalLibrary: React.FC<LegalLibraryProps> = ({ onSelectForDrafting }) => {
  const [documents, setDocuments] = useState<LibraryDocument[]>(getLibraryDocuments());
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<LibraryDocument | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State for Adding / Uploading
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<LibraryDocument['category']>('مذكرة دفاع');
  const [formDescription, setFormDescription] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formFileName, setFormFileName] = useState<string | undefined>();
  const [formFileType, setFormFileType] = useState<string | undefined>();
  const [formFileSize, setFormFileSize] = useState<number | undefined>();

  const lawyer = getStoredLawyerProfile();

  useEffect(() => {
    const handleUpdate = () => {
      setDocuments(getLibraryDocuments());
    };
    window.addEventListener('library-docs-updated', handleUpdate);
    return () => window.removeEventListener('library-docs-updated', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSeedDefaults = () => {
    INITIAL_STARTER_TEMPLATES.forEach((tmpl, i) => {
      saveLibraryDocument({
        ...tmpl,
        id: `lib_seed_${Date.now()}_${i}`,
        createdAt: new Date().toISOString(),
      });
    });
    showToast('✓ تمت إضافة النماذج القضائية الاسترشادية بنجاح إلى المكتبة!');
  };

  const handleFileExtracted = (text: string, info: { fileName: string; fileType: string; fileSize: number }) => {
    setFormFileName(info.fileName);
    setFormFileType(info.fileType);
    setFormFileSize(info.fileSize);
    setFormContent(text);
    
    // Auto title from file name without extension
    const cleanTitle = info.fileName.replace(/\.[^/.]+$/, '');
    setFormTitle(cleanTitle);

    // Auto infer category from content or title
    const lower = (cleanTitle + ' ' + text).toLowerCase();
    if (lower.includes('طعن') || lower.includes('نقض') || lower.includes('إدارية عليا')) {
      setFormCategory('تقرير طعن نقض / إدارية');
    } else if (lower.includes('صحيفة') || lower.includes('عريضة') || lower.includes('افتتاح دعوى')) {
      setFormCategory('صحيفة دعوى');
    } else if (lower.includes('إنذار') || lower.includes('محضرين')) {
      setFormCategory('إنذار رسمي');
    } else if (lower.includes('عقد') || lower.includes('اتفاق') || lower.includes('تصالح')) {
      setFormCategory('صيغة عقد');
    } else if (lower.includes('حكم') || lower.includes('مبدأ')) {
      setFormCategory('حكم قضائي ومبدأ نقض');
    } else {
      setFormCategory('مذكرة دفاع');
    }

    setIsAddModalOpen(true);
    showToast(`✓ تم استخراج وقراءة ملف "${info.fileName}" بنجاح! راجع البيانات واضغط حفظ.`);
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      alert('يرجى كتابة عنوان ونص النموذج أولاً.');
      return;
    }

    const newDoc: LibraryDocument = {
      id: 'doc_' + Date.now(),
      title: formTitle.trim(),
      category: formCategory,
      description: formDescription.trim(),
      content: formContent.trim(),
      fileName: formFileName,
      fileType: formFileType,
      fileSize: formFileSize,
      tags: formTags ? formTags.split(',').map(t => t.trim()).filter(Boolean) : [],
      createdAt: new Date().toISOString(),
    };

    saveLibraryDocument(newDoc);
    setIsAddModalOpen(false);
    resetForm();
    showToast('✓ تم حفظ النموذج في المكتبة بنجاح! سيتم استخدامه في صياغة المذكرات المشابهة.');
  };

  const resetForm = () => {
    setFormTitle('');
    setFormCategory('مذكرة دفاع');
    setFormDescription('');
    setFormContent('');
    setFormTags('');
    setFormFileName(undefined);
    setFormFileType(undefined);
    setFormFileSize(undefined);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('هل أنت متأكد من حذف هذا النموذج من المكتبة؟')) {
      deleteLibraryDocument(id);
      if (viewingDoc?.id === id) setViewingDoc(null);
      showToast('✓ تم حذف النموذج من المكتبة.');
    }
  };

  const handleCopy = (doc: LibraryDocument, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(doc.content);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('✓ تم نسخ نص النموذج إلى الحافظة.');
  };

  const handleExportDocx = (doc: LibraryDocument, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const htmlContent = `
      <div style="font-size: 14pt; line-height: 2.1; font-family: 'Amiri', serif;">
        <div style="white-space: pre-line; text-align: justify;">
          ${doc.content.replace(/\n/g, '<br/>')}
        </div>
      </div>
    `;
    exportToWordDocument(doc.title, htmlContent, lawyer);
  };

  // Filtered documents
  const filteredDocs = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'الكل' || doc.category === selectedCategory;
    if (!matchesCategory) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      doc.title.toLowerCase().includes(q) ||
      (doc.description && doc.description.toLowerCase().includes(q)) ||
      doc.content.toLowerCase().includes(q) ||
      (doc.tags && doc.tags.some(t => t.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-950 border-2 border-emerald-500 rounded-xl px-5 py-3 text-emerald-200 text-sm font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            المكتبة القانونية وصيغ النماذج المعتمدة
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-2">
            المكتبة القانونية
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            مستودعك القضائي الخاص لحفظ نماذج مذكراتك، وصحف الدعاوى، والطعون، والعقود. عندما تطلب صياغة أي مذكرة في التطبيق، يستند الذكاء الاصطناعي تلقائياً إلى النماذج المشابهة المحفوظة هنا ليصيغ لك بذات الرصانة والأسلوب.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            إضافة نموذج جديد
          </button>

          {documents.length === 0 && (
            <button
              onClick={handleSeedDefaults}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              تضمين نماذج استرشادية معتمدة
            </button>
          )}
        </div>
      </div>

      {/* File Upload Section for Library (Word, PDF, OCR, Text) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Upload className="w-4 h-4 text-amber-400" />
            رفع ملف قانوني إلى المكتبة مباشرة (Word / PDF / صور ماسح ضوئي / نصوص):
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            يتم استخراج كامل النص وتصنيف النموذج تلقائياً
          </span>
        </div>

        <FileUploadArea
          onTextExtracted={handleFileExtracted}
          label="انقر أو اسحب ملف وورد (.docx)، أو PDF، أو صورة محرر قضائي لإضافته مباشرة إلى مكتبتك القانونية"
        />
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في عناوين النماذج، الكلمات المفتاحية، أو نصوص المذكرات..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
            <FolderKanban className="w-4 h-4 text-amber-400" />
            <span>إجمالي النماذج:</span>
            <strong className="text-amber-300">{documents.length}</strong>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('الكل')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'الكل'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            الكل ({documents.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = documents.filter(d => d.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map(doc => (
            <div
              key={doc.id}
              onClick={() => setViewingDoc(doc)}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group cursor-pointer space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {doc.category}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleCopy(doc, e)}
                      title="نسخ النص"
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      {copiedId === doc.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => handleExportDocx(doc, e)}
                      title="تصدير Word مع الترويسة"
                      className="p-1 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(doc.id, e)}
                      title="حذف النموذج"
                      className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-100 text-sm group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                  {doc.title}
                </h3>

                {doc.description && (
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {doc.description}
                  </p>
                )}

                <div className="mt-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 line-clamp-3 font-serif leading-relaxed">
                  {doc.content}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-500">
                <span>{new Date(doc.createdAt).toLocaleDateString('ar-EG')}</span>
                <span className="text-amber-400 font-semibold group-hover:underline flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  عرض وتفاصيل
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="text-slate-300 font-bold text-base">لا توجد نماذج مطابقة في المكتبة حالياً</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            يمكنك رفع ملفات وورد، أو PDF، أو كتابة وإضافة نماذج مذكراتك القضائية المفضلة لكي يستعين بها النظام دائماً في صياغة المحررات المشابهة.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إضافة نموذج جديد
            </button>
            <button
              onClick={handleSeedDefaults}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              إضافة نماذج استرشادية معتمدة
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 my-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-base">
                <FileText className="w-5 h-5 text-amber-400" />
                إضافة نموذج جديد إلى المكتبة القانونية
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    عنوان النموذج القضائي: <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="مثال: مذكرة دفاع في دعوى فسخ عقد بيع لعدم الوفاء بالثمن"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    تصنيف النموذج:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  وصف مختصر للموضوع والنزاع (اختياري):
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="مثال: يركز على إعمال الشرط الفاسخ الصريح والطعن بالصورية..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  نص النموذج أو المذكرة أو العريضة بالكامل: <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={9}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="الصق نص المذكرة أو الصحيفة هنا..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-slate-100 text-xs font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  كلمات دلالية للبحث والربط التلقائي (مفصولة بفاصلة):
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="مثال: فسخ, تعويض, بيع, شيك, نقض..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  حفظ النموذج في المكتبة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Document Details Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-5 my-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 gap-3">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
                  {viewingDoc.category}
                </span>
                <h2 className="text-lg font-bold text-slate-100">
                  {viewingDoc.title}
                </h2>
                {viewingDoc.description && (
                  <p className="text-xs text-slate-400 mt-1">{viewingDoc.description}</p>
                )}
              </div>

              <button
                onClick={() => setViewingDoc(null)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content View */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 max-h-[55vh] overflow-y-auto font-serif text-slate-200 text-sm leading-loose whitespace-pre-wrap selection:bg-amber-500/30">
              {viewingDoc.content}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(viewingDoc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                >
                  {copiedId === viewingDoc.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === viewingDoc.id ? 'تم النسخ' : 'نسخ النص'}
                </button>
                <button
                  onClick={() => handleExportDocx(viewingDoc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  تصدير Word (.doc)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(viewingDoc.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  حذف من المكتبة
                </button>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
