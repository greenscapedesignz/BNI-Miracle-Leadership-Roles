// ═══════════════════════════════════════════════════════════════════════════════
// BNI Miracle — Chapter Leadership Diagnostic
// Google Apps Script Backend
// ─────────────────────────────────────────────────────────────────────────────
// DEPLOY SETTINGS:
//   Execute as: Me
//   Who has access: Anyone
// ═══════════════════════════════════════════════════════════════════════════════

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

// ── ROUTER ────────────────────────────────────────────────────────────────────

function doGet(e) {
  let result;
  try {
    const action = (e.parameter && e.parameter.action) || 'getAll';
    if      (action === 'getAll')        result = getAllData();
    else if (action === 'getAssessments') result = getAssessments();
    else                                  result = { error: 'Unknown action: ' + action };
  } catch (err) {
    result = { error: err.toString() };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let result;
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    if      (action === 'saveAssessment') result = saveAssessment(data);
    else if (action === 'savePalms')      result = savePalms(data);
    else if (action === 'saveAssignment') result = saveAssignment(data);
    else                                  result = { error: 'Unknown action: ' + action };
  } catch (err) {
    result = { error: err.toString() };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── GET ALL ───────────────────────────────────────────────────────────────────

function getAllData() {
  return {
    assessments : getAssessments(),
    palms       : getPalms(),
    assignments : getAssignments(),
    syncedAt    : new Date().toISOString()
  };
}

// ── ASSESSMENTS ───────────────────────────────────────────────────────────────

const ASM_HEADERS = [
  'Timestamp','MemberName','Composite','QuizTotal','QuizNorm',
  'PalmsScore','HasPalms','Category','CategoryColor','Personality',
  'Risks','Scores','RiskFlags'
];

function getAssessments() {
  const sheet = getSheet('Assessments');
  const rows  = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  return rows.slice(1)
    .filter(r => r[1])
    .map(r => ({
      timestamp    : r[0],
      memberName   : r[1],
      composite    : Number(r[2]),
      quizTotal    : Number(r[3]),
      quizNorm     : Number(r[4]),
      palmsScore   : r[5] !== '' ? Number(r[5]) : null,
      hasPalms     : r[6] === true || r[6] === 'true',
      category     : r[7],
      categoryColor: r[8],
      personality  : r[9],
      risks        : Number(r[10]),
      scores       : safeParseJSON(r[11], {}),
      riskFlags    : safeParseJSON(r[12], [])
    }));
}

function saveAssessment(data) {
  const sheet = getSheet('Assessments');
  ensureHeaders(sheet, ASM_HEADERS);

  const row = [
    new Date().toISOString(),
    data.memberName,
    data.composite    || 0,
    data.quizTotal    || 0,
    data.quizNorm     || 0,
    data.palmsScore != null ? data.palmsScore : '',
    data.hasPalms     || false,
    data.category     || '',
    data.categoryColor|| '',
    data.personality  || '',
    data.risks        || 0,
    JSON.stringify(data.scores    || {}),
    JSON.stringify(data.riskFlags || [])
  ];

  // Update existing row if member already assessed
  const all = sheet.getDataRange().getValues();
  for (let i = 1; i < all.length; i++) {
    if (all[i][1] === data.memberName) {
      sheet.getRange(i + 1, 1, 1, ASM_HEADERS.length).setValues([row]);
      return { success: true, action: 'updated', member: data.memberName };
    }
  }
  sheet.appendRow(row);
  return { success: true, action: 'created', member: data.memberName };
}

// ── PALMS ─────────────────────────────────────────────────────────────────────

const PALMS_HEADERS = [
  'UploadTimestamp','MemberName','AttendancePct',
  'ReferralsGiven','TYFCB','Meetings121','Visitors'
];

function getPalms() {
  const sheet = getSheet('PALMS');
  const rows  = sheet.getDataRange().getValues();
  if (rows.length <= 1) return {};
  const result = {};
  rows.slice(1).filter(r => r[1]).forEach(r => {
    result[r[1]] = {
      attendancePct : r[2] !== '' ? String(r[2]) : null,
      referralsGiven: r[3] !== '' ? String(r[3]) : null,
      tyfcb         : r[4] !== '' ? String(r[4]) : null,
      meetings121   : r[5] !== '' ? String(r[5]) : null,
      visitors      : r[6] !== '' ? String(r[6]) : null
    };
  });
  return result;
}

function savePalms(data) {
  const sheet = getSheet('PALMS');
  ensureHeaders(sheet, PALMS_HEADERS);

  // Full replace on each upload
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);

  const uploadTs = new Date().toISOString();
  const entries  = Object.entries(data.palmsData || {});
  entries.forEach(([name, p]) => {
    sheet.appendRow([
      uploadTs, name,
      p.attendancePct  || '',
      p.referralsGiven || '',
      p.tyfcb          || '',
      p.meetings121    || '',
      p.visitors       || ''
    ]);
  });
  return { success: true, count: entries.length };
}

// ── ASSIGNMENTS ───────────────────────────────────────────────────────────────

const ASSIGN_HEADERS = [
  'Timestamp','RoleId','RoleTitle','AssignedMember','Notes'
];

function getAssignments() {
  const sheet = getSheet('Assignments');
  const rows  = sheet.getDataRange().getValues();
  if (rows.length <= 1) return {};
  const result = {};
  rows.slice(1).filter(r => r[1]).forEach(r => {
    result[r[1]] = {
      assignedMember: r[3],
      notes         : r[4],
      timestamp     : r[0]
    };
  });
  return result;
}

function saveAssignment(data) {
  const sheet = getSheet('Assignments');
  ensureHeaders(sheet, ASSIGN_HEADERS);

  const row = [
    new Date().toISOString(),
    data.roleId        || '',
    data.roleTitle     || '',
    data.assignedMember|| '',
    data.notes         || ''
  ];

  const all = sheet.getDataRange().getValues();
  for (let i = 1; i < all.length; i++) {
    if (all[i][1] === data.roleId) {
      sheet.getRange(i + 1, 1, 1, ASSIGN_HEADERS.length).setValues([row]);
      return { success: true, action: 'updated', roleId: data.roleId };
    }
  }
  sheet.appendRow(row);
  return { success: true, action: 'created', roleId: data.roleId };
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function ensureHeaders(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
}

function safeParseJSON(val, fallback) {
  try { return JSON.parse(val); } catch(e) { return fallback; }
}
