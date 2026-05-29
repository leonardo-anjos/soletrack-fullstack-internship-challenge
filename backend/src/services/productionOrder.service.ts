import { prisma } from "../database/prisma";
import { Status } from "@prisma/client";
import { AppError } from "../errors/AppError";

export interface CreateProductionDTO {
  model_id: string;
  color: string;
  sole_color: string;
  size: number;
  quantity_planned: number;
}

export class ProductionOrderService {
  private async generateId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `OP-${year}-`;

    const lastOrder = await prisma.productionOrder.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: "desc" },
      select: { id: true },
    });

    if (!lastOrder) return `${prefix}001`;

    const lastSeq = parseInt(lastOrder.id.split("-")[2], 10);
    const nextSeq = String(lastSeq + 1).padStart(3, "0");

    return `${prefix}${nextSeq}`;
  }

  async create(data: CreateProductionDTO) {
    const { model_id, color, sole_color, size, quantity_planned } = data;

    if (!model_id || !color || !sole_color || !size || quantity_planned == null) {
      throw new AppError("Todos os campos são obrigatórios", 400);
    }

    if (quantity_planned <= 0) {
      throw new AppError("Quantidade planejada inválida", 400);
    }

    if (size < 34 || size > 44) {
      throw new AppError("Tamanho deve ser entre 34 e 44", 400);
    }

    const model = await prisma.shoeModel.findUnique({ where: { id: model_id } });
    if (!model) throw new AppError("Modelo não encontrado", 404);

    // Busca ou cria tamanho
    let sizeRecord = await prisma.size.findUnique({ where: { value: size } });
    if (!sizeRecord) {
      sizeRecord = await prisma.size.create({ data: { value: size } });
    }

    // Busca ou cria variante pelo SKU
    const sku = `${model_id}-${color}-${sole_color}`.toUpperCase().replace(/\s+/g, "-");
    let variant = await prisma.shoeVariant.findUnique({ where: { sku } });
    if (!variant) {
      variant = await prisma.shoeVariant.create({
        data: { model_id, color, sole_color, sku },
      });
    }

    const id = await this.generateId();

    return prisma.productionOrder.create({
      data: {
        id,
        quantity_planned,
        variant: { connect: { id: variant.id } },
        size: { connect: { id: sizeRecord.id } },
      },
      include: {
        variant: { include: { model: true } },
        size: true,
      },
    });
  }

  async findAll(status?: Status) {
    return prisma.productionOrder.findMany({
      where: status ? { status } : {},
      include: {
        variant: { include: { model: true } },
        size: true,
      },
      orderBy: { created_at: "desc" },
    });
  }

  async updateStatus(id: string, status: Status) {
    const order = await prisma.productionOrder.findUnique({ where: { id } });
    if (!order) throw new AppError("Ordem não encontrada", 404);

    const data: any = { status };

    if (status === Status.IN_PROGRESS && !order.start_date) {
      data.start_date = new Date();
    }

    if (status === Status.COMPLETED) {
      data.end_date = new Date();
      data.quantity_produced = order.quantity_planned;
    }

    return prisma.productionOrder.update({
      where: { id },
      data,
      include: {
        variant: { include: { model: true } },
        size: true,
      },
    });
  }

  async updateProduced(id: string, quantity: number) {
    if (quantity <= 0) throw new AppError("Quantidade inválida", 400);

    const order = await prisma.productionOrder.findUnique({ where: { id } });
    if (!order) throw new AppError("Ordem não encontrada", 404);

    if (order.status === Status.PLANNED) {
      throw new AppError("Inicie a produção antes de atualizar", 400);
    }

    const newProduced = order.quantity_produced + quantity;
    if (newProduced > order.quantity_planned) {
      throw new AppError("Quantidade excede o planejado", 400);
    }

    const isCompleted = newProduced === order.quantity_planned;

    return prisma.productionOrder.update({
      where: { id },
      data: {
        quantity_produced: newProduced,
        status: isCompleted ? Status.COMPLETED : Status.IN_PROGRESS,
        start_date: order.start_date ?? new Date(),
        end_date: isCompleted ? new Date() : null,
      },
      include: {
        variant: { include: { model: true } },
        size: true,
      },
    });
  }

  async delete(id: string) {
    const order = await prisma.productionOrder.findUnique({ where: { id } });
    if (!order) throw new AppError("Ordem de produção não encontrada", 404);

    if (order.status !== Status.PLANNED) {
      throw new AppError("Só é possível excluir ordens planejadas", 400);
    }

    return prisma.productionOrder.delete({ where: { id } });
  }

  async reset(id: string) {
    const order = await prisma.productionOrder.findUnique({ where: { id } });
    if (!order) throw new AppError("Ordem não encontrada", 404);

    return prisma.productionOrder.update({
      where: { id },
      data: {
        quantity_produced: 0,
        status: Status.PLANNED,
        start_date: null,
        end_date: null,
      },
      include: {
        variant: { include: { model: true } },
        size: true,
      },
    });
  }
}