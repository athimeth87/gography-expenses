// shared.jsx — design tokens, mock data, shared UI primitives for PhotoExpense

// ─── Design tokens ──────────────────────────────────────────────
const PE = {
  // Navy palette
  navy: '#0A2540',
  navy900: '#06182C',
  navy700: '#14304F',
  navy500: '#2A4A75',
  navy300: '#7A8FB0',
  navy100: '#DDE5F0',
  navy50:  '#F3F6FB',
  // Surface
  white:   '#FFFFFF',
  surface: '#F7F9FC',
  border:  '#E5EAF2',
  borderS: '#EFF2F7',
  // Text
  ink:    '#0A2540',
  ink2:   '#3E5172',
  ink3:   '#6E7E9A',
  ink4:   '#94A2BB',
  // Status
  green:    '#0F9D58',
  greenBg:  '#E6F4EA',
  amber:    '#B7791F',
  amberBg:  '#FEF3C7',
  red:      '#C5363A',
  redBg:    '#FBE9EA',
  blue:     '#1D4ED8',
  blueBg:   '#DBEAFE',
  gray:     '#5B6B85',
  grayBg:   '#EEF1F6',
  // Type
  font: '"IBM Plex Sans Thai", "IBM Plex Sans", -apple-system, system-ui, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, monospace',
};
window.PE = PE;

// ─── Mock data ──────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'fuel',  label: 'Fuel',           th: 'น้ำมัน',       icon: 'fuel' },
  { key: 'hotel', label: 'Hotel',          th: 'ที่พัก',        icon: 'hotel' },
  { key: 'food',  label: 'Food',           th: 'อาหาร',        icon: 'food' },
  { key: 'trans', label: 'Transportation', th: 'การเดินทาง',   icon: 'trans' },
  { key: 'park',  label: 'Parking',        th: 'ที่จอดรถ',     icon: 'park' },
  { key: 'equip', label: 'Equipment',      th: 'อุปกรณ์',      icon: 'equip' },
  { key: 'other', label: 'Other',          th: 'อื่น ๆ',       icon: 'other' },
];
window.CATEGORIES = CATEGORIES;

const STATUS = {
  draft:    { label: 'Draft',    th: 'ร่าง',          color: PE.gray,  bg: PE.grayBg },
  pending:  { label: 'Pending',  th: 'รออนุมัติ',     color: PE.amber, bg: PE.amberBg },
  approved: { label: 'Approved', th: 'อนุมัติแล้ว',  color: PE.green, bg: PE.greenBg },
  rejected: { label: 'Rejected', th: 'ถูกปฏิเสธ',     color: PE.red,   bg: PE.redBg },
  paid:     { label: 'Paid',     th: 'จ่ายแล้ว',     color: PE.blue,  bg: PE.blueBg },
};
window.STATUS = STATUS;

const TRIPS = [
  { id: 'T1', title: 'ถ่ายงานเชียงใหม่ Winter Series', client: 'AYANA Studio',
    start: '12 พ.ย. 2025', end: '18 พ.ย. 2025', status: 'active',
    members: ['เอก', 'พีท', 'เฟิร์น'], totalExpense: 48230, claims: 14, location: 'Chiang Mai' },
  { id: 'T2', title: 'รีวิวโรงแรม Sindhorn Midtown', client: 'Sindhorn Midtown',
    start: '05 ม.ค. 2026', end: '07 ม.ค. 2026', status: 'active',
    members: ['เอก', 'มิ้น'], totalExpense: 12400, claims: 6, location: 'Bangkok' },
  { id: 'T3', title: 'งานแต่งงาน คุณภัทร & คุณนิ', client: 'Patarayada Wedding',
    start: '14 ก.พ. 2026', end: '14 ก.พ. 2026', status: 'active',
    members: ['เอก', 'พีท'], totalExpense: 7820, claims: 4, location: 'Hua Hin' },
  { id: 'T4', title: 'Campaign · Sukhumvit Lookbook S/S26', client: 'Vela Apparel',
    start: '01 มี.ค. 2026', end: '03 มี.ค. 2026', status: 'closed',
    members: ['เฟิร์น', 'มิ้น'], totalExpense: 26900, claims: 11, location: 'Bangkok' },
];
window.TRIPS = TRIPS;

