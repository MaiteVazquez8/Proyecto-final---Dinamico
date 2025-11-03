import { useState } from "react"
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
    setCurrentPage('home')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    setCart([])
    setFavorites([])
    setCurrentPage('home')
  }

  const renderPage = () => {
    console.log('Rendering page:', currentPage)
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
      case 'checkout':
        // Datos de productos (centralizados)
        const productsData = {
          1: { id: 1, name: 'iPhone 15 Pro Max', brand: 'Apple', price: 1199, image: '📱', stock: 15 },
          2: { id: 2, name: 'MacBook Pro M3', brand: 'Apple', price: 1999, image: '💻', stock: 8 },
          3: { id: 3, name: 'AirPods Pro 2', brand: 'Apple', price: 249, image: '🎧', stock: 25 },
          4: { id: 4, name: 'iPad Pro 12.9"', brand: 'Apple', price: 1099, image: '📱', stock: 12 },
          5: { id: 5, name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', price: 1299, image: '📱', stock: 20 },
          6: { id: 6, name: 'Dell XPS 13 Plus', brand: 'Dell', price: 1399, image: '💻', stock: 10 },
          7: { id: 7, name: 'Sony WH-1000XM5', brand: 'Sony', price: 399, image: '🎧', stock: 18 },
          8: { id: 8, name: 'Surface Pro 9', brand: 'Microsoft', price: 999, image: '📱', stock: 14 }
        };

        // Verificar si es compra directa o desde carrito
        if (pageData?.purchaseType === 'direct' && pageData?.directProduct) {
          // Compra directa desde producto
          return <Checkout 
            directProduct={pageData.directProduct}
            purchaseType="direct"
            onBack={() => handleNavigation('product-detail', { productId: pageData.directProduct.id })}
          />
        } else {
          // Compra desde carrito
          return <Checkout 
            cartItems={cart.map(item => {
              const productData = productsData[item.id];
              return {
                id: item.id,
                name: productData?.name || 'Producto Desconocido',
                price: productData?.price || 0,
                quantity: item.quantity
              };
            })}
            purchaseType="cart"
            onBack={() => handleNavigation('cart')}
          />
        }
      case 'delete':
        return <DeleteUser onNavigate={handleNavigation} />
      case 'edit':
        return <EditUser onNavigate={handleNavigation} />
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
      <Encabezado 
        onNavigate={handleNavigation} 
        currentPage={currentPage} 
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main className={`main-content ${currentPage === 'login' || currentPage === 'register' || currentPage === 'delete' || currentPage === 'edit' || currentPage === 'profile' || currentPage === 'checkout' ? 'centered' : 'full-width'}`}>
        {renderPage()}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

export default Layout