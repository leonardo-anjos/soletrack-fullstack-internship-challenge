import { prisma } from "../database/prisma";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";
import { AppError } from "../errors/AppError";

type Role = "ADMIN" | "OPERATOR";

const SALT_ROUNDS = 10;

type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
};

function serializeUser(user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: Date;
}): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
  };
}

export interface LoginResponse {
  user: SafeUser;
  token: string;
}

export class AuthService {
  private async hashPassword(password: string) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  private async comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async register(
    name: string,
    email: string,
    password: string,
    role: Role
  ): Promise<SafeUser> {
    if (!name?.trim() || !email?.trim() || !password?.trim() || !role) {
      throw new AppError("Todos os campos são obrigatórios", 400);
    }

    if (password.length < 6) {
      throw new AppError("A senha deve ter pelo menos 6 caracteres", 400);
    }

    try {
      const hashedPassword = await this.hashPassword(password);

      const created = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          created_at: true,
        },
      });

      return serializeUser(created);
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new AppError("Este e-mail já está em uso", 400);
      }
      throw error;
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    if (!email?.trim() || !password?.trim()) {
      throw new AppError("E-mail e senha são obrigatórios", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new AppError("E-mail ou senha inválidos", 401);
    }

    const passwordMatch = await this.comparePassword(password, user.password);

    if (!passwordMatch) {
      throw new AppError("E-mail ou senha inválidos", 401);
    }

    const token = generateToken({ id: user.id, role: user.role });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
        role: user.role,
      },
      token,
    };
  }

  async deleteUser(id: string) {
    if (!id) throw new AppError("ID inválido", 400);

    try {
      return await prisma.user.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new AppError("Usuário não encontrado", 404);
      }
      throw error;
    }
  }

  async updateProfile(
    id: string,
    data: { name?: string; email?: string; password?: string }
  ): Promise<SafeUser> {
    if (!id) throw new AppError("ID inválido", 400);

    const updateData: any = {};

    if (data.name?.trim()) {
      updateData.name = data.name.trim();
    }

    if (data.email?.trim()) {
      updateData.email = data.email.toLowerCase().trim();
    }

    if (data.password) {
      if (data.password.length < 6) {
        throw new AppError("A senha deve ter pelo menos 6 caracteres", 400);
      }
      updateData.password = await this.hashPassword(data.password);
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError("Nenhum dado para atualizar", 400);
    }

    try {
      const updated = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          created_at: true,
        },
      });

      return serializeUser(updated);
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new AppError("Este e-mail já está em uso", 400);
      }

      if (error.code === "P2025") {
        throw new AppError("Usuário não encontrado", 404);
      }

      throw error;
    }
  }
}