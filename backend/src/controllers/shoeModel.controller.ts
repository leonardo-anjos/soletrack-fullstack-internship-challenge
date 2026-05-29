import { Request, Response, NextFunction } from "express";
import { ShoeModelService } from "../services/shoeModel.service";
import { z } from "zod";

const service = new ShoeModelService();

/**
 * SCHEMAS
 */
const idSchema = z.object({
  id: z.string().min(1),
});

const createSchema = z.object({
  name: z.string().min(3).trim(),
  category: z.string().min(2).trim(),
  base_cost: z.number().positive(),
});

const updateSchema = createSchema
  .partial()
  .refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    { message: "Nenhum campo para atualizar." }
  );

/**
 * CONTROLLER
 */
export class ShoeModelController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createSchema.parse(req.body);

      const shoe = await service.create(data);

      return res.status(201).json({
        success: true,
        data: shoe,
      });
    } catch (error) {
      next(error);
    }
  };

  findAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const shoes = await service.findAll();

      return res.json({
        success: true,
        data: shoes,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = idSchema.parse(req.params);
      const data = updateSchema.parse(req.body);

      const updated = await service.update(id, data);

      return res.json({
        success: true,
        message: "Modelo atualizado",
        data: updated,
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
}