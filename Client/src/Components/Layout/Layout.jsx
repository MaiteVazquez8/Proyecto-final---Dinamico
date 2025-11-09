import { useState, useEffect } from "react"
import axios from "axios"
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
import "./Layout.css"

function Layout() {
  const [currentPage, setCurrentPage] = useState('home')
  const [pageData, setPageData] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [cart, setCart] = useState([])
  const [favorites, setFavorites] = useState([])
  const [serverInitialized, setServerInitialized] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    // Leer preferencia desde localStorage o detectar preferencia del sistema
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      return saved === 'true'
    }
    // Detectar preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true
    }
    return false
  })

  // Aplicar modo oscuro al documento
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    // Guardar preferencia en localStorage
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      // Solo actualizar si no hay preferencia guardada
      if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches)
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev)
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
      'products': 'ElectroShop - Productos',
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
      'suppliers': 'ElectroShop - Gestión de Proveedores'
    }
    
    const title = pageTitles[currentPage] || 'ElectroShop - Tu tienda de electrónica'
    document.title = title
  }, [currentPage])

  // Al montar, intentar restaurar sesión desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed?.DNI) {
          // Restaurar estado de autenticación
          setIsAuthenticated(true)
          setCurrentUser(parsed)
          // Cargar carrito si es cliente
          const cargo = parsed.Cargo?.toLowerCase()
          if (cargo === 'cliente') {
            axios.get(`http://localhost:3000/api/compras/carrito/${parsed.DNI}`)
              .then(response => {
                const localCart = response.data.map(item => ({ id: item.ID_Producto, quantity: 1 }))
                setCart(localCart)
              })
              .catch(err => console.error('Error al restaurar carrito desde localStorage:', err))
          }
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
        const response = await axios.get(`http://localhost:3000/api/compras/carrito/${userData.DNI}`)
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
    if (currentPage === 'delete') return true
    if (currentPage === 'edit') return true
    if (currentPage === 'profile') return true
    if (currentPage === 'checkout') return true
    if (currentPage === 'product-management') return false
    if (currentPage === 'employee-management') return false
    if (currentPage === 'manager-management') return false
    return false
  }

  const renderPage = () => {
    console.log('Rendering page:', currentPage)
    
    // Páginas de administración según rol
    const userRole = currentUser?.Cargo?.toLowerCase()
    
    if (currentPage === 'product-management') {
      if (userRole === 'empleado' || userRole === 'gerente' || userRole === 'super admin' || userRole === 'administrador') {
        return <ProductManagement currentUser={currentUser} />
      }
      return <Home onNavigate={handleNavigation} />
    }
    
    if (currentPage === 'employee-management') {
      if (userRole === 'gerente' || userRole === 'super admin' || userRole === 'administrador') {
        return <EmployeeManagement currentUser={currentUser} />
      }
      return <Home onNavigate={handleNavigation} />
    }
    
    if (currentPage === 'manager-management') {
      if (userRole === 'super admin' || userRole === 'administrador') {
        return <ManagerManagement currentUser={currentUser} />
      }
      return <Home onNavigate={handleNavigation} />
    }

    if (currentPage === 'suppliers') {
      if (userRole === 'gerente' || userRole === 'super admin' || userRole === 'administrador') {
        return <SuppliersManagement currentUser={currentUser} />
      }
      return <Home onNavigate={handleNavigation} />
    }
    
    switch(currentPage) {
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
      />
      <main className={`main-content ${shouldCenterPage() ? 'centered' : 'full-width'}`}>
        {renderPage()}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

export default Layout