// Expense records used across photographer + admin views.
const EXPENSES = [
  { id: 'E1041', trip: 'T1', user: 'เอก',   cat: 'fuel',  amount: 1820,  date: '12 พ.ย. 2025',
    note: 'เติม Caltex ทางขึ้นเชียงใหม่',     status: 'approved', store: 'Caltex แม่ริม' },
  { id: 'E1042', trip: 'T1', user: 'เอก',   cat: 'hotel', amount: 4200,  date: '12 พ.ย. 2025',
    note: 'พักคืนแรก 2 ห้อง',                 status: 'approved', store: 'Khum Phaya Resort' },
  { id: 'E1043', trip: 'T1', user: 'เอก',   cat: 'food',  amount: 680,   date: '13 พ.ย. 2025',
    note: 'อาหารเช้าทีมงาน',                  status: 'pending',  store: 'SP Chicken' },
  { id: 'E1044', trip: 'T1', user: 'เฟิร์น', cat: 'equip', amount: 2300,  date: '13 พ.ย. 2025',
    note: 'ค่าเช่าเลนส์ 70-200 1 วัน',         status: 'pending',  store: 'Big Camera CM' },
  { id: 'E1045', trip: 'T1', user: 'พีท',   cat: 'trans', amount: 450,   date: '14 พ.ย. 2025',
    note: 'แท็กซี่ขึ้นดอยสุเทพ',              status: 'pending',  store: 'Bolt' },
  { id: 'E1046', trip: 'T1', user: 'เอก',   cat: 'food',  amount: 1240,  date: '14 พ.ย. 2025',
    note: 'มื้อค่ำพร้อมลูกค้า',               status: 'pending',  store: 'Tong Tem Toh' },
  { id: 'E1047', trip: 'T1', user: 'เฟิร์น', cat: 'park',  amount: 80,    date: '14 พ.ย. 2025',
    note: 'จอดที่ One Nimman',                status: 'rejected', store: 'One Nimman',
    adminNote: 'ขอใบเสร็จที่ชัดเจนกว่านี้' },
  { id: 'E1048', trip: 'T2', user: 'มิ้น',  cat: 'trans', amount: 320,   date: '05 ม.ค. 2026',
    note: 'Grab ไป-กลับ Sindhorn',            status: 'approved', store: 'Grab' },
  { id: 'E1049', trip: 'T2', user: 'เอก',   cat: 'food',  amount: 540,   date: '06 ม.ค. 2026',
    note: 'มื้อกลางวัน',                       status: 'pending',  store: 'Sindhorn Kempinski' },
  { id: 'E1050', trip: 'T3', user: 'พีท',   cat: 'fuel',  amount: 1450,  date: '14 ก.พ. 2026',
    note: 'น้ำมันไปหัวหิน',                   status: 'pending',  store: 'PT Cha-am' },
  { id: 'E1051', trip: 'T3', user: 'เอก',   cat: 'equip', amount: 3800,  date: '13 ก.พ. 2026',
    note: 'แบตเตอรี่กล้องสำรอง 3 ก้อน',       status: 'pending',  store: 'Zoom Camera' },
  { id: 'E1052', trip: 'T4', user: 'เฟิร์น', cat: 'food',  amount: 920,   date: '02 มี.ค. 2026',
    note: 'มื้อเที่ยงทีม + นางแบบ',           status: 'paid',     store: 'Roast Em Quartier' },
];
window.EXPENSES = EXPENSES;

// ─── Reusable visual primitives ─────────────────────────────────

function StatusPill({ status, size = 'md' }) {
  const s = STATUS[status] || STATUS.draft;
  const pad = size === 'sm' ? '3px 8px' : '5px 10px';
  const fs  = size === 'sm' ? 11 : 12;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: pad, borderRadius: 999, fontSize: fs, fontWeight: 600,
      color: s.color, background: s.bg, lineHeight: 1, letterSpacing: 0.1,
      fontFamily: PE.font,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.color }} />
      {s.label}
    </span>
  );
}

