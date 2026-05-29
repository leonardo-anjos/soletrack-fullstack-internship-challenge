# 📚 Backend - Sistema de Controle de Produção (SoleTrack)

## 📌 Visão geral

Este backend implementa um sistema de controle de produção de calçados industriais, permitindo gerenciar modelos, variações, estoque e ordens de produção.

O sistema foi construído com foco em:

- escalabilidade
- separação de responsabilidades
- segurança (JWT + RBAC)
- consistência de API
- modelagem relacional com Prisma

---

# 🏗️ Arquitetura

O backend segue arquitetura em camadas:


controllers → services → prisma → database


## 📁 Estrutura


src/
├── controllers/
├── services/
├── routes/
├── middlewares/
├── database/
├── utils/
├── errors/


---

# 🔹 Responsabilidades

## Controllers
- Recebem requisições HTTP
- Validam entrada (Zod)
- Chamam services
- Retornam resposta HTTP

## Services
- Regras de negócio
- Integração com Prisma
- Validações críticas

## Prisma
- Acesso ao banco de dados
- Relacionamentos

## Middlewares
- Autenticação (JWT)
- Autorização (RBAC)

---

# 🔐 Segurança

## Autenticação
- JWT (JSON Web Token)
- Middleware global `authMiddleware`

## Autorização (RBAC)

- ADMIN → acesso total
- OPERATOR → operações limitadas

---

# ⚙️ Padrões do sistema

## 1. Tratamento de erros
Uso de `AppError` + middleware global

## 2. Async handler
Uso de `catchAsync` para evitar try/catch repetido

## 3. Resposta padrão

```json
{
  "status": "success",
  "data": {}
}
🧩 Entidades do sistema
👤 User
autenticação
roles
controle de acesso
👟 ShoeModel

Modelo base do produto (ex: Nike Air Max)

🎨 ShoeVariant
cor
cor da sola
SKU único
📏 Size

Tamanhos disponíveis (38, 39, 40, 41)

📦 Stock

Controle de estoque por:

variant_id
size_id
🏭 ProductionOrder

Controle de produção:

variant + size
quantidade planejada
quantidade produzida
status:
PLANNED
IN_PROGRESS
COMPLETED
CANCELLED
📝 AuditLog

Registro de ações do sistema:

usuário responsável
ação realizada
entidade afetada
🔄 Fluxo do sistema
1. Modelo

ShoeModel → base do produto

2. Variantes

Cada modelo pode ter:

cores diferentes
combinações de sola
3. Estoque

Cada variante + tamanho gera estoque

4. Produção

ProductionOrder controla o que será produzido

5. Atualização
IN_PROGRESS → produção iniciada
COMPLETED → finalizada automaticamente
📊 Dashboard

Agregações baseadas em ProductionOrder:

total produzido
meta planejada
ordens por status
produção diária
🚧 Melhorias implementadas
padronização de arquitetura
separação de responsabilidades
implementação de RBAC
normalização do schema Prisma
inclusão de variants e stock
controle de produção incremental
geração de IDs customizados
validação com Zod
middleware de erro global
⚠️ Problema atual em análise
Sintoma
modelos aparecem corretamente
mas não aparecem em ordens de produção e dashboard
Possíveis causas
seed incompleto
frontend não consumindo endpoint correto
relacionamento variant_id / size_id incompleto
dashboard sem dados suficientes
🚀 Próximos passos
criar seed completo (Nike, Adidas, Mizuno, Oakley)
revisar fluxo ProductionOrder
corrigir dashboard (agregações)
validar integração frontend ↔ backend
otimizar queries Prisma (include/select)