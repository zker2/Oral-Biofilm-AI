/* =============================================
   TOOTH CHECK! / ORALSCAN AI — merged script v3
   Camera fixes:
   - Safari: manual video.play(), no auto-start
   - iOS: getUserMedia only inside user gesture
   - canvas.toBlob() → toDataURL() fallback
   - Front / back camera toggle (facingMode)
   - Mirror front camera via CSS class
   - Three clear states: idle / live / captured
   ============================================= */

'use strict';

const MODEL_PATH = './model/';

/* ─── Text dictionaries ─────────────────────── */
const T = {
  kid: {
    en: {
      heroTitle: 'How clean are your teeth? 🦷',
      heroSubtitle: "Take a photo after using your special pink dye. Toby will check for you!",
      tabUpload: 'Use a photo', tabCamera: 'Take a photo',
      dzHint: 'Drop your tooth photo here', chooseFile: 'Choose a photo',
      cameraIdleText: 'Tap to open camera',
      startCamera: 'Start camera', capture: 'Snap! 📸', retake: '↩ Retake', cancelLive: 'Cancel',
      flipFront: 'Front', flipBack: 'Back',
      analyzeBtn: 'Check my teeth! 🔍', analyzing: 'Toby is looking…',
      tipsHeading: "Here's what to do 👇", restartText: 'Check again!', shareText: 'Show a grown-up',
      modeToggle: '🩺 Pro Mode', disclaimerStrong: 'For parents & dentists:',
      disclaimerBody: 'This tool screens plaque levels from disclosing-gel photos using an AI model. It is not a clinical diagnosis. Always consult a dentist for professional advice.',
      toastNoImage: 'First, upload or take a photo! 📸', toastCopied: '✓ Copied for the dentist!',
      toastNoCam: 'Camera not available. Try uploading a photo instead!',
      modelWaiting: 'Toby is still waking up… please wait! 😴',
      predictError: "Oops! Toby couldn't read that photo. Try again! 😅",
    },
    th: {
      heroTitle: 'ฟันของเราสะอาดแค่ไหน? 🦷',
      heroSubtitle: 'ถ่ายรูปหลังใช้สารย้อมคราบฟัน แล้วให้ Toby ช่วยตรวจให้!',
      tabUpload: 'ใช้รูปภาพ', tabCamera: 'ถ่ายรูป',
      dzHint: 'วางรูปฟันของเราที่นี่', chooseFile: 'เลือกรูปภาพ',
      cameraIdleText: 'แตะเพื่อเปิดกล้อง',
      startCamera: 'เปิดกล้อง', capture: 'ถ่าย! 📸', retake: '↩ ถ่ายใหม่', cancelLive: 'ยกเลิก',
      flipFront: 'กล้องหน้า', flipBack: 'กล้องหลัง',
      analyzeBtn: 'ตรวจฟันเลย! 🔍', analyzing: 'Toby กำลังดูอยู่…',
      tipsHeading: 'ทำแบบนี้นะ 👇', restartText: 'ตรวจอีกครั้ง!', shareText: 'บอกผู้ใหญ่ด้วย',
      modeToggle: '🩺 โหมดผู้ใหญ่', disclaimerStrong: 'สำหรับผู้ปกครองและทันตแพทย์:',
      disclaimerBody: 'เครื่องมือนี้ตรวจระดับคราบจุลินทรีย์จากภาพถ่ายหลังใช้สารย้อม โดยใช้โมเดล AI ไม่ใช่การวินิจฉัยทางคลินิก ควรปรึกษาทันตแพทย์เสมอ',
      toastNoImage: 'อัปโหลดหรือถ่ายรูปก่อนนะ! 📸', toastCopied: '✓ คัดลอกให้ทันตแพทย์แล้ว!',
      toastNoCam: 'กล้องไม่พร้อมใช้งาน ลองอัปโหลดรูปแทนนะ!',
      modelWaiting: 'Toby ยังไม่พร้อม รอแป๊บนะ! 😴',
      predictError: 'อุ๊ย! Toby อ่านรูปนี้ไม่ได้ ลองใหม่นะ! 😅',
    }
  },
  pro: {
    en: {
      heroTitle: 'Know your caries risk in seconds.',
      heroSubtitle: 'Upload a photo taken after applying disclosing gel. The AI reads your biofilm distribution and returns a calibrated risk score with clinical guidance.',
      eyebrow: 'Disclosing-gel image analysis',
      wfStep1: 'Apply gel & photograph', wfStep2: 'Upload image', wfStep3: 'Read your report',
      tabUpload: 'Upload Photo', tabCamera: 'Take Photo',
      dzHint: 'Drop your post-gel dental photo here', dzMeta: 'PNG · JPG · WEBP · max 10 MB', chooseFile: 'Choose file',
      cameraIdleText: 'Tap to start camera',
      startCamera: 'Start Camera', capture: 'Capture', retake: '↩ Retake', cancelLive: 'Cancel',
      flipFront: 'Front', flipBack: 'Back',
      analyzeBtn: 'Analyze Image', analyzing: 'Analyzing…',
      riskLabel: 'Risk Assessment', confTitle: 'Confidence Breakdown', recTitle: 'Clinical Recommendation',
      gsLow: 'Low', gsMed: 'Medium', gsHigh: 'High', trendTitle: 'Your Risk Trend',
      restartText: 'Analyze Another', shareText: 'Copy Summary',
      modeToggle: '🧒 Kid Mode', disclaimerStrong: '',
      disclaimerBody: 'For educational screening only. Not a substitute for professional dental diagnosis. Always consult a licensed dentist for clinical decisions.',
      modelLoading: 'Loading model…', modelReady: 'Ready', modelError: 'Load failed',
      historyTitle: 'History', clearAll: 'Clear all', historyEmpty: 'No analyses yet. Upload an image to get started.',
      toastNoImage: 'Please upload or capture an image first.',
      copiedMsg: 'Summary copied to clipboard!', toastCopied: 'Summary copied to clipboard!',
      toastNoCam: 'Camera not available. Please use Upload instead.',
      modelWaiting: 'AI model is still loading. Please wait a moment.',
      predictError: 'Unable to analyze image. Please try again.',
      trendUp: 'Your risk has increased compared to your previous analysis.',
      trendDown: 'Great progress — your risk has decreased since your last analysis.',
      trendSame: 'Your risk level is similar to your previous analysis.',
      trendFirst: 'This is your first analysis. Keep tracking to see your trend.',
      low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk',
    },
    th: {
      heroTitle: 'รู้ระดับความเสี่ยงฟันผุ',
      heroSubtitle: 'อัปโหลดภาพหลังใช้สารย้อมคราบจุลินทรีย์ ระบบ AI จะประเมินความเสี่ยงของฟันผุและคราบชีวภาพโดยอัตโนมัติ',
      eyebrow: 'วิเคราะห์ภาพหลังใช้สารย้อมคราบ',
      wfStep1: 'ทาสารย้อมแล้วถ่ายรูป', wfStep2: 'อัปโหลดรูปภาพ', wfStep3: 'อ่านผลการวิเคราะห์',
      tabUpload: 'อัปโหลดรูป', tabCamera: 'ถ่ายรูป',
      dzHint: 'วางรูปภาพช่องปากที่นี่', dzMeta: 'PNG · JPG · WEBP · สูงสุด 10 MB', chooseFile: 'เลือกรูปภาพ',
      cameraIdleText: 'แตะเพื่อเปิดกล้อง',
      startCamera: 'เปิดกล้อง', capture: 'ถ่ายรูป', retake: '↩ ถ่ายใหม่', cancelLive: 'ยกเลิก',
      flipFront: 'กล้องหน้า', flipBack: 'กล้องหลัง',
      analyzeBtn: 'วิเคราะห์รูปภาพ', analyzing: 'กำลังวิเคราะห์…',
      riskLabel: 'ผลการประเมินความเสี่ยง', confTitle: 'ระดับความมั่นใจ', recTitle: 'คำแนะนำทางทันตกรรม',
      gsLow: 'ต่ำ', gsMed: 'ปานกลาง', gsHigh: 'สูง', trendTitle: 'แนวโน้มความเสี่ยง',
      restartText: 'วิเคราะห์รูปใหม่', shareText: 'คัดลอกสรุปผล',
      modeToggle: '🧒 โหมดเด็ก', disclaimerStrong: '',
      disclaimerBody: 'เครื่องมือนี้ใช้เพื่อการคัดกรองเบื้องต้นเท่านั้น ไม่สามารถใช้แทนการวินิจฉัยโดยทันตแพทย์ได้',
      modelLoading: 'กำลังโหลด…', modelReady: 'พร้อมใช้งาน', modelError: 'โหลดไม่สำเร็จ',
      historyTitle: 'ประวัติ', clearAll: 'ล้างทั้งหมด', historyEmpty: 'ยังไม่มีการวิเคราะห์ อัปโหลดรูปภาพเพื่อเริ่มต้น',
      toastNoImage: 'อัปโหลดหรือถ่ายรูปก่อนนะ',
      copiedMsg: 'คัดลอกสรุปผลแล้ว!', toastCopied: 'คัดลอกสรุปผลแล้ว!',
      toastNoCam: 'กล้องไม่พร้อมใช้งาน ลองอัปโหลดรูปแทน',
      modelWaiting: 'โมเดลกำลังโหลด กรุณารอสักครู่',
      predictError: 'ไม่สามารถวิเคราะห์รูปภาพได้ ลองใหม่อีกครั้ง',
      trendUp: 'ความเสี่ยงเพิ่มขึ้นจากการวิเคราะห์ครั้งก่อน',
      trendDown: 'ดีขึ้น — ความเสี่ยงลดลงจากครั้งก่อน',
      trendSame: 'ระดับความเสี่ยงใกล้เคียงกับครั้งก่อน',
      trendFirst: 'นี่คือการวิเคราะห์ครั้งแรกของคุณ ติดตามต่อเนื่องเพื่อดูแนวโน้ม',
      low: 'ความเสี่ยงต่ำ', medium: 'ความเสี่ยงปานกลาง', high: 'ความเสี่ยงสูง',
    }
  }
};

