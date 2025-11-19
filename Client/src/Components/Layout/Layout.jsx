import { useState, useEffect } from "react"
import axios from "axios"
import { SHOPPING_ENDPOINTS } from "../../config/api"
import Encabezado from "../Global/Encabezado/Encabezado"
import Footer from "../Global/Footer/Footer"
import ScrollToTop from "../Global/ScrollToTop/ScrollToTop"
import Home from "../Pages/Home/Home"
import Login from "../Auth/Login/Login"
import Register from "../Auth/Register/Register"
import Products from "../Products/ProductList/ProductList"
import ProductDetail from "../Products/ProductDetail/ProductDetail"
import Cart from "../Shopping/Cart/Cart"
import Favorites from "../Shopping/Favorites/Favorites"
import DeleteUser from "../UserManagement/DeleteUser/DeleteUser"
import EditUser from "../UserManagement/EditUser/EditUser"
import Profile from "../UserManagement/Profile/Profile"
import Checkout from "../Shopping/Checkout/Checkout"
import ServerStatus from "../Global/ServerStatus/ServerStatus"
import ProductManagement from "../Admin/ProductManagement/ProductManagement"
import EmployeeManagement from "../Admin/EmployeeManagement/EmployeeManagement"
import ManagerManagement from "../Admin/ManagerManagement/ManagerManagement"
import SuppliersManagement from "../Admin/SuppliersManagement/SuppliersManagement"
import SalesManagement from "../Admin/SalesManagement/SalesManagement"
import ClientManagement from "../Admin/ClientManagement/ClientManagement"
import Verify from "../Auth/Verify/Verify"
import "./Layout.css"

