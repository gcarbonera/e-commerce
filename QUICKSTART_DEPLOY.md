# 🚀 Quick Start - Deploy Render

## Comandos Rápidos

### 1. Testar Build Localmente
```powershell
cd frontend
npm run build
npm run preview
```

### 2. Inicializar Git
```powershell
# Na raiz do projeto
git init
git add .
git commit -m "feat: prepare for Render deploy"
```

### 3. Criar Repositório GitHub
```powershell
# Criar repo em https://github.com/new
# Depois conectar:
git remote add origin https://github.com/SEU_USUARIO/NOME_REPO.git
git branch -M main
git push -u origin main
```

### 4. Deploy no Render

**Opção A: Frontend apenas (Static Site)**
1. https://dashboard.render.com/new/static
2. Conectar repositório GitHub
3. Configurações:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `frontend/dist`
4. Create Static Site

**Opção B: Sistema completo (usar render.yaml)**
1. https://dashboard.render.com/new/blueprint
2. Conectar repositório
3. Render lê automaticamente o `render.yaml`
4. Deploy dos 3 serviços (frontend + 2 APIs)

---

## ⚙️ Configuração Render (Manual)

### Frontend Static Site
```
Name: ecommerce-frontend
Branch: main
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: frontend/dist
```

### Catalog API (Web Service)
```
Name: catalog-api
Branch: main
Root Directory: services/catalog-api
Build Command: npm install
Start Command: node server.js
Environment: Node
```

### Bag API (Web Service)
```
Name: bag-api
Branch: main
Root Directory: services/bag-api
Build Command: npm install
Start Command: node server.js
Environment: Node
```

---

## 🔧 Arquivos Criados

✅ `DEPLOY_RENDER.md` - Guia completo passo a passo
✅ `render.yaml` - Configuração automática dos 3 serviços
✅ `frontend/public/_redirects` - Fix para React Router
✅ `.gitignore` - Ignorar node_modules, dist, .env
✅ `vite.config.js` - Otimizado para produção

---

## 📋 Checklist Pré-Deploy

- [ ] `npm run build` funciona sem erros
- [ ] Código commitado no Git
- [ ] Repositório no GitHub (público ou privado)
- [ ] Conta criada no Render
- [ ] `.gitignore` configurado
- [ ] `_redirects` criado para SPA

---

## 🌐 URLs Esperadas

Após deploy, você terá:

```
Frontend:     https://ecommerce-frontend-XXXX.onrender.com
Catalog API:  https://ecommerce-catalog-api-XXXX.onrender.com
Bag API:      https://ecommerce-bag-api-XXXX.onrender.com
```

---

## ⚠️ Importante

1. **Free Tier do Render:**
   - Serviços dormem após 15min de inatividade
   - Primeira requisição pode demorar ~30s (cold start)
   - 750h/mês gratuitas por serviço

2. **APIs em Produção:**
   - Para frontend funcionar 100%, APIs precisam estar online
   - Configure CORS nas APIs para aceitar domínio do Render
   - SQLite funciona, mas dados são perdidos em redeploy
   - Para persistência, use PostgreSQL do Render (gratuito também)

3. **URLs das APIs:**
   - Atualize URLs no frontend após deploy das APIs
   - Use variáveis de ambiente no código
   - Exemplo:
     ```javascript
     const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
     ```

---

## 🐛 Troubleshooting

### Build falha no Render
```powershell
# Testar localmente:
cd frontend
npm install
npm run build
```

### 404 nas rotas React
- Verificar se `_redirects` existe em `frontend/public/`
- Conteúdo: `/*    /index.html   200`

### APIs não respondem
- Verificar logs no Render
- Confirmar que PORT vem do environment: `process.env.PORT || 3001`
- Testar endpoints: `https://sua-api.onrender.com/health`

---

## 📚 Documentação

- [Render Static Sites](https://render.com/docs/static-sites)
- [Render Web Services](https://render.com/docs/web-services)
- [Render Blueprint (YAML)](https://render.com/docs/blueprint-spec)
- [Vite Deploy](https://vitejs.dev/guide/static-deploy.html)

---

**Próximos Passos:**
1. Leia `DEPLOY_RENDER.md` (guia detalhado)
2. Teste build: `cd frontend && npm run build`
3. Commit e push para GitHub
4. Configure no Render
5. Acesse URL pública e teste! 🎉