function t(key) {
  return T[state.mode]?.[state.lang]?.[key]
      ?? T[state.mode]?.en?.[key]
      ?? T.pro.en[key]
      ?? key;
}
function localLabel(label) {
  const map = { 'Low Risk': 'low', 'Medium Risk': 'medium', 'High Risk': 'high' };
  return T.pro[state.lang]?.[map[label]] ?? label;
}

/* ─── Risk content ─────────────────────────── */
const RISK = {
  'Low Risk': {
    key: 'low', needlePct: 10, ringPct: 22,
    kid: {
      toby: 'happy', stars: '⭐⭐⭐',
      headline: { en: 'Amazing job! 🎉', th: 'เยี่ยมมากเลย! 🎉' },
      message: { en: 'Toby is super happy! Your teeth look really clean. Keep brushing every day!', th: 'Toby ดีใจมากเลย! ฟันของเราสะอาดมากๆ คงแปรงฟันดีมากเลยนะ!' },
      tips: {
        en: [{ icon: '🪥', text: 'Keep brushing for 2 minutes, morning and night!' }, { icon: '🧵', text: 'Use floss or a little brush to clean between your teeth.' }, { icon: '🍎', text: 'Eat yummy fruits and veggies instead of too many sweets.' }, { icon: '🦷', text: "Visit your dentist every 6 months — you're doing great!" }],
        th: [{ icon: '🪥', text: 'แปรงฟัน 2 นาที เช้าและก่อนนอนทุกวันนะ!' }, { icon: '🧵', text: 'ใช้ไหมขัดฟันเพื่อทำความสะอาดซอกฟันด้วย' }, { icon: '🍎', text: 'กินผักผลไม้แทนขนมหวาน ฟันจะได้แข็งแรง!' }, { icon: '🦷', text: 'ไปหาหมอฟันทุก 6 เดือนนะ — ทำได้ดีมาก!' }]
      }
    },
    pro: {
      recommendation: { en: 'Your plaque levels appear well-controlled. Keep up the great work!', th: 'ระดับคราบจุลินทรีย์อยู่ในเกณฑ์ดี คุณดูแลสุขภาพช่องปากได้อย่างเหมาะสม' },
      tips: {
        en: ['Keep brushing for at least 2 minutes, twice daily.', 'Floss or use interdental brushes once a day.', 'Schedule a routine dental check-up every 6 months.', 'Maintain a low-sugar, balanced diet.'],
        th: ['แปรงฟันอย่างน้อยวันละ 2 ครั้ง ครั้งละ 2 นาที', 'ใช้ไหมขัดฟันหรือแปรงซอกฟันทุกวัน', 'ตรวจสุขภาพช่องปากทุก 6 เดือน', 'หลีกเลี่ยงอาหารและเครื่องดื่มที่มีน้ำตาลสูง']
      }
    }
  },
  'Medium Risk': {
    key: 'medium', needlePct: 50, ringPct: 55,
    kid: {
      toby: 'medium', stars: '⭐⭐',
      headline: { en: 'Pretty good! Keep going 💪', th: 'ดีมากเลย! สู้ๆ นะ 💪' },
      message: { en: "Toby thinks you're doing okay, but some spots need a little more brushing. You can do it!", th: 'Toby คิดว่าทำได้ดีนะ แต่บางส่วนยังต้องแปรงเพิ่มอีกหน่อย เดี๋ยวก็ดีขึ้นเอง!' },
      tips: {
        en: [{ icon: '🪥', text: 'Try brushing a little longer — count to 120 while you brush!' }, { icon: '🔦', text: 'Look in the mirror so you can see all the tricky spots.' }, { icon: '🧵', text: 'Ask a grown-up to help you floss between your teeth.' }, { icon: '🍬', text: 'Have fewer sweets — maybe just one treat a day.' }, { icon: '🦷', text: 'Tell your dentist — they can help you get even better!' }],
        th: [{ icon: '🪥', text: 'ลองแปรงให้นานขึ้นหน่อย — นับถึง 120 ขณะแปรง!' }, { icon: '🔦', text: 'ส่องกระจกแปรงฟัน จะได้เห็นทุกซอกทุกมุม' }, { icon: '🧵', text: 'ให้ผู้ใหญ่ช่วยใช้ไหมขัดฟันให้ด้วยนะ' }, { icon: '🍬', text: 'ลดขนมหวานลงหน่อย — กินได้วันละ 1 ครั้งก็พอ' }, { icon: '🦷', text: 'บอกหมอฟันด้วย เดี๋ยวช่วยให้ดียิ่งขึ้น!' }]
      }
    },
    pro: {
      recommendation: { en: 'Moderate plaque activity detected. Some areas may need extra attention.', th: 'พบคราบจุลินทรีย์ในระดับปานกลาง ควรดูแลทำความสะอาดบางบริเวณเพิ่มเติม' },
      tips: {
        en: ['Review your brushing technique — use a timer for 2 full minutes.', 'Add interdental cleaning (floss, water flosser) to your daily routine.', 'Reduce frequency of sugary snacks and drinks.', 'Consider a fluoride mouthwash for added protection.', 'Schedule a professional cleaning within 3 months.'],
        th: ['ปรับปรุงเทคนิคการแปรงฟัน จับเวลาอย่างน้อย 2 นาที', 'ใช้ไหมขัดฟันหรือเครื่องฉีดน้ำทำความสะอาดซอกฟันเป็นประจำ', 'ลดความถี่ในการรับประทานของหวานและเครื่องดื่มที่มีน้ำตาล', 'พิจารณาใช้น้ำยาบ้วนปากผสมฟลูออไรด์', 'ควรเข้ารับการขูดหินปูนภายใน 3 เดือน']
      }
    }
  },
  'High Risk': {
    key: 'high', needlePct: 90, ringPct: 88,
    kid: {
      toby: 'sad', stars: '⭐',
      headline: { en: 'Time to brush more! 🪥', th: 'แปรงฟันเพิ่มอีกหน่อยนะ! 🪥' },
      message: { en: "Toby is a little worried. There's some stuff on your teeth that needs to come off. Don't worry — a bit more brushing will help a lot!", th: 'Toby เป็นห่วงนิดหน่อย มีคราบบนฟันที่ต้องกำจัดออก ไม่ต้องกังวลนะ แปรงเพิ่มอีกนิดก็จะดีขึ้นเลย!' },
      tips: {
        en: [{ icon: '🪥', text: 'Brush your teeth after every meal and before bed tonight.' }, { icon: '👩‍⚕️', text: 'Show a grown-up this result — they can help you make a plan.' }, { icon: '🍬', text: 'Drink water instead of juice or fizzy drinks for now.' }, { icon: '🧵', text: 'Use floss or a tiny brush for the gaps between teeth.' }, { icon: '🦷', text: 'Go see your dentist soon — they are there to help you!' }],
        th: [{ icon: '🪥', text: 'แปรงฟันหลังอาหารทุกมื้อและก่อนนอนเลยนะ' }, { icon: '👩‍⚕️', text: 'บอกผู้ใหญ่เกี่ยวกับผลนี้ด้วย เดี๋ยวช่วยวางแผนให้' }, { icon: '🍬', text: 'ดื่มน้ำเปล่าแทนน้ำหวานหรือน้ำอัดลมก่อนนะ' }, { icon: '🧵', text: 'ใช้ไหมขัดฟันหรือแปรงซอกฟันทำความสะอาดร่องฟัน' }, { icon: '🦷', text: 'ไปหาหมอฟันเร็วๆ นี้เลย — หมอพร้อมช่วยเสมอ!' }]
      }
    },
    pro: {
      recommendation: { en: 'Significant plaque accumulation detected. Professional dental care is strongly advised.', th: 'พบคราบจุลินทรีย์สะสมในระดับสูง ควรเข้ารับการตรวจและดูแลโดยทันตแพทย์' },
      tips: {
        en: ['Book a dental appointment as soon as possible.', 'Ask your dentist about a personalised plaque control programme.', 'Brush after every meal and before bedtime.', 'Eliminate sugary drinks and reduce refined carbohydrates.', 'Consider using disclosing tablets regularly to visualise remaining plaque.', 'Ask about prescription-strength fluoride toothpaste.'],
        th: ['นัดพบทันตแพทย์โดยเร็วที่สุด', 'ขอคำแนะนำเรื่องการควบคุมคราบจุลินทรีย์เฉพาะบุคคล', 'แปรงฟันหลังอาหารทุกมื้อและก่อนนอน', 'หลีกเลี่ยงเครื่องดื่มที่มีน้ำตาลและอาหารคาร์โบไฮเดรตขัดสี', 'ใช้เม็ดย้อมคราบจุลินทรีย์เพื่อตรวจสอบการแปรงฟัน', 'ปรึกษาเรื่องยาสีฟันฟลูออไรด์ความเข้มข้นสูง']
      }
    }
  }
};

