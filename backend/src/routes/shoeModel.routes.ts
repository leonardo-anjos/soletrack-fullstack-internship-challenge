import { Router } from "express";
import { ShoeModelController } from "../controllers/shoeModel.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();
const controller = new ShoeModelController();

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
 *   name: Models
 *   description: Gestão de modelos de calçados
 */

/**
 * @swagger
 * /api/models:
 *   post:
 *     summary: Criar modelo de calçado
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - base_cost
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nike Air Max
 *               category:
 *                 type: string
 *                 example: Esportivo
 *               base_cost:
 *                 type: number
 *                 example: 120
 *     responses:
 *       201:
 *         description: Modelo criado com sucesso
 */
router.post(
  "/",
  authorize("ADMIN"),
  catchAsync(controller.create),
);

/**
 * @swagger
 * /api/models:
 *   get:
 *     summary: Listar modelos
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de modelos
 */
router.get("/", catchAsync(controller.findAll));

/**
 * @swagger
 * /api/models/{id}:
 *   put:
 *     summary: Atualizar modelo
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/:id",
  authorize("ADMIN"),
  catchAsync(controller.update),
);

/**
 * @swagger
 * /api/models/{id}:
 *   delete:
 *     summary: Deletar modelo
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/:id",
  authorize("ADMIN"),
  catchAsync(controller.delete),
);

export default router;