function Layout() {
  // Detectar si hay un token en la URL para verificación
  const getTokenFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const tokenFromQuery = urlParams.get('token')
    if (tokenFromQuery) return tokenFromQuery
    
    // También verificar si está en el pathname
    if (window.location.pathname.includes('/verificar/')) {
      return window.location.pathname.split('/verificar/')[1]
    }
    
    return null
  }
  
  const initialToken = getTokenFromUrl()
  const [currentPage, setCurrentPage] = useState(initialToken ? 'verify' : 'home')
  const [pageData, setPageData] = useState(initialToken ? { token: initialToken } : null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [cart, setCart] = useState([])
  const [favorites, setFavorites] = useState([])
  const [serverInitialized, setServerInitialized] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    // Leer preferencia desde el DOM (ya aplicada en main.jsx) o localStorage
    const hasDarkTheme = document.documentElement.hasAttribute('data-theme')
    if (hasDarkTheme) {
      return true
    }
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      return saved === 'true'
    }
    return false
  })

  // Determinar si el usuario puede usar modo oscuro basado en rol y página actual
  const canUseDarkMode = (() => {
    const userRole = currentUser?.Cargo?.toLowerCase()
    // Clientes y usuarios no autenticados pueden usar modo oscuro en todas las páginas
    if (userRole === 'cliente' || !currentUser) {
      return true
    }
    // Empleados, gerentes y superadmin solo pueden usar modo oscuro en home
    if (userRole === 'empleado' || userRole === 'gerente' || userRole === 'super admin' || userRole === 'administrador') {
      return currentPage === 'home'
    }
    return true
  })()

  // Efecto para desactivar modo oscuro cuando no está permitido
  useEffect(() => {
    if (!canUseDarkMode && darkMode) {
      // Si el modo oscuro no está permitido pero está activo, desactivarlo
      setDarkMode(false)
      document.documentElement.removeAttribute('data-theme')
    }
  }, [canUseDarkMode, darkMode])

  // Aplicar modo oscuro al documento y guardar preferencia
  useEffect(() => {
    // Solo aplicar modo oscuro si está permitido
    if (canUseDarkMode && darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
      // Solo guardar preferencia para clientes o usuarios no autenticados
      const userRole = currentUser?.Cargo?.toLowerCase()
      if (userRole === 'cliente' || !currentUser) {
        localStorage.setItem('darkMode', 'true')
      }
    } else {
      document.documentElement.removeAttribute('data-theme')
      // Solo guardar preferencia para clientes o usuarios no autenticados
      const userRole = currentUser?.Cargo?.toLowerCase()
      if (userRole === 'cliente' || !currentUser) {
        localStorage.setItem('darkMode', 'false')
      }
    }
  }, [darkMode, canUseDarkMode, currentUser])

  const toggleDarkMode = () => {
    // Solo permitir toggle si está permitido
    if (canUseDarkMode) {
      setDarkMode(prev => !prev)
    }
  }

  // Inicializar datos del servidor al cargar la aplicación
  useEffect(() => {
    const initServer = async () => {
      try {
        // Intentar inicializar datos de ejemplo
        // En un entorno de producción, esto no sería necesario
        console.log('Inicializando datos del servidor...')
        setServerInitialized(true)
      } catch (error) {
        console.error('Error al inicializar servidor:', error)
        setServerInitialized(true) // Continuar aunque falle
      }
    }

    initServer()
  }, [])

  // Cambiar título de la pestaña según la página actual
  useEffect(() => {
    const pageTitles = {
      'home': 'ElectroShop - Inicio',
      'products': 'ElectroShop - Catálogo',
      'product-detail': 'ElectroShop - Detalle del Producto',
      'cart': 'ElectroShop - Carrito',
      'favorites': 'ElectroShop - Favoritos',
      'checkout': 'ElectroShop - Checkout',
      'login': 'ElectroShop - Iniciar Sesión',
      'register': 'ElectroShop - Registrarse',
      'profile': 'ElectroShop - Mi Perfil',
      'edit': 'ElectroShop - Editar Perfil',
      'delete': 'ElectroShop - Eliminar Cuenta',
      'product-management': 'ElectroShop - Gestión de Productos',
      'employee-management': 'ElectroShop - Gestión de Empleados',
      'manager-management': 'ElectroShop - Gestión de Gerentes',
      'suppliers': 'ElectroShop - Gestión de Proveedores',
      'sales-management': 'ElectroShop - Gestión de Compras',
      'client-management': 'ElectroShop - Gestión de Clientes',
      'verify': 'ElectroShop - Verificar Cuenta'
    }
    
    const title = pageTitles[currentPage] || 'ElectroShop - Tu tienda de electrónica'
    document.title = title
  }, [currentPage])

  // Restaurar sesión desde localStorage al montar
  // Solo restaurar automáticamente para personal (empleados, gerentes, superadmin)
  // Los clientes NO se restauran automáticamente para forzar verificación en el login
  useEffect(() => {
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const cargo = parsed?.Cargo?.toLowerCase()
        
        // Verificar si es personal (empleado, gerente, super admin, administrador)
        const esPersonal = cargo === 'empleado' || 
                          cargo === 'gerente' || 
                          cargo === 'super admin' || 
                          cargo === 'administrador'
        
        if (esPersonal) {
          // Restaurar sesión automáticamente para personal (no necesitan verificación)
          console.log('✅ Restaurando sesión de personal desde localStorage:', cargo)
          setIsAuthenticated(true)
          setCurrentUser(parsed)
          
          // Redirigir a la página de gestión según el cargo
          if (cargo === 'empleado' || cargo === 'gerente' || cargo === 'super admin' || cargo === 'administrador') {
            setCurrentPage('product-management')
          }
        } else {
          // Para clientes, NO restaurar automáticamente
          // Deben hacer login para verificar su estado de verificación
          console.log('⚠️ Sesión de cliente encontrada, pero no se restaurará automáticamente (requiere verificación)')
          // Limpiar sesión de cliente no verificada
          localStorage.removeItem('currentUser')
        }
      } catch (err) {
        console.error('Error parseando currentUser desde localStorage:', err)
        localStorage.removeItem('currentUser')
      }
    }
  }, [])

  const [cartRefreshKey, setCartRefreshKey] = useState(0)

  const handleNavigation = (page, data = null) => {
    setCurrentPage(page)
    setPageData(data)
    // Si navegamos al carrito, forzar recarga
    if (page === 'cart' && isAuthenticated) {
      setCartRefreshKey(prev => prev + 1)
    }
  }

  const handleLogin = async (userData) => {
    console.log('handleLogin recibió:', userData)
    setIsAuthenticated(true)
    setCurrentUser(userData)
    // Persistir sesión en localStorage para mantener login entre recargas
    try {
      localStorage.setItem('currentUser', JSON.stringify(userData))
    } catch (err) {
      console.warn('No se pudo persistir currentUser en localStorage:', err)
    }
    
    // Solo cargar carrito si es cliente (no personal)
    const cargo = userData.Cargo?.toLowerCase()
    console.log('Cargo del usuario:', cargo)
    
    if (cargo === 'cliente') {
      try {
        const response = await axios.get(SHOPPING_ENDPOINTS.GET_CART(userData.DNI))
        // Mapear los datos del servidor al formato local
        const localCart = response.data.map(item => ({
          id: item.ID_Producto,
          quantity: 1 // Por ahora asumimos cantidad 1
        }))
        setCart(localCart)
      } catch (error) {
        console.error('Error al cargar carrito:', error)
      }
    }
    
    // Redirigir según el tipo de usuario
    if (cargo === 'empleado' || cargo === 'gerente' || cargo === 'super admin' || cargo === 'administrador') {
      // Personal: redirigir a gestión de productos
      console.log('Redirigiendo personal a product-management')
      setCurrentPage('product-management')
    } else {
      // Cliente: redirigir a home
      console.log('Redirigiendo cliente a home')
      setCurrentPage('home')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    setCart([])
    setFavorites([])
    setCurrentPage('home')
    // Limpiar sesión persistida
    try {
      localStorage.removeItem('currentUser')
    } catch (err) {
      console.warn('Error al limpiar currentUser de localStorage:', err)
    }
  }

  // Función auxiliar para determinar si la página debe estar centrada
  const shouldCenterPage = () => {
    if (currentPage === 'login') return true
    if (currentPage === 'register') return true
    if (currentPage === 'verify') return true
    if (currentPage === 'delete') return true
    if (currentPage === 'edit') return true
    if (currentPage === 'profile') return true
    if (currentPage === 'checkout') return true
    if (currentPage === 'product-management') return false
    if (currentPage === 'employee-management') return false
    if (currentPage === 'manager-management') return false
    if (currentPage === 'suppliers') return false
    if (currentPage === 'sales-management') return false
    if (currentPage === 'client-management') return false
    return false
  }

  const renderPage = () => {
    console.log('Rendering page:', currentPage)
    console.log('Current user:', currentUser)
    console.log('Is authenticated:', isAuthenticated)
    
    // Páginas de administración según rol
    const userRole = currentUser?.Cargo?.toLowerCase()
    console.log('User role (lowercase):', userRole)
    
    if (currentPage === 'product-management') {
      if (userRole === 'empleado' || userRole === 'gerente' || userRole === 'super admin' || userRole === 'administrador') {
        return <ProductManagement currentUser={currentUser} />
      }
      console.log('Access denied to product-management for role:', userRole)
      return <Home onNavigate={handleNavigation} />
    }
    
    if (currentPage === 'employee-management') {
      if (userRole === 'gerente' || userRole === 'super admin' || userRole === 'administrador') {
        return <EmployeeManagement currentUser={currentUser} />
      }
      console.log('Access denied to employee-management for role:', userRole)
      return <Home onNavigate={handleNavigation} />
    }
    
    if (currentPage === 'manager-management') {
      if (userRole === 'super admin' || userRole === 'administrador') {
        return <ManagerManagement currentUser={currentUser} />
      }
      console.log('Access denied to manager-management for role:', userRole)
      return <Home onNavigate={handleNavigation} />
    }

    if (currentPage === 'suppliers') {
      if (userRole === 'gerente' || userRole === 'super admin' || userRole === 'administrador') {
        return <SuppliersManagement currentUser={currentUser} />
      }
      console.log('Access denied to suppliers for role:', userRole)
      return <Home onNavigate={handleNavigation} />
    }

    if (currentPage === 'sales-management') {
      console.log('=== SALES MANAGEMENT ROUTE ===')
      console.log('User role:', userRole)
      console.log('Current user:', currentUser)
      // Misma lógica que manager-management
      if (userRole === 'super admin' || userRole === 'administrador') {
        console.log('Access granted, rendering SalesManagement component')
        return <SalesManagement currentUser={currentUser} />
      }
      console.log('Access denied to sales-management for role:', userRole)
      return <Home onNavigate={handleNavigation} />
    }

    if (currentPage === 'client-management') {
      console.log('=== CLIENT MANAGEMENT ROUTE ===')
      console.log('User role:', userRole)
      console.log('Current user:', currentUser)
      // Solo super admin puede gestionar clientes
      if (userRole === 'super admin' || userRole === 'administrador') {
        console.log('Access granted, rendering ClientManagement component')
        return <ClientManagement currentUser={currentUser} />
      }
      console.log('Access denied to client-management for role:', userRole)
      return <Home onNavigate={handleNavigation} />
    }
    
    switch(currentPage) {
      case 'verify':
        return <Verify token={pageData?.token} onNavigate={handleNavigation} />
      case 'login':
        return <Login onNavigate={handleNavigation} onLogin={handleLogin} />
      case 'register':
        return <Register onNavigate={handleNavigation} />
      case 'products':
        return <Products 
          onNavigate={handleNavigation} 
          onLogout={handleLogout} 
          currentUser={currentUser} 
          isAuthenticated={isAuthenticated}
          cart={cart}
          setCart={setCart}
          favorites={favorites}
          setFavorites={setFavorites}
        />
      case 'product-detail':
        return <ProductDetail 
          onNavigate={handleNavigation} 
          productId={pageData?.productId} 
          isAuthenticated={isAuthenticated}
          cart={cart}
          setCart={setCart}
          favorites={favorites}
          setFavorites={setFavorites}
          currentUser={currentUser}
        />
      case 'cart':
        return <Cart 
          key={`cart-${currentUser?.DNI || 'guest'}-${cartRefreshKey}`}
          onNavigate={handleNavigation}
          cart={cart}
          setCart={setCart}
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
        />
      case 'favorites':
        return <Favorites 
          onNavigate={handleNavigation}
          favorites={favorites}
          setFavorites={setFavorites}
          cart={cart}
          setCart={setCart}
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
        />
      case 'checkout':
        return <Checkout 
          onNavigate={handleNavigation}
          currentUser={currentUser}
          isAuthenticated={isAuthenticated}
        />
      case 'delete':
        return <DeleteUser onNavigate={handleNavigation} />
      case 'edit':
        return <EditUser onNavigate={handleNavigation} currentUser={currentUser} />
      case 'profile':
        return <Profile onNavigate={handleNavigation} currentUser={currentUser} />
      case 'home':
        return <Home onNavigate={handleNavigation} />
      default:
        return <Home onNavigate={handleNavigation} />
    }
  }

  return (
    <div className="app-container">
      <ServerStatus />
      <Encabezado 
        onNavigate={handleNavigation} 
        currentPage={currentPage} 
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        canUseDarkMode={canUseDarkMode}
      />
      <main className={`main-content ${shouldCenterPage() ? 'centered' : 'full-width'}`}>
        {renderPage()}
      </main>
      <Footer onNavigate={handleNavigation} />
      <ScrollToTop />
    </div>
  )
}

export default Layout