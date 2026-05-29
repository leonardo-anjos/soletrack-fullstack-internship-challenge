import api from "./api";

export interface ShoeVariant {
  id: string;
  model_id: string;
  color: string;
  sole_color: string;
  sku: string;
}

export const ShoeVariantService = {
  findAll: async (): Promise<ShoeVariant[]> => {
    const { data } = await api.get("/variants");

    return data.data ?? data;
  },

  findByModel: async (model_id: string): Promise<ShoeVariant[]> => {
    const { data } = await api.get(`/variants/model/${model_id}`);

    return data.data ?? data;
  },

  create: async (
    payload: Omit<ShoeVariant, "id">
  ): Promise<ShoeVariant> => {
    const { data } = await api.post("/variants", payload);

    return data.data ?? data;
  },
};