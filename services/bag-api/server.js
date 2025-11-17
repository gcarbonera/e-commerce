const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = 'bag-api-secret-key-2024';
const DB_PATH = path.join(__dirname, 'database.sqlite');

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Sacola de Compras',
      version: '1.0.0',
      description: 'API REST para gerenciamento de sacola de compras com autenticação JWT e banco SQLite',
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
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('✗ Erro ao criar tabela users:', err.message);
    } else {
      console.log('✓ Tabela users criada/verificada');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS bag_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('✗ Erro ao criar tabela bag_items:', err.message);
    } else {
      console.log('✓ Tabela bag_items criada/verificada');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS coupons (
      code TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      value REAL NOT NULL,
      description TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('✗ Erro ao criar tabela coupons:', err.message);
    } else {
      console.log('✓ Tabela coupons criada/verificada');
      seedCoupons();
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS user_coupons (
      user_email TEXT PRIMARY KEY,
      coupon_code TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
      FOREIGN KEY (coupon_code) REFERENCES coupons(code)
    )
  `, (err) => {
    if (err) {
      console.error('✗ Erro ao criar tabela user_coupons:', err.message);
    } else {
      console.log('✓ Tabela user_coupons criada/verificada');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS user_addresses (
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
  `, (err) => {
    if (err) {
      console.error('✗ Erro ao criar tabela user_addresses:', err.message);
    } else {
      console.log('✓ Tabela user_addresses criada/verificada');
    }
  });
}

function calculateShipping(cep, subtotal) {

  const cleanCep = cep.replace(/\D/g, '');
  
  if (cleanCep.length !== 8) {
    return { error: 'CEP inválido' };
  }

  const region = parseInt(cleanCep.substring(0, 2));
  
  let shippingCost = 0;
  let estimatedDays = 0;
  let regionName = '';

  if (region >= 1 && region <= 9) {

    shippingCost = 15.90;
    estimatedDays = 2;
    regionName = 'São Paulo - SP';
  } else if (region >= 10 && region <= 19) {

    shippingCost = 22.90;
    estimatedDays = 3;
    regionName = 'Interior de São Paulo';
  } else if (region >= 20 && region <= 28) {

    shippingCost = 19.90;
    estimatedDays = 3;
    regionName = 'Rio de Janeiro - RJ';
  } else if (region >= 30 && region <= 39) {

    shippingCost = 25.90;
    estimatedDays = 4;
    regionName = 'Minas Gerais';
  } else if (region >= 40 && region <= 48) {

    shippingCost = 32.90;
    estimatedDays = 5;
    regionName = 'Bahia';
  } else if (region >= 50 && region <= 56) {

    shippingCost = 35.90;
    estimatedDays = 6;
    regionName = 'Pernambuco';
  } else if (region >= 60 && region <= 63) {

    shippingCost = 38.90;
    estimatedDays = 6;
    regionName = 'Ceará';
  } else if (region >= 69 && region <= 69) {

    shippingCost = 45.90;
    estimatedDays = 8;
    regionName = 'Região Norte';
  } else if (region >= 70 && region <= 73) {

    shippingCost = 28.90;
    estimatedDays = 4;
    regionName = 'Brasília/Goiás';
  } else if (region >= 80 && region <= 87) {

    shippingCost = 26.90;
    estimatedDays = 4;
    regionName = 'Paraná';
  } else if (region >= 88 && region <= 89) {

    shippingCost = 29.90;
    estimatedDays = 5;
    regionName = 'Santa Catarina';
  } else if (region >= 90 && region <= 99) {

    shippingCost = 31.90;
    estimatedDays = 5;
    regionName = 'Rio Grande do Sul';
  } else {

    shippingCost = 35.90;
    estimatedDays = 7;
    regionName = 'Outras regiões';
  }

  if (subtotal >= 200) {
    return {
      cost: 0,
      estimatedDays,
      regionName,
      originalCost: shippingCost,
      freeShipping: true
    };
  }

  return {
    cost: shippingCost,
    estimatedDays,
    regionName,
    freeShipping: false
  };
}

function seedCoupons() {
  db.get('SELECT COUNT(*) as count FROM coupons', (err, row) => {
    if (err || row.count > 0) return;

    const coupons = [
      { code: 'DESC10', type: 'percentage', value: 10, description: '10% de desconto' },
      { code: 'DESC20', type: 'percentage', value: 20, description: '20% de desconto' },
      { code: 'FRETE', type: 'fixed', value: 15.90, description: 'Frete grátis' },
      { code: 'BEM-VINDO', type: 'fixed', value: 50, description: 'R$ 50 de desconto' }
    ];

    const stmt = db.prepare('INSERT INTO coupons (code, type, value, description) VALUES (?, ?, ?, ?)');
    coupons.forEach(c => stmt.run(c.code, c.type, c.value, c.description));
    stmt.finalize(() => console.log('✓ Cupons populados'));
  });
}

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
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API funcionando
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'bag-api',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login via email
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
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *       400:
 *         description: Email inválido
 */
