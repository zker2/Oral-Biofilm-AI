/* =============================================
   ORALSCAN AI — SCRIPT v3
   Refactored: modular, clean state, scan sweep,
   fixed duplicate IDs, better error handling
   ============================================= */

'use strict';

/* ─── Language ─────────────────────────────── */
let currentLang = 'en';

const T = {
  en: {
    modelLoading: 'Loading model…',
    modelReady:   'Ready',
    modelError:   'Load failed',
    analyzeBtn:   'Analyze Image',
    analyzing:    'Analyzing…',
    riskLabel:    'Risk Assessment',
    confTitle:    'Confidence Breakdown',
    recTitle:     'Clinical Recommendation',
    restartText:  'Analyze Another',
    shareText:    'Copy Summary',
    historyTitle: 'History',
    clearAll:     'Clear all',
    historyEmpty: 'No analyses yet. Upload an image to get started.',
    trendTitle:   'Your Risk Trend',
    disclaimer:   'For educational screening only. Not a substitute for professional dental diagnosis. Always consult a licensed dentist for clinical decisions.',
    eyebrow:      'Disclosing-gel image analysis',
    heroLine1:    'Know your',
    heroLine2:    'caries risk',
    heroLine3:    'in seconds.',
    heroDesc:     'Upload a photo taken after applying disclosing gel. The AI reads your biofilm distribution and returns a calibrated risk score with clinical guidance.',
    wfStep1:      'Apply gel & photograph',
    wfStep2:      'Upload image',
    wfStep3:      'Read your report',
    tabUpload:    'Upload Photo',
    tabCamera:    'Take Photo',
    dzHint:       'Drop your post-gel dental photo here',
    dzMeta:       'PNG · JPG · WEBP · max 10 MB',
    chooseFile:   'Choose file',
    startCamera:  'Start Camera',
    capture:      'Capture',
    retake:       'Retake',
    gsLow:        'Low',
    gsMed:        'Medium',
    gsHigh:       'High',
    low:          'Low Risk',
    medium:       'Medium Risk',
    high:         'High Risk',
    copiedMsg:    'Summary copied to clipboard!',
    trendUp:      'Your risk has increased compared to your previous analysis.',
    trendDown:    'Great progress — your risk has decreased since your last analysis.',
    trendSame:    'Your risk level is similar to your previous analysis.',
    trendFirst:   'This is your first analysis. Keep tracking to see your trend.',
  },
  th: {
    modelLoading: 'กำลังโหลด…',
    modelReady:   'พร้อมใช้งาน',
    modelError:   'โหลดไม่สำเร็จ',
    analyzeBtn:   'วิเคราะห์รูปภาพ',
    analyzing:    'กำลังวิเคราะห์…',
    riskLabel:    'ผลการประเมินความเสี่ยง',
    confTitle:    'ระดับความมั่นใจ',
    recTitle:     'คำแนะนำทางทันตกรรม',
    restartText:  'วิเคราะห์รูปใหม่',
    shareText:    'คัดลอกสรุปผล',
    historyTitle: 'ประวัติ',
    clearAll:     'ล้างทั้งหมด',
    historyEmpty: 'ยังไม่มีการวิเคราะห์ อัปโหลดรูปภาพเพื่อเริ่มต้น',
    trendTitle:   'แนวโน้มความเสี่ยง',
    disclaimer:   'เครื่องมือนี้ใช้เพื่อการคัดกรองเบื้องต้นเท่านั้น ไม่สามารถใช้แทนการวินิจฉัยโดยทันตแพทย์ได้',
    eyebrow:      'วิเคราะห์ภาพหลังใช้สารย้อมคราบ',
    heroLine1:    'รู้ระดับ',
    heroLine2:    'ความเสี่ยงฟันผุ',
    heroLine3:    'ใน 3 วินาที',
    heroDesc:     'อัปโหลดภาพหลังใช้สารย้อมคราบจุลินทรีย์ ระบบ AI จะประเมินความเสี่ยงของฟันผุและคราบชีวภาพโดยอัตโนมัติ',
    wfStep1:      'ทาสารย้อมแล้วถ่ายรูป',
    wfStep2:      'อัปโหลดรูปภาพ',
    wfStep3:      'อ่านผลการวิเคราะห์',
    tabUpload:    'อัปโหลดรูป',
    tabCamera:    'ถ่ายรูป',
    dzHint:       'วางรูปภาพช่องปากที่นี่',
    dzMeta:       'PNG · JPG · WEBP · สูงสุด 10 MB',
    chooseFile:   'เลือกรูปภาพ',
    startCamera:  'เปิดกล้อง',
    capture:      'ถ่ายรูป',
    retake:       'ถ่ายใหม่',
    gsLow:        'ต่ำ',
    gsMed:        'ปานกลาง',
    gsHigh:       'สูง',
    low:          'ความเสี่ยงต่ำ',
    medium:       'ความเสี่ยงปานกลาง',
    high:         'ความเสี่ยงสูง',
    copiedMsg:    'คัดลอกสรุปผลแล้ว!',
    trendUp:      'ความเสี่ยงเพิ่มขึ้นจากการวิเคราะห์ครั้งก่อน',
    trendDown:    'ดีขึ้น — ความเสี่ยงลดลงจากครั้งก่อน',
    trendSame:    'ระดับความเสี่ยงใกล้เคียงกับครั้งก่อน',
    trendFirst:   'นี่คือการวิเคราะห์ครั้งแรกของคุณ ติดตามต่อเนื่องเพื่อดูแนวโน้ม',
  }
};

