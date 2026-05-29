import React, { useState, useEffect } from "react";
import { ShoeModelService } from "../services/shoeModelService";
import { ShoeModel } from "../types/shoeModel";
import Table from "../components/Table";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import styles from "./ShoeModels.module.css";

const CATEGORIES = ["Tênis", "Social", "Sandália", "Bota"];

const ShoeModels: React.FC = () => {
  const [models, setModels] = useState<ShoeModel[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    category: "Tênis",
    base_cost: 0,
  });

  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await ShoeModelService.findAll();
      setModels(data || []);
    } catch (err) {
      console.error("Erro ao buscar modelos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    try {
      await ShoeModelService.create({
        name: formData.name,
        category: formData.category,
        base_cost: Number(formData.base_cost),
      });

      setFormData({
        name: "",
        category: "Tênis",
        base_cost: 0,
      });

      await fetchModels();
    } catch (err) {
      alert("Erro ao salvar modelo. Verifique permissões.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este modelo?")) return;

    try {
      await ShoeModelService.delete(id);
      setModels((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert("Erro ao excluir modelo.");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Modelos de Calçados</h1>
        <p>Carregando modelos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Modelos de Calçados</h1>

      {/* FORM CARD */}
      <Card className={styles.formCard}>
        <form onSubmit={handleSave} className={styles.row}>
          <Input
            label="Nome"
            value={formData.name}
            onChange={(v) =>
              setFormData((prev) => ({ ...prev, name: v }))
            }
            required
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 500 }}>
              Categoria
            </label>

            <select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
                height: 38,
              }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Custo Base (R$)"
            type="number"
            value={formData.base_cost}
            onChange={(v) =>
              setFormData((prev) => ({
                ...prev,
                base_cost: Number(v),
              }))
            }
            required
          />

          <Button type="submit" className={styles.btn}>
            Salvar Modelo
          </Button>
        </form>
      </Card>

      {/* TABLE */}
      <Table
        data={models}
        columns={[
          { header: "Nome", accessor: "name" },
          { header: "Categoria", accessor: "category" },
          {
            header: "Custo Base",
            render: (row: ShoeModel) =>
              `R$ ${Number(row.base_cost || 0).toFixed(2)}`,
          },
          {
            header: "Ações",
            render: (row: ShoeModel) => (
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(row.id)}
              >
                Excluir
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ShoeModels;