// Monoline category icon — 20×20 stroke.
function CatIcon({ cat, size = 20, color = PE.navy }) {
  const sw = 1.6;
  const p = { stroke: color, strokeWidth: sw, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  const map = {
    fuel: <>
      <rect x="4" y="4" width="9" height="16" rx="1.5" {...p}/>
      <path d="M4 9h9" {...p}/>
      <path d="M13 8l3 2v7a2 2 0 0 0 2 2v-9l-3-3" {...p}/>
    </>,
    hotel: <>
      <path d="M3 19V8l9-4 9 4v11" {...p}/>
      <path d="M3 19h18" {...p}/>
      <rect x="8" y="12" width="3" height="3" {...p}/>
      <rect x="13" y="12" width="3" height="3" {...p}/>
    </>,
    food: <>
      <path d="M6 4v6c0 1.5 1 2 2 2v8" {...p}/>
      <path d="M10 4v6c0 1.5-1 2-2 2" {...p}/>
      <path d="M17 4c-2 0-3 2-3 5s1 4 3 4v7" {...p}/>
    </>,
    trans: <>
      <rect x="4" y="6" width="16" height="11" rx="2" {...p}/>
      <path d="M4 13h16" {...p}/>
      <circle cx="8" cy="17.5" r="1.4" {...p}/>
      <circle cx="16" cy="17.5" r="1.4" {...p}/>
    </>,
    park: <>
      <rect x="4" y="4" width="16" height="16" rx="3" {...p}/>
      <path d="M9 17V8h4a3 3 0 0 1 0 6h-4" {...p}/>
    </>,
    equip: <>
      <rect x="3" y="7" width="18" height="12" rx="2" {...p}/>
      <path d="M8 7l1.5-2h5L16 7" {...p}/>
      <circle cx="12" cy="13" r="3.2" {...p}/>
    </>,
    other: <>
      <circle cx="12" cy="12" r="8" {...p}/>
      <circle cx="8.5" cy="11" r="0.6" fill={color} stroke="none"/>
      <circle cx="15.5" cy="11" r="0.6" fill={color} stroke="none"/>
      <circle cx="12" cy="11" r="0.6" fill={color} stroke="none"/>
    </>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>{map[cat] || map.other}</svg>;
}

// Generic monoline icon.
function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.7 }) {
  const p = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" {...p}/></>,
    grid: <><rect x="4" y="4" width="7" height="7" rx="1.2" {...p}/><rect x="13" y="4" width="7" height="7" rx="1.2" {...p}/><rect x="4" y="13" width="7" height="7" rx="1.2" {...p}/><rect x="13" y="13" width="7" height="7" rx="1.2" {...p}/></>,
    plus: <><path d="M12 5v14M5 12h14" {...p}/></>,
    check: <><path d="M5 12l4.5 4.5L19 7" {...p}/></>,
    x: <><path d="M6 6l12 12M18 6L6 18" {...p}/></>,
    chevron: <><path d="M9 6l6 6-6 6" {...p}/></>,
    arrow_left: <><path d="M15 6l-6 6 6 6" {...p}/></>,
    arrow_right: <><path d="M9 6l6 6-6 6" {...p}/></>,
    arrow_up: <><path d="M6 15l6-6 6 6" {...p}/></>,
    bell: <><path d="M6 16V11a6 6 0 0 1 12 0v5l1 2H5z" {...p}/><path d="M10 21h4" {...p}/></>,
    search: <><circle cx="11" cy="11" r="6" {...p}/><path d="M20 20l-4.5-4.5" {...p}/></>,
    camera: <><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" {...p}/><circle cx="12" cy="13" r="3.5" {...p}/></>,
    upload: <><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" {...p}/><path d="M12 4v12M7 9l5-5 5 5" {...p}/></>,
    user: <><circle cx="12" cy="8" r="4" {...p}/><path d="M4 21c1-4.5 4-6.5 8-6.5s7 2 8 6.5" {...p}/></>,
    users: <><circle cx="9" cy="8" r="3.5" {...p}/><path d="M3 20c.7-3.5 3-5 6-5s5.3 1.5 6 5" {...p}/><path d="M15 5.5a3.5 3.5 0 0 1 0 7" {...p}/><path d="M17.5 20c.4-3 2-4.4 4-4.7" {...p}/></>,
    receipt: <><path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21z" {...p}/><path d="M9 8h6M9 12h6M9 16h4" {...p}/></>,
    calendar: <><rect x="4" y="6" width="16" height="14" rx="2" {...p}/><path d="M4 10h16M9 3v4M15 3v4" {...p}/></>,
    money: <><rect x="3" y="6" width="18" height="12" rx="2" {...p}/><circle cx="12" cy="12" r="2.5" {...p}/><path d="M6 12h.01M18 12h.01" {...p}/></>,
    chart: <><path d="M4 20V8M10 20V4M16 20v-8M22 20H2" {...p}/></>,
    pie: <><path d="M12 4a8 8 0 1 0 8 8h-8z" {...p}/></>,
    folder: <><path d="M3 8a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" {...p}/></>,
    location: <><path d="M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12z" {...p}/><circle cx="12" cy="9.5" r="2.5" {...p}/></>,
    filter: <><path d="M4 5h16l-6 8v6l-4-2v-4z" {...p}/></>,
    download: <><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" {...p}/><path d="M12 4v12M7 11l5 5 5-5" {...p}/></>,
    more: <><circle cx="6" cy="12" r="1.3" fill={color} stroke="none"/><circle cx="12" cy="12" r="1.3" fill={color} stroke="none"/><circle cx="18" cy="12" r="1.3" fill={color} stroke="none"/></>,
    settings: <><circle cx="12" cy="12" r="3" {...p}/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" {...p}/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" {...p}/><path d="M16 17l5-5-5-5M21 12H9" {...p}/></>,
    sparkle: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" {...p}/><path d="M19 17l.7 1.6L21 19l-1.3.4L19 21l-.7-1.6L17 19l1.3-.4z" {...p}/></>,
    note: <><path d="M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" {...p}/><path d="M14 3v6h6" {...p}/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" {...p}/><circle cx="12" cy="12" r="3" {...p}/></>,
    crop: <><path d="M6 2v16h16" {...p}/><path d="M2 6h16v16" {...p}/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" {...p}/><circle cx="9" cy="10" r="1.6" {...p}/><path d="M21 17l-5-5-9 9" {...p}/></>,
    refresh: <><path d="M20 11a8 8 0 0 0-14.5-3M4 13a8 8 0 0 0 14.5 3" {...p}/><path d="M20 4v4h-4M4 20v-4h4" {...p}/></>,
    clock: <><circle cx="12" cy="12" r="8" {...p}/><path d="M12 7v5l3 2" {...p}/></>,
    inbox: <><path d="M3 13l3-7h12l3 7v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" {...p}/><path d="M3 13h5l1 3h6l1-3h5" {...p}/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>{paths[name] || null}</svg>;
}

