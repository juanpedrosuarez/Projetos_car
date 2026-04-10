import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import CarListing from './pages/CarListing'
import CarDetail from './pages/CarDetail'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-dark">
          <Header />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cars" element={<CarListing />} />
              <Route path="/cars/:id" element={<CarDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={
                <div className="flex items-center justify-center min-h-screen text-center px-4">
                  <div>
                    <div className="text-6xl font-bold text-gold mb-4">404</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Página não encontrada</h2>
                    <p className="text-white/40 mb-6">A página que você procura não existe.</p>
                    <a href="/" className="btn-gold text-sm">Voltar ao início</a>
                  </div>
                </div>
              } />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
