import { ProductionOrder } from "../types/productionOrder";
import { ShoeModel } from "../types/shoeModel";

export class ProductionEngine {
  private orders: ProductionOrder[];
  private models: ShoeModel[];

  constructor(orders: ProductionOrder[], models: ShoeModel[]) {
    this.orders = orders;
    this.models = models;
  }

  private getModel(modelId: string) {
    return this.models.find((m) => m.id === modelId);
  }

  // 📦 TOTAL PRODUZIDO
  getTotalProduced() {
    return this.orders.reduce((acc, o) => acc + (o.quantity_produced || 0), 0);
  }

  // 🟢 CONCLUÍDOS HOJE
  getCompletedToday() {
    const today = new Date().toISOString().split("T")[0];
    return this.orders
      .filter((o) => o.status === "COMPLETED" && o.start_date !== null)
      .filter(
        (o) => new Date(o.start_date!).toISOString().split("T")[0] === today,
      )
      .reduce((acc, o) => acc + (o.quantity_produced || 0), 0);
  }

  // 🏭 EM PRODUÇÃO
  getInProduction() {
    return this.orders.filter((o) => o.status === "IN_PROGRESS").length;
  }

  // 📊 DASHBOARD FINAL
  getDashboard() {
    return {
      totalProduced: this.getTotalProduced(),
      completedToday: this.getCompletedToday(),
      inProduction: this.getInProduction(),
    };
  }
}