app.post('/login', (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: 'Email inválido'
    });
  }

  db.run('INSERT OR IGNORE INTO users (email) VALUES (?)', [email], (err) => {
    if (err) {
      console.error('✗ Erro ao criar usuário:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Erro no login'
      });
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
    
    console.log(`✓ Login bem-sucedido: ${email}`);
    res.status(200).json({
      success: true,
      data: { token, email, expiresIn: '24h' }
    });
  });
});

/**
 * @swagger
 * /sacola:
 *   get:
 *     summary: Recuperar sacola do usuário
 *     tags: [Sacola]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sacola recuperada
 *       401:
 *         description: Não autenticado
 */
app.get('/sacola', authenticateToken, (req, res) => {
  const { email } = req.user;

  db.all('SELECT * FROM bag_items WHERE user_email = ?', [email], (err, items) => {
    if (err) {
      console.error('✗ Erro ao buscar itens:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar sacola'
      });
    }

    db.get('SELECT * FROM user_addresses WHERE user_email = ? AND is_default = 1 ORDER BY created_at DESC LIMIT 1', [email], (err, address) => {
      if (err) {
        console.error('✗ Erro ao buscar endereço:', err.message);
      }

      db.get('SELECT c.* FROM user_coupons uc JOIN coupons c ON uc.coupon_code = c.code WHERE uc.user_email = ?', [email], (err, coupon) => {
        if (err) {
          console.error('✗ Erro ao buscar cupom:', err.message);
        }

        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        let shipping = 15.90; // Padrão
        let shippingInfo = null;
        
        if (address && address.cep) {
          const calculatedShipping = calculateShipping(address.cep, subtotal);
          shipping = calculatedShipping.cost;
          shippingInfo = calculatedShipping;
        } else if (subtotal >= 200) {
          shipping = 0;
        }
        
        let discount = 0;
        if (coupon) {
          if (coupon.type === 'percentage') {
            discount = subtotal * (coupon.value / 100);
          } else if (coupon.type === 'fixed') {
            discount = coupon.value;
          }
        }

        const total = subtotal + shipping - discount;

        console.log(`✓ Sacola recuperada: ${email} (${items.length} itens)`);
        res.status(200).json({
          success: true,
          data: {
            items,
            address: address || null,
            shippingInfo,
            coupon: coupon || null,
            summary: {
              subtotal: parseFloat(subtotal.toFixed(2)),
              shipping: parseFloat(shipping.toFixed(2)),
              discount: parseFloat(discount.toFixed(2)),
              total: parseFloat(total.toFixed(2))
            }
          }
        });
      });
    });
  });
});

/**
 * @swagger
 * /sacola/items:
 *   post:
 *     summary: Adicionar item à sacola
 *     tags: [Sacola]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item adicionado
 */
app.post('/sacola/items', authenticateToken, (req, res) => {
  const { email } = req.user;
  const { productId, name, price, quantity, image } = req.body;

  if (!productId || !name || !price || !quantity) {
    return res.status(400).json({
      success: false,
      error: 'Dados incompletos do produto'
    });
  }

  db.get('SELECT * FROM bag_items WHERE user_email = ? AND product_id = ?', [email, productId], (err, existing) => {
    if (err) {
      console.error('✗ Erro ao verificar item:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Erro ao adicionar item'
      });
    }

    if (existing) {

      const newQuantity = existing.quantity + quantity;
      db.run('UPDATE bag_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newQuantity, existing.id], (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Erro ao atualizar item'
          });
        }

        console.log(`✓ Quantidade atualizada: produto ${productId}`);
        res.status(200).json({
          success: true,
          message: 'Quantidade atualizada'
        });
      });
    } else {

      db.run(
        'INSERT INTO bag_items (user_email, product_id, name, price, quantity, image) VALUES (?, ?, ?, ?, ?, ?)',
        [email, productId, name, price, quantity, image],
        function(err) {
          if (err) {
            console.error('✗ Erro ao inserir item:', err.message);
            return res.status(500).json({
              success: false,
              error: 'Erro ao adicionar item'
            });
          }

          console.log(`✓ Item adicionado: ${name}`);
          res.status(201).json({
            success: true,
            message: 'Item adicionado à sacola'
          });
        }
      );
    }
  });
});

/**
 * @swagger
 * /sacola/items/{itemId}:
 *   put:
 *     summary: Atualizar quantidade
 *     tags: [Sacola]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Quantidade atualizada
 */
