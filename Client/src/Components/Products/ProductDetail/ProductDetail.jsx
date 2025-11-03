import { useState } from "react"
import "./ProductDetail.css"

function ProductDetail({ onNavigate, productId, isAuthenticated, cart, setCart, favorites, setFavorites }) {
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState('description') // description, reviews
    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: '',
        title: ''
    })
    const [reviews, setReviews] = useState([
        {
            id: 1,
            user: 'Juan Pérez',
            rating: 5,
            title: 'Excelente producto',
            comment: 'Muy buena calidad, llegó rápido y funciona perfecto. Lo recomiendo totalmente.',
            date: '2024-01-15',
            verified: true
        },
        {
            id: 2,
            user: 'María González',
            rating: 4,
            title: 'Buena compra',
            comment: 'El producto cumple con las expectativas. La batería dura bastante y la pantalla se ve muy bien.',
            date: '2024-01-10',
            verified: true
        },
        {
            id: 3,
            user: 'Carlos López',
            rating: 5,
            title: 'Increíble',
            comment: 'Superó mis expectativas. La calidad de construcción es excelente y el rendimiento es muy bueno.',
            date: '2024-01-08',
            verified: false
        }
    ])

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
        
        // Solo agregar si el producto NO está en el carrito
        const existingItem = cart.find(item => item.id === productId)
        if (!existingItem) {
            setCart(prev => [...prev, { id: productId, quantity: quantity }])
            console.log(`Agregado al carrito: ${quantity} x ${product.name}`)
        }
        // Si ya está en el carrito, no hacer nada
    }

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            onNavigate('login')
            return
        }
        
        // Ir directamente al checkout con el producto específico
        console.log('Buy now clicked, navigating to checkout with product:', product)
        onNavigate('checkout', { 
            directProduct: {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity
            },
            purchaseType: 'direct'
        })
    }

    const toggleFavorite = () => {
        if (!isAuthenticated) {
            onNavigate('login')
            return
        }
        
        setFavorites(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }

    // Funciones auxiliares
    const isInCart = () => {
        return cart.some(item => item.id === productId)
    }

    const isInFavorites = () => {
        return favorites.includes(productId)
    }

    const renderStars = (rating) => {
        return '⭐'.repeat(Math.floor(rating))
    }

    // Funciones para reseñas
    const renderInteractiveStars = (currentRating, onRatingChange) => {
        return (
            <div className="interactive-stars">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        className={`star-btn ${star <= currentRating ? 'active' : ''}`}
                        onClick={() => onRatingChange(star)}
                    >
                        ⭐
                    </button>
                ))}
            </div>
        )
    }

    const handleReviewSubmit = (e) => {
        e.preventDefault()
        
        if (!isAuthenticated) {
            onNavigate('login')
            return
        }

        if (!newReview.title.trim() || !newReview.comment.trim()) {
            alert('Por favor completa todos los campos')
            return
        }

        const review = {
            id: reviews.length + 1,
            user: 'Usuario Actual', // En una app real vendría del usuario logueado
            rating: newReview.rating,
            title: newReview.title,
            comment: newReview.comment,
            date: new Date().toISOString().split('T')[0],
            verified: true
        }

        setReviews(prev => [review, ...prev])
        setNewReview({ rating: 5, comment: '', title: '' })
        
        // Actualizar rating promedio del producto (simulado)
        const newAverage = (reviews.reduce((sum, r) => sum + r.rating, 0) + review.rating) / (reviews.length + 1)
        console.log('Nuevo rating promedio:', newAverage.toFixed(1))
    }

    const getAverageRating = () => {
        if (reviews.length === 0) return product.rating
        return (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    }

    const getRatingDistribution = () => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        reviews.forEach(review => {
            distribution[review.rating]++
        })
        return distribution
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
                            <span className="stars-large">{renderStars(getAverageRating())}</span>
                            <span className="rating-value-large">{getAverageRating()}</span>
                            <span className="reviews-count">({reviews.length} reseñas)</span>
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
                                className={`favorite-btn-large ${isInFavorites() ? 'active' : ''}`}
                                onClick={toggleFavorite}
                            >
                                {isInFavorites() ? '❤️' : '🤍'} {isInFavorites() ? 'En Favoritos' : 'Agregar a Favoritos'}
                            </button>
                            
                            <button 
                                className={`add-to-cart-btn-large ${isInCart() ? 'in-cart' : ''}`}
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                            >
                                {product.stock === 0 
                                    ? '❌ Sin Stock' 
                                    : isInCart() 
                                        ? '✅ Ya está en el carrito' 
                                        : '🛒 Agregar al Carrito'
                                }
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

            {/* Sección de Tabs */}
            <div className="product-tabs">
                <div className="tab-headers">
                    <button 
                        className={`tab-header ${activeTab === 'description' ? 'active' : ''}`}
                        onClick={() => setActiveTab('description')}
                    >
                        Descripción
                    </button>
                    <button 
                        className={`tab-header ${activeTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reseñas ({reviews.length})
                    </button>
                </div>

                <div className="tab-content">
                    {/* Tab de Descripción */}
                    {activeTab === 'description' && (
                        <div className="description-tab">
                            <h3>Descripción del Producto</h3>
                            <p>{product.description}</p>
                            
                            <h4>Características:</h4>
                            <ul>
                                <li>• Marca: {product.brand}</li>
                                <li>• Categoría: {product.category}</li>
                                <li>• Stock disponible: {product.stock} unidades</li>
                                {product.isNew && <li>• ✨ Producto nuevo</li>}
                            </ul>
                        </div>
                    )}

                    {/* Tab de Reseñas */}
                    {activeTab === 'reviews' && (
                        <div className="reviews-tab">
                            {/* Resumen de Reseñas */}
                            <div className="reviews-summary">
                                <div className="rating-overview">
                                    <div className="average-rating">
                                        <span className="big-rating">{getAverageRating()}</span>
                                        <div className="rating-stars">
                                            {renderStars(getAverageRating())}
                                        </div>
                                        <span className="total-reviews">{reviews.length} reseñas</span>
                                    </div>
                                    
                                    <div className="rating-breakdown">
                                        {[5, 4, 3, 2, 1].map(star => {
                                            const count = getRatingDistribution()[star]
                                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                                            return (
                                                <div key={star} className="rating-bar">
                                                    <span className="star-label">{star} ⭐</span>
                                                    <div className="progress-bar">
                                                        <div 
                                                            className="progress-fill" 
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="count">({count})</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Formulario para Nueva Reseña */}
                            <div className="new-review-form">
                                <h3>Escribir una Reseña</h3>
                                {isAuthenticated ? (
                                    <form onSubmit={handleReviewSubmit}>
                                        <div className="form-group">
                                            <label>Calificación:</label>
                                            {renderInteractiveStars(newReview.rating, (rating) => 
                                                setNewReview(prev => ({ ...prev, rating }))
                                            )}
                                        </div>
                                        
                                        <div className="form-group">
                                            <label>Título de la reseña:</label>
                                            <input
                                                type="text"
                                                value={newReview.title}
                                                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="Resumen de tu experiencia"
                                                maxLength="100"
                                                required
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label>Tu comentario:</label>
                                            <textarea
                                                value={newReview.comment}
                                                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                                placeholder="Comparte tu experiencia con este producto..."
                                                rows="4"
                                                maxLength="500"
                                                required
                                            />
                                            <small>{newReview.comment.length}/500 caracteres</small>
                                        </div>
                                        
                                        <button type="submit" className="submit-review-btn">
                                            Publicar Reseña
                                        </button>
                                    </form>
                                ) : (
                                    <div className="login-prompt">
                                        <p>Debes iniciar sesión para escribir una reseña</p>
                                        <button 
                                            className="login-btn"
                                            onClick={() => onNavigate('login')}
                                        >
                                            Iniciar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Lista de Reseñas */}
                            <div className="reviews-list">
                                <h3>Todas las Reseñas</h3>
                                {reviews.length === 0 ? (
                                    <p className="no-reviews">Aún no hay reseñas para este producto. ¡Sé el primero en escribir una!</p>
                                ) : (
                                    reviews.map(review => (
                                        <div key={review.id} className="review-item">
                                            <div className="review-header">
                                                <div className="reviewer-info">
                                                    <span className="reviewer-name">{review.user}</span>
                                                    {review.verified && <span className="verified-badge">✓ Compra verificada</span>}
                                                </div>
                                                <div className="review-meta">
                                                    <div className="review-rating">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                    <span className="review-date">{review.date}</span>
                                                </div>
                                            </div>
                                            <div className="review-content">
                                                <h4 className="review-title">{review.title}</h4>
                                                <p className="review-comment">{review.comment}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductDetail