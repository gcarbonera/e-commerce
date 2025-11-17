# Guia Rápido de Uso

## Como Testar o E-commerce

### 1. Abrir a Aplicação
O frontend já está rodando em: **http://localhost:5173**

### 2. Fluxo Completo de Teste

#### Passo 1: Página Home
- Você verá um banner de boas-vindas
- Menu de navegação no topo
- 4 categorias em destaque (Eletrônicos, Roupas, Livros, Acessórios)
- Clique em "Ver Produtos" ou em uma categoria

#### Passo 2: Listagem de Produtos (/categorias)
- Visualize todos os 8 produtos cadastrados
- Use o filtro de categoria no topo da página
- Teste filtrar por: Eletrônicos, Roupas, Livros ou Acessórios
- Clique em qualquer produto para ver os detalhes

#### Passo 3: Detalhes do Produto (/produtos/:id)
- Veja informações completas: nome, descrição, preço, estoque
- Clique em "Adicionar à Sacola"
- Se não estiver logado, será redirecionado para o login

#### Passo 4: Login (/sacola/login)
- Digite qualquer email válido (ex: teste@email.com)
- **Não precisa de senha!**
- Após login, será redirecionado para a sacola
- O token JWT é salvo no localStorage

#### Passo 5: Sacola (/sacola)
- Visualize todos os itens adicionados
- Aumente/diminua quantidades com os botões +/-
- Remova itens clicando em "Remover"
- Veja o resumo: subtotal, frete, desconto e total
- **Frete grátis** para compras acima de R$ 200

#### Passo 6: Aplicar Cupons
Na seção de cupom, teste um dos cupons disponíveis:
- **DESC10** - 10% de desconto
- **DESC20** - 20% de desconto
- **FRETE** - Frete grátis (R$ 15,90)
- **BEM-VINDO** - R$ 50,00 de desconto

### 3. Testar Funcionalidades Técnicas

#### Logs no Console
Abra o DevTools (F12) e veja os logs de debug:
- 🔍 Buscas e requisições às APIs
- ✓ Sucessos de operações
- ✗ Erros capturados
- 🔐 Login e autenticação
- 🛒 Operações da sacola

#### Persistência
1. Adicione produtos à sacola
2. Feche o navegador
3. Abra novamente
4. A sacola permanece (localStorage + API)

#### Tratamento de Erros
1. Pare a API de catálogo (Ctrl+C no terminal)
2. Tente acessar /categorias
3. Veja a mensagem de erro amigável
4. Reinicie a API e clique em "Tentar Novamente"

#### Autenticação JWT
1. Faça login
2. Abra DevTools > Application > Local Storage
3. Veja o token JWT salvo
4. Tente acessar /sacola sem token (remova do localStorage)
5. Será redirecionado para login

### 4. Testar APIs Diretamente

Se você tiver uma ferramenta como Postman ou Insomnia:

**API de Catálogo (porta 4000):**
```
GET http://localhost:4000/produtos
GET http://localhost:4000/produtos/1
GET http://localhost:4000/categorias?categoria=Eletrônicos
```

**API de Sacola (porta 5000):**
```
POST http://localhost:5000/login
Body: { "email": "teste@email.com" }

GET http://localhost:5000/sacola
Header: Authorization: Bearer {SEU_TOKEN}

POST http://localhost:5000/sacola/items
Header: Authorization: Bearer {SEU_TOKEN}
Body: {
  "productId": 1,
  "name": "Produto Teste",
  "price": 99.90,
  "quantity": 1,
  "image": "https://via.placeholder.com/400"
}
```

### 5. Arquivos de Dados

Os dados são salvos em arquivos JSON:
- `services/catalog-api/data/products.json` - Produtos
- `services/bag-api/data/bags.json` - Sacolas dos usuários

Você pode editar esses arquivos manualmente e reiniciar as APIs.

### 6. Recursos Implementados

✅ **Frontend React com Vite**
✅ **5 páginas completas** (Home, Produtos, Detalhes, Login, Sacola)
✅ **2 APIs REST independentes** (Catálogo e Sacola)
✅ **Autenticação JWT** (login por email)
✅ **Persistência de dados** (JSON files)
✅ **Sincronização** (API + localStorage)
✅ **HTML semântico** (nav, main, section, article, aside, form)
✅ **Acessibilidade** (labels, aria-labels, alt text, roles)
✅ **Tratamento de erros** (try/catch, mensagens amigáveis)
✅ **Estados de loading** (feedback visual)
✅ **Logs de debug** (console.log para desenvolvimento)
✅ **CORS habilitado** (comunicação entre frontend e APIs)
✅ **Cupons de desconto** (4 cupons funcionais)
✅ **Cálculo de frete** (grátis acima de R$ 200)
✅ **Filtro por categoria** (querystring)

### 7. Dicas de Desenvolvimento

- Para ver todos os logs, abra o Console do navegador (F12)
- Para editar produtos, modifique `catalog-api/data/products.json`
- Para limpar a sacola, delete `bag-api/data/bags.json` e reinicie a API
- Para testar sem internet, o sistema funciona 100% offline (exceto imagens placeholder)

### 8. Parar os Serviços

Para parar todos os serviços:
1. Vá em cada terminal
2. Pressione **Ctrl + C**

Ou feche o VS Code (os processos serão encerrados automaticamente).

---

**Pronto! O e-commerce está funcionando perfeitamente! 🎉**
