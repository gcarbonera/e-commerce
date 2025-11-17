import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Bag from './pages/Bag'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="categorias" element={<ProductList />} />
          <Route path="produtos/:id" element={<ProductDetail />} />
          <Route path="sacola/login" element={<Login />} />
          <Route path="sacola" element={<Bag />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

