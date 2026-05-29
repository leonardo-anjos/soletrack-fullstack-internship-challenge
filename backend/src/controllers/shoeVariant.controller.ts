import { Request, Response, NextFunction } from "express";
import { ShoeVariantService } from "../services/shoeVariant.service";
import { z } from "zod";

const service = new ShoeVariantService();

/**
 * SCHEMAS
 */
const createSchema = z.object({
  model_id: z.string().min(1),
  color: z.string().min(2).trim(),
  sole_color: z.string().min(2).trim(),
});

const modelParamSchema = z.object({
  model_id: z.string().min(1),
});

/**
 * CONTROLLER
 */
export class ShoeVariantController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createSchema.parse(req.body);

      const variant = await service.create(data);

      return res.status(201).json({
        success: true,
        data: variant,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const variants = await service.findAll();

      return res.json({
        success: true,
        data: variants,
      });
    } catch (error) {
      next(error);
    }
  };

  findByModel = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { model_id } = modelParamSchema.parse(req.params);

      const variants = await service.findByModel(model_id);

      return res.json({
        success: true,
        data: variants,
      });
    } catch (error) {
      next(error);
    }
  };
}