function t(key) { return T[currentLang]?.[key] ?? T.en[key] ?? key; }

/* ─── Risk Config ─────────────────────────── */
const MODEL_PATH = './model/';

const RISK_CONFIG = {
  'Low Risk': {
    key: 'low',
    needlePct: 10,
    ringPct: 22,
    recommendation: {
      en: 'Your plaque levels appear well-controlled. Keep up the great work!',
      th: 'ระดับคราบจุลินทรีย์อยู่ในเกณฑ์ดี คุณดูแลสุขภาพช่องปากได้อย่างเหมาะสม'
    },
    tips: {
      en: [
        'Keep brushing for at least 2 minutes, twice daily.',
        'Floss or use interdental brushes once a day.',
        'Schedule a routine dental check-up every 6 months.',
        'Maintain a low-sugar, balanced diet.',
      ],
      th: [
        'แปรงฟันอย่างน้อยวันละ 2 ครั้ง ครั้งละ 2 นาที',
        'ใช้ไหมขัดฟันหรือแปรงซอกฟันทุกวัน',
        'ตรวจสุขภาพช่องปากทุก 6 เดือน',
        'หลีกเลี่ยงอาหารและเครื่องดื่มที่มีน้ำตาลสูง',
      ]
    }
  },
  'Medium Risk': {
    key: 'medium',
    needlePct: 50,
    ringPct: 55,
    recommendation: {
      en: 'Moderate plaque activity detected. Some areas may need extra attention.',
      th: 'พบคราบจุลินทรีย์ในระดับปานกลาง ควรดูแลทำความสะอาดบางบริเวณเพิ่มเติม'
    },
    tips: {
      en: [
        'Review your brushing technique — use a timer for 2 full minutes.',
        'Add interdental cleaning (floss, water flosser) to your daily routine.',
        'Reduce frequency of sugary snacks and drinks.',
        'Consider a fluoride mouthwash for added protection.',
        'Schedule a professional cleaning within 3 months.',
      ],
      th: [
        'ปรับปรุงเทคนิคการแปรงฟัน จับเวลาอย่างน้อย 2 นาที',
        'ใช้ไหมขัดฟันหรือเครื่องฉีดน้ำทำความสะอาดซอกฟันเป็นประจำ',
        'ลดความถี่ในการรับประทานของหวานและเครื่องดื่มที่มีน้ำตาล',
        'พิจารณาใช้น้ำยาบ้วนปากผสมฟลูออไรด์',
        'ควรเข้ารับการขูดหินปูนภายใน 3 เดือน',
      ]
    }
  },
  'High Risk': {
    key: 'high',
    needlePct: 90,
    ringPct: 88,
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
        'Consider using disclosing tablets regularly to visualise remaining plaque.',
        'Ask about prescription-strength fluoride toothpaste.',
      ],
      th: [
        'นัดพบทันตแพทย์โดยเร็วที่สุด',
        'ขอคำแนะนำเรื่องการควบคุมคราบจุลินทรีย์เฉพาะบุคคล',
        'แปรงฟันหลังอาหารทุกมื้อและก่อนนอน',
        'หลีกเลี่ยงเครื่องดื่มที่มีน้ำตาลและอาหารคาร์โบไฮเดรตขัดสี',
        'ใช้เม็ดย้อมคราบจุลินทรีย์เพื่อตรวจสอบการแปรงฟัน',
        'ปรึกษาเรื่องยาสีฟันฟลูออไรด์ความเข้มข้นสูง',
      ]
    }
  }
};

