import { useState } from "react"
import Encabezado from "../Global/Encabezado/Encabezado"
import Footer from "../Global/Footer/Footer"
import Home from "../Pages/Home/Home"
import Login from "../Auth/Login/Login"
import Register from "../Auth/Register/Register"
import Products from "../Products/ProductList/ProductList"
import ProductDetail from "../Products/ProductDetail/ProductDetail"
import Cart from "../Shopping/Cart/Cart"
import Favorites from "../Shopping/Favorites/Favorites"
import DeleteUser from "../UserManagement/DeleteUser/DeleteUser"
import EditUser from "../UserManagement/EditUser/EditUser"
import "./Layout.css"

function Layout() {
  const [currentPage, setCurrentPage] = useState('home')
  const [pageData, setPageData] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [cart, setCart] = useState([])
  const [favorites, setFavorites] = useState([])

  const handleNavigation = (page, data = null) => {
    setCurrentPage(page)
    setPageData(data)
  }

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setCurrentUser(userData)
    setCurrentPage('products')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    setCart([])
    setFavorites([])
    setCurrentPage('home')
  }

  const renderPage = () => {
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
        />
      case 'cart':
        return <Cart 
          onNavigate={handleNavigation}
          cart={cart}
          setCart={setCart}
          isAuthenticated={isAuthenticated}
        />
      case 'favorites':
        return <Favorites 
          onNavigate={handleNavigation}
          favorites={favorites}
          setFavorites={setFavorites}
          cart={cart}
          setCart={setCart}
          isAuthenticated={isAuthenticated}
        />
      case 'delete':
        return <DeleteUser onNavigate={handleNavigation} />
      case 'edit':
        return <EditUser onNavigate={handleNavigation} />
      default:
        return <Home onNavigate={handleNavigation} />
    }
  }

  return (
    <div className="app-container">
      <Encabezado 
        onNavigate={handleNavigation} 
        currentPage={currentPage} 
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main className={`main-content ${currentPage === 'login' || currentPage === 'register' || currentPage === 'delete' || currentPage === 'edit' ? 'centered' : 'full-width'}`}>
        {renderPage()}
      </main>
      <Footer />
    </div>
  )
}

export default Layout