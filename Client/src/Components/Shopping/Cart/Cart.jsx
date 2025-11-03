import { useState } from "react"
import "./Cart.css"

function Cart({ onNavigate, cart, setCart, isAuthenticated }) {
    const [isLoading, setIsLoading] = useState(false)

    // Datos de productos para mostrar detalles completos
    const productsData = {
        1: { id: 1, name: 'iPhone 15 Pro Max', brand: 'Apple', price: 1199, image: '📱', stock: 15 },
        2: { id: 2, name: 'MacBook Pro M3', brand: 'Apple', price: 1999, image: '💻', stock: 8 },
        3: { id: 3, name: 'AirPods Pro 2', brand: 'Apple', price: 249, image: '🎧', stock: 25 },
        4: { id: 4, name: 'iPad Pro 12.9"', brand: 'Apple', price: 1099, image: '📱', stock: 12 },
        5: { id: 5, name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', price: 1299, image: '📱', stock: 20 },
        6: { id: 6, name: 'Dell XPS 13 Plus', brand: 'Dell', price: 1399, image: '💻', stock: 10 },
        7: { id: 7, name: 'Sony WH-1000XM5', brand: 'Sony', price: 399, image: '🎧', stock: 18 },
        8: { id: 8, name: 'Surface Pro 9', brand: 'Microsoft', price: 999, image: '📱', stock: 14 }
    }

    // Obtener productos del carrito con detalles completos
    const cartItems = cart.map(item => ({
        ...productsData[item.id],
        quantity: item.quantity
    })).filter(item => item.id) // Filtrar items que existen

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId)
            return
        }

        setCart(prev => prev.map(item => 
            item.id === productId 
                ? { ...item, quantity: Math.min(newQuantity, productsData[productId]?.stock || 1) }
                : item
        ))
    }

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId))
    }

    const clearCart = () => {
        setCart([])
    }

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    }

    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0)
    }

    const handleCheckout = () => {
        console.log('Checkout button clicked, navigating to checkout')
        onNavigate('checkout')
    }

    if (!isAuthenticated) {
        return (
            <div className="cart-container">
                <div className="cart-empty">
                    <div className="empty-icon">🛒</div>
                    <h2>Inicia sesión para ver tu carrito</h2>
                    <p>Necesitas estar autenticado para acceder a tu carrito de compras</p>
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

    if (cartItems.length === 0) {
        return (
            <div className="cart-container">
                <div className="cart-header">
                    <h1 className="cart-title">Mi Carrito</h1>
                    <button 
                        className="back-btn"
                        onClick={() => onNavigate('products')}
                    >
                        ← Seguir Comprando
                    </button>
                </div>
                
                <div className="cart-empty">
                    <div className="empty-icon">🛒</div>
                    <h2>Tu carrito está vacío</h2>
                    <p>¡Agrega algunos productos increíbles a tu carrito!</p>
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
        <div className="cart-container">
            <div className="cart-header">
                <h1 className="cart-title">Mi Carrito ({getTotalItems()} productos)</h1>
                <button 
                    className="back-btn"
                    onClick={() => onNavigate('products')}
                >
                    ← Seguir Comprando
                </button>
            </div>

            <div className="cart-content">
                <div className="cart-items">
                    {cartItems.map(item => (
                        <div key={item.id} className="cart-item">
                            <div className="item-image">
                                {item.image}
                            </div>
                            
                            <div className="item-details">
                                <div className="item-brand">{item.brand}</div>
                                <h3 className="item-name">{item.name}</h3>
                                <div className="item-price">${item.price.toLocaleString()}</div>
                                <div className="item-stock">Stock disponible: {item.stock}</div>
                            </div>

                            <div className="item-controls">
                                <div className="quantity-controls">
                                    <button 
                                        className="qty-btn"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    >
                                        -
                                    </button>
                                    <span className="quantity">{item.quantity}</span>
                                    <button 
                                        className="qty-btn"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        disabled={item.quantity >= item.stock}
                                    >
                                        +
                                    </button>
                                </div>
                                
                                <div className="item-total">
                                    ${(item.price * item.quantity).toLocaleString()}
                                </div>
                                
                                <button 
                                    className="remove-btn"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <div className="summary-card">
                        <h3 className="summary-title">Resumen del Pedido</h3>
                        
                        <div className="summary-line">
                            <span>Productos ({getTotalItems()})</span>
                            <span>${getTotalPrice().toLocaleString()}</span>
                        </div>
                        
                        <div className="summary-line">
                            <span>Envío</span>
                            <span className="free">Gratis</span>
                        </div>
                        
                        <div className="summary-divider"></div>
                        
                        <div className="summary-total">
                            <span>Total</span>
                            <span>${getTotalPrice().toLocaleString()}</span>
                        </div>

                        <button 
                            className="checkout-btn"
                            onClick={handleCheckout}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Procesando...' : 'Finalizar Compra'}
                        </button>

                        <button 
                            className="clear-cart-btn"
                            onClick={clearCart}
                        >
                            Vaciar Carrito
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart