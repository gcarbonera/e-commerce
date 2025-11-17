@echo off
chcp 65001 > nul
echo.
echo ═══════════════════════════════════════════════════
echo 🧪 Testando APIs do E-commerce
echo ═══════════════════════════════════════════════════
echo.

echo 1️⃣  Testando GET /health (Catálogo)...
curl -s http://localhost:3001/health
echo.
echo.

echo 2️⃣  Testando GET /health (Sacola)...
curl -s http://localhost:3002/health
echo.
echo.

echo 3️⃣  Testando GET /produtos (primeiros 3 produtos)...
curl -s "http://localhost:3001/produtos?limit=3"
echo.
echo.

echo 4️⃣  Testando GET /produtos/1 (produto específico)...
curl -s http://localhost:3001/produtos/1
echo.
echo.

echo 5️⃣  Testando filtro por categoria Eletrônicos...
curl -s "http://localhost:3001/produtos?categoria=Eletrônicos"
echo.
echo.

echo 6️⃣  Testando busca por 'smartphone'...
curl -s "http://localhost:3001/produtos?busca=smartphone"
echo.
echo.

echo 7️⃣  Testando POST /login (Sacola)...
curl -s -X POST http://localhost:3002/login -H "Content-Type: application/json" -d "{\"email\":\"teste@email.com\"}"
echo.
echo.

echo 8️⃣  Testando POST /auth/login (Catálogo)...
curl -s -X POST http://localhost:3001/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@catalog.com\"}"
echo.
echo.

echo ═══════════════════════════════════════════════════
echo ✅ Testes concluídos!
echo ═══════════════════════════════════════════════════
echo.
echo 📝 Para testar o frontend, acesse: http://localhost:5173
echo 📚 Documentação Swagger:
echo    - Catálogo: http://localhost:3001/api-docs
echo    - Sacola: http://localhost:3002/api-docs
echo.
