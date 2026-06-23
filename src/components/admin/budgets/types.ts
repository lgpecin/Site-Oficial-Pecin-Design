export type BudgetClient = {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientService = {
  id: string;
  client_id: string;
  template_service_id: string | null;
  name: string;
  description: string | null;
  category: string;
  price: number;
  delivery_days: number;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  display_order: number;
};

export type ClientBudget = {
  id: string;
  user_id: string;
  client_id: string;
  name: string;
  status: string;
  start_date: string | null;
  discount_type: "none" | "value" | "percent" | string;
  discount_value: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BudgetItem = {
  id: string;
  budget_id: string;
  client_service_id: string | null;
  name: string;
  description: string | null;
  price: number;
  delivery_days: number;
  quantity: number;
  group_label: string | null;
  group_color: string | null;
  display_order: number;
  created_at: string;
};
