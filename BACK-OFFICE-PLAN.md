# GoGraphy Expenses — แผนเพิ่มส่วน "จัดการหลังบ้าน" (Back Office)

> ออกแบบโดย Claude Code · mockup ดูได้ที่ `design-extracted/back-office-preview.html` (เปิดในเบราว์เซอร์)
> หลักการ: **Trust ก่อน Growth** — ทุกการเปลี่ยนแปลงเงิน/สิทธิ์ ตรวจสอบย้อนหลังได้ (audit trail) และยึด least-privilege

---

## 1. ภาพรวม

เพิ่ม **5 หน้าใหม่/ปรับปรุง** ในโซน Admin โดยเพิ่ม nav group ใหม่ "หลังบ้าน" ใน `AdminSidebar`:

| # | หน้า | route | สถานะปัจจุบัน |
|---|------|-------|--------------|
| 1 | รายการทั้งหมด (ละเอียดเต็ม) ⭐ | `/admin/expenses` | มีตารางอย่างเดียว → เพิ่ม filter + detail เต็ม |
| 2 | การจ่ายเงิน (Payouts) | `/admin/payouts` | ยังไม่มี (สร้างใหม่) |
| 3 | สมาชิก & สิทธิ์ | `/admin/team` | read-only → เพิ่ม จัดการ role/ปิดใช้งาน/เชิญ |
| 4 | หมวดค่าใช้จ่าย | `/admin/settings/categories` | hardcode ในโค้ด → ย้ายเข้า DB |
| 5 | ตั้งค่าระบบ (Settings) | `/admin/settings` | ไอคอนค้าง (ยังไม่มีหน้า) → สร้างใหม่ |

---

## 2. หน้า 1 — รายการทั้งหมด (Expenses · ละเอียดที่สุด) ⭐

ศูนย์กลางดูรายการเบิกทุกทริป/ช่างภาพในที่เดียว: filter bar + ตารางหลัก + คลิกดูรายละเอียดเต็ม

**โครงสร้าง:** filter bar (ทริป/ช่างภาพ/หมวด/สถานะ/สกุลเงิน/ช่วงวันที่/ค้นหา) + ชิปสรุป (จำนวน · ยอดรวม ฿ · แยกตามสถานะ) → ตาราง → detail view (ใบเสร็จ + ทุก field + OCR confidence + **audit trail** ส่ง→อนุมัติ→จ่าย + ปุ่ม action)

**DB:**
- เพิ่ม index: `expenses(status)`, `(trip_id)`, `(user_id)`, `(expense_date)`, `(currency)`, `(amount_thb)`
- `amount_thb` → generated column = `amount * exchange_rate` (ให้ยอดรวมฝั่ง DB คงเส้นคงวา)
- **ตารางใหม่ `expense_status_events`** `{id, expense_id(fk), from_status, to_status, actor_id(fk profiles), note, created_at}` → audit trail จริง (แทนการอ่านแค่ `approved_by/approved_at`)
- RLS: admin อ่าน/แก้ทุกแถว; photographer เห็นเฉพาะของตัวเอง, เปลี่ยนเป็น approved/paid ไม่ได้
- ใบเสร็จ: bucket `receipts` (private) → signed URL อายุสั้นตอนเปิด detail

**Server actions:** `listExpenses(filters)`, `getExpenseDetail(id)`, `updateExpense(id, patch)`, `changeExpenseStatus(id, to, note)`, `markExpensePaid(id)`, `getReceiptSignedUrl(id)`, `exportExpenses(filters)`

---

## 3. หน้า 2 — การจ่ายเงิน (Payouts)

จ่ายเงินคืนช่างภาพสำหรับรายการที่ approved แล้วแต่ยังไม่จ่าย — เลือกหลายรายการ mark paid แบบ batch หรือทีละรายการ

**โครงสร้าง:** KPI (รอจ่าย ฿+count · จ่ายแล้วเดือนนี้ · ช่างภาพรอรับ N คน · รอบจ่ายล่าสุด) → toolbar เลือกหลายรายการ → ตาราง approved-unpaid จัดกลุ่มตามช่างภาพ (มี checkbox) → การ์ด "วิธีการจ่าย" (วันที่ · ช่องทาง โอน/พร้อมเพย์/เงินสด · เลขอ้างอิง) → ประวัติการจ่าย

**DB:**
- เพิ่มคอลัมน์ `expenses`: `paid_at`, `paid_by(fk)`, `payout_method` ∈ (bank_transfer/promptpay/cash), `payout_reference`, `payout_batch_id(fk)`
- **ตารางใหม่ `payout_batches`** `{id, created_by, payout_method, payout_reference, paid_at, total_thb, item_count, created_at}`
- RLS: เฉพาะ admin INSERT batch + UPDATE เป็น paid; photographer เห็นเฉพาะรอบที่มีรายการของตน
- audit การ mark-paid คงไว้เสมอ — ยกเลิกได้แค่ด้วย record ใหม่ (ห้ามลบ)

**Server actions:** `getPayoutSummary()`, `listApprovedUnpaid()`, `markExpensePaid(id, {method, ref, paid_at})`, `markBatchPaid(ids[], {...})` (ทำใน transaction เดียว), `listPayoutHistory(limit)`

---

## 4. หน้า 3 — สมาชิก & สิทธิ์ (Members)

ขยายหน้า Team เดิม: เปลี่ยน role, ปิด/เปิดการใช้งาน, ลบ, เชิญสมาชิกทางอีเมล + การ์ดอธิบายสิทธิ์ Admin vs Photographer

