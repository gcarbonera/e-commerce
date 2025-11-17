import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const email = localStorage.getItem('userEmail')
    if (token && email) {
      setIsLoggedIn(true)
      setUserEmail(email)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    setIsLoggedIn(false)
    setUserEmail('')
    navigate('/')
    console.log('🔓 Usuário deslogado')
  }

  return (
    <>
      <header>
        <div className="container">
          <nav aria-label="Navegação principal">
            <Link to="/" className="logo" aria-label="Página inicial">
              E-commerce
            </Link>
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/categorias">Produtos</Link></li>
              {isLoggedIn ? (
                <>
                  <li><Link to="/sacola">Sacola</Link></li>
                  <li>
                    <button 
                      onClick={handleLogout}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      aria-label="Sair da conta"
                    >
                      Sair ({userEmail})
                    </button>
                  </li>
                </>
              ) : (
                <li><Link to="/sacola/login">Login</Link></li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main>
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer>
        <div className="container">
          <p>&copy; 2024 E-commerce. Todos os direitos reservados.</p>
        </div>
      </footer>
    </>
  )
}

export default Layout

