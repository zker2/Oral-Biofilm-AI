/* =============================================
   ORAL BIOFILM AI — SCRIPT
   TensorFlow.js + Teachable Machine integration
   ============================================= */

'use strict';

let currentLang = "en";

const TRANSLATIONS = {
  en: {
    clinicalPreview: "Clinical Preview",

    heroLabel: "AI-Powered Dental Analysis",
    heroTitle1: "Detect plaque risk",
    heroTitle2: "before it becomes a problem.",
    heroSub:
      "Upload a photo taken after applying disclosing gel. Our AI model instantly assesses your caries and biofilm risk level.",

    step1: "Upload photo",
    step2: "AI analyzes",
    step3: "Get results",

    uploadTitle: "Upload Image",
    uploadSub: "Drag & drop or tap to select",

    dropLabel: "Drop your dental photo here",
    dropSub: "PNG, JPG or WEBP · max 10MB",
    chooseFile: "Choose File",

    analyzeBtn: "Analyze Image",
    analyzing: "Analyzing...",

    riskAssessment: "Risk Assessment",
    confidence: "Prediction Confidence",

    recommendation: "Clinical Recommendation",

    another: "Analyze Another Image",

    low: "Low Risk",
    medium: "Medium Risk",
    high: "High Risk",

    lowLabel: "Low",
    mediumLabel: "Medium",
    highLabel: "High",

    disclaimer:
      "This tool is for educational screening purposes only and does not replace professional dental diagnosis. Always consult a licensed dentist for clinical decisions."
  },

  th: {
    clinicalPreview: "เวอร์ชันทดลองทางคลินิก",

    heroLabel: "การวิเคราะห์สุขภาพช่องปากด้วย AI",
    heroTitle1: "ตรวจความเสี่ยงคราบจุลินทรีย์",
    heroTitle2: "ก่อนที่จะกลายเป็นปัญหา",

    heroSub:
      "อัปโหลดภาพหลังใช้สารย้อมคราบจุลินทรีย์ ระบบ AI จะประเมินความเสี่ยงของฟันผุและคราบจุลินทรีย์โดยอัตโนมัติ",

    step1: "อัปโหลดรูป",
    step2: "AI วิเคราะห์",
    step3: "ดูผลลัพธ์",

    uploadTitle: "อัปโหลดรูปภาพ",
    uploadSub: "ลากวางหรือกดเพื่อเลือกรูป",

    dropLabel: "วางรูปภาพช่องปากที่นี่",
    dropSub: "PNG, JPG หรือ WEBP · สูงสุด 10MB",
    chooseFile: "เลือกรูปภาพ",

    analyzeBtn: "วิเคราะห์รูปภาพ",
    analyzing: "กำลังวิเคราะห์...",

    riskAssessment: "ผลการประเมินความเสี่ยง",
    confidence: "ความมั่นใจของการทำนาย",

    recommendation: "คำแนะนำทางทันตกรรม",

    another: "วิเคราะห์รูปใหม่",

    low: "ความเสี่ยงต่ำ",
    medium: "ความเสี่ยงปานกลาง",
    high: "ความเสี่ยงสูง",

    lowLabel: "ต่ำ",
    mediumLabel: "ปานกลาง",
    highLabel: "สูง",

    disclaimer:
      "เครื่องมือนี้ใช้เพื่อการคัดกรองเบื้องต้นเท่านั้น ไม่สามารถใช้แทนการวินิจฉัยโดยทันตแพทย์ได้"
  }
};

// ── Configuration ─────────────────────────────
const MODEL_PATH = './model/'; // folder containing model.json & metadata.json

