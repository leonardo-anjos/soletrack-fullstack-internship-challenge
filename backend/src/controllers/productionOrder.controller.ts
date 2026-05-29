import { Request, Response, NextFunction } from "express";
import { ProductionOrderService } from "../services/productionOrder.service";
import { z } from "zod";
import { Status } from "@prisma/client";
import { AppError } from "../errors/AppError";

const service = new ProductionOrderService();

/**
 * SCHEMAS
 */
const idSchema = z.object({
  id: z.string().min(1),
});

const createSchema = z.object({
  model_id: z.string().min(1),
  color: z.string().min(1),
  sole_color: z.string().min(1),
  size: z.number().int().min(34).max(44),
  quantity_planned: z.number().int().positive(),
});

const updateProducedSchema = z.object({
  quantity: z.number().int().positive(),
});

const statusSchema = z.object({
  status: z.nativeEnum(Status),
});

const querySchema = z.object({
  status: z.nativeEnum(Status).optional(),
});

/**
 * CONTROLLER
 */
export class ProductionOrderController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createSchema.parse(req.body);

      const order = await service.create(data);

      return res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = querySchema.parse(req.query);

      const orders = await service.findAll(status);

      return res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProduced = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = idSchema.parse(req.params);
      const { quantity } = updateProducedSchema.parse(req.body);

      const order = await service.updateProduced(id, quantity);

      return res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  reset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = idSchema.parse(req.params);

      const order = await service.reset(id);

      return res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = idSchema.parse(req.params);
      const { status } = statusSchema.parse(req.body);

      const order = await service.updateStatus(id, status);

      return res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = idSchema.parse(req.params);

      await service.delete(id);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  dashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await service.findAll();

      const today = new Date().toISOString().split("T")[0];

      const data = orders.reduce(
        (acc, order) => {
          const createdDate = order.created_at
            ? new Date(order.created_at).toISOString().split("T")[0]
            : null;

          if (createdDate === today) {
            acc.producedToday += order.quantity_produced;
          }

          acc.totalProduced += order.quantity_produced;
          acc.totalPlanned += order.quantity_planned;
          acc.totalOrders++;

          switch (order.status) {
            case Status.IN_PROGRESS:
              acc.inProduction++;
              break;
            case Status.COMPLETED:
              acc.completed++;
              break;
            case Status.PLANNED:
              acc.planned++;
              break;
          }

          return acc;
        },
        {
          producedToday: 0,
          inProduction: 0,
          completed: 0,
          planned: 0,
          totalProduced: 0,
          totalPlanned: 0,
          totalOrders: 0,
        }
      );

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}