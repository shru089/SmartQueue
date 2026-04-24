const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, LevelFormat, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, Header, Footer,
  TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

// ─── Design Tokens ───────────────────────────────────────────────────────────
const C = {
  navy:    "1A3C6E",
  blue:    "2E5FA3",
  light:   "EBF0FA",
  green:   "E8F5E9",
  greenDk: "1A6E2E",
  amber:   "FFF3E0",
  red:     "FDECEA",
  yellow:  "FFF9C4",
  gray:    "F5F5F5",
  mid:     "888888",
  text:    "1A1A1A",
  white:   "FFFFFF",
};

// ─── Border helpers ───────────────────────────────────────────────────────────
const bdr = (color = "BBBBBB", size = 1) => ({ style: BorderStyle.SINGLE, size, color });
const allBorders = (color = "BBBBBB") => ({ top: bdr(color), bottom: bdr(color), left: bdr(color), right: bdr(color) });
const noBorders = () => ({
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
});

// ─── Cell factories ───────────────────────────────────────────────────────────
function hCell(text, width, colSpan = 1) {
  return new TableCell({
    borders: allBorders(C.navy),
    width: { size: width, type: WidthType.DXA },
    columnSpan: colSpan,
    shading: { fill: C.navy, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [
      new TextRun({ text, bold: true, color: C.white, size: 18, font: "Arial" })
    ]})]
  });
}

function dCell(text, width, fill = C.white, bold = false, color = C.text, colSpan = 1) {
  return new TableCell({
    borders: allBorders(),
    width: { size: width, type: WidthType.DXA },
    columnSpan: colSpan,
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children: [
      new TextRun({ text, bold, color, size: 18, font: "Arial" })
    ]})]
  });
}

function codeCell(text, width) {
  return new TableCell({
    borders: allBorders("AAAAAA"),
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "F0F4FA", type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 160, right: 160 },
    children: text.split('\n').map(line => new Paragraph({
      spacing: { before: 0, after: 0, line: 240 },
      children: [new TextRun({ text: line, font: "Courier New", size: 18, color: C.navy })]
    }))
  });
}

// ─── Paragraph factories ──────────────────────────────────────────────────────
function sp(n = 1) {
  return Array.from({ length: n }, () =>
    new Paragraph({ children: [new TextRun("")], spacing: { before: 0, after: 80 } })
  );
}

function body(text, opts = {}) {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: { before: opts.before ?? 60, after: opts.after ?? 80, line: 276 },
    children: [new TextRun({
      text, bold: opts.bold ?? false, italics: opts.italic ?? false,
      size: opts.size ?? 22, font: "Arial",
      color: opts.color ?? C.text
    })]
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: true,
    spacing: { before: 240, after: 180 },
    children: [new TextRun({ text, bold: true, size: 32, font: "Arial", color: C.navy })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, bold: true, size: 26, font: "Arial", color: C.navy })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 80 },
    children: [new TextRun({ text, bold: true, size: 22, font: "Arial", color: C.blue })]
  });
}

function h4(text) {
  return new Paragraph({
    spacing: { before: 140, after: 60 },
    children: [new TextRun({ text, bold: true, size: 22, font: "Arial", color: C.blue })]
  });
}

function bullet(text, bold = false) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40, line: 276 },
    children: [new TextRun({ text, bold, size: 22, font: "Arial", color: C.text })]
  });
}

function subbullet(text) {
  return new Paragraph({
    numbering: { reference: "subbullets", level: 0 },
    spacing: { before: 20, after: 20, line: 260 },
    children: [new TextRun({ text, size: 20, font: "Arial", color: "444444" })]
  });
}

function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { before: 40, after: 40, line: 276 },
    children: [new TextRun({ text, size: 22, font: "Arial" })]
  });
}

function divider() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.navy, space: 1 } },
    spacing: { before: 80, after: 80 },
    children: []
  });
}

function code(...lines) {
  return lines.map(line => new Paragraph({
    spacing: { before: 0, after: 0, line: 240 },
    children: [new TextRun({ text: line, font: "Courier New", size: 18, color: C.navy })]
  }));
}

function codeBox(lines) {
  return [
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [9026],
      rows: [new TableRow({ children: [
        new TableCell({
          borders: allBorders("AAAAAA"),
          shading: { fill: "F0F4FA", type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 180, right: 180 },
          children: lines.map(line => new Paragraph({
            spacing: { before: 0, after: 0, line: 240 },
            children: [new TextRun({ text: line, font: "Courier New", size: 18, color: C.navy })]
          }))
        })
      ]})]
    }),
    ...sp(1)
  ];
}

function badge(label, fill, color = C.text) {
  return new TextRun({ text: ` ${label} `, bold: true, size: 18, font: "Arial", color, shading: { fill } });
}

// ─── TITLE PAGE ───────────────────────────────────────────────────────────────
const titlePage = {
  properties: {
    page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 } }
  },
  children: [
    ...sp(2),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [
      new TextRun({ text: "SmartQueue", bold: true, size: 64, font: "Arial", color: C.navy })
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 }, children: [
      new TextRun({ text: "Smart Queue & Crowd Optimization System", size: 28, font: "Arial", color: C.blue })
    ]}),
    divider(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 40 }, children: [
      new TextRun({ text: "PRODUCT REQUIREMENTS DOCUMENT", bold: true, size: 32, font: "Arial", color: C.navy })
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 }, children: [
      new TextRun({ text: "+", size: 28, font: "Arial", color: C.mid })
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 }, children: [
      new TextRun({ text: "IMPLEMENTATION SPECIFICATION", bold: true, size: 32, font: "Arial", color: C.navy })
    ]}),
    ...sp(2),
    new Table({
      width: { size: 6000, type: WidthType.DXA },
      columnWidths: [2400, 3600],
      rows: [
        new TableRow({ children: [
          new TableCell({ borders: noBorders(), width: { size: 2400, type: WidthType.DXA }, children: [body("Version:", { bold: true })] }),
          new TableCell({ borders: noBorders(), width: { size: 3600, type: WidthType.DXA }, children: [body("v1.0 — Initial Release")] }),
        ]}),
        new TableRow({ children: [
          new TableCell({ borders: noBorders(), width: { size: 2400, type: WidthType.DXA }, children: [body("SDLC Model:", { bold: true })] }),
          new TableCell({ borders: noBorders(), width: { size: 3600, type: WidthType.DXA }, children: [body("Hybrid Agile-Waterfall")] }),
        ]}),
        new TableRow({ children: [
          new TableCell({ borders: noBorders(), width: { size: 2400, type: WidthType.DXA }, children: [body("Platform:", { bold: true })] }),
          new TableCell({ borders: noBorders(), width: { size: 3600, type: WidthType.DXA }, children: [body("Progressive Web App (PWA)")] }),
        ]}),
        new TableRow({ children: [
          new TableCell({ borders: noBorders(), width: { size: 2400, type: WidthType.DXA }, children: [body("Academic Year:", { bold: true })] }),
          new TableCell({ borders: noBorders(), width: { size: 3600, type: WidthType.DXA }, children: [body("2025–26")] }),
        ]}),
        new TableRow({ children: [
          new TableCell({ borders: noBorders(), width: { size: 2400, type: WidthType.DXA }, children: [body("Department:", { bold: true })] }),
          new TableCell({ borders: noBorders(), width: { size: 3600, type: WidthType.DXA }, children: [body("CS&IT — CSMU, Panvel")] }),
        ]}),
      ]
    }),
    ...sp(3),
    divider(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 40 }, children: [
      new TextRun({ text: "CONFIDENTIAL — FOR ACADEMIC SUBMISSION ONLY", size: 18, font: "Arial", color: C.mid, italics: true })
    ]}),
  ]
};

// ─── MAIN SECTION ─────────────────────────────────────────────────────────────
const mainSection = {
  properties: {
    page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 } }
  },
  headers: {
    default: new Header({ children: [new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.navy, space: 1 } },
      tabStops: [{ type: TabStopType.RIGHT, position: 8100 }],
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({ text: "SmartQueue — PRD & Implementation Spec", size: 18, font: "Arial", color: C.navy }),
        new TextRun({ text: "\t", size: 18 }),
        new TextRun({ text: "v1.0 | CSMU 2025–26", size: 18, font: "Arial", color: C.mid })
      ]
    })]})
  },
  footers: {
    default: new Footer({ children: [new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.navy, space: 1 } },
      tabStops: [{ type: TabStopType.RIGHT, position: 8100 }],
      spacing: { before: 80, after: 0 },
      children: [
        new TextRun({ text: "SmartQueue PRD + Spec", size: 18, font: "Arial", color: C.mid }),
        new TextRun({ text: "\t", size: 18 }),
        new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Arial", color: C.navy })
      ]
    })]})
  },

  children: [

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 0 — DOCUMENT OVERVIEW
    // ══════════════════════════════════════════════════════════════════════════
    h1("SECTION 0 — DOCUMENT OVERVIEW"),

    h2("0.1 Purpose of This Document"),
    body("This document serves as the combined Product Requirements Document (PRD) and Implementation Specification for the Smart Queue and Crowd Optimization System (SmartQueue). It is structured to address two distinct audiences:"),
    bullet("Stakeholders / Evaluators: Section 0–2 cover the product vision, platform decision, and requirements in business-readable language."),
    bullet("Developers / Implementers: Sections 3–9 cover architecture, data models, API specification, algorithms, and sprint plans in technical detail."),

    h2("0.2 What Was Wrong With the Original Idea — Loopholes Fixed"),
    body("The original concept had several engineering gaps that this specification addresses:"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [3500, 5526],
      rows: [
        new TableRow({ children: [hCell("Original Gap", 3500), hCell("Fix Implemented in This Spec", 5526)] }),
        ...[
          ["Wait time = people × constant (hardcoded)", "Dynamic rolling average of last 20 real sessions, updated after every served user"],
          ["No login/auth → spam tokens possible", "Phone + OTP identity check; JWT-protected admin routes; duplicate detection"],
          ["No queue closing time", "Admin can CLOSE queue (existing tokens still served); token generation blocked"],
          ["No-show handling was manual only", "APScheduler auto-marks MISSED tokens after configurable window (default 2 min)"],
          ["No priority queuing for emergencies", "Four-tier priority model P0–P3 with FIFO within each tier; P0 admin alert channel"],
          ["Firebase optional / vague real-time strategy", "WebSockets (FastAPI native) — no Firebase cost, no vendor lock-in"],
          ["Only Waterfall SDLC mentioned", "Hybrid Agile-Waterfall: Waterfall for documentation, Agile sprints for implementation"],
          ["No platform decision (mobile vs web)", "PWA — single codebase, works on Android + iOS + Desktop, no Play Store needed"],
          ["No session history stored", "ServiceSession table + PriorityAuditLog table enable future ML layer + accountability"],
        ].map(([g, f]) => new TableRow({ children: [dCell(g, 3500, C.red), dCell(f, 5526, C.green)] }))
      ]
    }),

    h2("0.3 Document Scope"),
    bullet("In Scope: Single-branch, single-queue deployment with multi-counter support; priority queuing; PWA delivery; Hybrid SDLC."),
    bullet("Out of Scope: Multi-branch management, payment integration, native mobile app, hardware kiosks."),

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 1 — PLATFORM & TECHNOLOGY DECISIONS
    // ══════════════════════════════════════════════════════════════════════════
    h1("SECTION 1 — PLATFORM & TECHNOLOGY DECISIONS"),

    h2("1.1 Platform Decision: PWA vs Native App"),
    body("The platform decision was evaluated on six criteria. The outcome is a definitive choice of Progressive Web Application for this project version, with native app as a v2.0 future scope item."),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [2200, 3413, 3413],
      rows: [
        new TableRow({ children: [hCell("Criterion", 2200), hCell("PWA  (CHOSEN)", 3413), hCell("Native App", 3413)] }),
        ...[
          ["Platform reach", "Android + iOS + Desktop — single codebase", "Separate Android + iOS builds required"],
          ["Distribution", "Instant via browser URL — no store needed", "Play Store / App Store — approval + delays"],
          ["Push notifications", "Web Push API — fully supported", "Firebase / APNs — more reliable but complex"],
          ["Offline support", "Service Workers + Workbox", "Full native offline — more capable"],
          ["Dev effort", "One React codebase (React + Vite)", "Two codebases OR React Native compromise"],
          ["Installable?", "Yes — Add to Home Screen in one tap", "Yes — from store after approval"],
          ["Academic demo fit", "✓ Perfect — zero infra cost, instant access", "Overkill — Play Store adds weeks of delay"],
        ].map(([a, b, c], i) => new TableRow({ children: [
          dCell(a, 2200, C.light, true),
          dCell(b, 3413, i === 6 ? C.green : "FFFFFF", i === 6, i === 6 ? C.greenDk : C.text),
          dCell(c, 3413, i === 6 ? C.amber : "FFFFFF")
        ]}))
      ]
    }),
    ...sp(1),
    body("Website or App? PWA is the right call for SmartQueue at this stage because one codebase supports Android, iOS, and desktop without Play Store approval friction. That makes it the best fit for an academic project and MVP rollout.", { bold: true }),
    body("Chapter 1.4 decision summary: PWA delivers faster development, simpler deployment, and broad device reach, while native app should be considered at v2.0 once the product reaches production scale and needs deeper offline support, store distribution, or hardware integrations.", { italic: true }),

    h2("1.2 SDLC Decision: Hybrid Agile-Waterfall"),
    body("Neither pure Waterfall nor pure Agile alone fits this project's dual need for academic documentation rigor and flexible implementation iteration."),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [2500, 3263, 3263],
      rows: [
        new TableRow({ children: [hCell("Layer", 2500), hCell("Governed By", 3263), hCell("Why", 3263)] }),
        new TableRow({ children: [dCell("Requirements & Docs", 2500, C.light, true), dCell("Waterfall", 3263, C.light), dCell("Full SRS upfront; chapter-by-chapter report; traceable req IDs", 3263)] }),
        new TableRow({ children: [dCell("Implementation", 2500, C.light, true), dCell("Agile (3 sprints)", 3263, C.green), dCell("Iterative delivery; sprint reviews catch edge cases early", 3263)] }),
        new TableRow({ children: [dCell("Testing", 2500, C.light, true), dCell("Both", 3263, C.amber), dCell("Formal test case table (Waterfall) + continuous testing in sprints (Agile)", 3263)] }),
        new TableRow({ children: [dCell("Deployment", 2500, C.light, true), dCell("Waterfall", 3263, C.light), dCell("Single planned release to Vercel + Render", 3263)] }),
      ]
    }),

    h2("1.3 Technology Stack"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [2000, 2500, 2000, 2526],
      rows: [
        new TableRow({ children: [hCell("Layer", 2000), hCell("Technology", 2500), hCell("Version", 2000), hCell("Rationale", 2526)] }),
        ...[
          ["Frontend","React + Vite","18 / 5","Industry standard; fast HMR; small bundle"],
          ["PWA","vite-plugin-pwa","0.19+","Workbox-based SW; manifest; offline cache"],
          ["Styling","Tailwind CSS","3+","Utility-first; no custom CSS overhead"],
          ["Charts","Recharts","2+","React-native; no external deps"],
          ["Backend","FastAPI (Python)","0.111+","Native async; auto-docs; built-in WS"],
          ["Database (dev)","SQLite","3+","Zero-config for local dev"],
          ["Database (prod)","PostgreSQL","14+","Render managed; same SQLAlchemy ORM"],
          ["Real-time","WebSockets (native)","RFC 6455","No Firebase cost; no vendor lock-in"],
          ["Auth","JWT (python-jose)","3.3+","Stateless; admin route protection"],
          ["Scheduler","APScheduler","3.10+","No-show detection background job"],
          ["Push notifs","pywebpush","2.0+","Web Push API; no Twilio needed for MVP"],
          ["Frontend host","Vercel","—","Free; CDN; auto-deploy from GitHub"],
          ["Backend host","Render","—","Free tier; ASGI support; managed Postgres"],
        ].map(([a,b,c,d]) => new TableRow({ children: [dCell(a,2000,C.light,true), dCell(b,2500), dCell(c,2000), dCell(d,2526)] }))
      ]
    }),

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 2 — PRODUCT REQUIREMENTS
    // ══════════════════════════════════════════════════════════════════════════
    h1("SECTION 2 — PRODUCT REQUIREMENTS"),

    h2("2.1 User Stories"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [800, 1200, 4026, 3000],
      rows: [
        new TableRow({ children: [hCell("ID", 800), hCell("As a...", 1200), hCell("I want to...", 4026), hCell("So that...", 3000)] }),
        ...[
          ["US-01","User","Generate a digital token using my phone number","I don't need to physically stand in line"],
          ["US-02","User","See my current queue position and wait time in real time","I can plan when to arrive at the counter"],
          ["US-03","User","Receive a push notification when my turn is near","I don't need to watch the screen constantly"],
          ["US-04","User","Declare an emergency or special priority reason","I get appropriate escalation in clinical contexts"],
          ["US-05","Admin","Call the next token with one click","Queue progresses without confusion"],
          ["US-06","Admin","Skip or reprioritize any token","I can handle no-shows and special cases flexibly"],
          ["US-07","Admin","Assign a P0-P3 priority tier to any token with a reason","Emergency cases are served immediately and the action is accountable"],
          ["US-08","Admin","Receive an instant alert when a P0 Critical token arrives","I can interrupt or expedite service for emergencies"],
          ["US-09","Admin","View analytics on peak hours and average service time","I can make staffing decisions for busy periods"],
          ["US-10","Admin","Close or pause the queue","I control when new tokens can be issued"],
          ["US-11","System","Auto-detect and mark no-show tokens after 2 minutes","Queue progresses without manual intervention"],
        ].map(([a,b,c,d]) => new TableRow({ children: [dCell(a,800,C.light), dCell(b,1200), dCell(c,4026), dCell(d,3000)] }))
      ]
    }),

    h2("2.2 Functional Requirements"),
    h3("2.2.1 Token & User Requirements"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [1200, 4826, 3000],
      rows: [
        new TableRow({ children: [hCell("ID", 1200), hCell("Requirement", 4826), hCell("Linked User Story", 3000)] }),
        ...[
          ["FR-U-01","System shall allow token generation via phone number and optional priority reason declaration","US-01, US-04"],
          ["FR-U-02","System shall display token number, queue position (priority-aware), and estimated wait on token page","US-02"],
          ["FR-U-03","System shall update position and EWT in real time via WebSocket without page refresh","US-02"],
          ["FR-U-04","System shall send Web Push notification when user is 2 positions from being called","US-03"],
          ["FR-U-05","System shall display current token being served at all times","US-02"],
          ["FR-U-06","System shall prevent duplicate token generation for the same phone in active session","US-01"],
          ["FR-U-07","System shall recalculate and broadcast all users' EWT whenever a priority change occurs","US-02"],
        ].map(([a,b,c]) => new TableRow({ children: [dCell(a,1200,C.light,true), dCell(b,4826), dCell(c,3000)] }))
      ]
    }),

    h3("2.2.2 Admin Requirements"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [1200, 4826, 3000],
      rows: [
        new TableRow({ children: [hCell("ID", 1200), hCell("Requirement", 4826), hCell("Linked User Story", 3000)] }),
        ...[
          ["FR-A-01","Admin interface shall require JWT-authenticated login","US-05"],
          ["FR-A-02","Admin shall call next token (always priority-ordered)","US-05"],
          ["FR-A-03","Admin shall skip any specific token","US-06"],
          ["FR-A-04","Admin shall promote any token to queue front (manual override)","US-06"],
          ["FR-A-05","Admin shall assign P0–P3 priority tier to any token with a mandatory reason field","US-07"],
          ["FR-A-06","System shall log every priority change (token_id, old, new, reason, admin_id, timestamp)","US-07"],
          ["FR-A-07","Admin dashboard shall display a full-width red alert when a P0 token is generated","US-08"],
          ["FR-A-08","Admin shall pause or close the queue","US-10"],
          ["FR-A-09","Admin dashboard shall display analytics: avg service time, tokens/day, peak hour chart","US-09"],
          ["FR-A-10","System shall auto-mark MISSED tokens after configurable no-show window (default 120s)","US-11"],
        ].map(([a,b,c]) => new TableRow({ children: [dCell(a,1200,C.light,true), dCell(b,4826), dCell(c,3000)] }))
      ]
    }),

    h2("2.3 Non-Functional Requirements"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [1000, 1500, 6526],
      rows: [
        new TableRow({ children: [hCell("ID", 1000), hCell("Category", 1500), hCell("Requirement", 6526)] }),
        ...[
          ["NFR-01","Performance","Queue state updates reflected on all clients within 500ms of admin action"],
          ["NFR-02","Usability","UI operable on 360px-wide mobile screen; no horizontal scroll"],
          ["NFR-03","Reliability","WebSocket client auto-reconnects within 3s on drop"],
          ["NFR-04","Scalability","Backend supports 200 concurrent WebSocket connections per queue"],
          ["NFR-05","Security","All admin endpoints JWT-protected; priority changes audit-logged"],
          ["NFR-06","Fairness","Within each priority tier, FIFO order strictly maintained (prevent gaming)"],
          ["NFR-07","Availability","Deployable on free-tier cloud; target 99% uptime"],
          ["NFR-08","Accuracy","EWT deviation < 15% from actual after 5+ completed sessions in controlled testing"],
        ].map(([a,b,c]) => new TableRow({ children: [dCell(a,1000,C.light,true), dCell(b,1500), dCell(c,6526)] }))
      ]
    }),

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 3 — SYSTEM ARCHITECTURE
    // ══════════════════════════════════════════════════════════════════════════
    h1("SECTION 3 — SYSTEM ARCHITECTURE"),

    h2("3.1 Architecture Overview"),
    body("SmartQueue follows a three-tier architecture with two real-time communication channels:"),
    ...codeBox([
      "[ React PWA Client ]",
      "       |",
      "       |  HTTP REST (token ops, auth, analytics)",
      "       |  WebSocket /ws/queue/{id}     — public: live queue state",
      "       |  WebSocket /ws/admin/{id}     — private: P0 alerts + audit events",
      "       v",
      "[ FastAPI Backend ]",
      "       |",
      "       |-- [ SQLite / PostgreSQL ]            (SQLAlchemy ORM)",
      "       |-- [ WebSocket Manager ]              (user + admin channels)",
      "       |-- [ APScheduler ]                    (no-show check every 60s)",
      "       |-- [ Priority Queue Service ]         (P0–P3 ordered get_next)",
      "       |-- [ Wait Time Service ]              (rolling avg + effective position)",
      "       |-- [ Priority Audit Logger ]          (immutable change log)",
      "       `-- [ Web Push Notification Service ]  (pywebpush)",
    ]),

    h2("3.2 Three-Tier Breakdown"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [2200, 2800, 4026],
      rows: [
        new TableRow({ children: [hCell("Tier", 2200), hCell("Component", 2800), hCell("Responsibilities", 4026)] }),
        new TableRow({ children: [dCell("Presentation", 2200, C.light, true), dCell("React PWA (Vite)", 2800), dCell("User/Admin UI; Service Worker; Web Push; Priority badge display; P0 alert panel", 4026)] }),
        new TableRow({ children: [dCell("Application", 2200, C.light, true), dCell("FastAPI (Python)", 2800), dCell("Business logic; REST APIs; WebSocket manager (2 channels); Priority ordering; Scheduler; Push notifications", 4026)] }),
        new TableRow({ children: [dCell("Data", 2200, C.light, true), dCell("SQLite / PostgreSQL", 2800), dCell("Persistent: tokens (with priority), sessions, queue config, admin accounts, priority audit log", 4026)] }),
      ]
    }),

    h2("3.3 WebSocket Channel Design"),
    body("Two distinct WebSocket channels serve different purposes:"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [2500, 2000, 4526],
      rows: [
        new TableRow({ children: [hCell("Channel", 2500), hCell("Auth Required", 2000), hCell("Events Published", 4526)] }),
        new TableRow({ children: [dCell("/ws/queue/{queue_id}", 2500), dCell("None (public)", 2000), dCell("queue_state_update, token_called, token_done, token_missed, position_recalculated", 4526)] }),
        new TableRow({ children: [dCell("/ws/admin/{queue_id}", 2500), dCell("JWT in WS header", 2000), dCell("p0_emergency_alert, priority_changed, audit_log_entry, queue_state_update", 4526)] }),
      ]
    }),

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 4 — DATA MODELS
    // ══════════════════════════════════════════════════════════════════════════
    h1("SECTION 4 — DATA MODELS"),

    h2("4.1 Entity Relationship Summary"),
    body("One Queue has many Tokens. One Token has one ServiceSession upon completion. One Queue has one or more Admins. Each priority change on a Token generates one PriorityAuditLog entry."),

    h2("4.2 Queue"),
    ...codeBox([
      "Queue",
      "  id                      : String (UUID)",
      "  name                    : String",
      "  location                : String",
      "  status                  : Enum [OPEN | CLOSED | PAUSED]",
      "  avg_service_time_seconds: Float  (rolling avg, updated after each DONE)",
      "  active_counters         : Integer (default 1)",
      "  no_show_window_seconds  : Integer (default 120)",
      "  created_at              : DateTime",
      "  updated_at              : DateTime",
    ]),

    h2("4.3 Token"),
    ...codeBox([
      "Token",
      "  id                     : Integer (PK)",
      "  queue_id               : String (FK -> Queue.id)",
      "  user_phone             : String",
      "  token_number           : String  (e.g. 'A001')",
      "  status                 : Enum [WAITING | CALLED | SERVING | DONE | MISSED | SKIPPED]",
      "  priority               : Integer (0=Critical, 1=Urgent, 2=Priority, 3=Regular)  DEFAULT 3",
      "  priority_reason        : String  (nullable: 'Emergency', 'Senior Citizen', 'Pregnant', etc.)",
      "  priority_set_by        : String  ('user' | 'admin')  DEFAULT 'user'",
      "  priority_set_at        : DateTime (nullable)",
      "  issued_at              : DateTime",
      "  called_at              : DateTime (nullable)",
      "  served_at              : DateTime (nullable)",
      "  completed_at           : DateTime (nullable)",
      "  estimated_wait_seconds : Integer",
    ]),

    h2("4.4 ServiceSession"),
    ...codeBox([
      "ServiceSession",
      "  id               : Integer (PK)",
      "  token_id         : Integer (FK -> Token.id)",
      "  counter_id       : Integer",
      "  start_time       : DateTime",
      "  end_time         : DateTime",
      "  duration_seconds : Integer  (computed: end_time - start_time)",
    ]),

    h2("4.5 PriorityAuditLog"),
    ...codeBox([
      "PriorityAuditLog",
      "  id           : Integer (PK)",
      "  token_id     : Integer (FK -> Token.id)",
      "  old_priority : Integer",
      "  new_priority : Integer",
      "  reason       : String  (mandatory — admin must enter)",
      "  set_by       : String  ('user' | 'admin')",
      "  admin_id     : Integer (FK -> Admin.id, nullable for user self-declare)",
      "  timestamp    : DateTime",
    ]),

    h2("4.6 Admin"),
    ...codeBox([
      "Admin",
      "  id            : Integer (PK)",
      "  queue_id      : String (FK -> Queue.id)",
      "  username      : String (unique)",
      "  password_hash : String (bcrypt)",
      "  role          : Enum [SUPERADMIN | COUNTER]",
    ]),

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 5 — API SPECIFICATION
    // ══════════════════════════════════════════════════════════════════════════
    h1("SECTION 5 — API SPECIFICATION"),

    h2("5.1 User APIs"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [900, 2800, 5326],
      rows: [
        new TableRow({ children: [hCell("Method", 900), hCell("Endpoint", 2800), hCell("Description", 5326)] }),
        ...[
          ["POST", "/api/token/generate", "Generate token. Body: { phone, queue_id, priority_reason? }. Returns: token_number, position, ewt_seconds."],
          ["GET",  "/api/token/{token_id}", "Get token status, priority-aware position, and updated EWT."],
          ["GET",  "/api/queue/{queue_id}/status", "Live queue snapshot: current serving, count by priority tier, queue status."],
          ["POST", "/api/token/{token_id}/checkin", "User confirms physical presence when called."],
        ].map(([m,e,d]) => new TableRow({ children: [
          dCell(m, 900, m==="POST" ? C.green : C.light),
          dCell(e, 2800, "F8F9FA"),
          dCell(d, 5326)
        ]}))
      ]
    }),

    h2("5.2 Admin APIs"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [900, 2800, 1000, 4326],
      rows: [
        new TableRow({ children: [hCell("Method", 900), hCell("Endpoint", 2800), hCell("Auth", 1000), hCell("Description", 4326)] }),
        ...[
          ["POST","/api/admin/login","None","Admin login. Returns JWT access token."],
          ["POST","/api/admin/queue/next","JWT","Call next token (always priority-ordered P0→P3→FIFO within tier)."],
          ["POST","/api/admin/queue/skip/{token_id}","JWT","Skip token; status → SKIPPED; queue re-broadcasts."],
          ["POST","/api/admin/queue/priority/{token_id}","JWT","Move token to absolute position 1 (manual front-of-queue override)."],
          ["POST","/api/admin/token/{token_id}/set-priority","JWT","Set priority tier. Body: { priority: 0-3, reason: string }. Creates PriorityAuditLog entry. Triggers EWT recalculation broadcast."],
          ["POST","/api/admin/queue/close","JWT","Stop new token generation. Existing tokens continue to be served."],
          ["POST","/api/admin/queue/pause","JWT","Pause queue temporarily. No new calls until resumed."],
          ["GET","/api/admin/analytics","JWT","Analytics: avg service time, tokens/hour chart, peak hour, priority distribution."],
          ["GET","/api/admin/priority-audit/{queue_id}","JWT","Retrieve full PriorityAuditLog for the queue. Supports date filtering."],
        ].map(([m,e,a,d]) => new TableRow({ children: [
          dCell(m, 900, m==="POST" ? C.green : C.light),
          dCell(e, 2800, "F8F9FA"),
          dCell(a, 1000),
          dCell(d, 4326)
        ]}))
      ]
    }),

    h2("5.3 WebSocket Events"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [2200, 1400, 5426],
      rows: [
        new TableRow({ children: [hCell("Event Name", 2200), hCell("Channel", 1400), hCell("Payload Description", 5426)] }),
        ...[
          ["queue_state_update","Public","Full queue snapshot: serving_token, waiting_count, tokens_by_priority, avg_ewt"],
          ["position_recalculated","Public","Triggered when any priority change shifts positions. Clients re-fetch their EWT."],
          ["token_called","Public","{ token_number, token_id } — notifies all clients who is being called"],
          ["token_missed","Public","{ token_number } — notifies all clients of no-show"],
          ["p0_emergency_alert","Admin","{ token_number, priority_reason, issued_at } — flash red alert on admin dashboard"],
          ["priority_changed","Admin","{ token_id, old_priority, new_priority, reason, admin_id } — audit broadcast"],
          ["audit_log_entry","Admin","Full PriorityAuditLog entry object for live audit feed"],
        ].map(([e,c,p]) => new TableRow({ children: [
          dCell(e, 2200, "F8F9FA", true, C.navy),
          dCell(c, 1400, c==="Admin" ? C.amber : C.light),
          dCell(p, 5426)
        ]}))
      ]
    }),

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 6 — PRIORITY QUEUING SPECIFICATION
    // ══════════════════════════════════════════════════════════════════════════
    h1("SECTION 6 — PRIORITY QUEUING SPECIFICATION"),

    h2("6.1 Priority Tier Definitions"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [700, 1800, 2800, 1926, 1800],
      rows: [
        new TableRow({ children: [hCell("Value", 700), hCell("Tier", 1800), hCell("Who Gets It", 2800), hCell("UI Color", 1926), hCell("Within-Tier Order", 1800)] }),
        new TableRow({ children: [dCell("0", 700, C.red, true), dCell("Critical / Emergency", 1800, C.red), dCell("Life-threatening, unconscious, severe trauma, cardiac event", 2800, C.red), dCell("Red #D32F2F", 1926, C.red), dCell("FIFO", 1800, C.red)] }),
        new TableRow({ children: [dCell("1", 700, C.amber), dCell("Urgent", 1800, C.amber), dCell("Senior citizen (65+), pregnant, disability, high fever", 2800, C.amber), dCell("Orange #F57C00", 1926, C.amber), dCell("FIFO", 1800, C.amber)] }),
        new TableRow({ children: [dCell("2", 700, C.yellow), dCell("Priority", 1800, C.yellow), dCell("Pre-booked appointment, VIP, admin-escalated", 2800, C.yellow), dCell("Amber #FBC02D", 1926, C.yellow), dCell("FIFO", 1800, C.yellow)] }),
        new TableRow({ children: [dCell("3", 700, C.green), dCell("Regular", 1800, C.green), dCell("Standard walk-in token — default", 2800, C.green), dCell("Green #388E3C", 1926, C.green), dCell("FIFO", 1800, C.green)] }),
      ]
    }),
    ...sp(1),
    body("Key design principle: Within the same priority tier, ordering is always strictly FIFO (by issued_at). This prevents gaming — a user cannot gain advantage over others at the same priority level by any mechanism other than arriving earlier.", { bold: true }),

    h2("6.2 Priority Assignment Flow"),
    h3("6.2.1 User Self-Declaration (at Token Generation)"),
    body("User selects from dropdown: Emergency / Senior Citizen / Pregnant / Disability / None. System assigns corresponding priority tier. This enables the most common use cases (elderly, pregnant) to be handled automatically without admin intervention."),
    h3("6.2.2 Admin Override (at any time)"),
    body("Admin can escalate or de-escalate any token via the admin dashboard. A reason field is mandatory. Every change creates a PriorityAuditLog record. This is the primary mechanism for P0 Critical assignments, which should be verified by clinical staff rather than self-declared."),

    h2("6.3 Priority Queue Ordering Algorithm"),
    h4("Database Query (Core Ordering Logic)"),
    ...codeBox([
      "# Called by get_next_token() and get_effective_position()",
      "# All WAITING tokens for a queue, sorted by priority then time",
      "",
      "tokens = db.query(Token).filter(",
      "    Token.queue_id == queue_id,",
      "    Token.status == 'WAITING'",
      ").order_by(",
      "    Token.priority.asc(),     # P0 first (lowest int = highest priority)",
      "    Token.issued_at.asc()     # FIFO within the same tier",
      ").all()",
      "",
      "# When admin presses 'Next' -> result[0] is always called",
      "# No manual selection needed; priority is automatically respected",
    ]),

    h4("Effective Position Calculation (for EWT)"),
    ...codeBox([
      "def get_effective_position(token_id: int) -> int:",
      "    token = db.get(Token, token_id)",
      "    # Count tokens that will be served BEFORE this one",
      "    ahead = db.query(Token).filter(",
      "        Token.queue_id == token.queue_id,",
      "        Token.status == 'WAITING',",
      "        or_(",
      "            Token.priority < token.priority,   # strictly higher priority",
      "            and_(",
      "                Token.priority == token.priority,",
      "                Token.issued_at < token.issued_at  # earlier in same tier",
      "            )",
      "        )",
      "    ).count()",
      "    return ahead + 1  # 1-indexed position",
    ]),

    h2("6.4 P0 Emergency Interrupt Handling"),
    body("When a P0 token is generated, the following sequence occurs:"),
    numbered("Token created with priority=0; position set to 1 in sorted order."),
    numbered("Backend broadcasts p0_emergency_alert event on the admin WebSocket channel immediately."),
    numbered("Admin dashboard displays full-width red banner: '🔴 EMERGENCY TOKEN RECEIVED — [Token#] | Reason: [reason]' with a one-click 'Call Emergency Now' button."),
    numbered("All connected users' EWT is recalculated and broadcast via position_recalculated event."),
    numbered("Admin decides whether to interrupt current in-progress service or wait for natural completion."),
    numbered("Alert persists until admin explicitly acknowledges it (dismiss button) or the token is called."),
    ...sp(1),
    body("Note: The software cannot force-stop an in-progress human service interaction. The system provides maximum visibility and one-click action; the final call remains with the service provider. This is intentional.", { italic: true }),

    h2("6.5 No-Show Handling (Interaction with Priority)"),
    ...codeBox([
      "# APScheduler job — runs every 60 seconds",
      "def check_no_shows():",
      "    called_tokens = db.query(Token).filter(",
      "        Token.status == 'CALLED'",
      "    ).all()",
      "    for token in called_tokens:",
      "        elapsed = (now() - token.called_at).seconds",
      "        queue = db.get_queue(token.queue_id)",
      "        if elapsed > queue.no_show_window_seconds:  # default 120s",
      "            # P0 tokens get double the no-show window (240s) — safety buffer",
      "            window = queue.no_show_window_seconds * (2 if token.priority == 0 else 1)",
      "            if elapsed > window:",
      "                token.status = 'MISSED'",
      "                db.save(token)",
      "                broadcast_queue_update(token.queue_id)",
    ]),

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 7 — WAIT TIME ALGORITHM
    // ══════════════════════════════════════════════════════════════════════════
    h1("SECTION 7 — WAIT TIME ALGORITHM"),

    h2("7.1 Full Algorithm"),
    ...codeBox([
      "def calculate_wait_time(queue_id: str, token_id: int) -> int:",
      "    \"\"\"Returns estimated wait in seconds. Priority-aware.\"\"\"",
      "    queue   = db.get_queue(queue_id)",
      "    avg_st  = queue.avg_service_time_seconds  # dynamically updated",
      "    counters = queue.active_counters",
      "",
      "    # Priority-aware position (not just count of all waiting tokens)",
      "    position     = get_effective_position(token_id)",
      "    people_ahead = position - 1",
      "",
      "    # Remaining time for the currently-being-served token",
      "    current = db.get_current_serving(queue_id)",
      "    if current and current.called_at:",
      "        elapsed   = (now() - current.called_at).seconds",
      "        remaining = max(0, avg_st - elapsed)",
      "    else:",
      "        remaining = 0",
      "",
      "    # Total wait = remaining for current + full slots for all ahead / counters",
      "    total = remaining + (people_ahead / counters) * avg_st",
      "    return int(total)",
      "",
      "",
      "def update_avg_service_time(queue_id: str):",
      "    \"\"\"Called after every token is marked DONE.\"\"\"",
      "    ROLLING_WINDOW = 20",
      "    sessions = db.get_last_N_sessions(queue_id, ROLLING_WINDOW)",
      "    if sessions:",
      "        avg = sum(s.duration_seconds for s in sessions) / len(sessions)",
      "        db.update_queue_avg(queue_id, avg)",
      "        # Trigger EWT recalculation broadcast for all waiting tokens",
      "        broadcast_ewt_update(queue_id)",
    ]),

    h2("7.2 Initialization Behaviour"),
    body("At queue creation, avg_service_time_seconds defaults to 300 (5 minutes per person). This is used until at least one ServiceSession is recorded. After 5 sessions, the rolling average begins to converge. After 20 sessions, the window is fully established. The default value can be overridden by the admin at queue creation."),

    h2("7.3 EWT Recalculation Triggers"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [4026, 5000],
      rows: [
        new TableRow({ children: [hCell("Trigger Event", 4026), hCell("Action", 5000)] }),
        ...[
          ["Token marked DONE","Update rolling avg; broadcast EWT for all WAITING tokens"],
          ["New P0/P1/P2 token generated","Recalculate effective positions; broadcast position_recalculated"],
          ["Admin assigns higher priority to a token","Recalculate all WAITING tokens' positions; broadcast"],
          ["Admin calls next token (status CALLED)","Recalculate remaining time estimate; broadcast queue_state_update"],
          ["Token marked MISSED or SKIPPED","Recalculate positions of all remaining WAITING tokens; broadcast"],
        ].map(([t,a]) => new TableRow({ children: [dCell(t, 4026, C.light), dCell(a, 5000)] }))
      ]
    }),

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 8 — FRONTEND SPECIFICATION
    // ══════════════════════════════════════════════════════════════════════════
    h1("SECTION 8 — FRONTEND SPECIFICATION"),

    h2("8.1 Design Direction"),
    body("SmartQueue follows a mobile-first PWA design system optimized for 360px-wide screens before scaling up to tablet and desktop admin layouts."),
    bullet("Visual tone: clean, clinical, and trustworthy rather than decorative."),
    bullet("Primary color: hospital blue #1A3C6E, paired with white backgrounds and soft blue-gray card surfaces."),
    bullet("Layout system: stacked cards, generous spacing, high-contrast typography, and large touch targets for fast queue interactions."),
    bullet("Priority colors: Critical = red, Urgent = orange, Priority = yellow, Regular = green across both user and admin views."),

    h2("8.2 User Flow Pages"),
    h3("Page 1 — Landing / Token Generation"),
    bullet("Phone number input (validated: 10 digits, Indian format)"),
    bullet("Priority reason dropdown: None (default) / Emergency / Senior Citizen (65+) / Pregnant / Disability"),
    bullet("Submit → OTP verification (4-digit code for MVP; Twilio SMS for prod)"),
    bullet("On success → redirect to Token Page with token_id in URL"),

    h3("Page 2 — Token Tracking Page"),
    bullet("Large token number badge centered inside the hero card (e.g. A007), designed as the primary visual anchor."),
    bullet("Live position counter: '3rd in queue' shown prominently under the token badge and updated in real time via WebSocket."),
    bullet("Estimated wait: '~12 minutes' displayed as a dedicated stat card and recalculated on every queue event."),
    bullet("Currently serving: 'Now serving: A004'"),
    bullet("Priority tier badge shown on the same card using color-coded labels: red = Critical, orange = Urgent, yellow = Priority, green = Regular."),
    bullet("Visual style: white background, blue primary accents (#1A3C6E), rounded cards, minimal clinical UI chrome."),
    bullet("Notification permission prompt on first load"),
    bullet("Auto-update without refresh; reconnects WS on drop"),

    h3("Page 3 — PWA / Service Worker"),
    bullet("Manifest: app name, icons, theme color #1A3C6E, display: standalone"),
    bullet("Service worker: caches HTML/CSS/JS for offline shell; token page works offline (shows last state)"),
    bullet("Web Push subscription requested at token generation; push sent when 2 positions remain"),

    h2("8.3 Admin Flow Pages"),
    h3("Page 4 — Admin Login"),
    bullet("Username + password form; JWT stored in httpOnly cookie"),

    h3("Page 5 — Admin Dashboard"),
    bullet("P0 Emergency Alert Panel (top): prominent full-width red banner appears immediately when a Critical token arrives; includes 'Call Emergency Now' CTA and dismiss button."),
    bullet("Queue control bar: Next / Pause / Close buttons; current counter display"),
    bullet("Waiting tokens list: card or table rows showing token number, phone (masked), priority badge, issued time, and EWT."),
    bullet("Per-token action cluster includes Next, Skip, and Escalate buttons so the dashboard matches operational workflow directly."),
    bullet("Escalate modal: priority tier dropdown (P0–P3) + mandatory reason text field + confirm"),
    bullet("Currently serving panel: token number, time elapsed, 'Mark Done' button"),
    bullet("Desktop enhancement: waiting queue can expand into a denser table, while mobile keeps the same information in stacked cards."),

    h3("Page 6 — Analytics Dashboard"),
    bullet("Tokens served today (count) + avg service time (minutes)"),
    bullet("Hourly chart: tokens served per hour (Recharts BarChart)"),
    bullet("Priority distribution pie: P0/P1/P2/P3 breakdown for the day"),
    bullet("P0 frequency chart: P0 arrivals by hour (useful for staffing)"),
    bullet("Priority audit log table: token, change, reason, admin, timestamp"),

    h2("8.4 Key React Components"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [2800, 6226],
      rows: [
        new TableRow({ children: [hCell("Component", 2800), hCell("Description", 6226)] }),
        ...[
          ["QueueDisplay.jsx","Token number, position, EWT, currently serving. Auto-updates via WS."],
          ["PriorityBadge.jsx","Color-coded tier badge (P0–P3) with label. Used in both user and admin views."],
          ["EmergencyAlert.jsx","P0 alert banner connected to admin WS channel. Persists until acknowledged."],
          ["AdminPanel.jsx","Queue controls + waiting tokens list with per-token actions."],
          ["PriorityModal.jsx","Escalate dialog: tier dropdown + mandatory reason field + confirm/cancel."],
          ["AnalyticsChart.jsx","Recharts-based bar/pie charts for admin analytics page."],
          ["NotificationPermission.jsx","Web Push subscription request prompt."],
          ["useWebSocket.js","Custom hook: WS connect, reconnect (3s backoff), message dispatch."],
          ["useAdminChannel.js","Admin-only WS hook: receives P0 alerts and audit events."],
        ].map(([c,d]) => new TableRow({ children: [dCell(c, 2800, C.light, true, C.navy), dCell(d, 6226)] }))
      ]
    }),

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 9 — HYBRID SDLC & SPRINT PLAN
    // ══════════════════════════════════════════════════════════════════════════
    h1("SECTION 9 — HYBRID SDLC & SPRINT PLAN"),

    h2("9.1 Waterfall Phase Milestones"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [1200, 2400, 3426, 2000],
      rows: [
        new TableRow({ children: [hCell("Phase", 1200), hCell("Waterfall Stage", 2400), hCell("Deliverable", 3426), hCell("Week", 2000)] }),
        ...[
          ["WF-1","Requirement Analysis","SRS Document, User Stories, FR/NFR table, Priority tier definitions","Week 1"],
          ["WF-2","System Design","Architecture diagram, ER diagram, API spec, Priority queue logic, DFD, Wireframes","Week 2"],
          ["WF-3","Implementation","Working codebase via 3 Agile sprints (see 9.2)","Weeks 3–5"],
          ["WF-4","Testing","Formal test case table (14+ cases), bug fixes, performance validation","Week 5"],
          ["WF-5","Deployment","Live Vercel + Render deployment, CI/CD via GitHub","Week 5"],
          ["WF-6","Documentation","Final project report, UML diagrams, Gantt chart, presentation","Week 6"],
        ].map(([a,b,c,d]) => new TableRow({ children: [dCell(a,1200,C.light,true,C.navy), dCell(b,2400), dCell(c,3426), dCell(d,2000)] }))
      ]
    }),

    h2("9.2 Agile Sprint Backlog"),
    h3("Sprint 1 — Backend Core (Week 3)"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [5026, 2500, 1500],
      rows: [
        new TableRow({ children: [hCell("Task", 5026), hCell("Acceptance Criteria", 2500), hCell("Priority", 1500)] }),
        ...[
          ["FastAPI project setup + SQLAlchemy models (including priority fields on Token)","Models migrate without error; Token has priority/reason/audit fields","P0"],
          ["Token CRUD APIs (generate, get status)","POST /token/generate returns token_number, ewt; duplicate phone returns 400","P0"],
          ["Priority-ordered get_next_token() service","Returns P0 before P1 before P3; FIFO within same tier; unit tested","P0"],
          ["get_effective_position() for priority-aware EWT","Position recalculates correctly when higher-priority token inserted; unit tested","P0"],
          ["WebSocket broadcast manager (user + admin channels)","Admin action broadcasts to all user WS clients within 500ms on localhost","P0"],
          ["Queue state management (next/skip/close/pause)","All state transitions tested; status changes persist to DB","P1"],
          ["Rolling avg service time updater","After 3 DONE events, avg updates correctly; verified via unit test","P1"],
        ].map(([t,a,p]) => new TableRow({ children: [dCell(t,5026), dCell(a,2500), dCell(p,1500, p==="P0"?C.red:C.amber,true)] }))
      ]
    }),

    h3("Sprint 2 — Frontend + Priority UI (Week 4)"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [5026, 2500, 1500],
      rows: [
        new TableRow({ children: [hCell("Task", 5026), hCell("Acceptance Criteria", 2500), hCell("Priority", 1500)] }),
        ...[
          ["React + Vite + PWA setup (manifest + service worker)","App installable on Android Chrome; offline shell loads","P0"],
          ["User flow: phone entry → priority dropdown → token page","Full flow works end-to-end; priority badge shows correct color","P0"],
          ["Admin login + JWT auth flow","Admin can log in; non-admin routes return 401 without token","P0"],
          ["Admin dashboard: queue controls + waiting tokens list + priority badges","Next/Skip/Close buttons functional; token list shows P0–P3 badges","P0"],
          ["EmergencyAlert.jsx: P0 alert banner on admin WS event","Red banner appears within 200ms of P0 token generation","P0"],
          ["PriorityModal.jsx: escalation dialog with mandatory reason","Reason field prevents submit if empty; PriorityAuditLog entry created","P1"],
          ["useWebSocket.js + useAdminChannel.js hooks with auto-reconnect","Client reconnects within 3s after simulated drop","P1"],
          ["Web Push subscription + backend pywebpush integration","Push notification received on Android Chrome when 2 positions remain","P2"],
        ].map(([t,a,p]) => new TableRow({ children: [dCell(t,5026), dCell(a,2500), dCell(p,1500, p==="P0"?C.red:p==="P1"?C.amber:C.yellow,true)] }))
      ]
    }),

    h3("Sprint 3 — Analytics, Polish & Deploy (Week 5)"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [5026, 2500, 1500],
      rows: [
        new TableRow({ children: [hCell("Task", 5026), hCell("Acceptance Criteria", 2500), hCell("Priority", 1500)] }),
        ...[
          ["Analytics API: tokens/hour, avg service time, priority distribution","GET /admin/analytics returns correct aggregated data","P0"],
          ["Analytics dashboard: Recharts bar + pie charts","Charts render with mock data; update correctly with live data","P0"],
          ["No-show APScheduler job (60s interval)","Token auto-transitions to MISSED after 120s; P0 gets 240s window","P0"],
          ["Priority audit log API + admin UI table","GET /admin/priority-audit returns log entries; renders in analytics page","P1"],
          ["Mobile UI polish (360px viewport; Tailwind responsive)","No horizontal scroll on iPhone SE (375px); buttons tap-friendly","P1"],
          ["Deploy: Render (backend) + Vercel (frontend)","Both live; CORS configured; WebSocket works over wss://","P0"],
          ["End-to-end smoke test on live deployment","All 14 test cases pass on live URLs","P0"],
        ].map(([t,a,p]) => new TableRow({ children: [dCell(t,5026), dCell(a,2500), dCell(p,1500, p==="P0"?C.red:C.amber,true)] }))
      ]
    }),

    h2("9.3 Definition of Done (Each Sprint)"),
    bullet("All P0 sprint tasks completed and acceptance criteria verified"),
    bullet("No open P0/P1 bugs remaining"),
    bullet("Code pushed to GitHub; PR reviewed"),
    bullet("Waterfall documentation updated with any design changes discovered during sprint"),
    bullet("Sprint retrospective note added to project README"),

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 10 — FOLDER STRUCTURE
    // ══════════════════════════════════════════════════════════════════════════
    h1("SECTION 10 — FOLDER STRUCTURE"),
    ...codeBox([
      "smart-queue/",
      "├── backend/",
      "│   ├── main.py                    # FastAPI app entry; CORS; router registration",
      "│   ├── models.py                  # SQLAlchemy models (Token has priority fields)",
      "│   ├── schemas.py                 # Pydantic request/response schemas",
      "│   ├── database.py                # DB engine + session factory",
      "│   ├── scheduler.py               # APScheduler: no-show checker (60s interval)",
      "│   ├── routers/",
      "│   │   ├── token.py               # /api/token/* endpoints",
      "│   │   ├── admin.py               # /api/admin/* endpoints + set-priority",
      "│   │   └── analytics.py           # /api/admin/analytics + priority-audit",
      "│   ├── services/",
      "│   │   ├── queue_service.py       # get_next_token(), priority-ordered",
      "│   │   ├── wait_time.py           # calculate_wait_time(), get_effective_position()",
      "│   │   ├── priority_audit.py      # create_audit_entry(), get_audit_log()",
      "│   │   └── notifications.py       # Web Push (pywebpush)",
      "│   └── ws/",
      "│       └── manager.py             # ConnectionManager: user + admin channels",
      "│",
      "├── frontend/",
      "│   ├── src/",
      "│   │   ├── pages/",
      "│   │   │   ├── UserPage.jsx       # Phone + priority dropdown; OTP verify",
      "│   │   │   ├── TokenPage.jsx      # Token number; position; EWT; priority badge",
      "│   │   │   └── AdminPage.jsx      # P0 alert; queue controls; token list; analytics",
      "│   │   ├── components/",
      "│   │   │   ├── QueueDisplay.jsx",
      "│   │   │   ├── PriorityBadge.jsx  # P0-P3 color badge component",
      "│   │   │   ├── EmergencyAlert.jsx # P0 red banner (admin only)",
      "│   │   │   ├── PriorityModal.jsx  # Escalation dialog + mandatory reason",
      "│   │   │   ├── AdminPanel.jsx",
      "│   │   │   └── AnalyticsChart.jsx",
      "│   │   ├── hooks/",
      "│   │   │   ├── useWebSocket.js    # User WS hook; auto-reconnect; dispatch",
      "│   │   │   └── useAdminChannel.js # Admin WS hook; P0 + audit events",
      "│   │   └── App.jsx",
      "│   ├── public/",
      "│   │   ├── manifest.json          # PWA manifest: name, icons, theme",
      "│   │   └── sw.js                  # Service worker (Workbox auto-generated)",
      "│   └── vite.config.js             # vite-plugin-pwa config",
      "│",
      "└── README.md                      # Setup, env vars, deploy instructions",
    ]),

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 11 — DEPLOYMENT
    // ══════════════════════════════════════════════════════════════════════════
    h1("SECTION 11 — DEPLOYMENT"),

    h2("11.1 Deployment Targets"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [2200, 2500, 2326, 2000],
      rows: [
        new TableRow({ children: [hCell("Component", 2200), hCell("Platform", 2500), hCell("URL Pattern", 2326), hCell("Cost", 2000)] }),
        new TableRow({ children: [dCell("Frontend (React PWA)", 2200, C.light), dCell("Vercel", 2500), dCell("https://smartqueue.vercel.app", 2326), dCell("Free", 2000, C.green)] }),
        new TableRow({ children: [dCell("Backend (FastAPI)", 2200, C.light), dCell("Render", 2500), dCell("https://smartqueue-api.onrender.com", 2326), dCell("Free tier", 2000, C.green)] }),
        new TableRow({ children: [dCell("Database (dev)", 2200, C.light), dCell("SQLite (local file)", 2500), dCell("smart_queue.db", 2326), dCell("Free", 2000, C.green)] }),
        new TableRow({ children: [dCell("Database (prod)", 2200, C.light), dCell("Render Postgres", 2500), dCell("Render-managed", 2326), dCell("Free tier", 2000, C.green)] }),
        new TableRow({ children: [dCell("Push Notifications", 2200, C.light), dCell("Web Push (self-hosted)", 2500), dCell("Via pywebpush", 2326), dCell("Free", 2000, C.green)] }),
      ]
    }),

    h2("11.2 Local Development Setup"),
    ...codeBox([
      "# Backend",
      "cd backend",
      "python -m venv venv && source venv/bin/activate",
      "pip install fastapi uvicorn sqlalchemy apscheduler python-jose pywebpush",
      "uvicorn main:app --reload --port 8000",
      "",
      "# Frontend",
      "cd frontend",
      "npm install",
      "npm run dev  # starts on http://localhost:5173",
      "",
      "# CORS in main.py must allow http://localhost:5173 for local dev",
    ]),

    h2("11.3 Environment Variables"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [3000, 3000, 3026],
      rows: [
        new TableRow({ children: [hCell("Variable", 3000), hCell("Example Value", 3000), hCell("Purpose", 3026)] }),
        ...[
          ["DATABASE_URL","postgresql://user:pass@host/db","DB connection (prod)"],
          ["SECRET_KEY","random-256-bit-string","JWT signing key"],
          ["VAPID_PRIVATE_KEY","base64-encoded key","Web Push signing"],
          ["VAPID_PUBLIC_KEY","base64-encoded key","Sent to clients for WS subscription"],
          ["NO_SHOW_WINDOW","120","Seconds before token auto-MISSED"],
          ["VITE_API_BASE","https://smartqueue-api.onrender.com","Frontend API URL"],
        ].map(([a,b,c]) => new TableRow({ children: [dCell(a,3000,"F8F9FA",true,C.navy), dCell(b,3000), dCell(c,3026)] }))
      ]
    }),

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 12 — FUTURE ROADMAP
    // ══════════════════════════════════════════════════════════════════════════
    h1("SECTION 12 — FUTURE ROADMAP"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [800, 2500, 4226, 1500],
      rows: [
        new TableRow({ children: [hCell("Phase", 800), hCell("Feature", 2500), hCell("Description", 4226), hCell("Effort", 1500)] }),
        ...[
          ["v1.1","ML Wait Time Prediction","Replace rolling average with trained regression model using session history, time-of-day, day-of-week","Medium"],
          ["v1.2","Triage System Integration","API bridge to hospital triage scores (ESI/MTS) for auto-P0/P1 assignment","High"],
          ["v1.3","QR Code Tokens","Printable QR tokens for users without smartphones; scannable at counter","Low"],
          ["v1.4","WhatsApp / SMS Alerts","Twilio integration for SMS push; covers iOS Push limitations","Low"],
          ["v1.5","Priority Analytics ML","Predict peak P0 hours; staff scheduling recommendations","Medium"],
          ["v2.0","Multi-Branch Support","Multiple physical locations with independent queues under one admin","High"],
          ["v2.1","Native Mobile App","React Native packaging for Play Store + App Store","High"],
          ["v2.2","Appointment Booking","Time-slot booking alongside walk-in tokens","Medium"],
        ].map(([a,b,c,d]) => new TableRow({ children: [dCell(a,800,C.light,true,C.navy), dCell(b,2500,C.light), dCell(c,4226), dCell(d,1500)] }))
      ]
    }),

    // ══════════════════════════════════════════════════════════════════════════
    // CHANGELOG
    // ══════════════════════════════════════════════════════════════════════════
    h1("DOCUMENT CHANGELOG"),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [1200, 1800, 6026],
      rows: [
        new TableRow({ children: [hCell("Version", 1200), hCell("Date", 1800), hCell("Changes", 6026)] }),
        new TableRow({ children: [dCell("v0.1", 1200, C.light), dCell("2025", 1800), dCell("Initial concept: basic token system, hardcoded wait time, no priority, Waterfall-only SDLC", 6026)] }),
        new TableRow({ children: [dCell("v0.2", 1200, C.light), dCell("2025", 1800), dCell("Fixed wait time: rolling average from session history. Added OTP identity, no-show scheduler, queue close/pause. Platform decided: PWA.", 6026)] }),
        new TableRow({ children: [dCell("v1.0", 1200, C.light, true), dCell("2025–26", 1800), dCell("Added: P0–P3 four-tier priority queue; PriorityAuditLog; admin P0 alert WS channel; priority-aware EWT; Hybrid Agile-Waterfall SDLC with 3-sprint plan; PWA vs native app decision table; dual WS channels; P0 double no-show window. This version.", 6026)] }),
      ]
    }),
  ]
};

// ─── Build Document ───────────────────────────────────────────────────────────
const outputFile = process.argv[2] || "SmartQueue.docx";

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "subbullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u25E6",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
        }]
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: C.navy },
        paragraph: { spacing: { before: 320, after: 200 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: C.navy },
        paragraph: { spacing: { before: 240, after: 140 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: C.blue },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 2 }
      },
    ]
  },
  sections: [titlePage, mainSection]
});

Packer.toBuffer(doc)
  .then((buffer) => {
    fs.writeFileSync(outputFile, buffer);
    console.log(`Document created: ${outputFile}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
