const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'catalog-api-secret-key-2024';
const DB_PATH = path.join(__dirname, 'database.sqlite');

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Catálogo de Produtos',
      version: '1.0.0',
      description: 'API REST para gerenciamento de catálogo de produtos com autenticação JWT e banco SQLite',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Inicializar banco de dados
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('✗ Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('✓ Conectado ao banco de dados SQLite');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT,
      image TEXT,
      stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('✗ Erro ao criar tabela:', err.message);
    } else {
      console.log('✓ Tabela produtos criada/verificada');
      seedDatabase();
    }
  });
}

function seedDatabase() {
  db.get('SELECT COUNT(*) as count FROM produtos', (err, row) => {
    if (err) {
      console.error('✗ Erro ao verificar produtos:', err.message);
      return;
    }

    if (row.count === 0) {
      const produtos = [
        { name: 'Smartphone Galaxy X', description: 'Smartphone de última geração com câmera de 108MP, tela AMOLED 6.7" e bateria de longa duração.', price: 2499.90, category: 'Eletrônicos', image: 'https://via.placeholder.com/400x400?text=Smartphone', stock: 15 },
        { name: 'Notebook Pro 15', description: 'Notebook profissional com processador Intel i7, 16GB RAM, SSD 512GB. Ideal para trabalho e games.', price: 4999.00, category: 'Eletrônicos', image: 'https://via.placeholder.com/400x400?text=Notebook', stock: 8 },
        { name: 'Fone de Ouvido Bluetooth', description: 'Fone sem fio com cancelamento de ruído ativo, bateria de 30h e som Hi-Fi.', price: 399.90, category: 'Eletrônicos', image: 'https://via.placeholder.com/400x400?text=Fone', stock: 25 },
        { name: 'Camiseta Premium', description: 'Camiseta 100% algodão com corte moderno e alta qualidade. Disponível em várias cores.', price: 89.90, category: 'Roupas', image: 'https://via.placeholder.com/400x400?text=Camiseta', stock: 50 },
        { name: 'Tênis Esportivo Pro', description: 'Tênis para corrida com tecnologia de amortecimento avançada e design ergonômico.', price: 299.90, category: 'Roupas', image: 'https://via.placeholder.com/400x400?text=Tenis', stock: 20 },
        { name: 'Livro: Programação Web Moderna', description: 'Guia completo sobre desenvolvimento web com React, Node.js e APIs REST.', price: 79.90, category: 'Livros', image: 'https://via.placeholder.com/400x400?text=Livro', stock: 30 },
        { name: 'Mouse Gamer RGB', description: 'Mouse óptico com 7 botões programáveis, DPI ajustável até 16.000 e iluminação RGB.', price: 199.90, category: 'Eletrônicos', image: 'https://via.placeholder.com/400x400?text=Mouse', stock: 18 },
        { name: 'Mochila Executiva', description: 'Mochila com compartimento para notebook 15", tecido impermeável e design elegante.', price: 179.90, category: 'Acessórios', image: 'https://via.placeholder.com/400x400?text=Mochila', stock: 12 }
      ];

      const stmt = db.prepare('INSERT INTO produtos (name, description, price, category, image, stock) VALUES (?, ?, ?, ?, ?, ?)');
      
      produtos.forEach(produto => {
        stmt.run(produto.name, produto.description, produto.price, produto.category, produto.image, produto.stock);
      });

      stmt.finalize(() => {
        console.log('✓ Banco de dados populado com produtos iniciais');
      });
    } else {
      console.log(`✓ Banco já contém ${row.count} produtos`);
    }
  });
}

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('✗ Token não fornecido');
    return res.status(401).json({
      success: false,
      error: 'Token de autenticação não fornecido'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('✗ Token inválido ou expirado');
      return res.status(403).json({
        success: false,
        error: 'Token inválido ou expirado'
      });
    }

    req.user = user;
    next();
  });
}

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Verifica se a API está funcionando
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API funcionando normalmente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: catalog-api
 *                 timestamp:
 *                   type: string
 *                   example: 2024-01-01T00:00:00.000Z
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'catalog-api',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login de administrador
 *     description: Gera token JWT para acesso às rotas autenticadas
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@catalog.com
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *       400:
 *         description: Email não fornecido
 */
app.post('/auth/login', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email é obrigatório'
    });
  }

  const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  
  console.log(`✓ Login bem-sucedido: ${email}`);
  res.status(200).json({
    success: true,
    data: { token, email }
  });
});

/**
 * @swagger
 * /produtos:
 *   get:
 *     summary: Lista produtos com filtros e paginação
 *     description: Retorna lista de produtos com suporte a busca, filtro por categoria e paginação
 *     tags: [Produtos]
 *     parameters:
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *         description: Busca por nome ou descrição
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoria
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de produtos
 *       400:
 *         description: Parâmetros inválidos
 */