const LABEL_MAP = [
  { pattern: /low/i,  label: 'Low Risk' },
  { pattern: /med/i,  label: 'Medium Risk' },
  { pattern: /high/i, label: 'High Risk' }
];
const RISK_RANK  = { 'Low Risk': 1, 'Medium Risk': 2, 'High Risk': 3 };
const RISK_SCORE = { 'Low Risk': 20, 'Medium Risk': 55, 'High Risk': 90 };

function normaliseLabel(raw) {
  for (const { pattern, label } of LABEL_MAP) {
    if (pattern.test(raw)) return label;
  }
  return raw;
}

/* ─── State ─────────────────────────────────── */
const state = {
  mode:            'kid',
  lang:            'en',
  model:           null,
  uploadedFile:    null,
  capturedBlob:    null,
  isAnalyzing:     false,
  cameraStream:    null,
  activeTab:       'upload',
  facingMode:      'user',     // 'user' (front) | 'environment' (back)
  history:         JSON.parse(localStorage.getItem('toothcheck_history') || '[]'),
  lastPredictions: null,
};

/* ─── DOM refs ───────────────────────────────── */
const el  = id => document.getElementById(id);
const dom = {
  html:             document.documentElement,

  // Toby
  tobyWrap:         el('tobyWrap'),
  tobyNeutral:      el('tobyNeutral'),
  tobyHappy:        el('tobyHappy'),
  tobyMedium:       el('tobyMedium'),
  tobySad:          el('tobySad'),

  // Hero
  heroTitle:        el('heroTitle'),
  heroSubtitle:     el('heroSubtitle'),

  // Upload
  dropZone:         el('dropZone'),
  fileInput:        el('fileInput'),
  dropContent:      el('dropContent'),
  previewWrap:      el('previewWrap'),
  previewImg:       el('previewImg'),
  removeBtn:        el('removeBtn'),
  previewFilename:  el('previewFilename'),
  scanSweep:        el('scanSweep'),

  // Camera — three states
  cameraIdle:       el('cameraIdle'),
  cameraLive:       el('cameraLive'),
  cameraCaptured:   el('cameraCaptured'),
  cameraFeed:       el('cameraFeed'),
  captureCanvas:    el('captureCanvas'),
  capturedImg:      el('capturedImg'),

  // Buttons
  startCameraBtn:   el('startCameraBtn'),
  flipCameraBtn:    el('flipCameraBtn'),   // idle flip toggle
  flipLiveBtn:      el('flipLiveBtn'),     // live flip button
  captureBtn:       el('captureBtn'),
  cancelLiveBtn:    el('cancelLiveBtn'),
  retakeBtn:        el('retakeBtn'),

  analyzeBtn:       el('analyzeBtn'),
  btnSpinner:       el('btnSpinner'),

  // Status chip (pro)
  chipDot:          el('chipDot'),
  chipLabel:        el('chipLabel'),

  // Results
  resultsSection:   el('resultsSection'),
  resultStars:      el('resultStars'),
  resultHeadline:   el('resultHeadline'),
  resultMessage:    el('resultMessage'),
  kidResultCard:    el('kidResultCard'),
  tipsListKid:      el('tipsListKid'),
  scorePanel:       el('scorePanel'),
  recPanel:         el('recPanel'),
  resultLevel:      el('resultLevel'),
  riskPill:         el('riskPill'),
  confidenceBars:   el('confidenceBars'),
  ringFill:         el('ringFill'),
  ringPct:          el('ringPct'),
  gsNeedle:         el('gsNeedle'),
  recText:          el('recText'),
  recTips:          el('recTips'),
  trendPanel:       el('trendPanel'),
  trendChart:       el('trendChart'),
  trendNote:        el('trendNote'),

  // History (pro)
  historyPanel:     el('historyPanel'),
  historyOverlay:   el('historyOverlay'),
  historyList:      el('historyList'),
  historyEmpty:     el('historyEmpty'),
  historyCount:     el('historyCount'),
  historyStats:     el('historyStats'),

  toast:            el('toast'),
  langBtn:          el('langBtn'),
  modeBtn:          el('modeBtn'),
};

