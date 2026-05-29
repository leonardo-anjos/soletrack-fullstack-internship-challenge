import { Router } from "express";
import { ShoeVariantController } from "../controllers/shoeVariant.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();
const controller = new ShoeVariantController();

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
 *   name: Variants
 *   description: Gestão de variações dos modelos de calçados
 */

/**
 * @swagger
 * /api/variants:
 *   post:
 *     summary: Criar variação de modelo
 *     tags: [Variants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - model_id
 *               - color
 *               - sole_color
 *             properties:
 *               model_id:
 *                 type: string
 *               color:
 *                 type: string
 *                 example: Preto
 *               sole_color:
 *                 type: string
 *                 example: Branco
 *     responses:
 *       201:
 *         description: Variante criada com sucesso
 */
router.post(
  "/",
  authorize("ADMIN"),
  catchAsync(controller.create),
);

/**
 * @swagger
 * /api/variants:
 *   get:
 *     summary: Listar todas as variações
 *     tags: [Variants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de variações
 */
router.get("/", catchAsync(controller.findAll));

/**
 * @swagger
 * /api/variants/model/{model_id}:
 *   get:
 *     summary: Listar variações por modelo
 *     tags: [Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Variações do modelo
 */
router.get(
  "/model/:model_id",
  catchAsync(controller.findByModel),
);

export default router;