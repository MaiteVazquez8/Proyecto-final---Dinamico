import { useState, useEffect } from "react"
import axios from "axios"
import { PRODUCT_ENDPOINTS, SHOPPING_ENDPOINTS } from "../../../config/api"
import Swal from 'sweetalert2'
import { AiFillStar } from "react-icons/ai"
import "./Favorites.css"

function Favorites({ onNavigate, favorites, setFavorites, cart, setCart, isAuthenticated, currentUser }) {
    const [productsData, setProductsData] = useState({})
    const [loading, setLoading] = useState(true)

    // Cargar productos del servidor
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true)
                const response = await axios.get(PRODUCT_ENDPOINTS.GET_PRODUCTS)
                const products = response.data || []
                
                // Convertir array a objeto con ID como clave
                const productsMap = {}
                products.forEach(product => {
                    const getBrand = (name) => {
                        if (!name) return 'ElectroShop'
                        if (name.includes('iPhone') || name.includes('MacBook') || name.includes('iPad') || name.includes('AirPods')) return 'Apple'
                        if (name.includes('Samsung') || name.includes('Galaxy')) return 'Samsung'
                        if (name.includes('Dell')) return 'Dell'
                        if (name.includes('Sony')) return 'Sony'
                        if (name.includes('Google') || name.includes('Pixel')) return 'Google'
                        return 'ElectroShop'
                    }

                    productsMap[product.ID_Producto] = {
                        id: product.ID_Producto,
                        name: product.Nombre || 'Producto sin nombre',
                        brand: getBrand(product.Nombre),
                        price: product.Precio || 0,
                        image: product.Imagen_1 || null,
                        image_1: product.Imagen_1 || null,
                        Imagen_1: product.Imagen_1 || null,
                        description: product.Descripcion || 'Sin descripción disponible',
                        rating: product.Promedio_Calificacion || 4.5,
                        stock: product.Stock || 0,
                        isNew: false
                    }
                })
                
                setProductsData(productsMap)
            } catch (err) {
                console.error('Error al cargar productos:', err)
                setProductsData({})
            } finally {
                setLoading(false)
            }
        }

        loadProducts()
    }, [])

    // Obtener productos favoritos con detalles completos
    const favoriteItems = favorites.map(id => productsData[id]).filter(item => item)

    const removeFromFavorites = (productId) => {
        setFavorites(prev => prev.filter(id => id !== productId))
    }

    const clearFavorites = () => {
        setFavorites([])
    }

    const addToCart = async (productId) => {
        if (!isAuthenticated) {
            onNavigate('login')
            return
        }
        
        // Solo agregar si el producto NO está en el carrito local
        const existingItem = cart.find(item => item.id === productId)
        if (existingItem) {
            console.log('El producto ya está en el carrito')
            return
        }

        try {
            // Obtener el producto de los datos cargados del servidor
            const product = productsData[productId]
            if (!product) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Producto no encontrado',
                    confirmButtonColor: '#A0A2BA',
                    confirmButtonText: 'Aceptar'
                })
                return
            }

            console.log('Agregando producto al carrito desde favoritos:', {
                DNI: currentUser.DNI,
                ID_Producto: productId,
                Total: product.price
            })

            // Agregar al carrito usando el servidor (igual que ProductList)
            const response = await axios.post(SHOPPING_ENDPOINTS.ADD_TO_CART, {
                DNI: currentUser.DNI,
                ID_Producto: productId,
                Total: product.price
            })
            
            console.log('Respuesta del servidor al agregar:', response.data)
            
            // Actualizar el estado local
            setCart(prev => [...prev, { id: productId, quantity: 1 }])
            console.log('Producto agregado al carrito exitosamente desde favoritos')
        } catch (error) {
            console.error('Error al agregar al carrito desde favoritos:', error)
            if (error.response) {
                console.error('Error del servidor:', error.response.data)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response.data?.Error || 'No se pudo agregar el producto al carrito',
                    confirmButtonColor: '#A0A2BA',
                    confirmButtonText: 'Aceptar'
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'Verifica que el servidor esté funcionando.',
                    confirmButtonColor: '#A0A2BA',
                    confirmButtonText: 'Aceptar'
                })
            }
        }
    }

    const viewProductDetails = (productId) => {
        onNavigate('product-detail', { productId })
    }

    const isInCart = (productId) => {
        return cart.some(item => item.id === productId)
    }

    // Función para verificar si una imagen es Base64 o URL
    const isImageUrl = (img) => {
        if (!img || typeof img !== 'string') return false
        return img.startsWith('data:image/') || img.startsWith('http://') || img.startsWith('https://')
    }

    // Función para renderizar imagen
    const renderProductImage = (product) => {
        const image = product.image || product.image_1 || product.Imagen_1
        if (isImageUrl(image)) {
            return <img src={image} alt={product.name} className="product-image-img" />
        }
        return <span className="product-image-emoji">{image || 'Imagen no disponible'}</span>
    }

    if (loading) {
        return (
            <div className="favorites-container">
                <div className="favorites-empty">
                    <div className="empty-icon">Cargando...</div>
                    <h2>Cargando favoritos...</h2>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="favorites-container">
                <div className="favorites-empty">
                    <div className="empty-icon">Favoritos</div>
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
                        ← Explorar Catálogo
                    </button>
                </div>
                
                <div className="favorites-empty">
                    <div className="empty-icon">Favoritos</div>
                    <h2>No tienes favoritos aún</h2>
                    <p>¡Agrega productos a tu lista de favoritos para verlos aquí!</p>
                    <button 
                        className="shop-btn"
                        onClick={() => onNavigate('products')}
                    >
                        Explorar Catálogo
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
                        ← Explorar Catálogo
                    </button>
                </div>
            </div>

            <div className="favorites-items">
                {favoriteItems.map(product => (
                    <div 
                        key={product.id} 
                        className="favorite-item"
                        onClick={() => viewProductDetails(product.id)}
                    >
                        <div className="item-image">
                            {renderProductImage(product)}
                            {product.isNew && <div className="new-badge">Nuevo</div>}
                        </div>
                        
                        <div className="item-details">
                            <div className="item-brand">{product.brand}</div>
                            <h3 className="item-name">{product.name}</h3>
                            <p className="item-description">{product.description}</p>
                            <div className="item-rating">
                                <AiFillStar className="star-icon" />
                                <span className="rating-value">{product.rating} estrellas</span>
                            </div>
                            <div className="item-price">${product.price.toLocaleString()}</div>
                            <div className="item-stock">Stock disponible: {product.stock}</div>
                        </div>

                        <div className="item-controls">
                            <button 
                                className="remove-favorite-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromFavorites(product.id);
                                }}
                                title="Quitar de favoritos"
                            >
                                Quitar de favoritos
                            </button>
                            
                            <button 
                                className={(() => {
                                    let buttonClass = "add-to-cart-btn"
                                    if (isInCart(product.id)) {
                                        buttonClass += " in-cart"
                                    }
                                    return buttonClass
                                })()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(product.id);
                                }}
                                disabled={product.stock === 0}
                            >
                                {(() => {
                                    if (product.stock === 0) {
                                        return 'Sin Stock'
                                    } else if (isInCart(product.id)) {
                                        return 'En Carrito ✓'
                                    } else {
                                        return 'Agregar al Carrito'
                                    }
                                })()}
                            </button>
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