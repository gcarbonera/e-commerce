import { Link } from 'react-router-dom'

function Home() {
  return (
    <>
      <section className="banner" aria-labelledby="banner-title">
        <h1 id="banner-title">Bem-vindo ao E-commerce</h1>
        <p>Encontre os melhores produtos com os melhores preços!</p>
        <Link to="/categorias" className="btn btn-primary" aria-label="Ver todos os produtos">
          Ver Produtos
        </Link>
      </section>

      <section aria-labelledby="featured-title">
        <h2 id="featured-title">Categorias em Destaque</h2>
        <div className="product-grid" style={{ marginTop: '2rem' }}>
          <Link 
            to="/categorias?categoria=Eletrônicos" 
            className="product-card"
            aria-label="Ver produtos de Eletrônicos"
          >
            <div style={{
              width: '100%',
              height: '250px',
              backgroundColor: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              📱 Eletrônicos
            </div>
            <div className="product-info">
              <h3>Eletrônicos</h3>
              <p>Smartphones, notebooks e muito mais</p>
            </div>
          </Link>

          <Link 
            to="/categorias?categoria=Moda" 
            className="product-card"
            aria-label="Ver produtos de Moda"
          >
            <div style={{
              width: '100%',
              height: '250px',
              backgroundColor: '#EC4899',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              👕 Moda
            </div>
            <div className="product-info">
              <h3>Moda</h3>
              <p>Roupas e acessórios de moda</p>
            </div>
          </Link>

          <Link 
            to="/categorias?categoria=Casa" 
            className="product-card"
            aria-label="Ver produtos de Casa"
          >
            <div style={{
              width: '100%',
              height: '250px',
              backgroundColor: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              🏠 Casa
            </div>
            <div className="product-info">
              <h3>Casa</h3>
              <p>Utensílios e decoração</p>
            </div>
          </Link>

          <Link 
            to="/categorias?categoria=Esportes" 
            className="product-card"
            aria-label="Ver produtos de Esportes"
          >
            <div style={{
              width: '100%',
              height: '250px',
              backgroundColor: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              ⚽ Esportes
            </div>
            <div className="product-info">
              <h3>Esportes</h3>
              <p>Tênis, roupas e equipamentos</p>
            </div>
          </Link>
        </div>
      </section>
    </>
  )
}

export default Home

