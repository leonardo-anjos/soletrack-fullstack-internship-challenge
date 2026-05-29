import React, { useEffect, useState } from "react";
import { ProductionOrderService, CreateProductionOrderDTO } from "../services/productionOrderService";
import { ShoeModelService } from "../services/shoeModelService";
import { ProductionOrder, OrderStatus } from "../types/productionOrder";
import { ShoeModel } from "../types/shoeModel";

import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import styles from "./ProductionOrders.module.css";

import { RotateCcw, Plus } from "lucide-react";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PLANNED: "Planejada",
  IN_PROGRESS: "Em Produção",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

const SIZES = Array.from({ length: 11 }, (_, i) => 34 + i);

const ProductionOrders: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [models, setModels] = useState<ShoeModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Modal + Pares
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [isAddPairsOpen, setIsAddPairsOpen] = useState(false);
  const [qtyToAdd, setQtyToAdd] = useState(1);

  // Modal Nova Ordem
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [newOrder, setNewOrder] = useState<CreateProductionOrderDTO>({
    model_id: "",
    color: "",
    sole_color: "Branco",
    size: 39,
    quantity_planned: 1,
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [o, m] = await Promise.all([
        ProductionOrderService.findAll(),
        ShoeModelService.findAll(),
      ]);
      setOrders(o);
      setModels(m);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (id: string) => {
    const updated = await ProductionOrderService.updateStatus(id, "IN_PROGRESS");
    refreshOrder(updated);
  };

  const handleAddPairs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const updated = await ProductionOrderService.updateProduced(selectedOrder.id, qtyToAdd);
    refreshOrder(updated);
    setIsAddPairsOpen(false);
    setSelectedOrder(null);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.model_id || !newOrder.color || !newOrder.sole_color) return;
    try {
      const created = await ProductionOrderService.create(newOrder);
      setOrders((prev) => [created, ...prev]);
      setIsNewOrderOpen(false);
      setNewOrder({ model_id: "", color: "", sole_color: "Branco", size: 39, quantity_planned: 1 });
    } catch {
      alert("Erro ao criar ordem de produção.");
    }
  };

  const handleReset = async (id: string) => {
    if (confirm("Zerar produção e voltar para planejamento?")) {
      const updated = await ProductionOrderService.resetProduction(id);
      refreshOrder(updated);
    }
  };

  const handleDelete = (id: string) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;

    if (order.status !== "PLANNED") {
      setWarningMessage(
        `Esta ordem está com status "${STATUS_LABELS[order.status]}" e não pode ser excluída.\n\nClique em "Reiniciar" para voltar ao status "Planejada" e tente novamente.`
      );
      return;
    }

    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    await ProductionOrderService.delete(deleteTargetId);
    setOrders((prev) => prev.filter((o) => o.id !== deleteTargetId));
    setDeleteTargetId(null);
  };

  const refreshOrder = (updated: ProductionOrder) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (a.status === "COMPLETED" && b.status !== "COMPLETED") return 1;
    if (a.status !== "COMPLETED" && b.status === "COMPLETED") return -1;
    return 0;
  });

  const selectStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14,
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 4,
    display: "block",
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className={styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Ordens de Produção</h1>
        <Button onClick={() => setIsNewOrderOpen(true)}>
          <Plus size={16} /> Nova Ordem
        </Button>
      </div>

      <Table
        data={sortedOrders}
        rowStyle={(row) =>
          row.status === "COMPLETED"
            ? { backgroundColor: "#d4edda", color: "#155724" }
            : {}
        }
        columns={[
          {
            header: "Modelo",
            render: (row) => row.variant?.model?.name ?? "N/A",
          },
          {
            header: "Cor",
            render: (row) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span>Superior: {row.variant?.color ?? "N/A"}</span>
                <span style={{ fontSize: 11, color: "#888" }}>
                  Sola: {row.variant?.sole_color ?? "N/A"}
                </span>
              </div>
            ),
          },
          {
            header: "Tamanho",
            render: (row) => row.size?.value ?? "N/A",
          },
          {
            header: "Planejado",
            accessor: "quantity_planned",
          },
          {
            header: "Produzido",
            render: (row) => {
              const restante = row.quantity_planned - row.quantity_produced;
              return (
                <div>
                  <strong>
                    {row.quantity_produced} / {row.quantity_planned}
                  </strong>
                  <div style={{ fontSize: 11 }}>
                    {restante > 0 ? `Faltam ${restante}` : "Meta atingida!"}
                  </div>
                </div>
              );
            },
          },
          {
            header: "Status",
            render: (row) => STATUS_LABELS[row.status],
          },
          {
            header: "Ações",
            render: (row) => (
              <div style={{ display: "flex", gap: 5 }}>
                {row.status === "PLANNED" && (
                  <Button size="sm" variant="success" onClick={() => handleStart(row.id)}>
                    Começar
                  </Button>
                )}

                {row.status !== "COMPLETED" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedOrder(row);
                      setIsAddPairsOpen(true);
                      setQtyToAdd(1);
                    }}
                  >
                    + Pares
                  </Button>
                )}

                <Button size="sm" variant="outline" onClick={() => handleReset(row.id)}>
                  <RotateCcw size={18} />
                  Reiniciar
                </Button>

                <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>
                  Excluir
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* MODAL AVISO — não pode excluir */}
      <Modal
        isOpen={!!warningMessage}
        onClose={() => setWarningMessage(null)}
        variant="warning"
        title="⚠️ Ação não permitida"
        footer={
          <Button variant="outline" onClick={() => setWarningMessage(null)}>
            Entendi
          </Button>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", textAlign: "center" }}>
          <span style={{ fontSize: 48 }}>🔒</span>
          <p style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-line" }}>
            {warningMessage}
          </p>
        </div>
      </Modal>

      {/* MODAL CONFIRMAR EXCLUSÃO */}
      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        variant="danger"
        title="🗑️ Excluir Ordem"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Excluir definitivamente
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", textAlign: "center" }}>
          <span style={{ fontSize: 48 }}>⚠️</span>
          <p style={{ fontSize: 15, lineHeight: 1.6 }}>
            Tem certeza que deseja excluir esta ordem?<br />
            <strong>Esta ação não pode ser desfeita.</strong>
          </p>
        </div>
      </Modal>

      {/* MODAL + PARES */}
      <Modal
        isOpen={isAddPairsOpen}
        onClose={() => setIsAddPairsOpen(false)}
        title="Adicionar Produção"
      >
        <form onSubmit={handleAddPairs} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p>Quantidade produzida agora:</p>
          <input
            type="number"
            value={qtyToAdd}
            onChange={(e) => setQtyToAdd(Number(e.target.value))}
            min={1}
            style={selectStyle}
          />
          <Button type="submit">Confirmar</Button>
        </form>
      </Modal>

      {/* MODAL NOVA ORDEM */}
      <Modal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        title="Nova Ordem de Produção"
      >
        <form onSubmit={handleCreateOrder} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelStyle}>Modelo</label>
            <select
              value={newOrder.model_id}
              onChange={(e) => setNewOrder((prev) => ({ ...prev, model_id: e.target.value }))}
              style={selectStyle}
              required
            >
              <option value="">Selecione um modelo</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Cor Superior</label>
            <input
              type="text"
              value={newOrder.color}
              onChange={(e) => setNewOrder((prev) => ({ ...prev, color: e.target.value }))}
              placeholder="Ex: Preto, Azul Marinho..."
              style={selectStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Cor da Sola</label>
            <input
              type="text"
              value={newOrder.sole_color}
              onChange={(e) => setNewOrder((prev) => ({ ...prev, sole_color: e.target.value }))}
              placeholder="Ex: Branco, Preto..."
              style={selectStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Tamanho</label>
            <select
              value={newOrder.size}
              onChange={(e) => setNewOrder((prev) => ({ ...prev, size: Number(e.target.value) }))}
              style={selectStyle}
              required
            >
              {SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Quantidade Planejada</label>
            <input
              type="number"
              value={newOrder.quantity_planned}
              onChange={(e) =>
                setNewOrder((prev) => ({ ...prev, quantity_planned: Number(e.target.value) }))
              }
              min={1}
              style={selectStyle}
              required
            />
          </div>

          <Button type="submit">Criar Ordem</Button>
        </form>
      </Modal>
    </div>
  );
};

export default ProductionOrders;