const LABEL_MAP = [
  { pattern: /low/i,    label: 'Low Risk' },
  { pattern: /med/i,    label: 'Medium Risk' },
  { pattern: /high/i,   label: 'High Risk' },
];

/* ─── App State ───────────────────────────── */
const state = {
  model:        null,
  uploadedFile: null,
  isAnalyzing:  false,
  cameraStream: null,
  capturedBlob: null,
  activeTab:    'upload',
  history:      JSON.parse(localStorage.getItem('oralscan_history') || '[]'),
  lastResult:   null,
};

/* ─── DOM refs ────────────────────────────── */
const el = id => document.getElementById(id);

const dom = {
  // Upload
  dropZone:         el('dropZone'),
  fileInput:        el('fileInput'),
  dropContent:      el('dropContent'),
  previewWrap:      el('previewWrap'),
  previewImg:       el('previewImg'),
  removeBtn:        el('removeBtn'),
  previewFilename:  el('previewFilename'),
  scanSweep:        el('scanSweep'),

  // Camera
  cameraFeed:       el('cameraFeed'),
  captureCanvas:    el('captureCanvas'),
  startCameraBtn:   el('startCameraBtn'),
  captureBtn:       el('captureBtn'),
  retakeBtn:        el('retakeBtn'),
  cameraCaptured:   el('cameraCaptured'),
  capturedImg:      el('capturedImg'),
  removeCaptureBtn: el('removeCaptureBtn'),

  // Controls
  analyzeBtn:       el('analyzeBtn'),
  btnSpinner:       el('btnSpinner'),
  btnArrow:         el('btnArrow'),
  chipDot:          el('chipDot'),
  chipLabel:        el('chipLabel'),

  // Results
  resultsSection:   el('resultsSection'),
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

  // History
  historyPanel:     el('historyPanel'),
  historyOverlay:   el('historyOverlay'),
  historyList:      el('historyList'),
  historyEmpty:     el('historyEmpty'),
  historyCount:     el('historyCount'),
  historyStats:     el('historyStats'),
  toast:            el('toast'),
};

/* ─── Model ───────────────────────────────── */
async function loadModel() {
  setChip('loading', t('modelLoading'));
  try {
    state.model = await tmImage.load(MODEL_PATH + 'model.json', MODEL_PATH + 'metadata.json');
    setChip('ready', t('modelReady'));
    if (hasImage()) dom.analyzeBtn.disabled = false;
  } catch (err) {
    console.warn('Model load failed:', err);
    setChip('error', t('modelError'));
    state.model = null;
    // Still allow analysis attempt (will show error gracefully)
    if (hasImage()) dom.analyzeBtn.disabled = false;
  }
}

function setChip(state, text) {
  dom.chipDot.className = 'status-dot ' + state;
  dom.chipLabel.textContent = text;
}

function hasImage() {
  return !!(state.uploadedFile || state.capturedBlob);
}

/* ─── Tab switching ───────────────────────── */
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

  if (tab === 'camera' && !state.cameraStream) {
    startCamera();
  }
}

/* ─── Camera ──────────────────────────────── */
dom.startCameraBtn.addEventListener('click', startCamera);

async function startCamera() {
  try {
    state.cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });
    dom.cameraFeed.srcObject = state.cameraStream;
    dom.cameraFeed.classList.remove('hidden');
    dom.startCameraBtn.classList.add('hidden');
    dom.captureBtn.classList.remove('hidden');
    dom.cameraCaptured.classList.add('hidden');
  } catch (err) {
    console.warn('Camera access denied:', err);
    showToast('Camera not available. Please use Upload instead.');
    switchTab('upload');
  }
}

dom.captureBtn.addEventListener('click', () => {
  const w = dom.cameraFeed.videoWidth;
  const h = dom.cameraFeed.videoHeight;
  dom.captureCanvas.width  = w;
  dom.captureCanvas.height = h;
  dom.captureCanvas.getContext('2d').drawImage(dom.cameraFeed, 0, 0, w, h);
  dom.captureCanvas.toBlob(blob => {
    state.capturedBlob = blob;
    const url = URL.createObjectURL(blob);
    dom.capturedImg.src = url;
    dom.cameraFeed.classList.add('hidden');
    dom.captureBtn.classList.add('hidden');
    dom.cameraCaptured.classList.remove('hidden');
    dom.retakeBtn.classList.remove('hidden');
    dom.analyzeBtn.disabled = false;
    stopCameraStream();
  }, 'image/jpeg', 0.92);
});

