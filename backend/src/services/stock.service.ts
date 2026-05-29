// src/services/stock.service.ts
import { prisma } from "../database/prisma";
import { AppError } from "../errors/AppError";

type StockSafe = {
  id: string;
  quantity: number;
  size: number;
  sku: string;
  modelName: string;
};

function serializeStock(stock: any): StockSafe {
  return {
    id: stock.id,
    quantity: stock.quantity,
    size: stock.size.value,
    sku: stock.variant.sku,
    modelName: stock.variant.model.name,
  };
}

export class StockService {
  async findAll(): Promise<StockSafe[]> {
    const stocks = await prisma.stock.findMany({
      include: {
        size: true,
        variant: {
          include: {
            model: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return stocks.map(serializeStock);
  }

  async updateQuantity(
    variant_id: string,
    size_id: string,
    quantity: number
  ) {
    if (!variant_id || !size_id) {
      throw new AppError("Dados inválidos", 400);
    }

    if (quantity < 0) {
      throw new AppError("Quantidade inválida", 400);
    }

    return prisma.stock.upsert({
      where: {
        variant_id_size_id: {
          variant_id,
          size_id,
        },
      },
      update: { quantity },
      create: {
        variant_id,
        size_id,
        quantity,
      },
    });
  }
}