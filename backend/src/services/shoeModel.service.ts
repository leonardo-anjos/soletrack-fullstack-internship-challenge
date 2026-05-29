import { prisma } from "../database/prisma";
import { ShoeModel } from "@prisma/client";
import { AppError } from "../errors/AppError";

export interface CreateShoeModelDTO {
  name: string;
  category: string;
  base_cost: number;
}

export class ShoeModelService {
  private normalizeCategory(category: string): string {
    return category
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/\s+/g, "-")
      .slice(0, 10);
  }

  private async generateId(category: string): Promise<string> {
    const categorySlug = this.normalizeCategory(category);
    const prefix = `SAP-${categorySlug}-`;

    const lastModel = await prisma.shoeModel.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: "desc" },
    });

    if (!lastModel) return `${prefix}001`;

    const parts = lastModel.id.split("-");
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    const nextSeq = String(lastSeq + 1).padStart(3, "0");

    return `${prefix}${nextSeq}`;
  }

  async create(data: CreateShoeModelDTO): Promise<ShoeModel> {
    const { name, category, base_cost } = data;

    if (!name?.trim() || !category?.trim() || base_cost == null) {
      throw new AppError("Todos os campos são obrigatórios", 400);
    }

    if (base_cost <= 0) {
      throw new AppError("Custo base inválido", 400);
    }

    const id = await this.generateId(category);

    return prisma.shoeModel.create({
      data: {
        id,
        name: name.trim(),
        category: category.trim(),
        base_cost,
      },
    });
  }

  async findAll(): Promise<ShoeModel[]> {
    return prisma.shoeModel.findMany({
      orderBy: { created_at: "desc" },
    });
  }

  async update(
    id: string,
    data: Partial<CreateShoeModelDTO>
  ): Promise<ShoeModel> {
    if (!id) throw new AppError("ID inválido", 400);

    const updateData: any = {};

    if (data.name?.trim()) updateData.name = data.name.trim();
    if (data.category?.trim()) updateData.category = data.category.trim();

    if (data.base_cost !== undefined) {
      if (data.base_cost <= 0) {
        throw new AppError("Custo base inválido", 400);
      }
      updateData.base_cost = data.base_cost;
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError("Nenhum dado para atualizar", 400);
    }

    try {
      return await prisma.shoeModel.update({
        where: { id },
        data: updateData,
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new AppError("Modelo não encontrado", 404);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<ShoeModel> {
    if (!id) throw new AppError("ID inválido", 400);

    const variants = await prisma.shoeVariant.findMany({
      where: { model_id: id },
      select: { id: true },
    });

    if (variants.length > 0) {
      const variantIds = variants.map((v) => v.id);

      const hasOrders = await prisma.productionOrder.findFirst({
        where: { variant_id: { in: variantIds } },
      });

      if (hasOrders) {
        throw new AppError(
          "Não é possível excluir modelo com ordens de produção associadas",
          400
        );
      }
    }

    try {
      return await prisma.shoeModel.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new AppError("Modelo não encontrado", 404);
      }
      throw error;
    }
  }
}