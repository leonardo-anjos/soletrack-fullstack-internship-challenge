import { Request, Response, NextFunction } from "express";
import { SizeService } from "../services/size.service";
import { z } from "zod";

const service = new SizeService();

/**
 * SCHEMAS
 */
const createSchema = z.object({
  value: z.number().int().positive(),
});

/**
 * CONTROLLER
 */
export class SizeController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value } = createSchema.parse(req.body);

      const size = await service.create(value);

      return res.status(201).json({
        success: true,
        data: size,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const sizes = await service.findAll();

      return res.json({
        success: true,
        data: sizes,
      });
    } catch (error) {
      next(error);
    }
  };
}