import { useState } from "react"
import "./ProductDetail.css"

function ProductDetail({ onNavigate, productId, isAuthenticated }) {
    const [quantity, setQuantity] = useState(1)
    const [isFavorite, setIsFavorite] = useState(false)

    // Base de datos de productos simplificada
    const productsDatabase = {
        1: {
            id: 1,
            name: 'iPhone 15 Pro Max',
            brand: 'Apple',
            price: 1199,
            image: '📱',
            description: 'El iPhone más avanzado hasta la fecha con el revolucionario chip A17 Pro.',
            rating: 4.8,
            stock: 15,
            category: 'Smartphones',
            isNew: true
        },
        2: {
            id: 2,
            name: 'MacBook Pro M3',
            brand: 'Apple',
            price: 1999,
            image: '💻',
            description: 'Potencia profesional con el nuevo chip M3 y pantalla Liquid Retina XDR.',
            rating: 4.9,
            stock: 8,
            category: 'Laptops',
            isNew: true
        },
        3: {
            id: 3,
            name: 'AirPods Pro 2',
            brand: 'Apple',
            price: 249,
            image: '🎧',
            description: 'Audio espacial personalizado con cancelación activa de ruido.',
            rating: 4.7,
            stock: 25,
            category: 'Audio',
            isNew: false
        }
    }

    const product = productsDatabase[productId] || productsDatabase[1]

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            onNavigate('login')
            return
        }
        console.log(`Agregado al carrito: ${quantity} x ${product.name}`)
    }

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            onNavigate('login')
            return
        }
        onNavigate('checkout', { productId: product.id, quantity })
    }

    const toggleFavorite = () => {
        if (!isAuthenticated) {
            onNavigate('login')
            return
        }
        setIsFavorite(!isFavorite)
    }

    const renderStars = (rating) => {
        return '⭐'.repeat(Math.floor(rating))
    }

    return (
        <div className="product-detail-container">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <button onClick={() => onNavigate('products')} className="breadcrumb-link">
                    Productos
                </button>
                <span className="breadcrumb-separator">›</span>
                <span className="breadcrumb-current">{product.name}</span>
            </div>

            <div className="product-detail-content">
                {/* Imagen del producto */}
                <div className="product-gallery">
                    <div className="main-image">
                        <div className="product-image-large">
                            {product.image}
                        </div>
                        {product.isNew && <div className="new-badge-large">Nuevo</div>}
                    </div>
                </div>

                {/* Información del producto */}
                <div className="product-info-detail">
                    <div className="product-header">
                        <div className="product-brand-detail">{product.brand}</div>
                        <h1 className="product-name-detail">{product.name}</h1>
                        
                        <div className="product-rating-detail">
                            <span className="stars-large">{renderStars(product.rating)}</span>
                            <span className="rating-value-large">{product.rating}</span>
                        </div>
                    </div>

                    <div className="product-pricing">
                        <span className="current-price">${product.price.toLocaleString()}</span>
                        <div className="stock-info">
                            <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                                {product.stock > 0 ? `✅ En stock (${product.stock} disponibles)` : '❌ Sin stock'}
                            </span>
                        </div>
                    </div>

                    <div className="product-description-detail">
                        <p>{product.description}</p>
                    </div>

                    {/* Controles de compra */}
                    <div className="purchase-controls">
                        <div className="quantity-selector">
                            <label>Cantidad:</label>
                            <div className="quantity-controls">
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="quantity-btn"
                                >
                                    -
                                </button>
                                <span className="quantity-value">{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="quantity-btn"
                                    disabled={quantity >= product.stock}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="action-buttons">
                            <button 
                                className={`favorite-btn-large ${isFavorite ? 'active' : ''}`}
                                onClick={toggleFavorite}
                            >
                                {isFavorite ? '❤️' : '🤍'} {isFavorite ? 'En Favoritos' : 'Agregar a Favoritos'}
                            </button>
                            
                            <button 
                                className="add-to-cart-btn-large"
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                            >
                                🛒 Agregar al Carrito
                            </button>
                            
                            <button 
                                className="buy-now-btn"
                                onClick={handleBuyNow}
                                disabled={product.stock === 0}
                            >
                                💳 Comprar Ahora
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetail