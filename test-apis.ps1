# Script de Testes das APIs
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🧪 Testando APIs do E-commerce" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Teste 1: Health Check - API de Catálogo
Write-Host "1️⃣  Testando GET /health (Catálogo)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get
    Write-Host "   ✓ Status: OK" -ForegroundColor Green
    Write-Host "   Service: $($response.service)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Erro: $_" -ForegroundColor Red
}
Write-Host ""

# Teste 2: Health Check - API de Sacola
Write-Host "2️⃣  Testando GET /health (Sacola)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/health" -Method Get
    Write-Host "   ✓ Status: OK" -ForegroundColor Green
    Write-Host "   Service: $($response.service)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Erro: $_" -ForegroundColor Red
}
Write-Host ""

# Teste 3: Listar Produtos
Write-Host "3️⃣  Testando GET /produtos (sem filtros)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/produtos" -Method Get
    Write-Host "   ✓ Produtos encontrados: $($response.data.Count)" -ForegroundColor Green
    Write-Host "   Página: $($response.pagination.page)/$($response.pagination.totalPages)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Erro: $_" -ForegroundColor Red
}
Write-Host ""

# Teste 4: Buscar produto por ID
Write-Host "4️⃣  Testando GET /produtos/1 ..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/produtos/1" -Method Get
    Write-Host "   ✓ Produto: $($response.data.name)" -ForegroundColor Green
    Write-Host "   Preço: R$ $($response.data.price)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Erro: $_" -ForegroundColor Red
}
Write-Host ""

# Teste 5: Filtro por categoria
Write-Host "5️⃣  Testando GET /produtos?categoria=Eletrônicos ..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/produtos?categoria=Eletrônicos" -Method Get
    Write-Host "   ✓ Produtos na categoria: $($response.data.Count)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Erro: $_" -ForegroundColor Red
}
Write-Host ""

# Teste 6: Busca por texto
Write-Host "6️⃣  Testando GET /produtos?busca=smartphone ..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/produtos?busca=smartphone" -Method Get
    Write-Host "   ✓ Resultados da busca: $($response.data.Count)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Erro: $_" -ForegroundColor Red
}
Write-Host ""

# Teste 7: Paginação
Write-Host "7️⃣  Testando GET /produtos?page=1&limit=3 ..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/produtos?page=1&limit=3" -Method Get
    Write-Host "   ✓ Produtos na página: $($response.data.Count)" -ForegroundColor Green
    Write-Host "   Limite: $($response.pagination.limit)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Erro: $_" -ForegroundColor Red
}
Write-Host ""

