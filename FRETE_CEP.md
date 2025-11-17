# 📦 Sistema de Cálculo de Frete por CEP

## 🎯 Funcionalidade Implementada

O sistema agora possui **cálculo automático de frete baseado no CEP** do usuário, com valores diferenciados por região do Brasil e informações de prazo de entrega.

---

## ✨ Recursos

### 1. **Cálculo de Frete por Região**
- Valores de frete baseados nos primeiros dígitos do CEP
- Prazos de entrega estimados por região
- Identificação automática da região (estado/cidade)

### 2. **Frete Grátis Automático**
- Compras acima de R$ 200 = frete grátis
- Mostra economia (valor original do frete)

### 3. **Interface Intuitiva**
- Campo de CEP formatado automaticamente (00000-000)
- Cálculo instantâneo ao clicar em "OK"
- Exibição clara da região e prazo de entrega

---

## 📍 Tabela de Frete por Região

| Região (CEP) | Estado/Cidade | Frete | Prazo |
|--------------|---------------|-------|-------|
| 01000-09999 | São Paulo (capital) | R$ 15,90 | 2 dias |
| 10000-19999 | Interior de SP | R$ 22,90 | 3 dias |
| 20000-28999 | Rio de Janeiro | R$ 19,90 | 3 dias |
| 30000-39999 | Minas Gerais | R$ 25,90 | 4 dias |
| 40000-48999 | Bahia | R$ 32,90 | 5 dias |
| 50000-56999 | Pernambuco | R$ 35,90 | 6 dias |
| 60000-63999 | Ceará | R$ 38,90 | 6 dias |
| 69000-69999 | Região Norte | R$ 45,90 | 8 dias |
| 70000-73999 | Brasília/Goiás | R$ 28,90 | 4 dias |
| 80000-87999 | Paraná | R$ 26,90 | 4 dias |
| 88000-89999 | Santa Catarina | R$ 29,90 | 5 dias |
| 90000-99999 | Rio Grande do Sul | R$ 31,90 | 5 dias |
| Outros | Outras regiões | R$ 35,90 | 7 dias |

---

## 🔧 Endpoints da API

### 1. **Calcular Frete**

```http
POST /sacola/frete
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "cep": "01310100"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "cep": "01310100",
    "subtotal": 2499.90,
    "cost": 15.90,
    "estimatedDays": 2,
    "regionName": "São Paulo - SP",
    "freeShipping": false
  }
}
```

**Resposta com Frete Grátis:**
```json
{
  "success": true,
  "data": {
    "cep": "01310100",
    "subtotal": 5000.00,
    "cost": 0,
    "estimatedDays": 2,
    "regionName": "São Paulo - SP",
    "freeShipping": true,
    "originalCost": 15.90
  }
}
```

---

### 2. **Salvar Endereço de Entrega**

```http
POST /sacola/endereco
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "cep": "01310100",
  "logradouro": "Avenida Paulista",
  "numero": "1578",
  "complemento": "Apto 101",
  "bairro": "Bela Vista",
  "cidade": "São Paulo",
  "estado": "SP"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "cep": "01310100",
    "logradouro": "Avenida Paulista",
    "numero": "1578",
    "complemento": "Apto 101",
    "bairro": "Bela Vista",
    "cidade": "São Paulo",
    "estado": "SP",
    "shipping": {
      "cost": 15.90,
      "estimatedDays": 2,
      "regionName": "São Paulo - SP",
      "freeShipping": false
    }
  },
  "message": "Endereço salvo com sucesso"
}
```

---

### 3. **Buscar Endereço Salvo**

```http
GET /sacola/endereco
Authorization: Bearer TOKEN
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_email": "usuario@exemplo.com",
    "cep": "01310100",
    "logradouro": "Avenida Paulista",
    "numero": "1578",
    "complemento": "Apto 101",
    "bairro": "Bela Vista",
    "cidade": "São Paulo",
    "estado": "SP",
    "is_default": 1,
    "created_at": "2024-11-10T20:00:00.000Z",
    "shipping": {
      "cost": 15.90,
      "estimatedDays": 2,
      "regionName": "São Paulo - SP",
      "freeShipping": false
    }
  }
}
```

---

### 4. **GET /sacola (Atualizado)**

A rota de buscar sacola agora também retorna informações de endereço e frete:

```http
GET /sacola
Authorization: Bearer TOKEN
```

