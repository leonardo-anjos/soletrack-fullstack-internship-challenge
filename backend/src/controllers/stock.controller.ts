import { Request, Response, NextFunction } from "express";
import { StockService } from "../services/stock.service";
import { z } from "zod";

const service = new StockService();

/**
 * SCHEMAS
 */
const updateSchema = z.object({
  variant_id: z.string().min(1),
  size_id: z.string().min(1),
  quantity: z.number().int().min(0),
});

/**
 * CONTROLLER
 */
export class StockController {
  findAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stocks = await service.findAll();

      return res.json({
        success: true,
        data: stocks,
      });
    } catch (error) {
      next(error);
    }
  };

  updateQuantity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { variant_id, size_id, quantity } = updateSchema.parse(req.body);

      const stock = await service.updateQuantity(
        variant_id,
        size_id,
        quantity
      );

      return res.json({
        success: true,
        data: stock,
      });
    } catch (error) {
      next(error);
    }
  };
}