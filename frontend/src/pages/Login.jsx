import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BAG_API = 'http://localhost:3002'

function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setError('Por favor, insira um email válido')
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log(`🔐 Tentando login com: ${email}`)

      const response = await fetch(`${BAG_API}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok && data.success) {

        localStorage.setItem('token', data.data.token)
        localStorage.setItem('userEmail', data.data.email)
        
        console.log(`✓ Login bem-sucedido: ${email}`)
        console.log('✓ Token salvo no localStorage')

        navigate('/sacola')
      } else {
        throw new Error(data.error || 'Erro ao fazer login')
      }
    } catch (err) {
      console.error('✗ Erro no login:', err)
      setError('Erro ao fazer login. Verifique se a API está rodando.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <h1>Login</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Entre com seu email para acessar sua sacola
      </p>

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            aria-required="true"
            aria-describedby="email-help"
          />
          <small id="email-help" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Não é necessário senha para este demo
          </small>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%' }}
          disabled={loading}
          aria-label="Entrar na conta"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
        💡 Dica: Use qualquer email válido para fazer login
      </p>
    </div>
  )
}

export default Login