app.put('/sacola/items/:itemId', authenticateToken, (req, res) => {
  const { email } = req.user;
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({
      success: false,
      error: 'Quantidade inválida'
    });
  }

  db.run(
    'UPDATE bag_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_email = ?',
    [quantity, itemId, email],
    function(err) {
      if (err) {
        console.error('✗ Erro ao atualizar:', err.message);
        return res.status(500).json({
          success: false,
          error: 'Erro ao atualizar item'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          error: 'Item não encontrado'
        });
      }

      console.log(`✓ Quantidade atualizada: item ${itemId}`);
      res.status(200).json({
        success: true,
        message: 'Quantidade atualizada'
      });
    }
  );
});

/**
 * @swagger
 * /sacola/items/{itemId}:
 *   delete:
 *     summary: Remover item
 *     tags: [Sacola]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item removido
 */
app.delete('/sacola/items/:itemId', authenticateToken, (req, res) => {
  const { email } = req.user;
  const { itemId } = req.params;

  db.run('DELETE FROM bag_items WHERE id = ? AND user_email = ?', [itemId, email], function(err) {
    if (err) {
      console.error('✗ Erro ao remover:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Erro ao remover item'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Item não encontrado'
      });
    }

    console.log(`✓ Item removido: ${itemId}`);
    res.status(200).json({
      success: true,
      message: 'Item removido'
    });
  });
});

/**
 * @swagger
 * /sacola/coupon:
 *   post:
 *     summary: Aplicar cupom
 *     tags: [Sacola]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cupom aplicado
 */
app.post('/sacola/coupon', authenticateToken, (req, res) => {
  const { email } = req.user;
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: 'Código do cupom não fornecido'
    });
  }

  db.get('SELECT * FROM coupons WHERE code = ?', [code.toUpperCase()], (err, coupon) => {
    if (err || !coupon) {
      return res.status(400).json({
        success: false,
        error: 'Cupom inválido'
      });
    }

    db.run(
      'INSERT OR REPLACE INTO user_coupons (user_email, coupon_code) VALUES (?, ?)',
      [email, coupon.code],
      (err) => {
        if (err) {
          console.error('✗ Erro ao aplicar cupom:', err.message);
          return res.status(500).json({
            success: false,
            error: 'Erro ao aplicar cupom'
          });
        }

        console.log(`✓ Cupom aplicado: ${code}`);
        res.status(200).json({
          success: true,
          data: { coupon },
          message: 'Cupom aplicado com sucesso'
        });
      }
    );
  });
});

/**
 * @swagger
 * /sacola/coupon:
 *   delete:
 *     summary: Remover cupom
 *     tags: [Sacola]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cupom removido
 */
app.delete('/sacola/coupon', authenticateToken, (req, res) => {
  const { email } = req.user;

  db.run('DELETE FROM user_coupons WHERE user_email = ?', [email], (err) => {
    if (err) {
      console.error('✗ Erro ao remover cupom:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Erro ao remover cupom'
      });
    }

    console.log(`✓ Cupom removido: ${email}`);
    res.status(200).json({
      success: true,
      message: 'Cupom removido'
    });
  });
});

/**
 * @swagger
 * /sacola/endereco:
 *   post:
 *     summary: Adicionar/atualizar endereço de entrega
 *     tags: [Endereço]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cep
 *             properties:
 *               cep:
 *                 type: string
 *                 example: "01310-100"
 *               logradouro:
 *                 type: string
 *                 example: "Avenida Paulista"
 *               numero:
 *                 type: string
 *                 example: "1578"
 *               complemento:
 *                 type: string
 *                 example: "Apto 101"
 *               bairro:
 *                 type: string
 *                 example: "Bela Vista"
 *               cidade:
 *                 type: string
 *                 example: "São Paulo"
 *               estado:
 *                 type: string
 *                 example: "SP"
 *     responses:
 *       200:
 *         description: Endereço salvo com sucesso
 */