**Resposta Atualizada:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "address": {
      "cep": "01310100",
      "cidade": "São Paulo",
      "estado": "SP",
      ...
    },
    "shippingInfo": {
      "cost": 15.90,
      "estimatedDays": 2,
      "regionName": "São Paulo - SP",
      "freeShipping": false
    },
    "coupon": null,
    "summary": {
      "subtotal": 2499.90,
      "shipping": 15.90,
      "discount": 0,
      "total": 2515.80
    }
  }
}
```

---

## 🖥️ Interface do Frontend

### Campo de CEP na Sacola

O frontend agora possui um formulário de cálculo de frete na página da sacola:

**Recursos da Interface:**

1. **Campo formatado**: CEP automaticamente formatado como `00000-000`
2. **Botão de calcular**: Clique em "OK" para calcular
3. **Informações exibidas**:
   - Nome da região/estado
   - Prazo de entrega em dias úteis
   - Valor do frete (ou "Grátis")
   - Economia quando frete é grátis

**Exemplo Visual:**
```
┌─────────────────────────────────┐
│ 📍 Calcular Frete               │
├─────────────────────────────────┤
│ São Paulo - SP                  │
│ Entrega em 2 dias úteis         │
│ Você economizou R$ 15,90!       │
├─────────────────────────────────┤
│ [01310-100] [OK]               │
└─────────────────────────────────┘
```

---

## 🧪 Como Testar

### Teste Rápido (Frontend)

1. Acesse http://localhost:5173
2. Adicione produtos ao carrinho
3. Faça login
4. Na sacola, digite um CEP de teste:
   - **01310-100** (São Paulo) → R$ 15,90, 2 dias
   - **20040-020** (Rio de Janeiro) → R$ 19,90, 3 dias
   - **30140-071** (Belo Horizonte) → R$ 25,90, 4 dias
   - **80010-000** (Curitiba) → R$ 26,90, 4 dias
   - **90010-000** (Porto Alegre) → R$ 31,90, 5 dias
5. Clique em "OK"
6. Veja as informações de frete atualizadas

### Teste com Frete Grátis

1. Adicione produtos que totalizem mais de R$ 200
2. Calcule o frete
3. Observe que o frete aparece como "Grátis 🎉"
4. Veja a economia exibida

### Teste via API (Swagger)

1. Acesse http://localhost:3002/api-docs
2. Faça login em `POST /login`
3. Autorize com o token
4. Teste `POST /sacola/frete` com diferentes CEPs
5. Veja as respostas com valores e prazos

---

## 💾 Banco de Dados

### Nova Tabela: `user_addresses`

```sql
CREATE TABLE user_addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  cep TEXT NOT NULL,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  is_default INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
)
```

**Campos:**
- `id`: Identificador único
- `user_email`: Email do usuário (FK)
- `cep`: CEP do endereço (8 dígitos)
- `logradouro`: Rua/avenida
- `numero`: Número do imóvel
- `complemento`: Complemento opcional
- `bairro`: Bairro
- `cidade`: Cidade
- `estado`: Estado (sigla)
- `is_default`: Endereço padrão (1 = sim, 0 = não)

---

## ⚙️ Lógica de Cálculo

### Função `calculateShipping(cep, subtotal)`

```javascript
// 1. Remove caracteres não numéricos do CEP
const cleanCep = cep.replace(/\D/g, '')

// 2. Valida CEP (deve ter 8 dígitos)
if (cleanCep.length !== 8) return { error: 'CEP inválido' }

// 3. Extrai região (primeiros 2 dígitos)
const region = parseInt(cleanCep.substring(0, 2))

// 4. Define frete e prazo baseado na região
// Exemplo: 01-09 = São Paulo (R$ 15,90, 2 dias)

// 5. Verifica frete grátis (subtotal >= R$ 200)
if (subtotal >= 200) {
  return {
    cost: 0,
    estimatedDays,
    regionName,
    originalCost: shippingCost,
    freeShipping: true
  }
}

// 6. Retorna informações de frete
return {
  cost: shippingCost,
  estimatedDays,
  regionName,
  freeShipping: false
}
```

---

## 🎓 Benefícios Implementados

### Para o Usuário:
- ✅ Sabe exatamente quanto pagará de frete
- ✅ Conhece o prazo de entrega antes de finalizar
- ✅ Vê de qual região está comprando
- ✅ Incentivo para comprar mais (frete grátis > R$ 200)

### Para o Negócio:
- ✅ Transparência nos custos
- ✅ Aumento do ticket médio (frete grátis)
- ✅ Dados de localização dos clientes
- ✅ Melhor experiência de compra

### Técnicos:
- ✅ Banco de dados normalizado com endereços
- ✅ API RESTful bem documentada
- ✅ Validações robustas de CEP
- ✅ Cálculo regionalizado de frete
- ✅ Interface responsiva e intuitiva

---

## 🚀 Melhorias Futuras

### Integrações Possíveis:
- [ ] Integração com API ViaCEP para preencher endereço automaticamente
- [ ] Múltiplos endereços por usuário
- [ ] Escolha de transportadora
- [ ] Rastreamento de pedidos
- [ ] Cálculo baseado em peso/volume
- [ ] Integração com Correios/transportadoras reais

---

## 📝 Documentação no Swagger

Todas as novas rotas estão documentadas no Swagger:
- http://localhost:3002/api-docs

Procure pela tag **"Frete"** e **"Endereço"** para testar os novos endpoints!

---

**Implementado em:** 10 de Novembro de 2024  
**Status:** ✅ Funcional e testado
