import api from "./api";

export interface Size {
  id: string;
  value: number;
}

export const SizeService = {
  findAll: async (): Promise<Size[]> => {
    const { data } = await api.get("/sizes");

    return data.data ?? data;
  },

  create: async (value: number): Promise<Size> => {
    const { data } = await api.post("/sizes", { value });

    return data.data ?? data;
  },
};