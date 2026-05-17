export type Role = "admin" | "photographer";
export type TripStatus = "active" | "closed";
export type ExpenseStatus = "draft" | "pending" | "approved" | "rejected" | "paid";
export type ExpenseCategory =
  | "fuel"
  | "hotel"
  | "food"
  | "trans"
  | "park"
  | "equip"
  | "other";

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
};

export type Trip = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: TripStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  cover_image_path: string | null;
};

export type TripMember = {
  trip_id: string;
  user_id: string;
  created_at: string;
};

export type Expense = {
  id: string;
  trip_id: string;
  user_id: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  exchange_rate: number;
  amount_thb: number;
  note: string | null;
  receipt_path: string | null;
  status: ExpenseStatus;
  admin_note: string | null;
  expense_date: string;
  store_name: string | null;
  ocr_confidence: { amount?: number; date?: number; store?: number } | null;
  created_at: string;
  updated_at: string;
  approved_by: string | null;
  approved_at: string | null;
};
