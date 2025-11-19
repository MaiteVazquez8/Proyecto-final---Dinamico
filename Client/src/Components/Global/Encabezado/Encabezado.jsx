import { useState } from "react";
import { AiOutlineMoon, AiOutlineSun } from "react-icons/ai";
import logoImagen from "../../../assets/imgs/tuercav4.png";
import "./Encabezado.css";

function Encabezado({ onNavigate, currentPage, isAuthenticated, currentUser, onLogout, darkMode, onToggleDarkMode, canUseDarkMode }) {
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

  // Funciones auxiliares para simplificar las clases de navegación
  const getNavLinkClass = (page) => {
    let linkClass = "sidebar-nav-link"
    if (currentPage === page) {
      linkClass += " active"
    }
    return linkClass
  }

  const getMenuIcon = () => {
    if (isMenuOpen) {
      return '✕'
    } else {
      return '☰'
    }
  }

  const getMenuTitle = () => {
    if (isMenuOpen) {
      return "Cerrar menú"
    } else {
      return "Abrir menú"
    }
  }

  const getSidebarMenuClass = () => {
    let menuClass = "sidebar-menu"
    if (isMenuOpen) {
      menuClass += " open"
    }
    return menuClass
  }

  return (
    <>
      <header className="encabezado">
        <div className="logo-container" role="button" tabIndex={0} onClick={() => onNavigate('home')} onKeyDown={(e)=>{ if(e.key==='Enter') onNavigate('home') }}>
          <h1><img src={logoImagen} alt="ElectroShop Logo" className="logo-img" /></h1>
          <span className="brand-name">ElectroShop</span>
        </div>

        <div className="header-controls">
          {/* BOTÓN MENÚ HAMBURGUESA - SIMPLE */}
          <button 
            className="menu-toggle" 
            onClick={toggleMenu}
            title={getMenuTitle()}
          >
            {getMenuIcon()}
          </button>
        </div>
      </header>

      {/* Overlay del menú */}
      {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}

      {/* Menú lateral hamburguesa */}
      <div className={getSidebarMenuClass()}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logoImagen} alt="ElectroShop Logo" className="sidebar-logo-img" />
            <span>ElectroShop</span>
          </div>
          <button className="close-menu" onClick={() => setIsMenuOpen(false)}>
            ✕
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={getNavLinkClass('home')}
            onClick={() => handleNavigation('home')}
          >
            Inicio
          </button>
          
          {!isAuthenticated && (
            <>
              <button
                className={getNavLinkClass('products')}
                onClick={() => handleNavigation('products')}
              >
                Catálogo
              </button>
              <button
                className={getNavLinkClass('login')}
                onClick={() => handleNavigation('login')}
              >
                Login
              </button>
              <button
                className={getNavLinkClass('register')}
                onClick={() => handleNavigation('register')}
              >
                Register
              </button>
            </>
          )}
          
          {isAuthenticated && (
            <>
              <div className="sidebar-user-info">
                <span className="sidebar-welcome">Hola, {currentUser?.Nombre || currentUser?.username}</span>
                {currentUser?.Cargo && (
                  <span className="sidebar-role">({currentUser.Cargo})</span>
                )}
              </div>
              {/* Mostrar opciones de cliente solo si no es personal */}
              {(currentUser?.Cargo?.toLowerCase() === 'cliente' || !currentUser?.Cargo) && (
                <>
                  <button
                    className={getNavLinkClass('products')}
                    onClick={() => handleNavigation('products')}
                  >
                    Catálogo
                  </button>
                  <button
                    className={getNavLinkClass('cart')}
                    onClick={() => handleNavigation('cart')}
                  >
                    Carrito
                  </button>
                  <button
                    className={getNavLinkClass('favorites')}
                    onClick={() => handleNavigation('favorites')}
                  >
                    Favoritos
                  </button>
                  <button
                    className={getNavLinkClass('profile')}
                    onClick={() => handleNavigation('profile')}
                  >
                    Perfil
                  </button>
                </>
              )}
              
              {/* Enlaces de administración según rol */}
              {(currentUser?.Cargo?.toLowerCase() === 'empleado' || 
                currentUser?.Cargo?.toLowerCase() === 'gerente' || 
                currentUser?.Cargo?.toLowerCase() === 'super admin' ||
                currentUser?.Cargo?.toLowerCase() === 'administrador') && (
                <button
                  className={getNavLinkClass('product-management')}
                  onClick={() => handleNavigation('product-management')}
                >
                  Gestión de Productos
                </button>
              )}
              
              {(currentUser?.Cargo?.toLowerCase() === 'gerente' || 
                currentUser?.Cargo?.toLowerCase() === 'super admin' ||
                currentUser?.Cargo?.toLowerCase() === 'administrador') && (
                <>
                  <button
                    className={getNavLinkClass('employee-management')}
                    onClick={() => handleNavigation('employee-management')}
                  >
                    Gestión de Empleados
                  </button>
                  <button
                    className={getNavLinkClass('suppliers')}
                    onClick={() => handleNavigation('suppliers')}
                  >
                    Gestión de Proveedores
                  </button>
                </>
              )}
              
              {(currentUser?.Cargo?.toLowerCase() === 'super admin' ||
                currentUser?.Cargo?.toLowerCase() === 'administrador') && (
                <>
                  <button
                    className={getNavLinkClass('manager-management')}
                    onClick={() => handleNavigation('manager-management')}
                  >
                    Gestión de Gerentes
                  </button>
                  <button
                    className={getNavLinkClass('sales-management')}
                    onClick={() => handleNavigation('sales-management')}
                  >
                    Gestión de Compras
                  </button>
                  <button
                    className={getNavLinkClass('client-management')}
                    onClick={() => handleNavigation('client-management')}
                  >
                    Gestión de Clientes
                  </button>
                </>
              )}
              
              {/* Opción de modo oscuro/claro */}
              {canUseDarkMode && (
                <button
                  className="sidebar-nav-link dark-mode-menu-item"
                  onClick={onToggleDarkMode}
                  title={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
                  aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
                >
                  {darkMode ? (
                    <AiOutlineMoon className="dark-mode-icon" />
                  ) : (
                    <AiOutlineSun className="dark-mode-icon" />
                  )}
                </button>
              )}
              
              <button
                className="sidebar-nav-link logout-link"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </button>
            </>
          )}
          
          {/* Opción de modo oscuro/claro para usuarios no autenticados */}
          {!isAuthenticated && canUseDarkMode && (
            <button
              className="sidebar-nav-link dark-mode-menu-item"
              onClick={onToggleDarkMode}
              title={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
              aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              {darkMode ? (
                <AiOutlineMoon className="dark-mode-icon" />
              ) : (
                <AiOutlineSun className="dark-mode-icon" />
              )}
            </button>
          )}
        </nav>
      </div>
    </>
  )
}

export default Encabezado;