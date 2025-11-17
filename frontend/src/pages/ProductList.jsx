import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const API_URL = 'http://localhost:3001'

function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  
  const selectedCategory = searchParams.get('categoria') || ''
  const currentPage = parseInt(searchParams.get('page') || '1')
  const searchQuery = searchParams.get('busca') || ''

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, currentPage, searchQuery])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (selectedCategory) params.append('categoria', selectedCategory)
      if (searchQuery) params.append('busca', searchQuery)
      params.append('page', currentPage)
      params.append('limit', '10')
      
      const url = `${API_URL}/produtos?${params.toString()}`
      
      console.log(`🔍 Buscando produtos: ${url}`)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data)
        setPagination(data.pagination)
        console.log(`✓ ${data.data.length} produtos carregados (página ${data.pagination.page})`)
      } else {
        throw new Error(data.error || 'Erro ao carregar produtos')
      }
    } catch (err) {
      console.error('✗ Erro ao buscar produtos:', err)
      setError('Não foi possível carregar os produtos. Verifique se a API está rodando.')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (e) => {
    const value = e.target.value
    const newParams = {}
    if (value) newParams.categoria = value
    if (searchQuery) newParams.busca = searchQuery
    setSearchParams(newParams)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    const newParams = {}
    if (selectedCategory) newParams.categoria = selectedCategory
    if (value) newParams.busca = value
    setSearchParams(newParams)
  }

  const handlePageChange = (page) => {
    const newParams = { page: page.toString() }
    if (selectedCategory) newParams.categoria = selectedCategory
    if (searchQuery) newParams.busca = searchQuery
    setSearchParams(newParams)
  }

  const categories = ['Eletrônicos', 'Roupas', 'Livros', 'Acessórios']

  if (loading) {
    return (
      <div className="loading" role="status" aria-live="polite">
        <p>Carregando produtos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error" role="alert">
        <p>{error}</p>
        <button onClick={fetchProducts} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <section aria-labelledby="products-title">
      <h1 id="products-title">Produtos</h1>

      <div className="filter-section">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label htmlFor="search-input" style={{ marginRight: '0.5rem' }}>Buscar:</label>
            <input
              type="text"
              id="search-input"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Nome ou descrição..."
              style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '6px' }}
              aria-label="Buscar produtos"
            />
          </div>
          
          <div>
            <label htmlFor="category-filter" style={{ marginRight: '0.5rem' }}>Categoria:</label>
            <select 
              id="category-filter"
              value={selectedCategory}
              onChange={handleCategoryChange}
              aria-label="Selecione uma categoria para filtrar"
            >
              <option value="">Todas as categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <h2>Nenhum produto encontrado</h2>
          <p>Tente ajustar os filtros ou fazer outra busca</p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map(product => {

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
                <article key={product.id} className="product-card">
                  <Link to={`/produtos/${product.id}`} aria-label={`Ver detalhes de ${product.name}`}>
                    <div style={{
                      width: '100%',
                      height: '300px',
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '80px',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      {emoji}
                    </div>
                    <div className="product-info">
                      <p className="product-category">{product.category}</p>
                      <h3>{product.name}</h3>
                      <p className="product-price">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="btn btn-secondary"
                style={{ opacity: pagination.hasPrev ? 1 : 0.5 }}
                aria-label="Página anterior"
              >
                ← Anterior
              </button>
              
              <span aria-label={`Página ${pagination.page} de ${pagination.totalPages}`}>
                Página {pagination.page} de {pagination.totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="btn btn-secondary"
                style={{ opacity: pagination.hasNext ? 1 : 0.5 }}
                aria-label="Próxima página"
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default ProductList

