# Photography Trip Expense Claim System

## Project Overview

ระบบบันทึกค่าใช้จ่ายสำหรับทีมช่างภาพและทีมออกกอง
โดยช่างภาพสามารถอัปโหลดใบเสร็จและส่งเบิกค่าใช้จ่ายให้แอดมินตรวจสอบและอนุมัติได้

ระบบนี้ไม่มีระบบรายรับ
เน้นเฉพาะการจัดการ “ค่าใช้จ่าย” และ “การเบิก”

---

# User Roles

## 1. Admin

สิทธิ์:

* สร้างทริป
* กำหนดช่างภาพในทริป
* ดูค่าใช้จ่ายทั้งหมด
* อนุมัติ / ปฏิเสธรายการเบิก
* Export รายงาน
* ดู Dashboard สรุป

---

## 2. Photographer

สิทธิ์:

* ดูทริปที่ได้รับมอบหมาย
* เพิ่มค่าใช้จ่าย
* อัปโหลดใบเสร็จ
* ดูสถานะการอนุมัติ

---

# Main Workflow

## 1. Admin Creates Trip

ตัวอย่าง:

* ถ่ายงานเชียงใหม่
* ถ่ายรีวิวโรงแรม
* งานแต่งงาน

ข้อมูล:

* ชื่อทริป
* รายละเอียด
* วันที่เริ่ม / สิ้นสุด
* รายชื่อช่างภาพ

---

## 2. Photographer Opens Assigned Trip

ช่างภาพจะเห็นเฉพาะ:

* ทริปที่ตัวเองได้รับมอบหมาย

---

## 3. Add Expense

ช่างภาพกรอก:

* หมวดค่าใช้จ่าย
* จำนวนเงิน
* หมายเหตุ
* อัปโหลดรูปใบเสร็จ

---

## 4. Submit Claim

เมื่อส่งเบิก:

* สถานะ = pending

---

## 5. Admin Reviews

แอดมินสามารถ:

* ดูรูปใบเสร็จ
* ดูยอดเงิน
* ดูคนส่ง

จากนั้น:

* Approve
* Reject

หาก Reject:

* ใส่เหตุผลได้

---

# Expense Categories

* Fuel
* Hotel
* Food
* Transportation
* Parking
* Equipment
* Other

---

# Expense Status

```txt
draft
pending
approved
rejected
paid
```

---

# Core Features

## Authentication

* Email Login
* Role-based Access

---

## Trip Management

Admin:

* Create Trip
* Assign Photographer
* Close Trip

---

## Expense Management

Photographer:

* Add Expense
* Upload Receipt
* Submit Claim

Admin:

* Review Expenses
* Approve / Reject

---

## Receipt Upload

* Upload image receipt
* Store in cloud storage

Supported:

* JPG
* PNG
* WEBP

---

# OCR AI Feature (Important)

เมื่ออัปโหลดใบเสร็จ:
AI จะอ่านข้อมูลอัตโนมัติ เช่น:

* Amount
* Date
* Store Name

Suggested AI:

* OpenAI Vision
* Gemini Vision

---

# Dashboard

## Admin Dashboard

แสดง:

* Total Expenses
* Pending Claims
* Approved Claims
* Expenses by Category
* Expenses by Trip

---

## Photographer Dashboard

แสดง:

* Assigned Trips
* Pending Claims
* Approved Claims
* Rejected Claims

---

# Database Structure

## users

```sql
id
name
email
password
role
created_at
```

---

## trips

```sql
id
title
description
start_date
end_date
status
created_by
created_at
```

---

## trip_members

```sql
id
trip_id
user_id
created_at
```

---

## expenses

```sql
id
trip_id
user_id
category
amount
note
receipt_image
status
admin_note
expense_date
created_at
```

---

## categories

```sql
id
name
created_at
```

---

# Recommended Tech Stack

## Frontend

* Next.js
* TailwindCSS
* shadcn/ui

---

## Backend

* Supabase

Use:

* Authentication
* PostgreSQL Database
* Storage
* Row Level Security

---

# Storage

Use:

* Supabase Storage

Store:

* Receipt Images

---

# Security Rules

## Photographer

Can only:

* View assigned trips
* View own expenses
* Create own expenses

---

## Admin

Can:

* View all trips
* View all expenses
* Manage approvals

---

# Suggested UI Pages

## Photographer Pages

### Login Page

### Dashboard

### Trip Detail

### Add Expense

### Claim History

---

## Admin Pages

### Dashboard

### Trip Management

### Expense Approval

### Expense Detail

### Reports

---

# Mobile First Design

ระบบต้องออกแบบให้ใช้งานง่ายบนมือถือ

Important:

* Large buttons
* Fast loading
* Simple form
* Easy receipt upload

---

# Future Features

## AI Auto Categorization

AI แยกหมวดค่าใช้จ่ายอัตโนมัติ

---

## Duplicate Receipt Detection

AI ตรวจสอบใบเสร็จซ้ำ

---

## Export Reports

* PDF
* Excel

---

## Notification System

แจ้งเตือน:

* New Claim
* Approved
* Rejected

Channels:

* LINE
* Telegram
* Email

---

# MVP Scope

Version 1 Features:

* Authentication
* Role System
* Trip Management
* Expense Submission
* Receipt Upload
* Approval System
* Dashboard

---

# Recommended Architecture

Frontend:

* Next.js App Router

Backend:

* Supabase

Deployment:

* Vercel

Storage:

* Supabase Storage

AI OCR:

* OpenAI API or Gemini API

---

# Suggested Project Name

* TripClaim
* ShootClaim
* SnapExpense
* ExpenseLens
* CrewClaim
* PhotoExpense
