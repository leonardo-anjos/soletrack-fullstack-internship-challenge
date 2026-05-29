// src/services/size.service.ts
import { prisma } from "../database/prisma";
import { AppError } from "../errors/AppError";

export class SizeService {
  async findAll() {
    return prisma.size.findMany({
      orderBy: { value: "asc" },
    });
  }

  async create(value: number) {
    if (!value) throw new AppError("Tamanho inválido", 400);

    try {
      return await prisma.size.create({
        data: { value },
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new AppError("Tamanho já existe", 400);
      }
      throw error;
    }
  }
}