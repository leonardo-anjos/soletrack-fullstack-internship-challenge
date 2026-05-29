import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/authService";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import styles from "./Register.module.css"; // reutiliza o mesmo CSS
 
type UserRole = "ADMIN" | "OPERATOR";
 
interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
 
const initialForm: RegisterForm = {
  name: "",
  email: "",
  password: "",
  role: "OPERATOR",
};
 
const RegisterOperator: React.FC = () => {
  const navigate = useNavigate();
 
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ msg: "", type: "" });
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ msg: "", type: "" });
    try {
      await AuthService.register(form);
      setStatus({ msg: "Operador registrado com sucesso!", type: "success" });
      setForm(initialForm);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Erro ao registrar.";
      setStatus({ msg: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };
 
  const now = new Date();
  const dateLabel = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
 
  return (
    <div className={styles.pageWrapper}>
      <main className={styles.main}>
 
        <div className={styles.header}>
          <h1 className={styles.title}>Registrar Operador</h1>
          <span className={styles.date}>
            {dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
          </span>
        </div>
 
        <Card className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div className={styles.fields}>
 
              <Input
                label="Nome Completo"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                required
              />
 
              <Input
                label="E-mail"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                required
              />
 
              <Input
                label="Senha"
                type="password"
                value={form.password}
                onChange={(v) => setForm({ ...form, password: v })}
                required
              />
 
              <div>
                <label className={styles.fieldLabel}>Nível de Acesso</label>
                <div className={styles.roleToggle}>
                  {(
                    [
                      ["OPERATOR", "Operador de Linha"],
                      ["ADMIN", "Administrador"],
                    ] as [UserRole, string][]
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={`${styles.roleOpt} ${
                        form.role === value ? styles.roleActive : ""
                      }`}
                      onClick={() => setForm({ ...form, role: value })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
 
            </div>
 
            {status.msg && (
              <div
                className={`${styles.statusMsg} ${
                  status.type === "error" ? styles.error : styles.success
                }`}
              >
                {status.type === "success" ? "✓" : "⚠"} {status.msg}
              </div>
            )}
 
            <div className={styles.actions}>
              <Button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? "⏳ Processando..." : "✓ Finalizar Cadastro"}
              </Button>
              <Button
                type="button"
                className={styles.clearBtn}
                onClick={() => setForm(initialForm)}
              >
                Limpar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/home")}
              >
                Voltar ao Dashboard
              </Button>
            </div>
          </form>
        </Card>
 
      </main>
    </div>
  );
};
 
export default RegisterOperator;