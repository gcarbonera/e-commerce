# Documentação das APIs REST

## API de Catálogo (porta 3001)

### Características
- **Porta**: 3001
- **Banco de dados**: SQLite (database.sqlite)
- **Autenticação**: JWT Bearer Token
- **Documentação**: http://localhost:3001/api-docs (Swagger)

---

### Rotas Obrigatórias

#### 1. GET /health
Health check da API

**Exemplo de Requisição:**
```http
GET http://localhost:3001/health
```

**Resposta (200 OK):**
```json
{
  "status": "ok",
  "service": "catalog-api",
  "timestamp": "2024-11-10T19:30:00.000Z"
}
```

---

#### 2. POST /auth/login
Gera token JWT para acessar rotas autenticadas

**Exemplo de Requisição:**
```http
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "admin@catalog.com"
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "email": "admin@catalog.com"
  }
}
```

**Erros:**
- **400 Bad Request**: Email não fornecido

---

#### 3. GET /produtos
Lista produtos com filtros e paginação

**Parâmetros de Query:**
- `busca` (string, opcional): Busca por nome ou descrição
- `categoria` (string, opcional): Filtrar por categoria
- `page` (integer, default: 1, min: 1): Número da página
- `limit` (integer, default: 10, min: 1, max: 100): Itens por página

**Exemplos de Requisição:**

```http
# Todos os produtos (primeira página)
GET http://localhost:3001/produtos

# Com busca
GET http://localhost:3001/produtos?busca=notebook

# Com filtro de categoria
GET http://localhost:3001/produtos?categoria=Eletrônicos

# Com paginação
GET http://localhost:3001/produtos?page=2&limit=5

# Combinando filtros
GET http://localhost:3001/produtos?busca=smartphone&categoria=Eletrônicos&page=1&limit=10
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Smartphone Galaxy X",
      "description": "Smartphone de última geração...",
      "price": 2499.90,
      "category": "Eletrônicos",
      "image": "https://via.placeholder.com/400x400?text=Smartphone",
      "stock": 15,
      "created_at": "2024-11-10 19:00:00",
      "updated_at": "2024-11-10 19:00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

**Erros:**
- **400 Bad Request**: Parâmetros inválidos (ex: page < 1, limit > 100)
- **500 Internal Server Error**: Erro no banco de dados

---

#### 4. GET /produtos/:id
Detalhes de um produto específico

**Exemplo de Requisição:**
```http
GET http://localhost:3001/produtos/1
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Smartphone Galaxy X",
    "description": "Smartphone de última geração com câmera de 108MP...",
    "price": 2499.90,
    "category": "Eletrônicos",
    "image": "https://via.placeholder.com/400x400?text=Smartphone",
    "stock": 15,
    "created_at": "2024-11-10 19:00:00",
    "updated_at": "2024-11-10 19:00:00"
  }
}
```

**Erros:**
- **400 Bad Request**: ID inválido (não é número)
- **404 Not Found**: Produto não existe
- **500 Internal Server Error**: Erro no banco de dados

---

#### 5. POST /produtos (Autenticado)
Criar novo produto no catálogo

**Cabeçalhos obrigatórios:**
```
Authorization: Bearer {seu_token_jwt}
Content-Type: application/json
```

**Exemplo de Requisição:**
```http
POST http://localhost:3001/produtos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Produto Teste",
  "description": "Descrição do produto",
  "price": 99.90,
  "category": "Eletrônicos",
  "image": "https://via.placeholder.com/400",
  "stock": 10
}
```

**Resposta (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 9,
    "name": "Produto Teste",
    "description": "Descrição do produto",
    "price": 99.90,
    "category": "Eletrônicos",
    "image": "https://via.placeholder.com/400",
    "stock": 10,
    "created_at": "2024-11-10 19:30:00",
    "updated_at": "2024-11-10 19:30:00"
  },
  "message": "Produto criado com sucesso"
}
```