/* ─── Model ──────────────────────────────────── */
async function loadModel() {
  setChip('loading', t('modelLoading'));
  try {
    state.model = await tmImage.load(MODEL_PATH + 'model.json', MODEL_PATH + 'metadata.json');
    setChip('ready', t('modelReady'));
  } catch (err) {
    console.warn('Model load failed:', err);
    state.model = null;
    setChip('error', t('modelError'));
  }
}
function setChip(cls, text) {
  if (!dom.chipDot) return;
  dom.chipDot.className = 'status-dot ' + cls;
  if (dom.chipLabel) dom.chipLabel.textContent = text;
}

/* ─── Toby reactions ─────────────────────────── */
function showToby(mood) {
  [dom.tobyNeutral, dom.tobyHappy, dom.tobyMedium, dom.tobySad]
    .forEach(n => n && n.classList.add('hidden'));
  if (!dom.tobyWrap) return;
  dom.tobyWrap.classList.remove('celebrate', 'wobble');
  const map = { neutral: dom.tobyNeutral, happy: dom.tobyHappy, medium: dom.tobyMedium, sad: dom.tobySad };
  const target = map[mood] ?? dom.tobyNeutral;
  if (target) target.classList.remove('hidden');
  void dom.tobyWrap.offsetWidth; // force reflow for animation restart
  if (mood === 'happy') dom.tobyWrap.classList.add('celebrate');
  if (mood === 'sad')   dom.tobyWrap.classList.add('wobble');
}

