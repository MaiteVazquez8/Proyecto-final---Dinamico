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
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <header className="encabezado">
        <div className="logo-container">
          <h1><AiFillOpenAI /></h1>
          <span className="brand-name">ElectroShop</span>
        </div>

        {/* Botón menú (solo móvil) */}
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>

        {/* Menú desktop */}
        <nav className="desktop-menu">
          <button
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigation('home')}
          >
            Inicio
          </button>
          
          <button
            className={`nav-link ${currentPage === 'products' ? 'active' : ''}`}
            onClick={() => handleNavigation('products')}
          >
            Productos
          </button>
          
          {!isAuthenticated && (
            <>
              <button
                className={`nav-link ${currentPage === 'login' ? 'active' : ''}`}
                onClick={() => handleNavigation('login')}
              >
                Login
              </button>
              <button
                className={`nav-link ${currentPage === 'register' ? 'active' : ''}`}
                onClick={() => handleNavigation('register')}
              >
                Registrar Usuario
              </button>
            </>
          )}
          
          {isAuthenticated && (
            <>
              <button
                className={`nav-link ${currentPage === 'edit' ? 'active' : ''}`}
                onClick={() => handleNavigation('edit')}
              >
                Editar Usuario
              </button>
              <button
                className={`nav-link ${currentPage === 'delete' ? 'active' : ''}`}
                onClick={() => handleNavigation('delete')}
              >
                Eliminar Usuario
              </button>
              <div className="user-info">
                <span className="welcome-text">Hola, {currentUser?.username}</span>
                <button className="logout-nav-btn" onClick={handleLogout}>
                  Cerrar Sesión
                </button>
              </div>
            </>
          )}
        </nav>
      </header>

      {/* Overlay del menú móvil */}
      {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}

      {/* Menú lateral móvil */}
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
          
          <button
            className={`sidebar-nav-link ${currentPage === 'products' ? 'active' : ''}`}
            onClick={() => handleNavigation('products')}
          >
            Productos
          </button>
          
          {!isAuthenticated && (
            <>
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
                Registrar Usuario
              </button>
            </>
          )}
          
          {isAuthenticated && (
            <>
              <div className="sidebar-user-info">
                <span className="sidebar-welcome">Hola, {currentUser?.username}</span>
              </div>
              <button
                className={`sidebar-nav-link ${currentPage === 'edit' ? 'active' : ''}`}
                onClick={() => handleNavigation('edit')}
              >
                Editar Usuario
              </button>
              <button
                className={`sidebar-nav-link ${currentPage === 'delete' ? 'active' : ''}`}
                onClick={() => handleNavigation('delete')}
              >
                Eliminar Usuario
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