const RISK_CONFIG = {
  'Low Risk': {
    key: 'low',
    gaugeAngle: -80,
    recommendation: {
      en: 'Your plaque levels appear well-controlled. Keep up the great work!',
      th: 'ระดับคราบจุลินทรีย์อยู่ในเกณฑ์ดี ดูแลสุขภาพช่องปากได้อย่างเหมาะสม'
    },
    tips: {
      en: [
        'Continue brushing for at least 2 minutes, twice daily.',
        'Floss or use interdental brushes once a day.',
        'Schedule a routine dental check-up every 6 months.',
        'Maintain a low-sugar, balanced diet.'
      ],
      th: [
        'แปรงฟันอย่างน้อยวันละ 2 ครั้ง ครั้งละ 2 นาที',
        'ใช้ไหมขัดฟันหรือแปรงซอกฟันทุกวัน',
        'ตรวจสุขภาพช่องปากทุก 6 เดือน',
        'หลีกเลี่ยงอาหารและเครื่องดื่มที่มีน้ำตาลสูง'
      ]
    }
  },

  'Medium Risk': {
    key: 'medium',
    gaugeAngle: 0,
    recommendation: {
      en: 'Moderate plaque activity detected. Some areas may need extra attention.',
      th: 'พบคราบจุลินทรีย์ในระดับปานกลาง ควรดูแลทำความสะอาดบางบริเวณเพิ่มเติม'
    },
    tips: {
      en: [
        'Review and improve your brushing technique — use a timer.',
        'Add interdental cleaning (floss, water flosser) to your daily routine.',
        'Reduce frequency of sugary snacks and drinks.',
        'Consider a fluoride mouthwash for added protection.',
        'Schedule a professional cleaning within 3 months.'
      ],
      th: [
        'ปรับปรุงเทคนิคการแปรงฟันและจับเวลาอย่างน้อย 2 นาที',
        'ใช้ไหมขัดฟันหรือเครื่องฉีดน้ำทำความสะอาดซอกฟันเป็นประจำ',
        'ลดความถี่ในการรับประทานของหวานและเครื่องดื่มที่มีน้ำตาล',
        'พิจารณาใช้น้ำยาบ้วนปากผสมฟลูออไรด์',
        'ควรเข้ารับการขูดหินปูนภายใน 3 เดือน'
      ]
    }
  },

  'High Risk': {
    key: 'high',
    gaugeAngle: 80,
    recommendation: {
      en: 'Significant plaque accumulation detected. Professional dental care is strongly advised.',
      th: 'พบคราบจุลินทรีย์สะสมในระดับสูง ควรเข้ารับการตรวจและดูแลโดยทันตแพทย์'
    },
    tips: {
      en: [
        'Book a dental appointment as soon as possible.',
        'Ask your dentist about a personalised plaque control programme.',
        'Brush after every meal and before bedtime.',
        'Eliminate sugary drinks and reduce refined carbohydrates.',
        'Consider using a disclosing tablet regularly to visualise remaining plaque.',
        'Ask about prescription-strength fluoride toothpaste.'
      ],
      th: [
        'นัดพบทันตแพทย์โดยเร็วที่สุด',
        'ขอคำแนะนำเรื่องการควบคุมคราบจุลินทรีย์เฉพาะบุคคล',
        'แปรงฟันหลังอาหารทุกมื้อและก่อนนอน',
        'หลีกเลี่ยงเครื่องดื่มที่มีน้ำตาลและอาหารคาร์โบไฮเดรตขัดสี',
        'ใช้เม็ดย้อมคราบจุลินทรีย์เพื่อตรวจสอบการแปรงฟัน',
        'ปรึกษาเรื่องยาสีฟันฟลูออไรด์ความเข้มข้นสูง'
      ]
    }
  }
};

// Fallback label mapping — normalises Teachable Machine class names
const LABEL_MAP = [
  { pattern: /low/i,    label: 'Low Risk' },
  { pattern: /med/i,    label: 'Medium Risk' },
  { pattern: /high/i,   label: 'High Risk' },
];

// ── State ──────────────────────────────────────
let model = null;
let uploadedFile = null;
let isAnalyzing = false;

// ── DOM References ─────────────────────────────
const dropZone    = document.getElementById('dropZone');
const fileInput   = document.getElementById('fileInput');
const dropContent = document.getElementById('dropContent');
const previewWrap = document.getElementById('previewWrap');
const previewImg  = document.getElementById('previewImg');
const removeBtn   = document.getElementById('removeBtn');
const analyzeBtn  = document.getElementById('analyzeBtn');
const btnSpinner  = document.getElementById('btnSpinner');
const modelStatus = document.getElementById('modelStatus');
const statusDot   = document.getElementById('statusDot');
const statusText  = document.getElementById('statusText');

const resultsSection  = document.getElementById('resultsSection');
const resultCard      = document.getElementById('resultCard');
const recCard         = document.getElementById('recCard');
const resultIcon      = document.getElementById('resultIcon');
const resultLevel     = document.getElementById('resultLevel');
const riskBadge       = document.getElementById('riskBadge');
const confidenceBars  = document.getElementById('confidenceBars');
const gaugeNeedle     = document.getElementById('gaugeNeedle');
const gaugePct        = document.getElementById('gaugePct');
const recIcon         = document.getElementById('recIcon');
const recText         = document.getElementById('recText');
const recTips         = document.getElementById('recTips');
const restartBtn      = document.getElementById('restartBtn');

