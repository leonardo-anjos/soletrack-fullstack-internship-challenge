import api from "./api";
import { ShoeModel } from "../types/shoeModel";

/**
 * DTO correto para criação (somente campos permitidos)
 */
export type CreateShoeModelDTO = {
  name: string;
  category: string;
  base_cost: number;
};

export type UpdateShoeModelDTO = Partial<CreateShoeModelDTO>;

export const ShoeModelService = {
  findAll: async (): Promise<ShoeModel[]> => {
    const { data } = await api.get("/models");

    return data.data ?? data;
  },

  create: async (payload: CreateShoeModelDTO): Promise<ShoeModel> => {
    const { data } = await api.post("/models", payload);

    return data.data ?? data;
  },

  update: async (
    id: string,
    payload: UpdateShoeModelDTO
  ): Promise<ShoeModel> => {
    const { data } = await api.put(`/models/${id}`, payload);

    return data.data ?? data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/models/${id}`);
  },
};