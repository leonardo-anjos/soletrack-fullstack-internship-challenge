export type OrderStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface ShoeModel {
  id: string;
  name: string;
  category: string;
  base_cost: number;
}

export interface ShoeVariant {
  id: string;
  color: string;
  sole_color: string;
  sku: string;
  model: ShoeModel;
}

export interface Size {
  id: string;
  value: number;
}

export interface ProductionOrder {
  id: string;

  variant_id: string;
  size_id: string;

  variant: ShoeVariant;
  size: Size;

  quantity_planned: number;
  quantity_produced: number;

  status: OrderStatus;

  start_date: string | null;
  end_date: string | null;

  created_at: string;
  updated_at: string;
}