import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const BAG_API = 'http://localhost:3002'

function Bag() {
  const [bagData, setBagData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [cep, setCep] = useState('')
  const [calculatingShipping, setCalculatingShipping] = useState(false)
  const [shippingError, setShippingError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('⚠️ Usuário não autenticado, redirecionando para login')
      navigate('/sacola/login')
      return
    }

    fetchBag()
  }, [navigate])

  const fetchBag = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/sacola/login')
        return
      }

      console.log('🛒 Buscando sacola do usuário')

      const response = await fetch(`${BAG_API}/sacola`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401 || response.status === 403) {
        console.log('✗ Token inválido ou expirado')
        localStorage.removeItem('token')
        localStorage.removeItem('userEmail')
        navigate('/sacola/login')
        return
      }

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setBagData(data.data)
        console.log(`✓ Sacola carregada: ${data.data.items.length} itens`)

        localStorage.setItem('bagItems', JSON.stringify(data.data.items))
      } else {
        throw new Error(data.error || 'Erro ao carregar sacola')
      }
    } catch (err) {
      console.error('✗ Erro ao buscar sacola:', err)
      setError('Erro ao carregar sacola. Tentando carregar do localStorage...')

      const localItems = JSON.parse(localStorage.getItem('bagItems') || '[]')
      if (localItems.length > 0) {
        console.log('✓ Sacola carregada do localStorage (fallback)')
        setBagData({
          items: localItems,
          coupon: null,
          summary: calculateLocalSummary(localItems)
        })
        setError(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const calculateLocalSummary = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const shipping = subtotal > 200 ? 0 : 15.90
    const total = subtotal + shipping
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      discount: 0,
      total: parseFloat(total.toFixed(2))
    }
  }

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      const token = localStorage.getItem('token')
      
      console.log(`📝 Atualizando quantidade do item ${itemId} para ${newQuantity}`)

      const response = await fetch(`${BAG_API}/sacola/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✓ Quantidade atualizada')
        fetchBag() // Recarregar sacola
      } else {
        throw new Error(data.error || 'Erro ao atualizar quantidade')
      }
    } catch (err) {
      console.error('✗ Erro ao atualizar quantidade:', err)
      setError('Erro ao atualizar quantidade')
    }
  }

  const handleRemoveItem = async (itemId) => {
    if (!confirm('Deseja remover este item da sacola?')) return

    try {
      const token = localStorage.getItem('token')
      
      console.log(`🗑️ Removendo item ${itemId}`)

      const response = await fetch(`${BAG_API}/sacola/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✓ Item removido')
        fetchBag() // Recarregar sacola
      } else {
        throw new Error(data.error || 'Erro ao remover item')
      }
    } catch (err) {
      console.error('✗ Erro ao remover item:', err)
      setError('Erro ao remover item')
    }
  }

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    
    if (!couponCode.trim()) {
      return
    }

    try {
      setApplyingCoupon(true)
      setError(null)

      const token = localStorage.getItem('token')
      
      console.log(`🎟️ Aplicando cupom: ${couponCode}`)

      const response = await fetch(`${BAG_API}/sacola/coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: couponCode })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log(`✓ Cupom aplicado: ${data.data.coupon.description}`)
        setCouponCode('')
        fetchBag() // Recarregar sacola
      } else {
        throw new Error(data.error || 'Cupom inválido')
      }
    } catch (err) {
      console.error('✗ Erro ao aplicar cupom:', err)
      setError(err.message || 'Erro ao aplicar cupom')
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = async () => {
    try {
      const token = localStorage.getItem('token')
      
      console.log('🗑️ Removendo cupom')

      const response = await fetch(`${BAG_API}/sacola/coupon`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✓ Cupom removido')
        fetchBag() // Recarregar sacola
      }
    } catch (err) {
      console.error('✗ Erro ao remover cupom:', err)
    }
  }

  const formatCep = (value) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 5) return numbers
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
  }

  const handleCepChange = (e) => {
    const formatted = formatCep(e.target.value)
    setCep(formatted)
  }

  const handleCalculateShipping = async (e) => {
    e.preventDefault()
    
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      setShippingError('CEP deve ter 8 dígitos')
      return
    }

    try {
      setCalculatingShipping(true)
      setShippingError('')

      const token = localStorage.getItem('token')
      
      console.log(`📍 Calculando frete para CEP: ${cep}`)

      const response = await fetch(`${BAG_API}/sacola/frete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cep: cleanCep })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log(`✓ Frete calculado: R$ ${data.data.cost} - ${data.data.regionName}`)

        setBagData(prev => ({
          ...prev,
          shippingInfo: data.data,
          summary: {
            ...prev.summary,
            shipping: data.data.cost
          }
        }))
      } else {
        throw new Error(data.error || 'Erro ao calcular frete')
      }
    } catch (err) {
      console.error('✗ Erro ao calcular frete:', err)
      setShippingError(err.message || 'Erro ao calcular frete')
    } finally {
      setCalculatingShipping(false)
    }
  }

  if (loading) {
    return (
      <div className="loading" role="status" aria-live="polite">
        <p>Carregando sacola...</p>
      </div>
    )
  }

  if (!bagData || bagData.items.length === 0) {
    return (
      <div className="empty-state">
        <h1>Sua sacola está vazia</h1>
        <p>Adicione produtos para continuar comprando</p>
        <Link to="/categorias" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Ver Produtos
        </Link>
      </div>
    )
  }

  return (
    <section aria-labelledby="bag-title">
      <h1 id="bag-title">Minha Sacola</h1>

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      <div className="bag-container">
        <div className="bag-items">
          <h2>Itens ({bagData.items.length})</h2>
          
          {bagData.items.map(item => (
            <article key={item.id} className="bag-item">
              <img src={item.image} alt={item.name} />
              
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="item-price">
                  R$ {item.price.toFixed(2).replace('.', ',')}
                </p>
                
                <div className="quantity-controls">
                  <button 
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    aria-label="Diminuir quantidade"
                  >
                    -
                  </button>
                  <span aria-label={`Quantidade: ${item.quantity}`}>
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>

                <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                  Subtotal: R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                </p>
              </div>

              <button 
                onClick={() => handleRemoveItem(item.id)}
                className="btn btn-danger"
                aria-label={`Remover ${item.name} da sacola`}
              >
                Remover
              </button>
            </article>
          ))}
        </div>

        <aside className="bag-summary" aria-labelledby="summary-title">
          <h2 id="summary-title">Resumo do Pedido</h2>

          {/* Seção de Cálculo de Frete */}
          <div className="shipping-section" style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '1rem' }}>📍 Calcular Frete</h3>
            
            {bagData.shippingInfo && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#e0f2fe', borderRadius: '6px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  <strong>{bagData.shippingInfo.regionName}</strong>
                </p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  Entrega em {bagData.shippingInfo.estimatedDays} dias úteis
                </p>
                {bagData.shippingInfo.freeShipping && bagData.shippingInfo.originalCost && (
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>
                    Você economizou R$ {bagData.shippingInfo.originalCost.toFixed(2)}!
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleCalculateShipping} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={cep}
                onChange={handleCepChange}
                placeholder="00000-000"
                maxLength="9"
                style={{ 
                  flex: 1, 
                  padding: '0.5rem', 
                  border: '1px solid var(--border)', 
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}
                aria-label="Digite seu CEP"
              />
              <button 
                type="submit" 
                disabled={calculatingShipping}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                {calculatingShipping ? '...' : 'OK'}
              </button>
            </form>
            
            {shippingError && (
              <p style={{ margin: '0.5rem 0 0', color: 'var(--danger-color)', fontSize: '0.85rem' }}>
                {shippingError}
              </p>
            )}

            {!bagData.shippingInfo && (
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Digite seu CEP para calcular o frete
              </p>
            )}
          </div>

          <div className="summary-row">
            <span>Subtotal:</span>
            <span>R$ {bagData.summary.subtotal.toFixed(2).replace('.', ',')}</span>
          </div>

          <div className="summary-row">
            <span>Frete:</span>
            <span>
              {bagData.summary.shipping === 0 
                ? 'Grátis 🎉' 
                : `R$ ${bagData.summary.shipping.toFixed(2).replace('.', ',')}`
              }
            </span>
          </div>

          {bagData.summary.discount > 0 && (
            <div className="summary-row" style={{ color: 'var(--success-color)' }}>
              <span>Desconto:</span>
              <span>- R$ {bagData.summary.discount.toFixed(2).replace('.', ',')}</span>
            </div>
          )}

          <div className="summary-row total">
            <span>Total:</span>
            <span>R$ {bagData.summary.total.toFixed(2).replace('.', ',')}</span>
          </div>

          <div className="coupon-section">
            <h3>Cupom de Desconto</h3>
            
            {bagData.coupon ? (
              <div className="coupon-applied">
                <div>
                  <strong>{bagData.coupon.code}</strong>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>
                    {bagData.coupon.description}
                  </p>
                </div>
                <button 
                  onClick={handleRemoveCoupon}
                  className="btn btn-danger"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  aria-label="Remover cupom"
                >
                  Remover
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon}>
                <div className="coupon-input">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Digite o cupom"
                    aria-label="Código do cupom"
                  />
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    disabled={applyingCoupon || !couponCode.trim()}
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    {applyingCoupon ? 'Aplicando...' : 'Aplicar'}
                  </button>
                </div>
                <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                  Cupons disponíveis: DESC10, DESC20, FRETE, BEM-VINDO
                </small>
              </form>
            )}
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1.5rem' }}
            onClick={() => alert('Funcionalidade de checkout não implementada neste demo')}
          >
            Finalizar Pedido
          </button>

          {bagData.summary.subtotal < 200 && (
            <p style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-secondary)', 
              marginTop: '1rem',
              textAlign: 'center' 
            }}>
              💡 Frete grátis em compras acima de R$ 200,00
            </p>
          )}
        </aside>
      </div>
    </section>
  )
}

export default Bag