app.post('/sacola/endereco', authenticateToken, (req, res) => {
  const { email } = req.user;
  const { cep, logradouro, numero, complemento, bairro, cidade, estado } = req.body;

  if (!cep) {
    return res.status(400).json({
      success: false,
      error: 'CEP é obrigatório'
    });
  }

  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) {
    return res.status(400).json({
      success: false,
      error: 'CEP inválido. Deve conter 8 dígitos'
    });
  }

  db.all('SELECT * FROM bag_items WHERE user_email = ?', [email], (err, items) => {
    if (err) {
      console.error('✗ Erro ao buscar itens:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Erro ao calcular frete'
      });
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingInfo = calculateShipping(cleanCep, subtotal);

    if (shippingInfo.error) {
      return res.status(400).json({
        success: false,
        error: shippingInfo.error
      });
    }

    db.run('UPDATE user_addresses SET is_default = 0 WHERE user_email = ?', [email], (err) => {
      if (err) {
        console.error('✗ Erro ao atualizar endereços:', err.message);
      }

      db.run(
        `INSERT INTO user_addresses (user_email, cep, logradouro, numero, complemento, bairro, cidade, estado, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [email, cleanCep, logradouro, numero, complemento, bairro, cidade, estado],
        function(err) {
          if (err) {
            console.error('✗ Erro ao salvar endereço:', err.message);
            return res.status(500).json({
              success: false,
              error: 'Erro ao salvar endereço'
            });
          }

          console.log(`✓ Endereço salvo: ${email} - CEP ${cleanCep}`);
          res.status(200).json({
            success: true,
            data: {
              id: this.lastID,
              cep: cleanCep,
              logradouro,
              numero,
              complemento,
              bairro,
              cidade,
              estado,
              shipping: shippingInfo
            },
            message: 'Endereço salvo com sucesso'
          });
        }
      );
    });
  });
});

/**
 * @swagger
 * /sacola/endereco:
 *   get:
 *     summary: Buscar endereço de entrega
 *     tags: [Endereço]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Endereço encontrado
 */
app.get('/sacola/endereco', authenticateToken, (req, res) => {
  const { email } = req.user;

  db.get('SELECT * FROM user_addresses WHERE user_email = ? AND is_default = 1 ORDER BY created_at DESC LIMIT 1', [email], (err, address) => {
    if (err) {
      console.error('✗ Erro ao buscar endereço:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar endereço'
      });
    }

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Nenhum endereço cadastrado'
      });
    }

    db.all('SELECT * FROM bag_items WHERE user_email = ?', [email], (err, items) => {
      if (err) {
        console.error('✗ Erro ao buscar itens:', err.message);
        return res.status(500).json({
          success: false,
          error: 'Erro ao calcular frete'
        });
      }

      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingInfo = calculateShipping(address.cep, subtotal);

      res.status(200).json({
        success: true,
        data: {
          ...address,
          shipping: shippingInfo
        }
      });
    });
  });
});

/**
 * @swagger
 * /sacola/frete:
 *   post:
 *     summary: Calcular frete por CEP
 *     tags: [Frete]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cep
 *             properties:
 *               cep:
 *                 type: string
 *                 example: "01310-100"
 *     responses:
 *       200:
 *         description: Frete calculado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     cost:
 *                       type: number
 *                     estimatedDays:
 *                       type: integer
 *                     regionName:
 *                       type: string
 *                     freeShipping:
 *                       type: boolean
 */
app.post('/sacola/frete', authenticateToken, (req, res) => {
  const { email } = req.user;
  const { cep } = req.body;

  if (!cep) {
    return res.status(400).json({
      success: false,
      error: 'CEP é obrigatório'
    });
  }

  db.all('SELECT * FROM bag_items WHERE user_email = ?', [email], (err, items) => {
    if (err) {
      console.error('✗ Erro ao buscar itens:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Erro ao calcular frete'
      });
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingInfo = calculateShipping(cep, subtotal);

    if (shippingInfo.error) {
      return res.status(400).json({
        success: false,
        error: shippingInfo.error
      });
    }

    console.log(`✓ Frete calculado: ${cep} - R$ ${shippingInfo.cost}`);
    res.status(200).json({
      success: true,
      data: {
        cep: cep.replace(/\D/g, ''),
        subtotal: parseFloat(subtotal.toFixed(2)),
        ...shippingInfo
      }
    });
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

app.use((err, req, res, next) => {
  console.error('✗ Erro não tratado:', err.message);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════');
  console.log(`🛒 API de Sacola rodando na porta ${PORT}`);
  console.log(`📦 Endpoints disponíveis:`);
  console.log(`   GET    http://localhost:${PORT}/health`);
  console.log(`   POST   http://localhost:${PORT}/login`);
  console.log(`   GET    http://localhost:${PORT}/sacola (autenticado)`);
  console.log(`   POST   http://localhost:${PORT}/sacola/items (autenticado)`);
  console.log(`   PUT    http://localhost:${PORT}/sacola/items/:id (autenticado)`);
  console.log(`   DELETE http://localhost:${PORT}/sacola/items/:id (autenticado)`);
  console.log(`   POST   http://localhost:${PORT}/sacola/coupon (autenticado)`);
  console.log(`   DELETE http://localhost:${PORT}/sacola/coupon (autenticado)`);
  console.log(`📚 Documentação Swagger: http://localhost:${PORT}/api-docs`);
  console.log('═══════════════════════════════════════════════════');
});

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

