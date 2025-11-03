import { useState } from "react";
import { AiFillOpenAI } from "react-icons/ai";
import "./Encabezado.css";

function Encabezado({ onNavigate, currentPage, isAuthenticated, currentUser, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (page) => {
    onNavigate(page)
    setIsMenuOpen(false) // Cerrar menú al navegar
  }

  const handleLogout = () => {
    onLogout()
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    console.log('Menu toggle clicked!', !isMenuOpen)
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <header className="encabezado">
        <div className="logo-container">
          <h1><AiFillOpenAI /></h1>
          <span className="brand-name">ElectroShop</span>
        </div>

        {/* BOTÓN MENÚ HAMBURGUESA - SIMPLE */}
        <button 
          className="menu-toggle" 
          onClick={toggleMenu}
          title={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Overlay del menú */}
      {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}

      {/* Menú lateral hamburguesa */}
      <div className={`sidebar-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <AiFillOpenAI />
            <span>ElectroShop</span>
          </div>
          <button className="close-menu" onClick={() => setIsMenuOpen(false)}>
            ✕
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigation('home')}
          >
            Inicio
          </button>
          
          {!isAuthenticated && (
            <>
              <button
                className={`sidebar-nav-link ${currentPage === 'products' ? 'active' : ''}`}
                onClick={() => handleNavigation('products')}
              >
                Catálogo
              </button>
              <button
                className={`sidebar-nav-link ${currentPage === 'login' ? 'active' : ''}`}
                onClick={() => handleNavigation('login')}
              >
                Login
              </button>
              <button
                className={`sidebar-nav-link ${currentPage === 'register' ? 'active' : ''}`}
                onClick={() => handleNavigation('register')}
              >
                Register
              </button>
            </>
          )}
          
          {isAuthenticated && (
            <>
              <div className="sidebar-user-info">
                <span className="sidebar-welcome">Hola, {currentUser?.username}</span>
              </div>
              <button
                className={`sidebar-nav-link ${currentPage === 'products' ? 'active' : ''}`}
                onClick={() => handleNavigation('products')}
              >
                Productos
              </button>
              <button
                className={`sidebar-nav-link ${currentPage === 'cart' ? 'active' : ''}`}
                onClick={() => handleNavigation('cart')}
              >
                Carrito
              </button>
              <button
                className={`sidebar-nav-link ${currentPage === 'favorites' ? 'active' : ''}`}
                onClick={() => handleNavigation('favorites')}
              >
                Favoritos
              </button>
              <button
                className={`sidebar-nav-link ${currentPage === 'profile' ? 'active' : ''}`}
                onClick={() => handleNavigation('profile')}
              >
                Perfil
              </button>
              <button
                className="sidebar-nav-link logout-link"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </button>
            </>
          )}
        </nav>
      </div>
    </>
  )
}

export default Encabezado