**Erros:**
- **400 Bad Request**: Dados inválidos (name ou price ausentes, price negativo, stock negativo)
- **401 Unauthorized**: Token não fornecido
- **403 Forbidden**: Token inválido ou expirado
- **500 Internal Server Error**: Erro no banco de dados

---

#### 6. DELETE /produtos/:id (Autenticado)
Deletar um produto do catálogo

**Cabeçalhos obrigatórios:**
```
Authorization: Bearer {seu_token_jwt}
```

**Exemplo de Requisição:**
```http
DELETE http://localhost:3001/produtos/9
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Produto deletado com sucesso",
  "data": {
    "id": 9,
    "name": "Produto Teste",
    "description": "Descrição do produto",
    "price": 99.90,
    "category": "Eletrônicos",
    "image": "https://via.placeholder.com/400",
    "stock": 10,
    "created_at": "2024-11-10 19:30:00",
    "updated_at": "2024-11-10 19:30:00"
  }
}
```

**Erros:**
- **400 Bad Request**: ID inválido
- **401 Unauthorized**: Token não fornecido
- **403 Forbidden**: Token inválido ou expirado
- **404 Not Found**: Produto não encontrado
- **500 Internal Server Error**: Erro no banco de dados

---

## API de Sacola (porta 3002)

### Características
- **Porta**: 3002
- **Banco de dados**: SQLite (database.sqlite)
- **Autenticação**: JWT Bearer Token
- **Documentação**: http://localhost:3002/api-docs (Swagger)

---

### Rotas

#### 1. GET /health
Health check da API

**Exemplo de Requisição:**
```http
GET http://localhost:3002/health
```

**Resposta (200 OK):**
```json
{
  "status": "ok",
  "service": "bag-api",
  "timestamp": "2024-11-10T19:30:00.000Z"
}
```

---

#### 2. POST /login
Login via email (sem senha) - Gera token JWT

**Exemplo de Requisição:**
```http
POST http://localhost:3002/login
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "email": "user@example.com",
    "expiresIn": "24h"
  }
}
```

**Erros:**
- **400 Bad Request**: Email inválido
- **500 Internal Server Error**: Erro no banco de dados

---

#### 3. GET /sacola (Autenticado)
Recuperar sacola do usuário

**Exemplo de Requisição:**
```http
GET http://localhost:3002/sacola
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "user_email": "user@example.com",
        "product_id": 1,
        "name": "Smartphone Galaxy X",
        "price": 2499.90,
        "quantity": 2,
        "image": "https://via.placeholder.com/400x400?text=Smartphone",
        "created_at": "2024-11-10 19:00:00",
        "updated_at": "2024-11-10 19:00:00"
      }
    ],
    "coupon": {
      "code": "DESC10",
      "type": "percentage",
      "value": 10,
      "description": "10% de desconto"
    },
    "summary": {
      "subtotal": 4999.80,
      "shipping": 0.00,
      "discount": 499.98,
      "total": 4499.82
    }
  }
}
```

**Erros:**
- **401 Unauthorized**: Token não fornecido
- **403 Forbidden**: Token inválido ou expirado
- **500 Internal Server Error**: Erro no banco de dados

---

#### 4. POST /sacola/items (Autenticado)
Adicionar item à sacola

**Exemplo de Requisição:**
```http
POST http://localhost:3002/sacola/items
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "productId": 1,
  "name": "Smartphone Galaxy X",
  "price": 2499.90,
  "quantity": 1,
  "image": "https://via.placeholder.com/400x400?text=Smartphone"
}
```

**Resposta (201 Created / 200 OK):**
```json
{
  "success": true,
  "message": "Item adicionado à sacola"
}
```

**Erros:**
- **400 Bad Request**: Dados incompletos
- **401 Unauthorized**: Token não fornecido
- **403 Forbidden**: Token inválido
- **500 Internal Server Error**: Erro no banco

---

#### 5. PUT /sacola/items/:itemId (Autenticado)
Atualizar quantidade de um item