/* ─── Tabs ────────────────────────────────────── */
el('tabUpload').addEventListener('click', () => switchTab('upload'));
el('tabCamera').addEventListener('click', () => switchTab('camera'));

function switchTab(tab) {
  state.activeTab = tab;
  el('tabUpload').classList.toggle('active', tab === 'upload');
  el('tabCamera').classList.toggle('active', tab === 'camera');
  el('tabUpload').setAttribute('aria-selected', tab === 'upload');
  el('tabCamera').setAttribute('aria-selected', tab === 'camera');
  el('paneUpload').classList.toggle('hidden', tab !== 'upload');
  el('paneCamera').classList.toggle('hidden', tab !== 'camera');
  // Do NOT auto-start camera — must be user gesture for Safari
}

/* ─── Camera — Safari-safe implementation ────── */

/**
 * setCameraState: controls which of the three camera panels is visible.
 * 'idle' | 'live' | 'captured'
 */
function setCameraState(s) {
  dom.cameraIdle.classList.toggle('hidden', s !== 'idle');
  dom.cameraLive.classList.toggle('hidden', s !== 'live');
  dom.cameraCaptured.classList.toggle('hidden', s !== 'captured');
}

// Start camera — only called from a direct user click (required by Safari)
dom.startCameraBtn.addEventListener('click', () => startCamera());
dom.flipCameraBtn.addEventListener('click',  () => {
  toggleFacingMode();
  updateFlipLabel();
});
dom.flipLiveBtn.addEventListener('click', () => {
  toggleFacingMode();
  startCamera(); // restart with new facing mode
});

function toggleFacingMode() {
  state.facingMode = state.facingMode === 'user' ? 'environment' : 'user';
}

function updateFlipLabel() {
  const label = state.facingMode === 'user' ? t('flipFront') : t('flipBack');
  if (el('flipCameraText')) el('flipCameraText').textContent = label;
}

async function startCamera() {
  // Stop any existing stream first
  stopCameraStream();

  // Constraints: try exact facingMode, fall back to any camera
  const constraints = {
    video: {
      facingMode: { ideal: state.facingMode },
      width:  { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  };

  try {
    state.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (idealErr) {
    // facingMode constraint failed (some Android/desktop) — try without it
    try {
      state.cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    } catch (fallbackErr) {
      console.warn('Camera access denied:', fallbackErr);
      showToast(t('toastNoCam'));
      switchTab('upload');
      return;
    }
  }

  dom.cameraFeed.srcObject = state.cameraStream;

  // Mirror front camera
  dom.cameraFeed.classList.toggle('mirror', state.facingMode === 'user');

  // Safari requires explicit .play() call after srcObject assignment
  try {
    await dom.cameraFeed.play();
  } catch (playErr) {
    // Autoplay blocked — user will see a static frame, which is acceptable
    console.warn('Video autoplay blocked:', playErr);
  }

  setCameraState('live');
  updateFlipLabel();
}

// Capture photo
dom.captureBtn.addEventListener('click', capturePhoto);

function capturePhoto() {
  const video = dom.cameraFeed;
  const w = video.videoWidth  || video.clientWidth  || 640;
  const h = video.videoHeight || video.clientHeight || 480;
  dom.captureCanvas.width  = w;
  dom.captureCanvas.height = h;

  const ctx = dom.captureCanvas.getContext('2d');

  // Un-mirror the canvas output even if video is mirrored (front cam)
  if (state.facingMode === 'user') {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, w, h);
  if (state.facingMode === 'user') {
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
  }

  stopCameraStream();

  // toBlob with toDataURL fallback (Safari compatibility)
  if (typeof dom.captureCanvas.toBlob === 'function') {
    dom.captureCanvas.toBlob(onBlobReady, 'image/jpeg', 0.92);
  } else {
    // Safari < 15 fallback
    const dataURL = dom.captureCanvas.toDataURL('image/jpeg', 0.92);
    const byteString = atob(dataURL.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    onBlobReady(new Blob([ab], { type: 'image/jpeg' }));
  }
}

function onBlobReady(blob) {
  state.capturedBlob = blob;
  const url = URL.createObjectURL(blob);
  dom.capturedImg.src = url;
  setCameraState('captured');
  dom.analyzeBtn.disabled = false;
  hideResults();
}

// Cancel live camera
dom.cancelLiveBtn.addEventListener('click', () => {
  stopCameraStream();
  setCameraState('idle');
  // If they had already captured before, restore that
  if (state.capturedBlob) {
    setCameraState('captured');
  }
});

// Retake
dom.retakeBtn.addEventListener('click', () => {
  state.capturedBlob = null;
  dom.capturedImg.src = '';
  dom.analyzeBtn.disabled = true;
  setCameraState('idle');
  hideResults();
  showToby('neutral');
});

function stopCameraStream() {
  if (state.cameraStream) {
    state.cameraStream.getTracks().forEach(tr => tr.stop());
    state.cameraStream = null;
  }
  // Detach srcObject so Safari releases the camera indicator light
  try { dom.cameraFeed.srcObject = null; } catch (_) {}
}

/* ─── File upload ─────────────────────────────── */
function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) { showToast('Please choose a valid image file.'); return; }
  if (file.size > 10 * 1024 * 1024) { showToast('That file is too large (max 10 MB).'); return; }
  state.uploadedFile = file;
  const reader = new FileReader();
  reader.onload = e => { dom.previewImg.src = e.target.result; showPreview(file.name); };
  reader.onerror = () => { dom.previewImg.src = URL.createObjectURL(file); showPreview(file.name); };
  reader.readAsDataURL(file);
}

function showPreview(filename) {
  dom.dropContent.classList.add('hidden');
  dom.previewWrap.classList.remove('hidden');
  if (dom.previewFilename) dom.previewFilename.textContent = filename;
  dom.analyzeBtn.disabled = false;
  hideResults();
}

// Drag & drop
dom.dropZone.addEventListener('dragover', e => { e.preventDefault(); dom.dropZone.classList.add('drag-over'); });
dom.dropZone.addEventListener('dragleave', e => { if (!dom.dropZone.contains(e.relatedTarget)) dom.dropZone.classList.remove('drag-over'); });
dom.dropZone.addEventListener('drop', e => { e.preventDefault(); dom.dropZone.classList.remove('drag-over'); const f = e.dataTransfer.files[0]; if (f) handleFile(f); });

el('chooseFileBtn').addEventListener('click', e => { e.stopPropagation(); dom.fileInput.click(); });
dom.dropZone.addEventListener('click', e => {
  if (dom.removeBtn.contains(e.target)) return;
  if (!dom.previewWrap.classList.contains('hidden')) return;
  dom.fileInput.click();
});
dom.dropZone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dom.fileInput.click(); } });
dom.fileInput.addEventListener('change', e => { const f = e.target.files?.[0]; if (f) handleFile(f); dom.fileInput.value = ''; });
dom.removeBtn.addEventListener('click', e => { e.stopPropagation(); resetUpload(); });

