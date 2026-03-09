# BNI Miracle — Chapter Leadership Diagnostic
### Perpetual leadership selection system for BNI Miracle chapter

---

## What this system does

A 7-minute pulse check that maps every member's leadership profile — quiz scores + live PALMS behavioural data — to the 23 chapter roles across all three teams. The leadership team (President, VP, Secretary-Treasurer) uses the dashboard to make evidence-based role assignments.

**Composite score = Quiz (50pts) + PALMS data (50pts) = 100 points**

---

## One-time Setup (30 minutes total)

### Step 1 — Create the Google Sheet (5 min)

1. Go to [sheets.google.com](https://sheets.google.com) and create a **new blank spreadsheet**
2. Name it: `BNI Miracle — Leadership Data`
3. The Apps Script will auto-create the three required tabs (Assessments, PALMS, Assignments) on first use
4. Keep this tab open — you'll need the Sheet URL in Step 2

---

### Step 2 — Deploy the Apps Script API (10 min)

1. In your Google Sheet, click **Extensions → Apps Script**
2. Delete all existing code in the editor
3. Paste the entire contents of **`Code.gs`** from this repository
4. Click **Save** (floppy disk icon)
5. Click **Deploy → New deployment**
6. Click the gear icon next to "Select type" → choose **Web app**
7. Set these exact options:
   - Description: `BNI Miracle Diagnostic API`
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Click **Deploy**
9. Click **Authorise access** → choose your Google account → Allow
10. **Copy the Web App URL** — it looks like:
    `https://script.google.com/macros/s/XXXXXXXXXXXXXXX/exec`

> ⚠️ Keep this URL private — share only with the leadership team. Anyone with this URL can write to your Sheet.

---

### Step 3 — Add your Apps Script URL to the app (2 min)

1. Open `index.html` in any text editor
2. Find this line near the top (line ~27):
   ```
   const SCRIPT_URL = "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
3. Replace `YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` with the URL you copied in Step 2
4. Save the file

---

### Step 4 — Publish on GitHub Pages (10 min)

1. Go to [github.com](https://github.com) and create a free account if you don't have one
2. Click **New repository** (green button)
3. Name it: `bni-miracle-diagnostic`
4. Set visibility to **Public**
5. Click **Create repository**
6. Click **uploading an existing file** (or "Add file → Upload files")
7. Drag and drop both `index.html` and `README.md` into the upload area
8. Click **Commit changes**
9. Go to **Settings → Pages** (left sidebar)
10. Under "Source", select **Deploy from a branch**
11. Branch: **main** | Folder: **/ (root)**
12. Click **Save**
13. Wait 2–3 minutes, then your URL will appear:
    `https://YOUR-USERNAME.github.io/bni-miracle-diagnostic`

Share this URL with all chapter members via WhatsApp.

---

## Weekly operation (ongoing)

### For the Attendance Specialist / Secretary-Treasurer

Every week after entering PALMS:

1. Log into **BNI Connect**
2. Go to **Reports → Summary PALMS Report**
3. Set date range: **last 3 months**
4. Click **Export → CSV**
5. Open the diagnostic app → **Leadership Team Dashboard → PALMS Upload**
6. Upload the CSV file
7. All 38 members' composite scores update instantly

### For members

1. Open the shared GitHub Pages URL
2. Select their name from the dropdown
3. Complete the 7-minute pulse check
4. Results save automatically to Google Sheets
5. Leadership dashboard shows their profile immediately

---

## How to update role assignments

1. Open the app → **Leadership Team Dashboard → Assignments tab**
2. For each role, select the assigned member from the dropdown
3. Add deliberation notes (visible to leadership team only)
4. Click **Save to Sheets** — decision is logged with timestamp

---

## Data stored in Google Sheets

| Tab | What it stores |
|-----|---------------|
| **Assessments** | One row per member: composite score, quiz breakdown, personality type, risk flags |
| **PALMS** | Latest 3-month PALMS data for all members (replaced on each upload) |
| **Assignments** | Leadership team role decisions with notes and timestamps |

---

## Composite Score Formula

| Data Point | Source | Max Points |
|-----------|--------|-----------|
| Attendance % | PALMS | 20 pts |
| Referrals given | PALMS | 12 pts |
| TYFCB received | PALMS | 8 pts |
| 1-2-1 meetings | PALMS | 6 pts |
| Visitors invited | PALMS | 4 pts |
| Quiz (17 questions) | Self-assessment | 50 pts |
| **Total** | | **100 pts** |

| Score | Leadership Category |
|-------|-------------------|
| 80–100 | Strategic Leader |
| 62–79 | Operational Leader |
| 45–61 | Emerging Leader |
| Below 45 | Active Member |

---

## Updating the Apps Script (if you make changes)

When you edit `Code.gs`, you must redeploy:
1. Apps Script editor → **Deploy → Manage deployments**
2. Click the pencil (edit) icon on your existing deployment
3. Change version to **"New version"**
4. Click **Deploy**

The URL stays the same — no changes needed in `index.html`.

---

## Troubleshooting

**"Sheets sync failed" message in the app**
→ Check that your SCRIPT_URL in index.html is correct and matches the deployed Web App URL exactly.

**Data not appearing in dashboard after quiz**
→ Open your Google Sheet and check the Assessments tab. If the row is there, it's a display issue — click the Sync button in the dashboard.

**CSV upload not matching member names**
→ BNI Connect sometimes exports names with different spacing or prefixes (Mr., Mrs.). The parser fuzzy-matches on first name. If a member still doesn't match, check their name spelling in the CSV against the member list in `index.html`.

**Apps Script asking for re-authorisation**
→ This happens after 6 months of inactivity. Re-authorise via Deploy → Manage deployments.

---

*System built for BNI Miracle chapter. Member list, roles, and scoring weights are chapter-specific.*