dom.retakeBtn.addEventListener('click', () => {
  state.capturedBlob = null;
  dom.capturedImg.src = '';
  dom.cameraCaptured.classList.add('hidden');
  dom.retakeBtn.classList.add('hidden');
  dom.analyzeBtn.disabled = true;
  startCamera();
});

dom.removeCaptureBtn.addEventListener('click', () => {
  state.capturedBlob = null;
  dom.capturedImg.src = '';
  dom.cameraCaptured.classList.add('hidden');
  dom.retakeBtn.classList.add('hidden');
  dom.startCameraBtn.classList.remove('hidden');
  dom.captureBtn.classList.add('hidden');
  dom.analyzeBtn.disabled = true;
});

function stopCameraStream() {
  if (state.cameraStream) {
    state.cameraStream.getTracks().forEach(track => track.stop());
    state.cameraStream = null;
  }
}

/* ─── File Upload ─────────────────────────── */
function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Please upload a valid image file (PNG, JPG, WEBP).');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast('File is too large. Max 10 MB.');
    return;
  }

  state.uploadedFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    dom.previewImg.src = e.target.result;
    showPreview(file.name);
  };
  reader.onerror = () => {
    dom.previewImg.src = URL.createObjectURL(file);
    showPreview(file.name);
  };
  reader.readAsDataURL(file);
}

function showPreview(filename) {
  dom.dropContent.classList.add('hidden');
  dom.previewWrap.classList.remove('hidden');
  dom.previewFilename.textContent = filename;
  dom.analyzeBtn.disabled = false;
  hideResults();
}

// Drag & drop
dom.dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dom.dropZone.classList.add('drag-over');
});
dom.dropZone.addEventListener('dragleave', e => {
  if (!dom.dropZone.contains(e.relatedTarget)) {
    dom.dropZone.classList.remove('drag-over');
  }
});
dom.dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dom.dropZone.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f) handleFile(f);
});

// Click to open file picker
el('chooseFileBtn').addEventListener('click', e => {
  e.stopPropagation();
  dom.fileInput.click();
});
dom.dropZone.addEventListener('click', e => {
  if (dom.removeBtn.contains(e.target)) return;
  if (!dom.previewWrap.classList.contains('hidden')) return;
  dom.fileInput.click();
});
dom.dropZone.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dom.fileInput.click(); }
});

// File input handler (deduplicated)
dom.fileInput.addEventListener('change', e => {
  const f = e.target.files?.[0];
  if (f) handleFile(f);
  // Reset value so same file can be re-selected
  dom.fileInput.value = '';
});

dom.removeBtn.addEventListener('click', e => {
  e.stopPropagation();
  resetUpload();
});

function resetUpload() {
  state.uploadedFile = null;
  state.capturedBlob = null;
  dom.previewImg.src = '';
  dom.fileInput.value = '';
  dom.previewWrap.classList.add('hidden');
  dom.dropContent.classList.remove('hidden');
  dom.previewFilename.textContent = '';
  dom.analyzeBtn.disabled = true;
  hideResults();
}

/* ─── Analysis ────────────────────────────── */
dom.analyzeBtn.addEventListener('click', runAnalysis);

async function runAnalysis() {
  if (state.isAnalyzing) return;

  const imgEl = state.activeTab === 'camera' ? dom.capturedImg : dom.previewImg;
  if (!imgEl.src || imgEl.src === location.href) {
    showToast('Please upload or capture an image first.');
    return;
  }
  if (!state.model) {
    showToast('AI model is still loading. Please wait a moment.');
    return;
  }

  state.isAnalyzing = true;
  setAnalyzeLoading(true);
  setScanSweep(true);

  try {
    const predictions = await state.model.predict(imgEl);
    state.lastResult = predictions;
    showResults(predictions, imgEl.src);
  } catch (err) {
    console.error('Prediction error:', err);
    showToast('Unable to analyze image. Please try again.');
  } finally {
    state.isAnalyzing = false;
    setAnalyzeLoading(false);
    setScanSweep(false);
  }
}

