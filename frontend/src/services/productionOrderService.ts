import api from "./api";
import { ProductionOrder, OrderStatus } from "../types/productionOrder";

export type CreateProductionOrderDTO = {
  model_id: string;
  color: string;
  sole_color: string;
  size: number;
  quantity_planned: number;
};

export const ProductionOrderService = {
  findAll: async (status?: OrderStatus): Promise<ProductionOrder[]> => {
    const query = status ? `?status=${status}` : "";
    const { data } = await api.get(`/orders${query}`);
    return data.data ?? data;
  },

  create: async (payload: CreateProductionOrderDTO): Promise<ProductionOrder> => {
    const { data } = await api.post("/orders", payload);
    return data.data ?? data;
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<ProductionOrder> => {
    const { data } = await api.patch(`/orders/${id}/status`, { status });
    return data.data ?? data;
  },

  updateProduced: async (id: string, quantity: number): Promise<ProductionOrder> => {
    const { data } = await api.patch(`/orders/${id}/produce`, { quantity });
    return data.data ?? data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  resetProduction: async (id: string): Promise<ProductionOrder> => {
    const { data } = await api.patch(`/orders/${id}/reset`);
    return data.data ?? data;
  },
};