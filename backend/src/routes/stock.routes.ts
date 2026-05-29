import { Router } from "express";
import { StockController } from "../controllers/stock.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();
const controller = new StockController();

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
 *   name: Stock
 *   description: Controle de estoque por variante e tamanho
 */

/**
 * @swagger
 * /api/stock:
 *   get:
 *     summary: Listar estoque
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estoque
 */
router.get("/", catchAsync(controller.findAll));

/**
 * @swagger
 * /api/stock:
 *   patch:
 *     summary: Atualizar quantidade em estoque
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - variant_id
 *               - size_id
 *               - quantity
 *             properties:
 *               variant_id:
 *                 type: string
 *               size_id:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Estoque atualizado com sucesso
 */
router.patch(
  "/",
  authorize("ADMIN", "OPERATOR"),
  catchAsync(controller.updateQuantity),
);

export default router;