import { useState } from "react"
import { 
    AiOutlineHeart, 
    AiFillHeart, 
    AiFillStar, 
    AiOutlineStar,
    AiOutlineMobile,
    AiOutlineLaptop,
    AiOutlineTablet,
    AiOutlineAudio
} from "react-icons/ai"
import { BsBox } from "react-icons/bs"
import "./ProductCard.css"

function ProductCard({ 
    product, 
    onAddToCart, 
    onToggleFavorite, 
    onViewDetails, 
    isFavorite, 
    isInCart, 
    isAuthenticated 
}) {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)

    const handleAddToCart = (e) => {
        e.stopPropagation()
        onAddToCart(product.id)
    }

    const handleToggleFavorite = (e) => {
        e.stopPropagation()
        onToggleFavorite(product.id)
    }

    const handleViewDetails = () => {
        onViewDetails(product.id)
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(price)
    }

    const getProductIcon = (imageType) => {
        switch (imageType) {
            case 'PHONE':
                return <AiOutlineMobile />
            case 'LAPTOP':
                return <AiOutlineLaptop />
            case 'TABLET':
                return <AiOutlineTablet />
            case 'AUDIO':
                return <AiOutlineAudio />
            default:
                return <BsBox />
        }
    }

    // Verificar si la imagen es Base64 o una URL
    const getImageSrc = () => {
        const image = product.image_1 || product.image || product.Imagen_1
        if (!image) return null
        
        // Si es Base64 (empieza con data:image/)
        if (typeof image === 'string' && image.startsWith('data:image/')) {
            return image
        }
        
        // Si es una URL
        if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
            return image
        }
        
        return null
    }

    const hasValidImage = () => {
        return getImageSrc() !== null
    }

    // Funciones auxiliares para simplificar el código
    const getFavoriteButtonClass = () => {
        let buttonClass = "ml-favorite-btn"
        if (isFavorite) {
            buttonClass += " active"
        }
        return buttonClass
    }

    const getFavoriteIcon = () => {
        if (isFavorite) {
            return <AiFillHeart />
        } else {
            return <AiOutlineHeart />
        }
    }

    const getStockText = () => {
        if (product.stock > 0) {
            return `${product.stock} disponibles`
        } else {
            return 'Sin stock'
        }
    }

    const getAddToCartButtonClass = () => {
        let buttonClass = "ml-add-to-cart"
        if (isInCart) {
            buttonClass += " in-cart"
        }
        if (product.stock === 0) {
            buttonClass += " disabled"
        }
        return buttonClass
    }

    const getAddToCartButtonText = () => {
        if (!isAuthenticated) {
            return 'Inicia sesión'
        } else if (product.stock === 0) {
            return 'Sin stock'
        } else if (isInCart) {
            return 'En el carrito'
        } else {
            return 'Agregar al carrito'
        }
    }

    const isAddToCartDisabled = () => {
        // Solo deshabilitar si no hay stock o ya está en el carrito
        // No deshabilitar si no está autenticado, para que pueda redirigir al login
        return product.stock === 0 || isInCart
    }

    return (
        <div className="ml-catalog-card" onClick={handleViewDetails}>
            {/* Imagen del producto */}
            <div className="ml-catalog-image">
                {hasValidImage() && !imageError ? (
                    <>
                        <img 
                            src={getImageSrc()}
                            alt={product.name}
                            className="ml-catalog-product-image"
                            onLoad={() => setImageLoaded(true)}
                            onError={() => {
                                setImageError(true)
                                setImageLoaded(false)
                            }}
                        />
                        {!imageLoaded && (
                            <div className="ml-catalog-placeholder">
                                <span className="ml-catalog-category">Cargando...</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="ml-catalog-placeholder">
                        {product.category ? (
                            <span className="ml-catalog-category">{product.category.toUpperCase()}</span>
                        ) : (
                            getProductIcon(product.image_1 || product.image || product.Imagen_1 || 'PRODUCT')
                        )}
                    </div>
                )}
                
                {/* Botón de favoritos */}
                <button
                    className={getFavoriteButtonClass()}
                    onClick={handleToggleFavorite}
                    disabled={!isAuthenticated}
                >
                    {getFavoriteIcon()}
                </button>
            </div>

            {/* Información del producto */}
            <div className="ml-catalog-info">
                <h3 className="ml-catalog-title">{product.name}</h3>
                
                {/* Rating */}
                {product.rating && (
                    <div className="ml-catalog-rating">
                        <div className="ml-rating-stars">
                            {[...Array(5)].map((_, i) => {
                                const isFilled = i < Math.floor(product.rating)
                                let starClass = "ml-star"
                                if (isFilled) {
                                    starClass += " filled"
                                }
                                
                                let starIcon
                                if (isFilled) {
                                    starIcon = <AiFillStar />
                                } else {
                                    starIcon = <AiOutlineStar />
                                }
                                
                                return (
                                    <span key={i} className={starClass}>
                                        {starIcon}
                                    </span>
                                )
                            })}
                        </div>
                        <span className="ml-rating-value">({product.rating})</span>
                    </div>
                )}
                
                <div className="ml-catalog-price">{formatPrice(product.price)}</div>
                
                {/* Información adicional */}
                <div className="ml-catalog-details">
                    <span className="ml-catalog-stock">
                        {getStockText()}
                    </span>
                </div>
                
                {/* Badge de nuevo */}
                {product.isNew && (
                    <div className="ml-catalog-badge">
                        Nuevo
                    </div>
                )}
            </div>

            {/* Botón de agregar al carrito */}
            <div className="ml-catalog-actions">
                <button
                    className={getAddToCartButtonClass()}
                    onClick={handleAddToCart}
                    disabled={isAddToCartDisabled()}
                >
                    {getAddToCartButtonText()}
                </button>
            </div>
        </div>
    )
}

export default ProductCard