function resetUpload() {
  state.uploadedFile = null;
  state.capturedBlob = null;
  dom.previewImg.src = '';
  dom.fileInput.value = '';
  dom.previewWrap.classList.add('hidden');
  dom.dropContent.classList.remove('hidden');
  if (dom.previewFilename) dom.previewFilename.textContent = '';
  dom.analyzeBtn.disabled = true;
  hideResults();
  showToby('neutral');
  // Reset camera too
  stopCameraStream();
  setCameraState('idle');
  dom.capturedImg.src = '';
}

/* ─── Analysis ────────────────────────────────── */
dom.analyzeBtn.addEventListener('click', runAnalysis);

async function runAnalysis() {
  if (state.isAnalyzing) return;

  const imgEl = state.activeTab === 'camera' ? dom.capturedImg : dom.previewImg;
  if (!imgEl.src || imgEl.src === location.href) { showToast(t('toastNoImage')); return; }
  if (!state.model) { showToast(t('modelWaiting')); return; }

  state.isAnalyzing = true;
  setAnalyzeLoading(true);
  setScanSweep(true);

  try {
    const predictions = await state.model.predict(imgEl);
    state.lastPredictions = predictions;
    renderResults(predictions, imgEl.src);
  } catch (err) {
    console.error('Prediction error:', err);
    showToast(t('predictError'));
  } finally {
    state.isAnalyzing = false;
    setAnalyzeLoading(false);
    setScanSweep(false);
  }
}

function setAnalyzeLoading(on) {
  el('analyzeText').textContent = on ? t('analyzing') : t('analyzeBtn');
  dom.btnSpinner.classList.toggle('hidden', !on);
  dom.analyzeBtn.disabled = on;
}

function setScanSweep(on) {
  if (dom.scanSweep) dom.scanSweep.classList.toggle('active', on);
}

/* ─── Render results ──────────────────────────── */
function renderResults(predictions, imgSrc) {
  const normalised = predictions
    .map(p => ({ label: normaliseLabel(p.className), probability: p.probability }))
    .sort((a, b) => b.probability - a.probability);
  const top = normalised[0];
  const cfg = RISK[top.label] ?? RISK['Medium Risk'];

  // Save to history
  const entry = {
    id:          Date.now(),
    label:       top.label,
    probability: top.probability,
    imgSrc:      (imgSrc || '').slice(0, 2000),
    timestamp:   new Date().toISOString(),
  };
  state.history.unshift(entry);
  if (state.history.length > 20) state.history.pop();
  saveHistory();
  renderHistory();

  renderKidResult(top, cfg);
  renderProResult(top, cfg, normalised, entry);

  dom.resultsSection.classList.remove('hidden');
  setTimeout(() => dom.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
}

function renderKidResult(top, cfg) {
  showToby(cfg.kid.toby);
  dom.resultStars.textContent             = cfg.kid.stars;
  dom.kidResultCard.dataset.risk          = cfg.key;
  dom.resultHeadline.textContent          = cfg.kid.headline[state.lang];
  dom.resultMessage.textContent           = cfg.kid.message[state.lang];
  dom.tipsListKid.innerHTML = cfg.kid.tips[state.lang]
    .map(tip => `<li><span class="tip-icon" aria-hidden="true">${tip.icon}</span><span>${tip.text}</span></li>`)
    .join('');
}

function renderProResult(top, cfg, normalised, entry) {
  dom.scorePanel.dataset.risk = cfg.key;
  dom.recPanel.dataset.risk   = cfg.key;
  dom.resultLevel.textContent = localLabel(top.label);
  dom.riskPill.textContent    = localLabel(top.label);
  el('scoreTimestamp').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Ring
  const CIRC = 201;
  const offset = CIRC - (CIRC * cfg.ringPct / 100);
  dom.ringFill.style.transition = 'none';
  dom.ringFill.style.strokeDashoffset = CIRC;
  dom.ringPct.textContent = '0%';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    dom.ringFill.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)';
    dom.ringFill.style.strokeDashoffset = offset;
    animateCount(dom.ringPct, 0, cfg.ringPct, 1200, v => v + '%');
  }));

  // Gauge needle
  dom.gsNeedle.style.left = cfg.needlePct + '%';

  // Confidence bars
  dom.confidenceBars.innerHTML = '';
  normalised.forEach(({ label, probability }) => {
    const c   = RISK[label] ?? RISK['Medium Risk'];
    const pct = Math.round(probability * 100);
    const row = document.createElement('div');
    row.className = 'conf-row';
    row.innerHTML = `
      <div class="conf-meta">
        <span class="conf-label">${localLabel(label)}</span>
        <span class="conf-pct-label">${pct}%</span>
      </div>
      <div class="conf-track">
        <div class="conf-fill c-${c.key}" data-target="${pct}"></div>
      </div>
    `;
    dom.confidenceBars.appendChild(row);
  });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    dom.confidenceBars.querySelectorAll('.conf-fill[data-target]')
      .forEach(fill => { fill.style.width = fill.dataset.target + '%'; });
  }));

  // Recommendation
  dom.recText.textContent = cfg.pro.recommendation[state.lang];
  dom.recTips.innerHTML   = cfg.pro.tips[state.lang].map(tip => `<li>${tip}</li>`).join('');

  renderTrend(entry);
}