**DB:**
- เพิ่ม `profiles`: `status` ∈ (active/disabled) default active, `disabled_at`, `disabled_by(fk)`, index `(role)`,`(status)`
- **ตารางใหม่ `member_invites`** `{id, email, name, role, token unique, invited_by, status(pending/accepted/expired/revoked), expires_at, created_at}` → เปลี่ยนจากการสร้าง user+password ทันที เป็น invite-by-email ที่ปลอดภัยกว่า
- **ตารางใหม่ `role_audit`** `{id, target_user_id, actor_id, action, from_role, to_role, created_at}`
- RLS: mutation บน role/status/invites เฉพาะ admin
- **Constraint สำคัญ:** ต้องเหลือ active admin ≥ 1 คนเสมอ (เช็คใน action ก่อน demote/disable/remove admin คนสุดท้าย)

**Server actions:** `changeRoleAction`, `setMemberStatusAction`, `removeMemberAction`, `inviteMemberAction`, `resendInviteAction`, `revokeInviteAction`, `getMembersWithTripCount`

---

## 5. หน้า 4 — หมวดค่าใช้จ่าย (Categories)

ย้ายหมวดจาก hardcode (`design-tokens.ts`) เข้า DB ให้แก้เองได้ — ชื่อ ไทย/อังกฤษ, ไอคอน, สี, ลำดับ, เปิด/ปิด + ยอดใช้งานเดือนนี้

**DB:**
- **ตารางใหม่ `categories`** `{id, key unique, name_th, label_en, icon, color, sort_order, is_active, is_system, created_at, updated_at}`
- Seed 7 หมวดเดิม (fuel/hotel/food/trans/park/equip/other) ตั้ง `is_system=true` (ลบไม่ได้)
- `expenses.category` → เพิ่ม `category_id(fk)` `on delete restrict`, backfill จาก key เดิม
- RLS: ทุกคน SELECT (เพื่อเลือกตอนสร้าง expense), เฉพาะ admin เขียน
- ป้องกันลบหมวดที่ยังมีรายการอ้างอิง → แนะนำปิดใช้งานแทน
- แก้ `design-tokens.ts` ให้ดึงจาก DB (source of truth = DB)

**Server actions:** `createCategory`, `updateCategory`, `toggleCategoryActive`, `reorderCategories`, `deleteCategory` (บล็อกถ้า is_system หรือมีอ้างอิง), `getCategoryUsage(month)`

---

## 6. หน้า 5 — ตั้งค่าระบบ (Settings)

หน้า tabbed (ทั่วไป / การอนุมัติ / การแจ้งเตือน / ข้อมูล&ส่งออก) — ไอคอน gear ที่ค้างอยู่ ให้ใช้งานได้จริง

**DB:**
- **ตารางใหม่ `org_settings`** (single-row, บังคับ 1 แถวด้วย `CHECK(id)`): org_name, logo_path, base_currency, timezone, require_receipt, auto_approve_enabled, auto_approve_threshold_thb, approver_role, allow_manual_exchange_rate, date_format, ui_language, updated_at, updated_by
- **ตารางใหม่ `notification_channels`** `{channel(line/email/telegram), enabled, target, notify_on_new/approved/rejected}` (PRD future features)
- **ตารางใหม่ `settings_audit`** `{actor_id, field_key, old_value, new_value, created_at}`
- bucket `org-assets` (private) สำหรับโลโก้
- RLS: เฉพาะ admin

**Server actions:** `getOrgSettings`, `updateWorkspace`, `uploadOrgLogo`, `updateApprovalRules`, `updateNotificationChannel`, `updateDataPreferences`, `exportAllExpenses`

---

## 7. สรุป migration ที่ต้องเพิ่ม

**ตารางใหม่ (6):** `expense_status_events`, `payout_batches`, `member_invites`, `role_audit`, `categories`, `org_settings`, `notification_channels`, `settings_audit`
**คอลัมน์เพิ่ม:** `expenses`(paid_at, paid_by, payout_method, payout_reference, payout_batch_id, category_id) · `profiles`(status, disabled_at, disabled_by)
**Storage buckets:** `receipts` (มีอยู่แล้ว/ยืนยัน), `org-assets` (ใหม่)

---

## 8. ลำดับการ build ที่แนะนำ

1. **DB layer** — เขียน SQL migration (ตาราง + คอลัมน์ + RLS + seed categories) เป็นไฟล์เดียว รันใน Supabase
2. **Sidebar** — เพิ่ม nav group "หลังบ้าน" ใน `AdminSidebar.tsx` (Payouts, Settings) + ทำไอคอน Settings ให้ลิงก์ได้
3. **หน้า 4 Categories + หน้า 5 Settings** (พึ่งพา DB ใหม่, ความเสี่ยงต่ำ)
4. **หน้า 3 Members** (ขยายของเดิม)
5. **หน้า 2 Payouts**
6. **หน้า 1 Expenses detail** (ใหญ่สุด, ต่อยอด audit trail จาก expense_status_events)

> ⚠️ ก่อนเขียนโค้ด Next.js: repo นี้ note ไว้ใน `AGENTS.md` ว่าเป็น Next.js เวอร์ชันที่มี breaking changes — ต้องอ่าน `node_modules/next/dist/docs/` ก่อน (ต้อง `npm install` ก่อน) และยึด skill `supabase-postgres-best-practices` ใน `.agents/skills/`
