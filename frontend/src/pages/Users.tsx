import React, { useEffect, useState } from "react";
import api from "../services/api";
import styles from "./Users.module.css";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "OPERATOR";
  created_at: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/users");
      setUsers(response.data.data ?? response.data);
    } catch (err) {
      setError("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert("Erro ao excluir usuário");
    }
  };

  const handleChangeRole = async (id: string, role: User["role"]) => {
    try {
      const response = await api.patch(`/users/${id}/role`, { role });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? (response.data.data ?? response.data) : u))
      );
    } catch (err) {
      alert("Erro ao atualizar função do usuário");
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gerenciar Usuários</h1>

      <div className={styles.table}>
        <div className={styles.header}>
          <span>Nome</span>
          <span>Email</span>
          <span>Função</span>
          <span>Ações</span>
        </div>

        {users.map((user) => (
          <div key={user.id} className={styles.row}>
            <span>{user.name}</span>
            <span>{user.email}</span>

            <span>
              <select
                className={styles.select}
                value={user.role}
                onChange={(e) =>
                  handleChangeRole(user.id, e.target.value as User["role"])
                }
              >
                <option value="ADMIN">ADMIN</option>
                <option value="OPERATOR">OPERATOR</option>
              </select>
            </span>

            <div className={styles.actions}>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(user.id)}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;