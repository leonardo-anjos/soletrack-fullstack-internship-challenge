# 🥿 SoleTrack

**Sistema Fullstack de Controle de Produção de Calçados**

SoleTrack é um sistema fullstack para gerenciamento de produção de calçados em ambiente industrial. Ele permite o controle de usuários, modelos de calçados e ordens de produção, com autenticação JWT e controle de acesso baseado em perfis.

---

# 📌 Funcionalidades

- 🔐 Autenticação de usuários com JWT
- 👥 Controle de acesso por perfil (**ADMIN** e **OPERATOR**)
- 👤 Atualização de perfil de usuário
- 📦 Gestão completa de ordens de produção
- 👟 Gestão de modelos de calçados
- 📊 Dashboard com métricas em tempo real
- 🔒 Rotas protegidas (frontend e backend)
- 📖 Documentação da API com Swagger

---

# 🧠 Tecnologias

## Frontend
- React
- TypeScript
- Vite
- React Router
- Axios
- CSS Modules

## Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- JWT
- Swagger

## Banco de Dados
- PostgreSQL

---

# 📁 Estrutura do Projeto

```bash
soletrack-fullstack/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   └── src/
│       ├── controllers/
│       ├── database/
│       ├── errors/
│       ├── middlewares/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── app.ts
│       ├── createAdmin.ts
│       └── swagger.ts
│
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── hooks/
        ├── pages/
        ├── routes/
        ├── services/
        ├── styles/
        ├── types/
        ├── App.tsx
        └── main.tsx
```


---

# ⚙️ Pré-requisitos

- Node.js >= 18
- npm >= 9
- PostgreSQL >= 14

---

# 🔧 Configuração do Ambiente

## 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/soletrack-fullstack.git
cd soletrack-fullstack

2. Criar o banco de dados
CREATE DATABASE shoetrack_production;

3. Configurar variáveis de ambiente no backend, copie o arquivo de exemplo:
cd backend
cp .env.example .env

Exemplo de .env
DATABASE_URL="postgresql://user:password@localhost:5432/shoetrack_production"
JWT_SECRET="your_jwt_secret_here"
PORT=3000
FRONTEND_URL="http://localhost:5173"

Como executar o projeto

O projeto precisa de dois terminais rodando simultaneamente.

🔹 Backend
cd backend
npm install
npm run migrate
npm run dev

Servidor:

http://localhost:3000
🔹 Frontend
cd frontend
npm install
npm run dev

Aplicação:
http://localhost:5173

Documentação da API

Após iniciar o backend:

http://localhost:3000/api-docs
🔐 Autenticação
Exemplo de resposta
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "role": "ADMIN | OPERATOR"
  }
}

Perfis de acesso
Perfil	Permissões
ADMIN	Acesso total ao sistema (usuários, ordens e modelos)
OPERATOR	Acesso às operações de produção

📊 Módulos do sistema
📦 Ordens de Produção
Criar ordens
Atualizar produção
Reiniciar produção
Excluir ordens (com regras de status)

👟 Modelos de Calçados
Cadastro e listagem de modelos

📊 Dashboard
Produção total
Produção diária
Status de ordens
Progresso geral
👨‍💻 Autor

Desenvolvido por Carlos Otacílio Rodrigues dos Anjos
Projeto fullstack demonstrando integração entre frontend, backend, autenticação JWT, ORM e banco de dados relacional.
