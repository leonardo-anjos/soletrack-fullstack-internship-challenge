import api from "./api";
import { User } from "../types/User";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "OPERATOR";
}

interface LoginResponse {
  token: string;
  user: User;
}

export const AuthService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await api.post("/auth/login", payload);

    // compatível com diferentes formatos de backend
    const data = response.data?.data ?? response.data;

    const token = data.token;
    const user = data.user;

    if (!token || !user) {
      throw new Error("Resposta de login inválida");
    }

    // opcional: já salva aqui pra evitar repetição no frontend
    localStorage.setItem("token", token);

    return { token, user };
  },

  async register(payload: RegisterPayload): Promise<void> {
    await api.post("/auth/register", payload);
  },

  async updateProfile(
    id: string,
    payload: { name?: string; password?: string }
  ): Promise<User> {
    const response = await api.put(`/auth/${id}`, payload);

    return response.data?.data ?? response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/auth/${id}`);
  },
};