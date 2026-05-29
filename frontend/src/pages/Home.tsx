import React, { useEffect, useMemo, useState } from "react";
import { ProductionOrderService } from "../services/productionOrderService";
import { ShoeModelService } from "../services/shoeModelService";
import { ShoeVariantService } from "../services/shoeVariantService";
import { SizeService } from "../services/sizeService";

import { ProductionOrder } from "../types/productionOrder";
import { ShoeModel } from "../types/shoeModel";

import Card from "../components/Card";
import ProductionChart from "../components/ProductionChart";
import styles from "./Home.module.css";

import { Factory, Settings, CheckCircle2, ClipboardList } from "lucide-react";

const Home: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [models, setModels] = useState<ShoeModel[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [o, m, v, s] = await Promise.all([
          ProductionOrderService.findAll(),
          ShoeModelService.findAll(),
          ShoeVariantService.findAll(),
          SizeService.findAll(),
        ]);

        setOrders(o || []);
        setModels(m || []);
        setVariants(v || []);
        setSizes(s || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const enrichedOrders = useMemo(() => {
    return (orders || []).map((o) => {
      const variant = variants.find((v) => v.id === o.variant_id);
      const model = models.find((m) => m.id === variant?.model_id);
      const size = sizes.find((s) => s.id === o.size_id);

      return {
        ...o,
        modelName: model?.name ?? "Desconhecido",
        sizeValue: size?.value ?? "N/A",
      };
    });
  }, [orders, variants, models, sizes]);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const metrics = useMemo(() => {
    let producedToday = 0;
    let inProgress = 0;
    let completed = 0;
    let planned = 0;

    let totalProduced = 0;
    let totalPlanned = 0;

    for (const o of enrichedOrders) {
      const produced = Number(o.quantity_produced ?? 0);
      const plannedQty = Number(o.quantity_planned ?? 0);

      totalProduced += produced;
      totalPlanned += plannedQty;

      const date = o.start_date
        ? new Date(o.start_date).toISOString().split("T")[0]
        : null;

      if (date === today) producedToday += produced;

      if (o.status === "IN_PROGRESS") inProgress++;
      if (o.status === "COMPLETED") completed++;
      if (o.status === "PLANNED") planned++;
    }

    return {
      producedToday,
      inProgress,
      completed,
      planned,
      totalProduced,
      totalPlanned,
    };
  }, [enrichedOrders, today]);

  const progressPct = useMemo(() => {
    if (!metrics.totalPlanned) return 0;
    return Math.round((metrics.totalProduced / metrics.totalPlanned) * 100);
  }, [metrics]);

  if (loading) {
    return <div className={styles.loader}>Carregando dashboard...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Painel de Produção</h1>

      {/* CARDS COM CORES (AQUI ESTAVA O ERRO) */}
      <div className={styles.statsGrid}>
        <Card
          className={styles.blueTop}
          title="Produzido Hoje"
          value={metrics.producedToday}
          icon={<Factory size={28} />}
        />

        <Card
          className={styles.orangeTop}
          title="Em Produção"
          value={metrics.inProgress}
          icon={<Settings size={28} />}
        />

        <Card
          className={styles.greenTop}
          title="Concluídas"
          value={metrics.completed}
          icon={<CheckCircle2 size={28} />}
        />

        <Card
          className={styles.purpleTop}
          title="Planejadas"
          value={metrics.planned}
          icon={<ClipboardList size={28} />}
        />
      </div>

      <div className={styles.statsGridSecondary}>
        <Card
          title="Total Produzido"
          value={metrics.totalProduced.toLocaleString("pt-BR")}
        />
        <Card
          title="Meta Total"
          value={metrics.totalPlanned.toLocaleString("pt-BR")}
        />
        <Card title="Ordens" value={orders.length} />
      </div>

      {/* PROGRESSO */}
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span>Progresso geral</span>
          <span>{progressPct}%</span>
        </div>

        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* CHART */}
      <ProductionChart orders={enrichedOrders} />
    </div>
  );
};

export default Home;