# Teste 8: Login na API de Catálogo (para admin)
Write-Host "8️⃣  Testando POST /auth/login (Catálogo)..." -ForegroundColor Yellow
try {
    $body = @{ email = "admin@catalog.com" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method Post -Body $body -ContentType "application/json"
    $catalogToken = $response.data.token
    Write-Host "   ✓ Token gerado com sucesso" -ForegroundColor Green
    Write-Host "   Email: $($response.data.email)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Erro: $_" -ForegroundColor Red
}
Write-Host ""

# Teste 9: Login na API de Sacola
Write-Host "9️⃣  Testando POST /login (Sacola)..." -ForegroundColor Yellow
try {
    $body = @{ email = "teste@email.com" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:3002/login" -Method Post -Body $body -ContentType "application/json"
    $bagToken = $response.data.token
    Write-Host "   ✓ Token gerado com sucesso" -ForegroundColor Green
    Write-Host "   Email: $($response.data.email)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Erro: $_" -ForegroundColor Red
}
Write-Host ""

# Teste 10: Criar produto (autenticado)
if ($catalogToken) {
    Write-Host "🔟 Testando POST /produtos (criar produto autenticado)..." -ForegroundColor Yellow
    try {
        $headers = @{ Authorization = "Bearer $catalogToken" }
        $body = @{
            name = "Produto Teste via Script"
            description = "Produto criado pelo script de testes"
            price = 149.90
            category = "Testes"
            stock = 5
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:3001/produtos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
        $newProductId = $response.data.id
        Write-Host "   ✓ Produto criado com ID: $newProductId" -ForegroundColor Green
        Write-Host "   Nome: $($response.data.name)" -ForegroundColor Gray
    } catch {
        Write-Host "   ✗ Erro: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Teste 11: Buscar sacola (autenticado)
if ($bagToken) {
    Write-Host "1️⃣1️⃣  Testando GET /sacola (autenticado)..." -ForegroundColor Yellow
    try {
        $headers = @{ Authorization = "Bearer $bagToken" }
        $response = Invoke-RestMethod -Uri "http://localhost:3002/sacola" -Method Get -Headers $headers
        Write-Host "   ✓ Sacola recuperada" -ForegroundColor Green
        Write-Host "   Itens: $($response.data.items.Count)" -ForegroundColor Gray
        Write-Host "   Total: R$ $($response.data.summary.total)" -ForegroundColor Gray
    } catch {
        Write-Host "   ✗ Erro: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Teste 12: Adicionar item à sacola
if ($bagToken) {
    Write-Host "1️⃣2️⃣  Testando POST /sacola/items (adicionar item)..." -ForegroundColor Yellow
    try {
        $headers = @{ Authorization = "Bearer $bagToken" }
        $body = @{
            productId = 1
            name = "Smartphone Galaxy X"
            price = 2499.90
            quantity = 1
            image = "https://via.placeholder.com/400"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:3002/sacola/items" -Method Post -Headers $headers -Body $body -ContentType "application/json"
        Write-Host "   ✓ Item adicionado à sacola" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ Erro: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Teste 13: Aplicar cupom
if ($bagToken) {
    Write-Host "1️⃣3️⃣  Testando POST /sacola/coupon (aplicar cupom)..." -ForegroundColor Yellow
    try {
        $headers = @{ Authorization = "Bearer $bagToken" }
        $body = @{ code = "DESC10" } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:3002/sacola/coupon" -Method Post -Headers $headers -Body $body -ContentType "application/json"
        Write-Host "   ✓ Cupom aplicado: $($response.data.coupon.code)" -ForegroundColor Green
        Write-Host "   Descrição: $($response.data.coupon.description)" -ForegroundColor Gray
    } catch {
        Write-Host "   ✗ Erro: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Teste 14: Deletar produto criado (se existir)
if ($catalogToken -and $newProductId) {
    Write-Host "1️⃣4️⃣  Testando DELETE /produtos/$newProductId (deletar produto)..." -ForegroundColor Yellow
    try {
        $headers = @{ Authorization = "Bearer $catalogToken" }
        $response = Invoke-RestMethod -Uri "http://localhost:3001/produtos/$newProductId" -Method Delete -Headers $headers
        Write-Host "   ✓ Produto deletado: $($response.data.name)" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ Erro: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Teste 15: Validação - Page inválido
Write-Host "1️⃣5️⃣  Testando validação: page=0 (deve retornar erro 400)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/produtos?page=0" -Method Get
    Write-Host "   ✗ Deveria ter retornado erro 400" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "   ✓ Erro 400 retornado corretamente" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Status code inesperado: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}
Write-Host ""

# Teste 16: Validação - Limit muito alto
Write-Host "1️⃣6️⃣  Testando validação: limit=500 (deve retornar erro 400)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/produtos?limit=500" -Method Get
    Write-Host "   ✗ Deveria ter retornado erro 400" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "   ✓ Erro 400 retornado corretamente" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Status code inesperado: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}
Write-Host ""

# Teste 17: Produto não existente
Write-Host "1️⃣7️⃣  Testando GET /produtos/9999 (produto inexistente - deve retornar 404)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/produtos/9999" -Method Get
    Write-Host "   ✗ Deveria ter retornado erro 404" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "   ✓ Erro 404 retornado corretamente" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Status code inesperado: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Testes concluídos!" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Para testar o frontend, acesse: http://localhost:5173" -ForegroundColor Yellow
Write-Host "📚 Documentação Swagger:" -ForegroundColor Yellow
Write-Host "   - Catálogo: http://localhost:3001/api-docs" -ForegroundColor Gray
Write-Host "   - Sacola: http://localhost:3002/api-docs" -ForegroundColor Gray
