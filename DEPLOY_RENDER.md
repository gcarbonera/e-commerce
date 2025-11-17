# 🚀 Guia de Deploy no Render

Este guia demonstra como realizar o deploy do frontend React no Render (https://render.com).

## 📋 Pré-requisitos

- ✅ Conta no GitHub
- ✅ Conta no Render (gratuita em https://render.com)
- ✅ Repositório Git com o código do projeto

---

## 🔧 Passo 1: Preparar o Repositório

### 1.1 Inicializar Git (se ainda não tiver)

```bash
git init
git add .
git commit -m "Initial commit - E-commerce project"
```

### 1.2 Criar repositório no GitHub

1. Acesse https://github.com/new
2. Crie um novo repositório (ex: `ecommerce-frontend`)
3. **Não** inicialize com README (já temos arquivos)
4. Copie a URL do repositório

### 1.3 Conectar e enviar código

```bash
git remote add origin https://github.com/SEU_USUARIO/ecommerce-frontend.git
git branch -M main
git push -u origin main
```

---

## ⚙️ Passo 2: Configurar o Render

### 2.1 Criar novo serviço

1. Acesse https://dashboard.render.com
2. Clique em **"New +"** → **"Static Site"**
3. Conecte sua conta do GitHub (se for primeira vez)
4. Selecione o repositório `ecommerce-frontend`

### 2.2 Configurações do serviço

Preencha os campos:

| Campo | Valor |
|-------|-------|
| **Name** | `ecommerce-frontend` (ou nome de sua preferência) |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `frontend/dist` |

### 2.3 Variáveis de ambiente (opcional)

Se precisar configurar URLs das APIs em produção:

```
VITE_CATALOG_API_URL=https://sua-api-catalogo.onrender.com
VITE_BAG_API_URL=https://sua-api-sacola.onrender.com
```

---

## 🌐 Passo 3: Deploy

1. Clique em **"Create Static Site"**
2. Aguarde o build (leva ~2-5 minutos)
3. O Render fornecerá uma URL pública:
   ```
   https://ecommerce-frontend-XXXX.onrender.com
   ```

---

## ✅ Passo 4: Verificação

### 4.1 Testar o site

Acesse a URL fornecida pelo Render e verifique:

- ✅ Página inicial carrega corretamente
- ✅ Navegação entre páginas funciona
- ✅ Produtos são exibidos (se APIs estiverem em produção)
- ✅ Emojis dos placeholders aparecem
- ✅ Layout responsivo funciona

### 4.2 Verificar logs

No painel do Render:
- Vá em **"Logs"** para ver detalhes do build
- Verifique erros se algo não funcionar

---

## 🔄 Passo 5: Deploy Automático

Após a configuração inicial, qualquer push para a branch `main` no GitHub dispara um novo deploy automaticamente:

```bash
# Fazer alterações no código
git add .
git commit -m "Update frontend"
git push origin main

# Render detecta automaticamente e faz redeploy
```

---

## 🏗️ Estrutura do Projeto para Deploy

```
Trabalho Programação Web/
├── frontend/                    ← Root Directory no Render
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── dist/                    ← Publish Directory (gerado no build)
│       ├── index.html
│       ├── assets/
│       └── ...
├── services/
│   ├── catalog-api/
│   └── bag-api/
└── README.md
```

---

## 🎯 Dicas Importantes

### Para Frontend Estático (React/Vite)

1. **Build Command** deve gerar a pasta `dist`
   ```bash
   npm install && npm run build
   ```

2. **Publish Directory** aponta para onde está o HTML final
   ```
   frontend/dist
   ```

3. **Root Directory** é onde está o `package.json` do frontend
   ```
   frontend
   ```

### Problemas Comuns

#### ❌ "Build failed"
- Verifique se `npm run build` funciona localmente
- Confira logs no Render para ver erro específico
- Certifique-se que `package.json` está no `Root Directory` correto

#### ❌ "404 Not Found" em rotas
Para React Router funcionar corretamente, crie arquivo `_redirects`:

```bash
echo "/*    /index.html   200" > frontend/public/_redirects
```

Ou crie `render.yaml` na raiz:

```yaml
services:
  - type: web
    name: ecommerce-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

#### ❌ APIs não funcionam
- Frontend estático precisa de APIs também em produção
- Deploy as APIs separadamente no Render (tipo "Web Service")
- Configure CORS nas APIs para aceitar domínio do Render
- Use variáveis de ambiente para URLs das APIs

---

## 🚀 Deploy das APIs (Bonus)

Para ter sistema completo em produção, faça deploy das APIs também:

### Catalog API
1. **New +** → **Web Service**
2. Root Directory: `services/catalog-api`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Port: 3001 (Render detecta automaticamente)

### Bag API
1. **New +** → **Web Service**
2. Root Directory: `services/bag-api`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Port: 3002

Depois, atualize URLs das APIs no frontend e faça redeploy.

---

## 📚 Recursos Adicionais

- [Render Docs - Static Sites](https://render.com/docs/static-sites)
- [Render Docs - Deploy Hooks](https://render.com/docs/deploy-hooks)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [React Router - Web Server Config](https://reactrouter.com/en/main/guides/web-server-config)

---

## 🎓 Entrega da Tarefa

Inclua no relatório:

1. ✅ URL pública do site no Render
2. ✅ Print da página inicial funcionando
3. ✅ Print do painel do Render mostrando deploy bem-sucedido
4. ✅ Descrição dos passos realizados
5. ✅ Link do repositório GitHub utilizado

**Exemplo de URL final:**
```
https://ecommerce-frontend-abc123.onrender.com
```

---

## 📝 Checklist Final

Antes de entregar, verifique:

- [ ] Código está no GitHub (repositório público ou privado com acesso)
- [ ] Deploy no Render foi bem-sucedido (status "Live")
- [ ] URL pública está acessível e funcionando
- [ ] Navegação entre páginas funciona
- [ ] Layout está correto (CSS carregado)
- [ ] Não há erros no console do navegador
- [ ] README.md atualizado com URL de produção

---

**🎉 Parabéns! Seu e-commerce está online!**
