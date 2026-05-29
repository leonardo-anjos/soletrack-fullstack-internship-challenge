import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

interface Props {
  orders: any[];
}

const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#14b8a6"];

const ProductionChart: React.FC<Props> = ({ orders }) => {
  const data = useMemo(() => {
    const map = new Map<
      string,
      { name: string; produced: number; planned: number }
    >();

    for (const o of orders || []) {
      // 🔥 nome mais seguro possível (evita quebra total)
      const name =
        o?.variant?.model?.name ??
        o?.modelName ??
        `Modelo ${o?.variant_id?.slice?.(0, 6) ?? "N/A"}`;

      const produced = Number(o?.quantity_produced ?? 0);
      const planned = Number(o?.quantity_planned ?? 0);

      const existing = map.get(name);

      if (existing) {
        existing.produced += produced;
        existing.planned += planned;
      } else {
        map.set(name, {
          name,
          produced,
          planned,
        });
      }
    }

    return Array.from(map.values());
  }, [orders]);

  if (!data.length) {
    return (
      <div style={{ textAlign: "center", padding: 20 }}>
        Nenhuma produção para exibir
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />

        {/* planejado */}
        <Bar dataKey="planned" fill="#e2e8f0" name="Planejado" />

        {/* produzido */}
        <Bar dataKey="produced" name="Produzido">
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProductionChart;