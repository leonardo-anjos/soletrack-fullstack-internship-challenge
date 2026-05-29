import { Request, Response, NextFunction } from "express";
import {
  listUsers,
  deleteUser,
  updateUserRole,
} from "../services/users.service";
import { z } from "zod";

/**
 * SCHEMAS
 */
const idSchema = z.object({
  id: z.string().uuid(),
});

const roleSchema = z.object({
  role: z.enum(["ADMIN", "OPERATOR"]),
});

/**
 * CONTROLLERS
 */
export const getUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await listUsers();

    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const removeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = idSchema.parse(req.params);

    await deleteUser(id);

    return res.json({
      success: true,
      message: "Usuário removido com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = idSchema.parse(req.params);
    const { role } = roleSchema.parse(req.body);

    const user = await updateUserRole(id, role);

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};