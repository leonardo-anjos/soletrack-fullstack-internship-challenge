import { Router } from "express";

import authRoutes from "./auth.routes";
import userRoutes from "./users.routes";
import shoeModelRoutes from "./shoeModel.routes";
import productionOrderRoutes from "./productionOrder.routes";
import shoeVariantRoutes from "./shoeVariant.routes";
import sizeRoutes from "./size.routes";
import stockRoutes from "./stock.routes";

const router = Router();
//ROTAS PÚBLICAS
router.use("/auth", authRoutes);
//ROTAS DE USUÁRIOS
router.use("/users", userRoutes);
//DOMÍNIO: PRODUTOS (calçados)
router.use("/models", shoeModelRoutes);
router.use("/variants", shoeVariantRoutes);
router.use("/sizes", sizeRoutes);
//DOMÍNIO: ESTOQUE
router.use("/stock", stockRoutes);
// DOMÍNIO: PRODUÇÃO
router.use("/orders", productionOrderRoutes);

export default router;