/* ─── Trend ───────────────────────────────────── */
function renderTrend(latestEntry) {
  if (state.history.length < 2) { dom.trendPanel.classList.add('hidden'); return; }
  dom.trendPanel.classList.remove('hidden');

  const recent = state.history.slice(0, 8).reverse();
  dom.trendChart.innerHTML = '';
  recent.forEach(entry => {
    const score   = RISK_SCORE[entry.label] ?? 50;
    const heightPx = Math.round(score * 0.7);
    const cfg     = RISK[entry.label] ?? RISK['Medium Risk'];
    const lbl     = new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
    const wrap    = document.createElement('div');
    wrap.className = 'trend-bar-wrap';
    wrap.innerHTML = `<div class="trend-bar ${cfg.key}" data-h="${heightPx}px"></div><span class="trend-lbl">${lbl}</span>`;
    dom.trendChart.appendChild(wrap);
  });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    dom.trendChart.querySelectorAll('.trend-bar[data-h]')
      .forEach(bar => { bar.style.height = bar.dataset.h; });
  }));

  const prev = state.history[1];
  const curr = RISK_RANK[latestEntry.label] ?? 2;
  const p    = RISK_RANK[prev.label] ?? 2;
  dom.trendNote.textContent = curr > p ? t('trendUp')
    : curr < p ? t('trendDown')
    : t('trendSame');
}

function hideResults() { dom.resultsSection.classList.add('hidden'); }

/* ─── History panel ───────────────────────────── */
el('historyToggleBtn').addEventListener('click', openHistory);
el('historyCloseBtn').addEventListener('click',  closeHistory);
dom.historyOverlay.addEventListener('click',     closeHistory);
el('clearHistoryBtn').addEventListener('click',  () => { state.history = []; saveHistory(); renderHistory(); });

function openHistory()  { dom.historyPanel.classList.add('open'); dom.historyOverlay.classList.add('visible'); document.body.style.overflow = 'hidden'; }
function closeHistory() { dom.historyPanel.classList.remove('open'); dom.historyOverlay.classList.remove('visible'); document.body.style.overflow = ''; }

function saveHistory() {
  try { localStorage.setItem('toothcheck_history', JSON.stringify(state.history)); }
  catch (e) { state.history = state.history.slice(0, 10); localStorage.setItem('toothcheck_history', JSON.stringify(state.history)); }
}

