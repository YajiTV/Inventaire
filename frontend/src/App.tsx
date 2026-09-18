import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Stocks from './pages/Stocks'
import Movements from './pages/Movements'
import NewMovement from './pages/NewMovement'
import Products from './pages/Products'
import Suppliers from './pages/Suppliers'
import Categories from './pages/Categories'
import Replenishment from './pages/Replenishment'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/stocks" element={<Stocks />} />
              <Route path="/movements" element={<Movements />} />
              <Route path="/movements/new" element={<NewMovement />} />
              <Route path="/products" element={<Products />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/replenishment" element={<Replenishment />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