app.get('/produtos', (req, res) => {
  try {
    const { busca, categoria, page = 1, limit = 10 } = req.query;

    // Validações
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetro "page" deve ser um número maior que 0'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetro "limit" deve ser um número entre 1 e 100'
      });
    }

    const offset = (pageNum - 1) * limitNum;

    // Construir query
    let query = 'SELECT * FROM produtos WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM produtos WHERE 1=1';
    const params = [];
    const countParams = [];

    if (busca) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      countQuery += ' AND (name LIKE ? OR description LIKE ?)';
      const searchPattern = `%${busca}%`;
      params.push(searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern);
    }

    if (categoria) {
      query += ' AND category = ?';
      countQuery += ' AND category = ?';
      params.push(categoria);
      countParams.push(categoria);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    // Buscar total de registros
    db.get(countQuery, countParams, (err, countRow) => {
      if (err) {
        console.error('✗ Erro ao contar produtos:', err.message);
        return res.status(500).json({
          success: false,
          error: 'Erro ao buscar produtos'
        });
      }

      const total = countRow.total;
      const totalPages = Math.ceil(total / limitNum);

      // Buscar produtos
      db.all(query, params, (err, rows) => {
        if (err) {
          console.error('✗ Erro ao buscar produtos:', err.message);
          return res.status(500).json({
            success: false,
            error: 'Erro ao buscar produtos'
          });
        }

        console.log(`✓ Retornando ${rows.length} produtos (página ${pageNum}/${totalPages})`);
        res.status(200).json({
          success: true,
          data: rows,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
          }
        });
      });
    });
  } catch (error) {
    console.error('✗ Erro inesperado:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /produtos/{id}:
 *   get:
 *     summary: Detalhes de um produto
 *     description: Retorna informações detalhadas de um produto específico
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 */
app.get('/produtos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    db.get('SELECT * FROM produtos WHERE id = ?', [productId], (err, row) => {
      if (err) {
        console.error('✗ Erro ao buscar produto:', err.message);
        return res.status(500).json({
          success: false,
          error: 'Erro ao buscar produto'
        });
      }

      if (!row) {
        console.log(`✗ Produto ${productId} não encontrado`);
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado'
        });
      }

      console.log(`✓ Produto ${productId} encontrado: ${row.name}`);
      res.status(200).json({
        success: true,
        data: row
      });
    });
  } catch (error) {
    console.error('✗ Erro inesperado:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /produtos:
 *   post:
 *     summary: Criar novo produto (Autenticado)
 *     description: Cria um novo produto no catálogo
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Produto Teste
 *               description:
 *                 type: string
 *                 example: Descrição do produto
 *               price:
 *                 type: number
 *                 example: 99.90
 *               category:
 *                 type: string
 *                 example: Eletrônicos
 *               image:
 *                 type: string
 *                 example: https://via.placeholder.com/400
 *               stock:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Token inválido
 */
app.post('/produtos', authenticateToken, (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Validações
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        error: 'Nome e preço são obrigatórios'
      });
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return res.status(400).json({
        success: false,
        error: 'Preço deve ser um número positivo'
      });
    }

    if (stock !== undefined && (isNaN(parseInt(stock)) || parseInt(stock) < 0)) {
      return res.status(400).json({
        success: false,
        error: 'Estoque deve ser um número não negativo'
      });
    }

    const query = `
      INSERT INTO produtos (name, description, price, category, image, stock)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [
      name,
      description || null,
      parseFloat(price),
      category || null,
      image || null,
      stock !== undefined ? parseInt(stock) : 0
    ], function(err) {
      if (err) {
        console.error('✗ Erro ao criar produto:', err.message);
        return res.status(500).json({
          success: false,
          error: 'Erro ao criar produto'
        });
      }

      const newId = this.lastID;
      
      db.get('SELECT * FROM produtos WHERE id = ?', [newId], (err, row) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Produto criado mas erro ao recuperar'
          });
        }

        console.log(`✓ Produto criado: ${name} (ID: ${newId})`);
        res.status(201).json({
          success: true,
          data: row,
          message: 'Produto criado com sucesso'
        });
      });
    });
  } catch (error) {
    console.error('✗ Erro inesperado:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /produtos/{id}:
 *   delete:
 *     summary: Deletar produto (Autenticado)
 *     description: Remove um produto do catálogo
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso
 *       404:
 *         description: Produto não encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Token inválido
 */
app.delete('/produtos/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    // Verificar se produto existe
    db.get('SELECT * FROM produtos WHERE id = ?', [productId], (err, row) => {
      if (err) {
        console.error('✗ Erro ao buscar produto:', err.message);
        return res.status(500).json({
          success: false,
          error: 'Erro ao buscar produto'
        });
      }

      if (!row) {
        console.log(`✗ Produto ${productId} não encontrado`);
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado'
        });
      }

      // Deletar produto
      db.run('DELETE FROM produtos WHERE id = ?', [productId], function(err) {
        if (err) {
          console.error('✗ Erro ao deletar produto:', err.message);
          return res.status(500).json({
            success: false,
            error: 'Erro ao deletar produto'
          });
        }

        console.log(`✓ Produto ${productId} deletado: ${row.name}`);
        res.status(200).json({
          success: true,
          message: 'Produto deletado com sucesso',
          data: row
        });
      });
    });
  } catch (error) {
    console.error('✗ Erro inesperado:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('✗ Erro não tratado:', err.message);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════');
  console.log(`🚀 API de Catálogo rodando na porta ${PORT}`);
  console.log(`📦 Endpoints disponíveis:`);
  console.log(`   GET    http://localhost:${PORT}/health`);
  console.log(`   POST   http://localhost:${PORT}/auth/login`);
  console.log(`   GET    http://localhost:${PORT}/produtos`);
  console.log(`   GET    http://localhost:${PORT}/produtos/:id`);
  console.log(`   POST   http://localhost:${PORT}/produtos (autenticado)`);
  console.log(`   DELETE http://localhost:${PORT}/produtos/:id (autenticado)`);
  console.log(`📚 Documentação Swagger: http://localhost:${PORT}/api-docs`);
  console.log('═══════════════════════════════════════════════════');
});

// Fechar banco de dados ao encerrar
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('✗ Erro ao fechar banco:', err.message);
    } else {
      console.log('✓ Banco de dados fechado');
    }
    process.exit(0);
  });
});
