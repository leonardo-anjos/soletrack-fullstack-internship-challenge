// src/services/shoeVariant.service.ts
import { prisma } from "../database/prisma";
import { AppError } from "../errors/AppError";

type ShoeVariantSafe = {
  id: string;
  color: string;
  soleColor: string;
  sku: string;
  modelId: string;
  modelName: string;
  createdAt: Date;
};

function serializeVariant(variant: any): ShoeVariantSafe {
  return {
    id: variant.id,
    color: variant.color,
    soleColor: variant.sole_color,
    sku: variant.sku,
    modelId: variant.model_id,
    modelName: variant.model?.name,
    createdAt: variant.created_at,
  };
}

export interface CreateVariantDTO {
  model_id: string;
  color: string;
  sole_color: string;
}

export class ShoeVariantService {
  private generateSKU(modelId: string, color: string, sole: string) {
    const normalize = (str: string) =>
      str
        .toUpperCase()
        .replace(/\s+/g, "")
        .slice(0, 3);

    return `${modelId}-${normalize(color)}-${normalize(sole)}`;
  }

  async create(data: CreateVariantDTO): Promise<ShoeVariantSafe> {
    const { model_id, color, sole_color } = data;

    if (!model_id || !color?.trim() || !sole_color?.trim()) {
      throw new AppError("Todos os campos são obrigatórios", 400);
    }

    const model = await prisma.shoeModel.findUnique({
      where: { id: model_id },
    });

    if (!model) throw new AppError("Modelo não encontrado", 404);

    const sku = this.generateSKU(model_id, color, sole_color);

    try {
      const created = await prisma.shoeVariant.create({
        data: {
          model_id,
          color: color.trim(),
          sole_color: sole_color.trim(),
          sku,
        },
        include: { model: true },
      });

      return serializeVariant(created);
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new AppError("SKU já existe", 400);
      }
      throw error;
    }
  }

  async findByModel(model_id: string): Promise<ShoeVariantSafe[]> {
    const variants = await prisma.shoeVariant.findMany({
      where: { model_id },
      include: { model: true },
      orderBy: { created_at: "desc" },
    });

    return variants.map(serializeVariant);
  }

  async findAll(): Promise<ShoeVariantSafe[]> {
    const variants = await prisma.shoeVariant.findMany({
      include: { model: true },
      orderBy: { created_at: "desc" },
    });

    return variants.map(serializeVariant);
  }
}