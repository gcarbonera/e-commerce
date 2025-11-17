import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

const CATALOG_API = 'http://localhost:3001'
const BAG_API = 'http://localhost:3002'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingToBag, setAddingToBag] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log(`🔍 Buscando produto ${id}`)
      const response = await fetch(`${CATALOG_API}/produtos/${id}`)
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setProduct(data.data)
        console.log(`✓ Produto carregado: ${data.data.name}`)
      } else {
        throw new Error(data.error || 'Produto não encontrado')
      }
    } catch (err) {
      console.error('✗ Erro ao buscar produto:', err)
      setError('Não foi possível carregar o produto.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToBag = async () => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      console.log('⚠️ Usuário não autenticado, redirecionando para login')
      navigate('/sacola/login')
      return
    }

    try {
      setAddingToBag(true)
      setError(null)
      setSuccessMessage('')

      console.log(`🛒 Adicionando produto ${product.id} à sacola`)

      const response = await fetch(`${BAG_API}/sacola/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccessMessage('Produto adicionado à sacola com sucesso!')
        console.log(`✓ Produto adicionado à sacola`)

        const bagItems = JSON.parse(localStorage.getItem('bagItems') || '[]')
        const existingIndex = bagItems.findIndex(item => item.productId === product.id)
        
        if (existingIndex >= 0) {
          bagItems[existingIndex].quantity += 1
        } else {
          bagItems.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image
          })
        }
        
        localStorage.setItem('bagItems', JSON.stringify(bagItems))
        console.log('✓ Sacola sincronizada com localStorage')

        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        throw new Error(data.error || 'Erro ao adicionar produto')
      }
    } catch (err) {
      console.error('✗ Erro ao adicionar à sacola:', err)
      setError('Erro ao adicionar produto à sacola. Tente novamente.')
    } finally {
      setAddingToBag(false)
    }
  }

  if (loading) {
    return (
      <div className="loading" role="status" aria-live="polite">
        <p>Carregando produto...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="error" role="alert">
        <p>{error || 'Produto não encontrado'}</p>
        <Link to="/categorias" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Voltar para produtos
        </Link>
      </div>
    )
  }

  const categoryEmojis = {
    'Eletrônicos': '📱',
    'Roupas': '👕',
    'Moda': '👕',
    'Livros': '📚',
    'Acessórios': '🎒',
    'Casa': '🏠',
    'Esportes': '⚽'
  }
  const emoji = categoryEmojis[product.category] || '📦'

  return (
    <article className="product-detail">
      <div className="product-image">
        <div style={{
          width: '100%',
          height: '500px',
          backgroundColor: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '150px',
          borderRadius: '8px'
        }}>
          {emoji}
        </div>
      </div>

      <div className="product-details">
        <nav aria-label="Breadcrumb">
          <Link to="/categorias">Produtos</Link> / {product.category}
        </nav>

        <h1>{product.name}</h1>
        
        <p className="category">{product.category}</p>
        
        <p className="price">
          R$ {product.price.toFixed(2).replace('.', ',')}
        </p>

        <p className="description">{product.description}</p>

        <p className="stock">
          {product.stock > 0 
            ? `✓ Em estoque (${product.stock} unidades disponíveis)` 
            : '✗ Produto esgotado'
          }
        </p>

        {successMessage && (
          <div className="success" role="status" aria-live="polite">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        <button 
          onClick={handleAddToBag}
          disabled={addingToBag || product.stock === 0}
          className="btn btn-primary"
          style={{ marginRight: '1rem' }}
          aria-label="Adicionar produto à sacola"
        >
          {addingToBag ? 'Adicionando...' : 'Adicionar à Sacola'}
        </button>

        <Link to="/categorias" className="btn btn-secondary">
          Continuar Comprando
        </Link>
      </div>
    </article>
  )
}

export default ProductDetail

