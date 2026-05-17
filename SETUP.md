# GoGraphy Expenses · Setup

ระบบบันทึกค่าใช้จ่ายสำหรับทีมช่างภาพและทีมออกกอง (Photography Trip Expense Claim System).

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Auth/Postgres/Storage/RLS) · Recharts.

---

## 1. ใส่ Secret ที่ขาดอยู่

เปิด `.env.local` แล้วเติม `SUPABASE_SERVICE_ROLE_KEY` (ถ้ายังไม่มี):

1. เปิด <https://supabase.com/dashboard/project/scwljchrvplmjebqcqzu/settings/api>
2. คัดลอกค่าในช่อง **`service_role`** (secret — ห้ามแชร์)
3. แปะลง `.env.local`

หลังเปลี่ยน `.env.local` ต้อง **restart server** เสมอ

---

## 2. สร้าง Admin คนแรก

ระบบไม่มี self-signup (admin คนเดียวสร้างคนอื่นได้):

1. เปิด <https://supabase.com/dashboard/project/scwljchrvplmjebqcqzu/auth/users>
2. คลิก **Add user → Create new user** — ✅ Auto Confirm User
3. รัน SQL เพื่อ promote เป็น admin:

```sql
update public.profiles set role='admin', name='Admin' where email='<email>';
```

login ครั้งแรก middleware จะ sync `app_metadata.role` ให้อัตโนมัติ

---

## 3. ทดสอบ End-to-End

1. **Admin login** → `/admin/dashboard`
2. **Admin → /admin/team** → "เพิ่มสมาชิก" สร้าง photographer
3. **Admin → /admin/trips** → "สร้างทริปใหม่" + assign photographer
4. **Logout → Login as photographer** → เห็นทริปที่ dashboard
5. **กดปุ่ม +** → `/expenses/new` → เลือกทริป → อัปโหลดใบเสร็จหลายภาพ → กรอกฟอร์มแต่ละใบ (หมวด/จำนวน/วันที่/ร้าน/หมายเหตุ) → "ส่งเบิก N รายการ"
6. **Login as admin** → `/admin/approvals` → กด Approve
7. **Login as photographer** → `/history` → ดูสถานะ "อนุมัติแล้ว"

---

## 4. โครงการ

```
src/
├── app/
│   ├── (auth)/login            ฟอร์ม login
│   ├── (photographer)/         photographer layout + MobileTabBar
│   │   ├── dashboard           hero + 3 stat tiles + ทริป + รายการล่าสุด
│   │   ├── trips/              รายการ + trips/[id] (กลุ่มตามวันที่ + FAB)
│   │   ├── expenses/new        BatchExpenseForm — อัปโหลดได้หลายใบในครั้งเดียว
│   │   ├── history             ฟิลเตอร์ + การ์ดรายการ
│   │   └── me                  โปรไฟล์ + sign out
│   ├── admin/                  admin layout: Sidebar + TopBar
│   │   ├── dashboard           KPIs + Bar/Donut charts + Pending + Top trips
│   │   ├── trips/              ตาราง + dialog + trips/[id] + AssignmentEditor
│   │   ├── approvals/          split-panel pending + Approve/Reject + reject reason
│   │   ├── expenses/           ตารางรายการทั้งหมด
│   │   ├── reports/            Tiles + Stacked bar + Leaderboard
│   │   └── team/               ตารางสมาชิก + AddPhotographerDialog
│   ├── sandbox                 design tokens preview (public)
│   ├── globals.css             Tailwind v4 theme (navy + status + IBM Plex)
│   └── layout.tsx              root + load fonts
├── components/
│   ├── design/                 StatusPill, CatIcon, Logo, FauxReceipt
│   ├── photographer/           MobileTabBar
│   ├── admin/                  AdminSidebar, AdminTopBar, DashboardCharts, StackedTripChart
│   ├── forms/                  CategoryPicker
│   └── auth/                   SignOutButton
├── lib/
│   ├── supabase/{client,server,admin,middleware}.ts
│   ├── auth.ts                 getServerUser (cached), requireRole
│   ├── design-tokens.ts        STATUS + CATEGORIES Thai labels + tailwind classes
│   ├── format.ts               thb() + dateTh()
│   ├── utils.ts                cn() helper
│   └── queries/                trips.ts + profile.ts (React cache)
├── types/database.ts
└── proxy.ts                    session refresh + role-based redirects (Next.js 16 convention)
```

---

## 5. Migrations ที่รันแล้ว

```
0001_enums_and_profiles                profiles + enums + handle_new_user trigger
0002_lock_down_trigger_functions       Revoke EXECUTE + pin search_path
0003_trips_and_members                 trips + trip_members + app.is_trip_member + RLS
0004_expenses_and_storage              expenses + storage bucket "receipts" + policies + RLS
0005_consolidate_policies_and_indexes  รวม permissive policies + index บน approved_by
```

ทุก policy ใช้ `(select auth.uid())` (caching).

---

## 6. Deploy ไป Vercel

```bash
gh repo create gography-expenses --private --source=. --push
```

จากนั้น <https://vercel.com/new> import repo + เพิ่ม environment variables (URL + PUBLISHABLE_KEY + SERVICE_ROLE_KEY) + ใน Supabase → Auth → URL Configuration เพิ่มโดเมน production เข้า redirect URLs

---

## ⚠️ Security

- `.env.local` ห้าม commit (`.gitignore` มี `.env*` แล้ว)
- `SUPABASE_SERVICE_ROLE_KEY` ใช้แค่ฝั่ง server เท่านั้น
- ใบเสร็จเก็บใน bucket `receipts` (private) + เสิร์ฟผ่าน signed URLs (1 ชั่วโมง)

---

## 7. คำสั่ง

```bash
npm run dev               # dev server (มี HMR แต่มี compile overhead)
npm run build && npm start # production (เร็วกว่า ~30x)
npx tsc --noEmit          # typecheck only
```

Sandbox: <http://localhost:3000/sandbox>
