export type ExpenseStatus = "draft" | "pending" | "approved" | "rejected" | "paid";
export type ExpenseCategory = "fuel" | "hotel" | "food" | "trans" | "park" | "equip" | "other";

export const STATUS: Record<
  ExpenseStatus,
  { th: string; label: string; twBg: string; twFg: string }
> = {
  draft: {
    th: "ร่าง",
    label: "Draft",
    twBg: "bg-status-draft-bg",
    twFg: "text-status-draft-fg",
  },
  pending: {
    th: "รออนุมัติ",
    label: "Pending",
    twBg: "bg-status-pending-bg",
    twFg: "text-status-pending-fg",
  },
  approved: {
    th: "อนุมัติแล้ว",
    label: "Approved",
    twBg: "bg-status-approved-bg",
    twFg: "text-status-approved-fg",
  },
  rejected: {
    th: "ถูกปฏิเสธ",
    label: "Rejected",
    twBg: "bg-status-rejected-bg",
    twFg: "text-status-rejected-fg",
  },
  paid: {
    th: "จ่ายแล้ว",
    label: "Paid",
    twBg: "bg-status-paid-bg",
    twFg: "text-status-paid-fg",
  },
};

export const CATEGORIES: { key: ExpenseCategory; th: string; label: string }[] = [
  { key: "fuel", th: "น้ำมัน", label: "Fuel" },
  { key: "hotel", th: "ที่พัก", label: "Hotel" },
  { key: "food", th: "อาหาร", label: "Food" },
  { key: "trans", th: "การเดินทาง", label: "Transportation" },
  { key: "park", th: "ที่จอดรถ", label: "Parking" },
  { key: "equip", th: "อุปกรณ์", label: "Equipment" },
  { key: "other", th: "อื่น ๆ", label: "Other" },
];

export const CATEGORY_TH: Record<ExpenseCategory, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.th])
) as Record<ExpenseCategory, string>;
