import { useState } from "react"
import "./Favorites.css"

function Favorites({ onNavigate, favorites, setFavorites, cart, setCart, isAuthenticated }) {
    // Datos de productos para mostrar detalles completos
    const productsData = {
        1: { id: 1, name: 'iPhone 15 Pro Max', brand: 'Apple', price: 1199, image: '📱', description: 'El iPhone más avanzado con chip A17 Pro y cámara de 48MP', rating: 4.8, stock: 15, isNew: true },
        2: { id: 2, name: 'MacBook Pro M3', brand: 'Apple', price: 1999, image: '💻', description: 'Potencia profesional con el nuevo chip M3 y pantalla Liquid Retina XDR', rating: 4.9, stock: 8, isNew: true },
        3: { id: 3, name: 'AirPods Pro 2', brand: 'Apple', price: 249, image: '🎧', description: 'Audio espacial personalizado con cancelación activa de ruido', rating: 4.7, stock: 25, isNew: false },
        4: { id: 4, name: 'iPad Pro 12.9"', brand: 'Apple', price: 1099, image: '📱', description: 'La experiencia iPad definitiva con chip M2 y pantalla Liquid Retina XDR', rating: 4.8, stock: 12, isNew: false },
        5: { id: 5, name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', price: 1299, image: '📱', description: 'Smartphone premium con S Pen integrado y cámara de 200MP', rating: 4.6, stock: 20, isNew: true },
        6: { id: 6, name: 'Dell XPS 13 Plus', brand: 'Dell', price: 1399, image: '💻', description: 'Ultrabook premium con procesador Intel Core i7 de 12va generación', rating: 4.5, stock: 10, isNew: false },
        7: { id: 7, name: 'Sony WH-1000XM5', brand: 'Sony', price: 399, image: '🎧', description: 'Auriculares inalámbricos con la mejor cancelación de ruido del mercado', rating: 4.8, stock: 18, isNew: false },
        8: { id: 8, name: 'Surface Pro 9', brand: 'Microsoft', price: 999, image: '📱', description: 'Tablet 2 en 1 con procesador Intel Core i5 y Windows 11', rating: 4.4, stock: 14, isNew: false }
    }

    // Obtener productos favoritos con detalles completos
    const favoriteItems = favorites.map(id => productsData[id]).filter(item => item)

    const removeFromFavorites = (productId) => {
        setFavorites(prev => prev.filter(id => id !== productId))
    }

    const clearFavorites = () => {
        setFavorites([])
    }

    const addToCart = (productId) => {
        if (!isAuthenticated) {
            onNavigate('login')
            return
        }
        
        const existingItem = cart.find(item => item.id === productId)
        if (existingItem) {
            setCart(prev => prev.map(item => 
                item.id === productId 
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ))
        } else {
            setCart(prev => [...prev, { id: productId, quantity: 1 }])
        }
    }

    const viewProductDetails = (productId) => {
        onNavigate('product-detail', { productId })
    }

    const isInCart = (productId) => {
        return cart.some(item => item.id === productId)
    }

    if (!isAuthenticated) {
        return (
            <div className="favorites-container">
                <div className="favorites-empty">
                    <div className="empty-icon">❤️</div>
                    <h2>Inicia sesión para ver tus favoritos</h2>
                    <p>Necesitas estar autenticado para acceder a tu lista de favoritos</p>
                    <button 
                        className="login-btn"
                        onClick={() => onNavigate('login')}
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        )
    }

    if (favoriteItems.length === 0) {
        return (
            <div className="favorites-container">
                <div className="favorites-header">
                    <h1 className="favorites-title">Mis Favoritos</h1>
                    <button 
                        className="back-btn"
                        onClick={() => onNavigate('products')}
                    >
                        ← Explorar Productos
                    </button>
                </div>
                
                <div className="favorites-empty">
                    <div className="empty-icon">❤️</div>
                    <h2>No tienes favoritos aún</h2>
                    <p>¡Agrega productos a tu lista de favoritos para verlos aquí!</p>
                    <button 
                        className="shop-btn"
                        onClick={() => onNavigate('products')}
                    >
                        Explorar Productos
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="favorites-container">
            <div className="favorites-header">
                <h1 className="favorites-title">Mis Favoritos ({favoriteItems.length} productos)</h1>
                <div className="header-actions">
                    <button 
                        className="clear-favorites-btn"
                        onClick={clearFavorites}
                    >
                        Limpiar Favoritos
                    </button>
                    <button 
                        className="back-btn"
                        onClick={() => onNavigate('products')}
                    >
                        ← Explorar Productos
                    </button>
                </div>
            </div>

            <div className="favorites-grid">
                {favoriteItems.map(product => (
                    <div key={product.id} className="favorite-card">
                        {product.isNew && <div className="new-badge">Nuevo</div>}
                        
                        <button 
                            className="remove-favorite-btn"
                            onClick={() => removeFromFavorites(product.id)}
                            title="Quitar de favoritos"
                        >
                            ❤️
                        </button>

                        <div className="product-image-container">
                            <div className="product-image">{product.image}</div>
                        </div>

                        <div className="product-info">
                            <div className="product-brand">{product.brand}</div>
                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-description">{product.description}</p>
                            
                            <div className="product-rating">
                                <span className="stars">⭐</span>
                                <span className="rating-value">{product.rating}</span>
                            </div>

                            <div className="product-price-section">
                                <p className="product-price">${product.price.toLocaleString()}</p>
                                <p className="product-stock">Stock: {product.stock}</p>
                            </div>

                            <div className="product-actions">
                                <button 
                                    className="view-details-btn"
                                    onClick={() => viewProductDetails(product.id)}
                                >
                                    Ver Detalles
                                </button>
                                <button 
                                    className={`add-to-cart-btn ${isInCart(product.id) ? 'in-cart' : ''}`}
                                    onClick={() => addToCart(product.id)}
                                    disabled={product.stock === 0}
                                >
                                    {product.stock === 0 
                                        ? 'Sin Stock' 
                                        : isInCart(product.id) 
                                            ? 'En Carrito ✓' 
                                            : 'Agregar al Carrito'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="favorites-actions">
                <button 
                    className="add-all-to-cart-btn"
                    onClick={() => {
                        favoriteItems.forEach(product => {
                            if (product.stock > 0 && !isInCart(product.id)) {
                                addToCart(product.id)
                            }
                        })
                    }}
                >
                    Agregar Todos al Carrito
                </button>
                
                <button 
                    className="view-cart-btn"
                    onClick={() => onNavigate('cart')}
                >
                    Ver Carrito ({cart.reduce((total, item) => total + item.quantity, 0)})
                </button>
            </div>
        </div>
    )
}

export default Favorites