import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import Produits from './pages/Produits'
import Fournisseurs from './pages/Fournisseurs'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/produits" element={<Produits />} />
            <Route path="/fournisseurs" element={<Fournisseurs />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