function setAnalyzeLoading(on) {
  el('analyzeText').textContent = on ? t('analyzing') : t('analyzeBtn');
  dom.btnSpinner.classList.toggle('hidden', !on);
  dom.btnArrow.classList.toggle('hidden', on);
  dom.analyzeBtn.disabled = on;
}

function setScanSweep(on) {
  dom.scanSweep.classList.toggle('active', on);
}

/* ─── Results ─────────────────────────────── */
function normaliseLabel(raw) {
  for (const { pattern, label } of LABEL_MAP) {
    if (pattern.test(raw)) return label;
  }
  return raw;
}

function localLabel(key) {
  return { 'Low Risk': t('low'), 'Medium Risk': t('medium'), 'High Risk': t('high') }[key] ?? key;
}

function showResults(predictions, imgSrc) {
  const normalised = predictions
    .map(p => ({ label: normaliseLabel(p.className), probability: p.probability }))
    .sort((a, b) => b.probability - a.probability);

  const top    = normalised[0];
  const config = RISK_CONFIG[top.label] ?? RISK_CONFIG['Medium Risk'];

  // Save to history
  const entry = {
    id:          Date.now(),
    label:       top.label,
    probability: top.probability,
    imgSrc,
    timestamp:   new Date().toISOString(),
    all:         normalised,
  };
  state.history.unshift(entry);
  if (state.history.length > 20) state.history.pop();
  saveHistory();
  renderHistory();

  // Apply risk data attribute
  dom.scorePanel.dataset.risk = config.key;
  dom.recPanel.dataset.risk   = config.key;

  // Level + pill
  el('riskLabel').textContent  = t('riskLabel');
  dom.resultLevel.textContent  = localLabel(top.label);
  dom.riskPill.textContent     = localLabel(top.label);

  // Timestamp
  el('scoreTimestamp').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Ring gauge
  const CIRC   = 201; // 2π × r=32
  const offset = CIRC - (CIRC * config.ringPct / 100);
  dom.ringFill.style.transition     = 'none';
  dom.ringFill.style.strokeDashoffset = CIRC;
  dom.ringPct.textContent = '0%';

  requestAnimationFrame(() => requestAnimationFrame(() => {
    dom.ringFill.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)';
    dom.ringFill.style.strokeDashoffset = offset;
    animateCount(dom.ringPct, 0, config.ringPct, 1200, v => v + '%');
  }));

  // Gauge needle
  dom.gsNeedle.style.left = config.needlePct + '%';

  // Confidence bars
  dom.confidenceBars.innerHTML = '';
  normalised.forEach(({ label, probability }) => {
    const cfg = RISK_CONFIG[label] ?? RISK_CONFIG['Medium Risk'];
    const pct = Math.round(probability * 100);
    const row = document.createElement('div');
    row.className = 'conf-row';
    row.innerHTML = `
      <div class="conf-meta">
        <span class="conf-label">${localLabel(label)}</span>
        <span class="conf-pct-label">${pct}%</span>
      </div>
      <div class="conf-track">
        <div class="conf-fill c-${cfg.key}" style="width:0%" data-target="${pct}"></div>
      </div>
    `;
    dom.confidenceBars.appendChild(row);
  });

  requestAnimationFrame(() => requestAnimationFrame(() => {
    dom.confidenceBars.querySelectorAll('.conf-fill[data-target]').forEach(fill => {
      fill.style.width = fill.dataset.target + '%';
    });
  }));

  // Recommendation
  el('recTitle').textContent  = t('recTitle');
  dom.recText.textContent     = config.recommendation[currentLang];
  dom.recTips.innerHTML       = config.tips[currentLang].map(tip => `<li>${tip}</li>`).join('');

  // Trend
  renderTrend(entry);

  // Show
  dom.resultsSection.classList.remove('hidden');
  setTimeout(() => {
    dom.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);
}

function hideResults() {
  dom.resultsSection.classList.add('hidden');
}

/* ─── Trend chart ─────────────────────────── */
const RISK_SCORE = { 'Low Risk': 20, 'Medium Risk': 55, 'High Risk': 90 };
const RISK_RANK  = { 'Low Risk': 1, 'Medium Risk': 2, 'High Risk': 3 };