function renderHistory() {
  dom.historyCount.textContent = state.history.length;
  dom.historyCount.classList.toggle('show', state.history.length > 0);
  dom.historyEmpty.style.display = state.history.length ? 'none' : 'flex';
  dom.historyList.querySelectorAll('.history-item').forEach(n => n.remove());

  state.history.forEach(entry => {
    const cfg  = RISK[entry.label] ?? RISK['Medium Risk'];
    const time = new Date(entry.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const pct  = Math.round(entry.probability * 100);
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <img class="hi-thumb" src="${entry.imgSrc || ''}" alt="" onerror="this.style.display='none'" />
      <div class="hi-info">
        <div class="hi-level">${localLabel(entry.label)}</div>
        <div class="hi-time">${time} · ${pct}%</div>
      </div>
      <span class="hi-tag ${cfg.key}">${localLabel(entry.label)}</span>
    `;
    dom.historyList.appendChild(item);
  });

  if (state.history.length) {
    const counts = { low: 0, medium: 0, high: 0 };
    state.history.forEach(e => { const c = RISK[e.label]; if (c) counts[c.key]++; });
    dom.historyStats.innerHTML = `
      <div class="history-stat"><strong>${counts.low}</strong> ${T.pro[state.lang].low}</div>
      <div class="history-stat"><strong>${counts.medium}</strong> ${T.pro[state.lang].medium}</div>
      <div class="history-stat"><strong>${counts.high}</strong> ${T.pro[state.lang].high}</div>
    `;
  } else {
    dom.historyStats.innerHTML = '';
  }
}

/* ─── Share ───────────────────────────────────── */
el('shareBtn').addEventListener('click', async () => {
  if (!state.lastPredictions) return;
  const normalised = state.lastPredictions
    .map(p => ({ label: normaliseLabel(p.className), probability: p.probability }))
    .sort((a, b) => b.probability - a.probability);
  const top = normalised[0];
  const cfg = RISK[top.label] ?? RISK['Medium Risk'];
  const pct = Math.round(top.probability * 100);

  const lines = state.mode === 'kid'
    ? [
        `Tooth Check! — ${new Date().toLocaleString()}`,
        `Result: ${top.label} (${pct}% confidence)`,
        cfg.kid.headline.en, '',
        cfg.kid.tips.en.map(tip => `${tip.icon} ${tip.text}`).join('\n'),
        '', '(AI screening tool — not a dental diagnosis. Please consult a dentist.)'
      ]
    : [
        `OralScan AI — ${new Date().toLocaleString()}`,
        `Risk: ${top.label} (${pct}% confidence)`, '',
        cfg.pro.recommendation.en, '',
        cfg.pro.tips.en.map(tip => `• ${tip}`).join('\n'),
        '', '⚠ Educational screening only. Consult a licensed dentist.'
      ];

  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    showToast(t('toastCopied'));
  } catch {
    showToast('Please show the screen to your dentist! 😊');
  }
});

/* ─── Restart ─────────────────────────────────── */
el('restartBtn').addEventListener('click', () => {
  resetUpload();
  switchTab('upload');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ─── Toast ───────────────────────────────────── */
let toastTimer;
function showToast(msg) {
  dom.toast.textContent = msg;
  dom.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => dom.toast.classList.remove('show'), 3200);
}

/* ─── Animated counter ────────────────────────── */
function animateCount(node, from, to, duration, formatter) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    node.textContent = formatter(Math.round(from + (to - from) * eased));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ─── Mode + Language ─────────────────────────── */
dom.modeBtn.addEventListener('click', () => {
  state.mode = state.mode === 'kid' ? 'pro' : 'kid';
  // Stop camera when switching modes to avoid orphan streams
  stopCameraStream();
  setCameraState('idle');
  applyMode();
});
dom.langBtn.addEventListener('click', () => {
  state.lang = state.lang === 'en' ? 'th' : 'en';
  applyAll();
});

function applyMode() {
  dom.html.dataset.mode = state.mode;
  applyAll();
}

function applyAll() {
  dom.langBtn.textContent  = state.lang === 'en' ? 'EN / ไทย' : 'ไทย / EN';
  dom.modeBtn.textContent  = t('modeToggle');

  // Hero
  dom.heroTitle.textContent    = t('heroTitle');
  dom.heroSubtitle.textContent = t('heroSubtitle');
  const eyebrow = el('heroEyebrow');
  if (eyebrow) eyebrow.textContent = t('eyebrow');
  ['wfStep1','wfStep2','wfStep3'].forEach(id => { const e = el(id); if (e) e.textContent = t(id.replace('wf','wf').replace('Step','')); });
  // Fix step labels properly
  if (el('wfStep1')) el('wfStep1').textContent = t('wfStep1');
  if (el('wfStep2')) el('wfStep2').textContent = t('wfStep2');
  if (el('wfStep3')) el('wfStep3').textContent = t('wfStep3');

  // Upload / camera
  el('tabUploadText').textContent  = t('tabUpload');
  el('tabCameraText').textContent  = t('tabCamera');
  el('dzHint').textContent         = t('dzHint');
  const dzMeta = el('dzMeta');
  if (dzMeta) dzMeta.textContent   = t('dzMeta') || '';
  el('chooseFileText').textContent  = t('chooseFile');
  el('cameraIdleText').textContent  = t('cameraIdleText');
  el('startCameraText').textContent = t('startCamera');
  el('captureText').textContent     = t('capture');
  el('retakeText').textContent      = t('retake');
  el('cancelLiveText').textContent  = t('cancelLive');
  updateFlipLabel();
  if (!state.isAnalyzing) el('analyzeText').textContent = t('analyzeBtn');

  // Results
  const tipsHeadingKid = el('tipsHeadingKid');
  if (tipsHeadingKid) tipsHeadingKid.textContent = t('tipsHeading');
  const riskLabel = el('riskLabel');
  if (riskLabel) riskLabel.textContent = t('riskLabel');
  const confTitle = el('confidenceTitle');
  if (confTitle) confTitle.textContent = t('confTitle');
  const recTitle = el('recTitle');
  if (recTitle) recTitle.textContent = t('recTitle');
  ['gsLow','gsMed','gsHigh'].forEach(id => { const e = el(id); if (e) e.textContent = t(id.replace('gs','gs')); });
  if (el('gsLow'))  el('gsLow').textContent  = t('gsLow');
  if (el('gsMed'))  el('gsMed').textContent  = t('gsMed');
  if (el('gsHigh')) el('gsHigh').textContent = t('gsHigh');
  const trendTitle = el('trendTitle');
  if (trendTitle) trendTitle.textContent = t('trendTitle');
  const historyTitle = el('historyTitle');
  if (historyTitle) historyTitle.textContent = t('historyTitle');
  el('clearHistoryBtn').textContent  = t('clearAll');
  el('historyEmptyText').textContent = t('historyEmpty');

  el('restartText').textContent = t('restartText');
  el('shareText').textContent   = t('shareText');

  // Disclaimer
  const strong = t('disclaimerStrong');
  const strongEl = el('disclaimerStrong');
  const bodyEl   = el('disclaimerBody');
  if (strongEl) { strongEl.textContent = strong; strongEl.style.display = strong ? '' : 'none'; }
  if (bodyEl)   bodyEl.textContent = t('disclaimerBody');

  // Re-render live results if visible
  if (!dom.resultsSection.classList.contains('hidden') && state.lastPredictions) {
    const normalised = state.lastPredictions
      .map(p => ({ label: normaliseLabel(p.className), probability: p.probability }))
      .sort((a, b) => b.probability - a.probability);
    const top = normalised[0];
    const cfg = RISK[top.label] ?? RISK['Medium Risk'];
    renderKidResult(top, cfg);
    dom.resultLevel.textContent = localLabel(top.label);
    dom.riskPill.textContent    = localLabel(top.label);
    dom.recText.textContent     = cfg.pro.recommendation[state.lang];
    dom.recTips.innerHTML       = cfg.pro.tips[state.lang].map(tip => `<li>${tip}</li>`).join('');
    dom.confidenceBars.querySelectorAll('.conf-label')
      .forEach((labelEl, i) => { if (normalised[i]) labelEl.textContent = localLabel(normalised[i].label); });
  }

  renderHistory();
}

/* ─── Init ────────────────────────────────────── */
setCameraState('idle');
applyMode();
showToby('neutral');
renderHistory();
loadModel();