// Brand mark — a navy diamond "lens aperture" mark
function Logo({ size = 28, color = PE.navy, white = false }) {
  const c = white ? '#fff' : color;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
      <rect x="2" y="2" width="28" height="28" rx="7" fill={c}/>
      <g stroke={white ? PE.navy : '#fff'} strokeWidth="1.6" fill="none" strokeLinecap="round">
        <circle cx="16" cy="16" r="7"/>
        <path d="M16 9 L21.5 14 L19.5 21 L12.5 21 L10.5 14 Z"/>
      </g>
    </svg>
  );
}

// THB amount formatter
function thb(n) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

// Faux receipt — used in upload previews & expense detail
function FauxReceipt({ width = 220, scale = 1, ocrHighlight = null }) {
  // ocrHighlight: { date, amount, store }
  const lines = [
    { kind: 'h', txt: 'KHUM PHAYA RESORT' },
    { kind: 'h', txt: 'CHIANG MAI · TH' },
    { kind: 'b' },
    { kind: 'kv', k: 'Date',    v: '12/11/2025',           hl: 'date'   },
    { kind: 'kv', k: 'Time',    v: '14:32'                              },
    { kind: 'kv', k: 'Receipt', v: '#A-0044-2025'                       },
    { kind: 'b' },
    { kind: 'kv', k: 'Deluxe Room ×2', v: '3,800.00' },
    { kind: 'kv', k: 'Breakfast',       v: '320.00' },
    { kind: 'kv', k: 'Service 10%',     v: '80.00' },
    { kind: 'b' },
    { kind: 'kv', k: 'TOTAL',   v: '฿ 4,200.00', bold: true, hl: 'amount' },
    { kind: 'kv', k: 'Paid',    v: 'Credit Card' },
    { kind: 'b' },
    { kind: 'h', txt: 'ขอบคุณค่ะ · Thank you' },
  ];
  return (
    <div style={{
      width, transform: `scale(${scale})`, transformOrigin: 'top left',
      background: '#FBFAF6', color: '#3A3328',
      border: '1px solid #E9E4D6', borderRadius: 6,
      padding: '16px 14px',
      fontFamily: PE.mono, fontSize: 9.5, lineHeight: 1.55,
      boxShadow: '0 10px 24px rgba(10,37,64,.08), 0 1px 0 rgba(0,0,0,.04)',
      position: 'relative',
    }}>
      {/* torn top + bottom edges */}
      <div style={{ position: 'absolute', top: -6, left: 0, right: 0, height: 6,
        background: 'radial-gradient(circle at 6px 6px, transparent 5px, #FBFAF6 5.5px) 0 0/12px 12px' }}/>
      <div style={{ position: 'absolute', bottom: -6, left: 0, right: 0, height: 6,
        background: 'radial-gradient(circle at 6px 0px, transparent 5px, #FBFAF6 5.5px) 0 0/12px 12px' }}/>
      {lines.map((l, i) => {
        if (l.kind === 'b') return <div key={i} style={{ borderTop: '1px dashed #C9BFA6', margin: '6px 0' }} />;
        if (l.kind === 'h') return <div key={i} style={{ textAlign: 'center', fontWeight: 600, letterSpacing: 0.8 }}>{l.txt}</div>;
        const isHl = ocrHighlight && l.hl === ocrHighlight;
        return (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between',
            background: isHl ? 'rgba(217,119,6,0.22)' : 'transparent',
            outline: isHl ? '1.5px solid #B7791F' : 'none',
            borderRadius: 3, padding: isHl ? '1px 3px' : 0, margin: isHl ? '0 -3px' : 0,
            fontWeight: l.bold ? 700 : 400,
            transition: 'background .2s, outline .2s',
          }}>
            <span>{l.k}</span><span>{l.v}</span>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { PE, CATEGORIES, STATUS, TRIPS, EXPENSES, StatusPill, CatIcon, Icon, Logo, thb, FauxReceipt });