function renderTrend(latestEntry) {
  if (state.history.length < 2) {
    dom.trendPanel.classList.add('hidden');
    return;
  }

  dom.trendPanel.classList.remove('hidden');
  el('trendTitle').textContent = t('trendTitle');

  const recent = state.history.slice(0, 8).reverse();
  dom.trendChart.innerHTML = '';

  recent.forEach(entry => {
    const score   = RISK_SCORE[entry.label] ?? 50;
    const heightPx = Math.round(score * 0.7);
    const cfg     = RISK_CONFIG[entry.label] ?? RISK_CONFIG['Medium Risk'];
    const lbl     = new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

    const wrap    = document.createElement('div');
    wrap.className = 'trend-bar-wrap';
    wrap.innerHTML = `
      <div class="trend-bar ${cfg.key}" style="height:0" data-h="${heightPx}px"></div>
      <span class="trend-lbl">${lbl}</span>
    `;
    dom.trendChart.appendChild(wrap);
  });

  requestAnimationFrame(() => requestAnimationFrame(() => {
    dom.trendChart.querySelectorAll('.trend-bar[data-h]').forEach(bar => {
      bar.style.transition = 'height .6s ease';
      bar.style.height     = bar.dataset.h;
    });
  }));

  // Trend note
  if (state.history.length >= 2) {
    const prev = state.history[1];
    const curr = RISK_RANK[latestEntry.label] ?? 2;
    const p    = RISK_RANK[prev.label] ?? 2;
    dom.trendNote.textContent = curr > p ? t('trendUp')
      : curr < p ? t('trendDown')
      : t('trendSame');
  } else {
    dom.trendNote.textContent = t('trendFirst');
  }
}

/* ─── History panel ───────────────────────── */
el('historyToggleBtn').addEventListener('click', openHistory);
el('historyCloseBtn').addEventListener('click', closeHistory);
dom.historyOverlay.addEventListener('click', closeHistory);
el('clearHistoryBtn').addEventListener('click', () => {
  state.history = [];
  saveHistory();
  renderHistory();
});

