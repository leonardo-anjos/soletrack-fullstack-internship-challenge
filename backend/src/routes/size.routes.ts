import { Router } from "express";
import { SizeController } from "../controllers/size.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();
const controller = new SizeController();

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
 *   name: Sizes
 *   description: Gestão de tamanhos de calçados
 */

/**
 * @swagger
 * /api/sizes:
 *   post:
 *     summary: Criar tamanho
 *     tags: [Sizes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: number
 *                 example: 42
 *     responses:
 *       201:
 *         description: Tamanho criado com sucesso
 */
router.post(
  "/",
  authorize("ADMIN"),
  catchAsync(controller.create),
);

/**
 * @swagger
 * /api/sizes:
 *   get:
 *     summary: Listar tamanhos
 *     tags: [Sizes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tamanhos
 */
router.get("/", catchAsync(controller.findAll));

export default router;