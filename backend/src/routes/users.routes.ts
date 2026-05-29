import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import {
  getUsers,
  removeUser,
  updateRole,
} from "../controllers/users.controller";

const router = Router();

const catchAsync =
  (fn: any) => (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/**
 * 🔐 AUTH GLOBAL
 */
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestão de usuários do sistema
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar usuários
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get(
  "/",
  authorize("ADMIN"),
  catchAsync(getUsers),
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Remover usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário removido com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.delete(
  "/:id",
  authorize("ADMIN"),
  catchAsync(removeUser),
);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Atualizar role do usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, OPERATOR]
 *     responses:
 *       200:
 *         description: Role atualizada com sucesso
 */
router.patch(
  "/:id/role",
  authorize("ADMIN"),
  catchAsync(updateRole),
);

export default router;