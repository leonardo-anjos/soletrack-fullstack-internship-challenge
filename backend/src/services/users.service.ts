import { prisma } from "../database/prisma";
import { AppError } from "../errors/AppError";

type Role = "ADMIN" | "OPERATOR";

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

export const listUsers = async (): Promise<SafeUser[]> => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
    },
    orderBy: { created_at: "desc" },
  });

  return users.map(serializeUser);
};

export const deleteUser = async (id: string) => {
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
};

export const updateUserRole = async (
  id: string,
  role: Role
): Promise<SafeUser> => {
  if (!id) throw new AppError("ID inválido", 400);
  if (!role) throw new AppError("Role inválida", 400);

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { role },
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
    if (error.code === "P2025") {
      throw new AppError("Usuário não encontrado", 404);
    }
    throw error;
  }
};