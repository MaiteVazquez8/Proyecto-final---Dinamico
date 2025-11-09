import { useState, useEffect } from "react"
import axios from "axios"
import Swal from 'sweetalert2'
import { AiFillStar, AiOutlineStar } from "react-icons/ai"
import "./ProductDetail.css"

function ProductDetail({ onNavigate, productId, isAuthenticated, cart, setCart, favorites, setFavorites, currentUser }) {
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState('description') // description, reviews
    const [currentImageIndex, setCurrentImageIndex] = useState(0) // 0 para imagen 1, 1 para imagen 2
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: '',
        title: ''
    })
    const [reviews, setReviews] = useState([])
    const [loadingReviews, setLoadingReviews] = useState(false)

    // Cargar producto del servidor
    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true)
                // Obtener todos los productos y buscar el que coincide con productId
                const response = await axios.get('http://localhost:3000/api/productos/productos')
                const productsData = response.data || []
                const productData = productsData.find(p => p.ID_Producto === productId)
                
                if (productData) {
                    // Extraer marca del nombre del producto
                    const getBrand = (name) => {
                        if (!name) return 'ElectroShop'
                        if (name.includes('iPhone') || name.includes('MacBook') || name.includes('iPad') || name.includes('AirPods')) return 'Apple'
                        if (name.includes('Samsung') || name.includes('Galaxy')) return 'Samsung'
                        if (name.includes('Dell')) return 'Dell'
                        if (name.includes('Sony')) return 'Sony'
                        if (name.includes('Google') || name.includes('Pixel')) return 'Google'
                        return 'ElectroShop'
                    }

                    const mappedProduct = {
                        id: productData.ID_Producto,
                        name: productData.Nombre || 'Producto sin nombre',
                        brand: getBrand(productData.Nombre),
                        price: productData.Precio || 0,
                        image_1: productData.Imagen_1 || 'Imagen no disponible',
                        image_2: productData.Imagen_2 || null,
                        description: productData.Descripcion || 'Sin descripción disponible',
                        rating: productData.Promedio_Calificacion || 4.5,
                        stock: productData.Stock || 0,
                        category: productData.Categoria || 'Otros',
                        isNew: false,
                        color: productData.Color,
                        subcategoria: productData.Subcategoria
                    }
                    
                    setProduct(mappedProduct)
                } else {
                    // Si no se encuentra, crear un producto por defecto
                    setProduct({
                        id: productId,
                        name: 'Producto no encontrado',
                        brand: 'ElectroShop',
                        price: 0,
                        image_1: 'Imagen no disponible',
                        image_2: null,
                        description: 'El producto solicitado no está disponible',
                        rating: 0,
                        stock: 0,
                        category: 'Otros',
                        isNew: false
                    })
                }
            } catch (err) {
                console.error('Error al cargar producto:', err)
                    setProduct({
                        id: productId,
                        name: 'Error al cargar producto',
                        brand: 'ElectroShop',
                        price: 0,
                        image_1: 'Imagen no disponible',
                        image_2: null,
                        description: 'No se pudo cargar la información del producto',
                        rating: 0,
                        stock: 0,
                        category: 'Otros',
                        isNew: false
                    })
            } finally {
                setLoading(false)
            }
        }

        if (productId) {
            loadProduct()
        }
    }, [productId])

    // Listen for purchase events so we can refresh stock if this product was bought
    useEffect(() => {
        const onPurchase = (e) => {
            try {
                const detail = e?.detail || {};
                const productIds = detail.productIds || [];
                // If this product was among purchased products, reload
                if (productId && productIds.includes(productId)) {
                    // re-run loading
                    (async () => {
                        try {
                            const response = await axios.get('http://localhost:3000/api/productos/productos')
                            const productsData = response.data || []
                            const productData = productsData.find(p => p.ID_Producto === productId)
                            if (productData) {
                                const getBrand = (name) => {
                                    if (!name) return 'ElectroShop'
                                    if (name.includes('iPhone') || name.includes('MacBook') || name.includes('iPad') || name.includes('AirPods')) return 'Apple'
                                    if (name.includes('Samsung') || name.includes('Galaxy')) return 'Samsung'
                                    if (name.includes('Dell')) return 'Dell'
                                    if (name.includes('Sony')) return 'Sony'
                                    if (name.includes('Google') || name.includes('Pixel')) return 'Google'
                                    return 'ElectroShop'
                                }
                                const mappedProduct = {
                                    id: productData.ID_Producto,
                                    name: productData.Nombre || 'Producto sin nombre',
                                    brand: getBrand(productData.Nombre),
                                    price: productData.Precio || 0,
                                    image_1: productData.Imagen_1 || 'Imagen no disponible',
                                    image_2: productData.Imagen_2 || null,
                                    description: productData.Descripcion || 'Sin descripción disponible',
                                    rating: productData.Promedio_Calificacion || 4.5,
                                    stock: productData.Stock || 0,
                                    category: productData.Categoria || 'Otros',
                                    isNew: false,
                                    color: productData.Color,
                                    subcategoria: productData.Subcategoria
                                }
                                setProduct(mappedProduct)
                            }
                        } catch (err) {
                            console.error('Error al recargar producto tras compra:', err)
                        }
                    })()
                }
            } catch (err) {
                // ignore
            }
        }

        window.addEventListener('purchaseCompleted', onPurchase)

        // also listen to localStorage changes (other tabs)
        const onStorage = (ev) => {
            if (ev.key === 'lastPurchase') {
                try {
                    const productIds = []
                    // If product was part of last purchase we don't have ids here, but reload just in case
                    if (productId) {
                        // reload product
                        (async () => {
                            try {
                                const response = await axios.get('http://localhost:3000/api/productos/productos')
                                const productsData = response.data || []
                                const productData = productsData.find(p => p.ID_Producto === productId)
                                if (productData) {
                                    const getBrand = (name) => {
                                        if (!name) return 'ElectroShop'
                                        if (name.includes('iPhone') || name.includes('MacBook') || name.includes('iPad') || name.includes('AirPods')) return 'Apple'
                                        if (name.includes('Samsung') || name.includes('Galaxy')) return 'Samsung'
                                        if (name.includes('Dell')) return 'Dell'
                                        if (name.includes('Sony')) return 'Sony'
                                        if (name.includes('Google') || name.includes('Pixel')) return 'Google'
                                        return 'ElectroShop'
                                    }
                                    const mappedProduct = {
                                        id: productData.ID_Producto,
                                        name: productData.Nombre || 'Producto sin nombre',
                                        brand: getBrand(productData.Nombre),
                                        price: productData.Precio || 0,
                                        image_1: productData.Imagen_1 || 'Imagen no disponible',
                                        image_2: productData.Imagen_2 || null,
                                        description: productData.Descripcion || 'Sin descripción disponible',
                                        rating: productData.Promedio_Calificacion || 4.5,
                                        stock: productData.Stock || 0,
                                        category: productData.Categoria || 'Otros',
                                        isNew: false,
                                        color: productData.Color,
                                        subcategoria: productData.Subcategoria
                                    }
                                    setProduct(mappedProduct)
                                }
                            } catch (err) {
                                console.error('Error al recargar producto tras storage event:', err)
                            }
                        })()
                    }
                } catch (err) {
                    // ignore
                }
            }
        }

        window.addEventListener('storage', onStorage)

        return () => {
            window.removeEventListener('purchaseCompleted', onPurchase)
            window.removeEventListener('storage', onStorage)
        }
    }, [productId])

    // Cargar comentarios del servidor
    useEffect(() => {
        const loadComments = async () => {
            if (!productId) return
            
            try {
                setLoadingReviews(true)
                const response = await axios.get(`http://localhost:3000/api/compras/comentarios/${productId}`)
                const comments = response.data || []
                
                // Mapear comentarios del servidor al formato esperado
                const mappedReviews = comments.map(comment => ({
                    id: comment.ID_Comentario,
                    user: comment.Nombre_Usuario || 'Usuario',
                    rating: comment.Puntuacion || 5,
                    title: comment.Titulo || 'Sin título',
                    comment: comment.Texto || '',
                    date: comment.Fecha || new Date().toISOString().split('T')[0],
                    verified: false // Por ahora no verificamos compras
                }))
                
                setReviews(mappedReviews)
            } catch (err) {
                console.error('Error al cargar comentarios:', err)
                setReviews([])
            } finally {
                setLoadingReviews(false)
            }
        }

        loadComments()
    }, [productId])

    // Si no hay producto o está cargando, mostrar loading
    if (loading || !product) {
        return (
            <div className="product-detail-container">
                <div className="loading-container">
                    <p>Cargando producto...</p>
                </div>
            </div>
        )
    }

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            onNavigate('login')
            return
        }
        
        // Solo agregar si el producto NO está en el carrito
        const existingItem = cart.find(item => item.id === productId)
        if (existingItem) {
            console.log('El producto ya está en el carrito')
            return
        }

        try {
            // Agregar al servidor (igual que favoritos)
            await axios.post('http://localhost:3000/api/compras/carrito', {
                DNI: currentUser?.DNI,
                ID_Producto: productId,
                Total: product.price * quantity
            })
            
            // Actualizar el estado local (igual que favoritos)
            setCart(prev => [...prev, { id: productId, quantity: quantity }])
            console.log(`Agregado al carrito: ${quantity} x ${product.name}`)
        } catch (error) {
            console.error('Error al agregar al carrito:', error)
        }
    }

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            onNavigate('login')
            return
        }
        
        // Si ya está en el carrito, simplemente navegar al checkout
        const existingItem = cart.find(item => item.id === productId)
        if (existingItem) {
            onNavigate('checkout')
            return
        }

        // Agregar al carrito primero (una unidad por cantidad seleccionada) y luego ir al checkout
        // Esto permite reutilizar la lógica existente del Checkout que lee el carrito del servidor
        (async () => {
            try {
                await axios.post('http://localhost:3000/api/compras/carrito', {
                    DNI: currentUser?.DNI,
                    ID_Producto: productId,
                    Total: product.price * quantity
                })

                // Actualizar estado local del carrito para sincronizar UI
                setCart(prev => [...prev, { id: productId, quantity }])

                // Navegar al checkout (uso flujo de carrito)
                onNavigate('checkout')
            } catch (error) {
                console.error('Error al agregar al carrito para comprar ahora:', error)
                // Si hay error, aún navegar al checkout para que el usuario pueda intentar desde allí
                onNavigate('checkout')
            }
        })()
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
        const full = Math.floor(rating)
        const stars = []
        for (let i = 1; i <= 5; i++) {
            stars.push(i <= full ? <AiFillStar key={i} className="star-icon" /> : <AiOutlineStar key={i} className="star-icon" />)
        }
        return <span className="stars-icon-list">{stars}</span>
    }

    // Funciones auxiliares para simplificar el código
    const getStockStatusClass = () => {
        let statusClass = "stock-status"
        if (product.stock > 0) {
            statusClass += " in-stock"
        } else {
            statusClass += " out-stock"
        }
        return statusClass
    }

    const getStockStatusText = () => {
        if (product.stock > 0) {
            return `En stock (${product.stock} disponibles)`
        } else {
            return 'Sin stock'
        }
    }

    const getFavoriteButtonClass = () => {
        let buttonClass = "favorite-btn-large"
        if (isInFavorites()) {
            buttonClass += " active"
        }
        return buttonClass
    }

    const getFavoriteButtonText = () => {
        if (isInFavorites()) {
            return 'En Favoritos'
        } else {
            return 'Agregar a Favoritos'
        }
    }

    const getAddToCartButtonClass = () => {
        let buttonClass = "add-to-cart-btn-large"
        if (isInCart()) {
            buttonClass += " in-cart"
        }
        return buttonClass
    }

    const getAddToCartButtonText = () => {
        if (product.stock === 0) {
            return 'Sin Stock'
        } else if (isInCart()) {
            return 'Ya está en el carrito'
        } else {
            return 'Agregar al Carrito'
        }
    }

    const getTabHeaderClass = (tabName) => {
        let tabClass = "tab-header"
        if (activeTab === tabName) {
            tabClass += " active"
        }
        return tabClass
    }

    const getStarButtonClass = (star, currentRating) => {
        let starClass = "star-btn"
        if (star <= currentRating) {
            starClass += " active"
        }
        return starClass
    }

    // Funciones para manejar el cambio de imágenes
    const getCurrentImage = () => {
        const images = getProductImages()
        if (images.length > 0) {
            return images[currentImageIndex] || images[0]
        }
        return 'Imagen no disponible' // Imagen por defecto si no hay ninguna
    }

    const getProductImages = () => {
        const images = []
        // Primero intentar con image_1 e image_2 (formato del mock)
        if (product.image_1) images.push(product.image_1)
        if (product.image_2) images.push(product.image_2)
        
        // Si no hay image_1/image_2, usar image (formato del servidor)
        // Si solo hay una imagen, duplicarla para tener dos (opcional)
        if (images.length === 0 && product.image) {
            images.push(product.image)
            // Si hay Imagen_2 en el producto original, agregarla también
            if (product.Imagen_2) {
                images.push(product.Imagen_2)
            }
        }
        
        return images
    }

    // Función para verificar si una imagen es Base64 o URL
    const isImageUrl = (img) => {
        if (!img || typeof img !== 'string') return false
        return img.startsWith('data:image/') || img.startsWith('http://') || img.startsWith('https://')
    }

    // Función para renderizar una imagen correctamente
    const renderImage = (img, alt = product.name, className = 'product-image-large') => {
        if (isImageUrl(img)) {
            return <img src={img} alt={alt} className={className} />
        }
        // Si no es una URL Base64, mostrar como texto
        return <div className={className}>{img}</div>
    }

    // Función para renderizar miniatura
    const renderThumbnail = (img, index) => {
        if (isImageUrl(img)) {
            return <img src={img} alt={`Imagen ${index + 1}`} className="thumbnail-img" />
        }
        return <div className="thumbnail-image">{img}</div>
    }

    const handleImageChange = (index) => {
        setCurrentImageIndex(index)
    }

    const handleNextImage = () => {
        const images = getProductImages()
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length)
        }
    }

    const handlePrevImage = () => {
        const images = getProductImages()
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
        }
    }

    // Funciones para reseñas
    const renderInteractiveStars = (currentRating, onRatingChange) => {
        return (
            <div className="interactive-stars">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        className={getStarButtonClass(star, currentRating)}
                        onClick={() => onRatingChange(star)}
                    >
                        <AiFillStar />
                    </button>
                ))}
            </div>
        )
    }

    const handleReviewSubmit = async (e) => {
        e.preventDefault()
        
        if (!isAuthenticated) {
            onNavigate('login')
            return
        }

        if (!newReview.title.trim() || !newReview.comment.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor completa todos los campos',
                confirmButtonColor: '#B8CFCE',
                confirmButtonText: 'Aceptar'
            })
            return
        }

        try {
            // Guardar comentario en el servidor
            await axios.post('http://localhost:3000/api/compras/comentario', {
                DNI: currentUser?.DNI,
                ID_Producto: productId,
                Texto: newReview.comment.trim(),
                Titulo: newReview.title.trim(),
                Puntuacion: newReview.rating
            })

            // Crear el review local con los datos del usuario actual
            const review = {
                id: Date.now(), // ID temporal hasta que se recargue desde el servidor
                user: `${currentUser?.Nombre || ''} ${currentUser?.Apellido || ''}`.trim() || 'Usuario',
                rating: newReview.rating,
                title: newReview.title.trim(),
                comment: newReview.comment.trim(),
                date: new Date().toISOString().split('T')[0],
                verified: false
            }

            // Agregar a la lista local inmediatamente
            setReviews(prev => [review, ...prev])
            setNewReview({ rating: 5, comment: '', title: '' })

            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Tu comentario ha sido guardado correctamente',
                confirmButtonColor: '#B8CFCE',
                confirmButtonText: 'Aceptar'
            })

            // Recargar comentarios desde el servidor para obtener el ID real
            setTimeout(() => {
                axios.get(`http://localhost:3000/api/compras/comentarios/${productId}`)
                    .then(response => {
                        const comments = response.data || []
                        const mappedReviews = comments.map(comment => ({
                            id: comment.ID_Comentario,
                            user: comment.Nombre_Usuario || 'Usuario',
                            rating: comment.Puntuacion || 5,
                            title: comment.Titulo || 'Sin título',
                            comment: comment.Texto || '',
                            date: comment.Fecha || new Date().toISOString().split('T')[0],
                            verified: false
                        }))
                        setReviews(mappedReviews)
                    })
                    .catch(err => console.error('Error al recargar comentarios:', err))
            }, 500)

        } catch (error) {
            console.error('Error al guardar comentario:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.Error || 'No se pudo guardar el comentario',
                confirmButtonColor: '#A0A2BA',
                confirmButtonText: 'Aceptar'
            })
        }
    }

    const getAverageRating = () => {
        if (reviews.length === 0) {
            return product?.rating || 0
        }
        // Calcular promedio solo de comentarios con puntuación
        const reviewsWithRating = reviews.filter(r => r.rating && r.rating > 0)
        if (reviewsWithRating.length === 0) {
            return product?.rating || 0
        }
        const average = reviewsWithRating.reduce((sum, review) => sum + review.rating, 0) / reviewsWithRating.length
        return parseFloat(average.toFixed(1))
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
                        {renderImage(getCurrentImage(), product.name, 'product-image-large')}
                        
                        {/* Botón anterior (solo si hay más de una imagen) */}
                        {(() => {
                            const images = getProductImages()
                            if (images.length > 1) {
                                return (
                                    <button 
                                        className="image-nav-btn prev-btn"
                                        onClick={handlePrevImage}
                                        title="Imagen anterior"
                                    >
                                        ‹
                                    </button>
                                )
                            }
                            return null
                        })()}
                        
                        {/* Botón siguiente (solo si hay más de una imagen) */}
                        {(() => {
                            const images = getProductImages()
                            if (images.length > 1) {
                                return (
                                    <button 
                                        className="image-nav-btn next-btn"
                                        onClick={handleNextImage}
                                        title="Siguiente imagen"
                                    >
                                        ›
                                    </button>
                                )
                            }
                            return null
                        })()}
                        
                        {product.isNew && <div className="new-badge-large">Nuevo</div>}
                    </div>
                    
                    {/* Miniaturas de imágenes */}
                    {(() => {
                        const images = getProductImages()
                        if (images.length > 1) {
                            return (
                                <div className="image-thumbnails">
                                    {images.map((img, index) => (
                                        <button
                                            key={index}
                                            className={`thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                                            onClick={() => handleImageChange(index)}
                                            title={`Ver imagen ${index + 1}`}
                                        >
                                            {renderThumbnail(img, index)}
                                        </button>
                                    ))}
                                </div>
                            )
                        }
                        return null
                    })()}
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
                            <span className={getStockStatusClass()}>
                                {getStockStatusText()}
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
                                className={getFavoriteButtonClass()}
                                onClick={toggleFavorite}
                            >
                                {getFavoriteButtonText()}
                            </button>
                            
                            <button 
                                className={getAddToCartButtonClass()}
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                            >
                                {getAddToCartButtonText()}
                            </button>
                            
                            <button 
                                className="buy-now-btn"
                                onClick={handleBuyNow}
                                disabled={product.stock === 0}
                            >
                                Comprar Ahora
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de Tabs */}
            <div className="product-tabs">
                <div className="tab-headers">
                    <button 
                        className={getTabHeaderClass('description')}
                        onClick={() => setActiveTab('description')}
                    >
                        Descripción
                    </button>
                    <button 
                        className={getTabHeaderClass('reviews')}
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
                                                    <span className="star-label">{star} <AiFillStar /></span>
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
                                {loadingReviews ? (
                                    <p className="no-reviews">Cargando comentarios...</p>
                                ) : reviews.length === 0 ? (
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