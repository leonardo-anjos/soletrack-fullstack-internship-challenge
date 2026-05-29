import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { z } from "zod";
import { AppError } from "../errors/AppError";

const authService = new AuthService();

const registerSchema = z.object({
  name: z.string().min(3).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "OPERATOR"]),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6),
});

const updateProfileSchema = z
  .object({
    name: z.string().min(2).trim().optional(),
    email: z.string().email().toLowerCase().trim().optional(),
    password: z.string().min(6).optional(),
  })
  .refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    { message: "Nenhum campo para atualizar." }
  );

const idParamSchema = z.object({
  id: z.string().uuid(),
});

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = registerSchema.parse(req.body);

      const user = await authService.register(
        data.name,
        data.email,
        data.password,
        data.role
      );

      return res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = loginSchema.parse(req.body);

      const result = await authService.login(data.email, data.password);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = idParamSchema.parse(req.params);

      await authService.deleteUser(id);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = idParamSchema.parse(req.params);

      const requester = (req as any).user;

      if (!requester) {
        throw new AppError("Não autenticado", 401);
      }

      if (requester.id !== id && requester.role !== "ADMIN") {
        throw new AppError("Sem permissão para editar este perfil", 403);
      }

      const data = updateProfileSchema.parse(req.body);

      const updatedUser = await authService.updateProfile(id, data);

      return res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };
}