// ── Model Loading ──────────────────────────────
async function loadModel() {
  setStatus('loading', 'Loading AI model…');
  try {
    const modelURL    = MODEL_PATH + 'model.json';
    const metaURL     = MODEL_PATH + 'metadata.json';
    model = await tmImage.load(modelURL, metaURL);
    setStatus('ready', 'AI model ready');
    if (uploadedFile) analyzeBtn.disabled = false;
  } catch (err) {
    console.warn('Model load failed:', err);
    setStatus('error', 'AI model failed to load');
    model = null;
    if (uploadedFile) analyzeBtn.disabled = false;
  }
}

function setStatus(state, text) {
  statusDot.className = 'status-dot ' + state;
  statusText.textContent = text;
}

// ── File Handling ──────────────────────────────
function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    alert('Please upload a valid image file (PNG, JPG, or WEBP).');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    alert('File is too large. Please choose an image under 10 MB.');
    return;
  }

  uploadedFile = file;
  const url = URL.createObjectURL(file);
  previewImg.src = url;

  dropContent.classList.add('hidden');
  previewWrap.classList.remove('hidden');
  analyzeBtn.disabled = !(model || true); // enable once image is loaded (model may be in demo mode)

  // Enable once image actually loaded
  previewImg.onload = () => {
    analyzeBtn.disabled = false;
  };
}

// Drag and drop
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

// Click to open file picker (anywhere on drop zone)
dropZone.addEventListener('click', (e) => {
  if (e.target === removeBtn || removeBtn.contains(e.target)) return;
  if (!previewWrap.classList.contains('hidden')) return; // image already shown
  fileInput.click();
});

dropZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

// Remove image
removeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  resetUpload();
});

function resetUpload() {
  uploadedFile = null;
  previewImg.src = '';
  fileInput.value = '';
  previewWrap.classList.add('hidden');
  dropContent.classList.remove('hidden');
  analyzeBtn.disabled = true;
  hideResults();
}

// ── Analysis ───────────────────────────────────
analyzeBtn.addEventListener('click', async () => {
  if (isAnalyzing || !uploadedFile) return;

  if (!model) {
    alert('AI Model not loaded. Please refresh the page.');
    return;
  }

  isAnalyzing = true;
  startLoading();

  try {
    const predictions = await model.predict(previewImg);

    console.log('Predictions:', predictions);

    showResults(predictions);

  } catch (err) {
    console.error('Prediction error:', err);

    alert('Unable to analyze image. Please try again.');

  } finally {
    isAnalyzing = false;
    stopLoading();
  }
});

function startLoading() {
  analyzeBtn.querySelector('.btn-text').textContent = 'Analyzing…';
  analyzeBtn.querySelector('.btn-arrow').classList.add('hidden');
  btnSpinner.classList.remove('hidden');
  analyzeBtn.disabled = true;
}

function stopLoading() {
  analyzeBtn.querySelector('.btn-text').textContent = 'Analyze Image';
  analyzeBtn.querySelector('.btn-arrow').classList.remove('hidden');
  btnSpinner.classList.add('hidden');
  analyzeBtn.disabled = false;
}

// ── Results Rendering ──────────────────────────
function normaliseLabel(rawLabel) {
  for (const { pattern, label } of LABEL_MAP) {
    if (pattern.test(rawLabel)) return label;
  }
  return rawLabel; // return as-is if no match
}