function openHistory() {
  dom.historyPanel.classList.add('open');
  dom.historyOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeHistory() {
  dom.historyPanel.classList.remove('open');
  dom.historyOverlay.classList.remove('visible');
  document.body.style.overflow = '';
}

function saveHistory() {
  // Truncate imgSrc to save localStorage space
  const compact = state.history.map(e => ({ ...e, imgSrc: (e.imgSrc || '').slice(0, 2000) }));
  try {
    localStorage.setItem('oralscan_history', JSON.stringify(compact));
  } catch (e) {
    console.warn('localStorage full, clearing old entries');
    state.history = state.history.slice(0, 10);
    localStorage.setItem('oralscan_history', JSON.stringify(state.history));
  }
}

function renderHistory() {
  // Badge
  dom.historyCount.textContent = state.history.length;
  dom.historyCount.classList.toggle('show', state.history.length > 0);

  // Empty state
  dom.historyEmpty.style.display = state.history.length ? 'none' : 'flex';

  // Remove old items
  dom.historyList.querySelectorAll('.history-item').forEach(el => el.remove());

  state.history.forEach(entry => {
    const cfg  = RISK_CONFIG[entry.label] ?? RISK_CONFIG['Medium Risk'];
    const time = new Date(entry.timestamp).toLocaleString([], {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const pct  = Math.round(entry.probability * 100);

    const item = document.createElement('div');
    item.className = 'history-item';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.innerHTML = `
      <img class="hi-thumb" src="${entry.imgSrc || ''}" alt="Dental scan" onerror="this.style.display='none'" />
      <div class="hi-info">
        <div class="hi-level">${localLabel(entry.label)}</div>
        <div class="hi-time">${time} · ${pct}% conf.</div>
      </div>
      <span class="hi-tag ${cfg.key}">${localLabel(entry.label)}</span>
    `;
    dom.historyList.appendChild(item);
  });

  // Stats footer
  if (state.history.length) {
    const counts = { low: 0, medium: 0, high: 0 };
    state.history.forEach(e => {
      const c = RISK_CONFIG[e.label];
      if (c) counts[c.key]++;
    });
    dom.historyStats.innerHTML = `
      <div class="history-stat"><strong>${counts.low}</strong> ${t('low')}</div>
      <div class="history-stat"><strong>${counts.medium}</strong> ${t('medium')}</div>
      <div class="history-stat"><strong>${counts.high}</strong> ${t('high')}</div>
    `;
  } else {
    dom.historyStats.innerHTML = '';
  }
}

/* ─── Copy summary ────────────────────────── */
el('shareBtn').addEventListener('click', async () => {
  if (!state.lastResult) return;

  const normalised = state.lastResult
    .map(p => ({ label: normaliseLabel(p.className), probability: p.probability }))
    .sort((a, b) => b.probability - a.probability);
  const top    = normalised[0];
  const config = RISK_CONFIG[top.label] ?? RISK_CONFIG['Medium Risk'];

  const text = [
    `OralScan AI — ${new Date().toLocaleString()}`,
    `Risk: ${localLabel(top.label)} (${Math.round(top.probability * 100)}% confidence)`,
    '',
    config.recommendation[currentLang],
    '',
    config.tips[currentLang].map(tip => `• ${tip}`).join('\n'),
    '',
    '⚠ For educational screening only. Consult a dentist for diagnosis.',
  ].join('\n');

  try {
    await navigator.clipboard.writeText(text);
    showToast(t('copiedMsg'));
  } catch {
    showToast('Copy not supported in this browser.');
  }
});

/* ─── Restart ─────────────────────────────── */
el('restartBtn').addEventListener('click', () => {
  resetUpload();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ─── Toast ───────────────────────────────── */
let toastTimeout;
function showToast(msg) {
  dom.toast.textContent = msg;
  dom.toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => dom.toast.classList.remove('show'), 3200);
}

/* ─── Animated counter ────────────────────── */
function animateCount(el, from, to, duration, formatter) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = formatter(Math.round(from + (to - from) * eased));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ─── Language toggle ─────────────────────── */
el('langBtn').addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'th' : 'en';
  applyLanguage();
});

const LANG_TEXT_MAP = {
  heroEyebrow:      'eyebrow',
  heroLine1:        'heroLine1',
  heroLine2:        'heroLine2',
  heroLine3:        'heroLine3',
  heroDesc:         'heroDesc',
  wfStep1:          'wfStep1',
  wfStep2:          'wfStep2',
  wfStep3:          'wfStep3',
  tabUploadText:    'tabUpload',
  tabCameraText:    'tabCamera',
  dzHint:           'dzHint',
  dzMeta:           'dzMeta',
  chooseFileText:   'chooseFile',
  startCameraText:  'startCamera',
  captureText:      'capture',
  retakeText:       'retake',
  analyzeText:      'analyzeBtn',
  confidenceTitle:  'confTitle',
  recTitle:         'recTitle',
  gsLow:            'gsLow',
  gsMed:            'gsMed',
  gsHigh:           'gsHigh',
  restartText:      'restartText',
  shareText:        'shareText',
  historyTitle:     'historyTitle',
  historyEmptyText: 'historyEmpty',
  trendTitle:       'trendTitle',
  disclaimerText:   'disclaimer',
};

function applyLanguage() {
  Object.entries(LANG_TEXT_MAP).forEach(([id, key]) => {
    const node = el(id);
    if (node) node.textContent = t(key);
  });

  el('clearHistoryBtn').textContent = t('clearAll');
  el('langBtn').textContent = currentLang === 'en' ? 'EN / ไทย' : 'ไทย / EN';

  // Re-render live results if visible
  if (!dom.resultsSection.classList.contains('hidden') && state.lastResult) {
    const normalised = state.lastResult
      .map(p => ({ label: normaliseLabel(p.className), probability: p.probability }))
      .sort((a, b) => b.probability - a.probability);
    const top    = normalised[0];
    const config = RISK_CONFIG[top.label] ?? RISK_CONFIG['Medium Risk'];

    dom.resultLevel.textContent  = localLabel(top.label);
    dom.riskPill.textContent     = localLabel(top.label);
    dom.recText.textContent      = config.recommendation[currentLang];
    dom.recTips.innerHTML        = config.tips[currentLang].map(tip => `<li>${tip}</li>`).join('');

    dom.confidenceBars.querySelectorAll('.conf-label').forEach((labelEl, i) => {
      if (normalised[i]) labelEl.textContent = localLabel(normalised[i].label);
    });
  }

  // Update chip
  const dotClass = dom.chipDot.className.replace('status-dot ', '').trim();
  const chipKey  = dotClass === 'ready' ? 'modelReady'
    : dotClass === 'error' ? 'modelError'
    : 'modelLoading';
  setChip(dotClass, t(chipKey));

  renderHistory();
}

/* ─── Init ────────────────────────────────── */
renderHistory();
applyLanguage();
loadModel();