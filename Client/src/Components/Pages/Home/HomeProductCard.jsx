import React, { useState } from 'react'

function HomeProductCard({ product, onClick }) {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)

    // Verificar si la imagen es Base64 o una URL
    const getImageSrc = () => {
        const image = product.image_1
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

    return (
        <div 
            className="ml-product-card"
            onClick={() => onClick(product.id)}
        >
            {/* Imagen del producto */}
            <div className="ml-product-image">
                {hasValidImage() && !imageError ? (
                    <>
                        <img 
                            src={getImageSrc()}
                            alt={product.name}
                            className="ml-product-img"
                            onLoad={() => setImageLoaded(true)}
                            onError={() => {
                                setImageError(true)
                                setImageLoaded(false)
                            }}
                        />
                        {!imageLoaded && (
                            <div className="ml-product-placeholder">
                                <span className="ml-product-category">Cargando...</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="ml-product-placeholder">
                        <span className="ml-product-category">{product.imageType?.toUpperCase() || 'PRODUCTO'}</span>
                    </div>
                )}
            </div>
            
            {/* Información del producto */}
            <div className="ml-product-info">
                <h3 className="ml-product-title">{product.name}</h3>
                <div className="ml-product-price">{product.price}</div>
                
                {/* Badge si existe */}
                {product.badge && (
                    <div className="ml-product-badge">
                        {product.badge}
                    </div>
                )}
                
            </div>
        </div>
    )
}

export default HomeProductCard