**Exemplo de Requisição:**
```http
PUT http://localhost:3002/sacola/items/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "quantity": 3
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Quantidade atualizada"
}
```

**Erros:**
- **400 Bad Request**: Quantidade inválida (< 1)
- **401 Unauthorized**: Token não fornecido
- **403 Forbidden**: Token inválido
- **404 Not Found**: Item não encontrado
- **500 Internal Server Error**: Erro no banco

---

#### 6. DELETE /sacola/items/:itemId (Autenticado)
Remover item da sacola

**Exemplo de Requisição:**
```http
DELETE http://localhost:3002/sacola/items/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Item removido"
}
```

**Erros:**
- **401 Unauthorized**: Token não fornecido
- **403 Forbidden**: Token inválido
- **404 Not Found**: Item não encontrado
- **500 Internal Server Error**: Erro no banco

---

#### 7. POST /sacola/coupon (Autenticado)
Aplicar cupom de desconto

**Exemplo de Requisição:**
```http
POST http://localhost:3002/sacola/coupon
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "code": "DESC10"
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "coupon": {
      "code": "DESC10",
      "type": "percentage",
      "value": 10,
      "description": "10% de desconto"
    }
  },
  "message": "Cupom aplicado com sucesso"
}
```

**Cupons disponíveis:**
- `DESC10`: 10% de desconto
- `DESC20`: 20% de desconto
- `FRETE`: Frete grátis (R$ 15,90)
- `BEM-VINDO`: R$ 50 de desconto fixo

**Erros:**
- **400 Bad Request**: Cupom inválido ou não fornecido
- **401 Unauthorized**: Token não fornecido
- **403 Forbidden**: Token inválido
- **500 Internal Server Error**: Erro no banco

---

#### 8. DELETE /sacola/coupon (Autenticado)
Remover cupom aplicado

**Exemplo de Requisição:**
```http
DELETE http://localhost:3002/sacola/coupon
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Cupom removido"
}
```

---

## Status Codes Utilizados

- **200 OK**: Requisição bem-sucedida
- **201 Created**: Recurso criado com sucesso
- **400 Bad Request**: Parâmetros ou dados inválidos
- **401 Unauthorized**: Token não fornecido
- **403 Forbidden**: Token inválido ou expirado
- **404 Not Found**: Recurso não encontrado
- **500 Internal Server Error**: Erro no servidor/banco de dados

---

## Validações Implementadas

### API de Catálogo:
- `page`: Deve ser número inteiro ≥ 1
- `limit`: Deve ser número inteiro entre 1 e 100
- `price`: Deve ser número positivo
- `stock`: Deve ser número não negativo
- `id`: Deve ser número inteiro válido

### API de Sacola:
- `email`: Deve conter @ (formato válido)
- `quantity`: Deve ser número inteiro ≥ 1
- `productId`, `name`, `price`: Obrigatórios ao adicionar item
- `code`: Obrigatório ao aplicar cupom

---

## Persistência de Dados

Ambas as APIs utilizam **SQLite** com tabelas relacionais:

### API de Catálogo:
- **Tabela**: `produtos`
- **Campos**: id, name, description, price, category, image, stock, created_at, updated_at

### API de Sacola:
- **Tabelas**: `users`, `bag_items`, `coupons`, `user_coupons`
- **Relacionamentos**: FK entre tabelas para integridade referencial

---

## Testando as APIs

### Com Swagger (Interface Gráfica):
- API de Catálogo: http://localhost:3001/api-docs
- API de Sacola: http://localhost:3002/api-docs

### Com cURL (Linha de comando):
```bash
# Health check
curl http://localhost:3001/health

# Listar produtos
curl http://localhost:3001/produtos

# Login
curl -X POST http://localhost:3002/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Criar produto (com token)
curl -X POST http://localhost:3001/produtos \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","price":99.90}'
```

### Com Postman/Insomnia:
Importe as URLs e configure os headers conforme documentação acima.