function showResults(predictions) {
  // Normalise labels
  const normalised = predictions.map(p => ({
    label: normaliseLabel(p.className),
    probability: p.probability,
  }));

  // Sort by probability descending
  normalised.sort((a, b) => b.probability - a.probability);

  // Top prediction
  const top = normalised[0];
  const config = RISK_CONFIG[top.label] || RISK_CONFIG['Medium Risk'];

  // Set card risk attribute for CSS theming
  resultCard.dataset.risk = config.key;
  recCard.dataset.risk    = config.key;
  resultCard.querySelector('.rec-icon') // also theme rec icon
  recIcon.closest ? null : null; // noop

  // Result header
  let displayLabel = top.label;

  if(currentLang === "th"){

    if(top.label === "Low Risk")
      displayLabel = "ความเสี่ยงต่ำ";

    if(top.label === "Medium Risk")
      displayLabel = "ความเสี่ยงปานกลาง";

    if(top.label === "High Risk")
      displayLabel = "ความเสี่ยงสูง";
  }

  resultLevel.textContent = displayLabel;
  riskBadge.textContent = displayLabel;

  // Confidence bars
  confidenceBars.innerHTML = '';
  normalised.forEach(({ label, probability }) => {
    const cfg   = RISK_CONFIG[label] || RISK_CONFIG['Medium Risk'];
    const pct   = Math.round(probability * 100);
    const isTop = label === top.label;

    let translatedLabel = label;

    if(currentLang === "th"){
      if(label === "Low Risk") translatedLabel = "ความเสี่ยงต่ำ";
      if(label === "Medium Risk") translatedLabel = "ความเสี่ยงปานกลาง";
      if(label === "High Risk") translatedLabel = "ความเสี่ยงสูง";
    }

    const item = document.createElement('div');
    item.className = 'conf-item';
    item.innerHTML = `
      <div class="conf-row">
        <span class="conf-name">${translatedLabel}</span>
        <span class="conf-pct">${pct}%</span>
      </div>
      <div class="conf-track">
        <div class="conf-fill ${cfg.key}-color${isTop ? ' active-fill' : ''}"
            style="width: 0%"
            data-target="${pct}"></div>
      </div>
    `;
    confidenceBars.appendChild(item);
  });

  // Animate bars after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.conf-fill[data-target]').forEach(el => {
        el.style.width = el.dataset.target + '%';
      });
    });
  });

  // Gauge needle — map risk to angle
  const angle = config.gaugeAngle;
  gaugeNeedle.setAttribute('transform', `rotate(${angle} 100 100)`);
  gaugePct.textContent = Math.round(top.probability * 100) + '%';

  // Recommendation
  recText.textContent =
  config.recommendation[currentLang];

  recTips.innerHTML =
    config.tips[currentLang]
      .map(t => `<li>${t}</li>`)
      .join('');

  // Show section
  resultsSection.classList.remove('hidden');

  // Smooth scroll to results
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function hideResults() {
  resultsSection.classList.add('hidden');
}

// Restart
restartBtn.addEventListener('click', () => {
  resetUpload();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function updateLanguage() {

  const t = TRANSLATIONS[currentLang];

  document.getElementById("clinicalPreview").lastChild.textContent =
    " " + t.clinicalPreview;

  document.getElementById("heroLabel").textContent =
    t.heroLabel;

  document.getElementById("heroTitle1").textContent =
    t.heroTitle1;

  document.getElementById("heroTitle2").textContent =
    t.heroTitle2;

  document.getElementById("heroSub").textContent =
    t.heroSub;

  document.getElementById("step1").textContent =
    t.step1;

  document.getElementById("step2").textContent =
    t.step2;

  document.getElementById("step3").textContent =
    t.step3;

  document.getElementById("uploadTitle").textContent =
    t.uploadTitle;

  document.getElementById("uploadSubtitle").textContent =
    t.uploadSub;

  document.getElementById("dropLabel").textContent =
    t.dropLabel;

  document.getElementById("dropSub").textContent =
    t.dropSub;

  document.getElementById("chooseFileText").textContent =
    t.chooseFile;

  document.getElementById("analyzeText").textContent =
    t.analyzeBtn;

  document.getElementById("riskAssessmentTitle").textContent =
    t.riskAssessment;

  document.getElementById("confidenceTitle").textContent =
    t.confidence;

  document.getElementById("recommendationTitle").textContent =
    t.recommendation;

  document.getElementById("restartText").textContent =
    t.another;

  document.getElementById("disclaimerText").textContent =
    t.disclaimer;

  document.getElementById("langBtn").textContent =
    currentLang === "en" ? "ไทย" : "EN";

  document.getElementById("gaugeLow").textContent =
    t.lowLabel;

  document.getElementById("gaugeMedium").textContent =
    t.mediumLabel;

  document.getElementById("gaugeHigh").textContent =
    t.highLabel;

      // อัปเดตผลลัพธ์ที่แสดงอยู่เมื่อเปลี่ยนภาษา
  if (!resultsSection.classList.contains('hidden')) {

    const riskLabel = resultLevel.textContent;

    let key = 'Medium Risk';

    if (
      riskLabel.includes('Low') ||
      riskLabel.includes('ต่ำ')
    ) key = 'Low Risk';

    if (
      riskLabel.includes('High') ||
      riskLabel.includes('สูง')
    ) key = 'High Risk';

    const config = RISK_CONFIG[key];

    recText.textContent =
      config.recommendation[currentLang];

    recTips.innerHTML =
      config.tips[currentLang]
        .map(t => `<li>${t}</li>`)
        .join('');
  }
}

document.getElementById("langBtn").addEventListener("click", () => {

  currentLang =
    currentLang === "en"
      ? "th"
      : "en";

  updateLanguage();

});

// ── Init ───────────────────────────────────────
updateLanguage();
loadModel();