import { useState, useEffect } from "react"
import axios from "axios"
import { PRODUCT_ENDPOINTS, SHOPPING_ENDPOINTS } from "../../../config/api"
import Swal from 'sweetalert2'
import {
    AiOutlineShoppingCart,
    AiOutlineArrowLeft,
    AiOutlineDelete,
    AiFillStar
} from "react-icons/ai"
import "./Cart.css"

function Cart({ onNavigate, cart, setCart, isAuthenticated, currentUser }) {
    const [cartItems, setCartItems] = useState([])
    const [mensaje, setMensaje] = useState('')
    const [productsData, setProductsData] = useState({})

    // Cargar productos del servidor primero
    useEffect(() => {
        const loadProducts = async () => {
            try {
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
                        description: product.Descripcion || 'Producto agregado al carrito',
                        rating: product.Promedio_Calificacion || 4.5,
                        stock: product.Stock || 0,
                        isNew: false
                    }
                })

                setProductsData(productsMap)
            } catch (err) {
                console.error('Error al cargar productos:', err)
                setProductsData({})
            }
        }

        loadProducts()
    }, [])

    // Cargar carrito del servidor cuando se monta el componente
    useEffect(() => {
        if (isAuthenticated && currentUser?.DNI && Object.keys(productsData).length > 0) {
            loadCartFromServer()
        } else {
            setCartItems([])
        }
    }, [isAuthenticated, currentUser, productsData])

    // Refresh cart if a purchase is completed elsewhere
    useEffect(() => {
        const onPurchase = (e) => {
            // reload cart from server
            if (isAuthenticated && currentUser?.DNI) loadCartFromServer()
        }

        const onStorage = (ev) => {
            if (ev.key === 'lastPurchase') {
                if (isAuthenticated && currentUser?.DNI) loadCartFromServer()
            }
        }

        window.addEventListener('purchaseCompleted', onPurchase)
        window.addEventListener('storage', onStorage)

        return () => {
            window.removeEventListener('purchaseCompleted', onPurchase)
            window.removeEventListener('storage', onStorage)
        }
    }, [isAuthenticated, currentUser])

    // Recargar carrito cuando cambia el estado del carrito (después de agregar un producto)
    useEffect(() => {
        if (isAuthenticated && currentUser?.DNI) {
            // Pequeño delay para asegurar que el servidor procesó la inserción
            const timer = setTimeout(() => {
                console.log('Recargando carrito porque cambió el estado local del carrito...')
                loadCartFromServer()
            }, 800)
            return () => clearTimeout(timer)
        }
    }, [cart.length])

    const loadCartFromServer = async () => {
        try {
            console.log('Cargando carrito del servidor para DNI:', currentUser.DNI)
            // GET /api/compras/carrito/:DNI
            const response = await axios.get(SHOPPING_ENDPOINTS.GET_CART(currentUser.DNI))
            console.log('Respuesta completa del servidor:', response)
            console.log('Carrito cargado del servidor:', response.data)
            console.log('Tipo de datos:', typeof response.data, Array.isArray(response.data))

            // El servidor devuelve un array con los productos del carrito
            // Si el array está vacío, puede ser que el JOIN no encontró coincidencias
            // pero los productos pueden estar guardados en la tabla Carrito
            if (response.data && Array.isArray(response.data)) {
                if (response.data.length > 0) {
                    console.log('Productos encontrados en el carrito:', response.data.length)
                    // Mapear los productos del servidor a productos con detalles completos
                    const itemsWithDetails = response.data.map(item => {
                        console.log('Procesando item del carrito:', item)
                        const productDetails = productsData[item.ID_Producto]
                        if (productDetails) {
                            return {
                                ...productDetails,
                                ID_Carrito: item.ID_Carrito,
                                Total: item.Total,
                                Precio: item.Precio || productDetails.price
                            }
                        }
                        // Si no encuentra el producto en productsData, usar datos del servidor
                        const getBrand = (name) => {
                            if (!name) return 'ElectroShop'
                            if (name.includes('iPhone') || name.includes('MacBook') || name.includes('iPad') || name.includes('AirPods')) return 'Apple'
                            if (name.includes('Samsung') || name.includes('Galaxy')) return 'Samsung'
                            if (name.includes('Dell')) return 'Dell'
                            if (name.includes('Sony')) return 'Sony'
                            if (name.includes('Google') || name.includes('Pixel')) return 'Google'
                            return 'ElectroShop'
                        }

                        return {
                            id: item.ID_Producto,
                            name: item.Nombre || 'Producto',
                            brand: getBrand(item.Nombre),
                            price: item.Precio || item.Total,
                            image: item.Imagen_1 || null,
                            image_1: item.Imagen_1 || null,
                            Imagen_1: item.Imagen_1 || null,
                            description: item.Descripcion || 'Producto agregado al carrito',
                            rating: item.Promedio_Calificacion || 4.5,
                            stock: item.Stock || 0,
                            isNew: false,
                            ID_Carrito: item.ID_Carrito,
                            Total: item.Total,
                            Precio: item.Precio || item.Total
                        }
                    })

                    console.log('Items con detalles completos:', itemsWithDetails)
                    setCartItems(itemsWithDetails)

                    // Actualizar también el estado del carrito en Layout para sincronización
                    const localCart = response.data.map(item => ({
                        id: item.ID_Producto,
                        quantity: 1
                    }))
                    setCart(localCart)
                } else {
                    // Array vacío - el carrito está vacío o el JOIN no encontró productos
                    console.log('Carrito vacío - no hay productos en el servidor')
                    setCartItems([])
                    setCart([])
                }
            } else {
                console.log('Respuesta inválida del servidor')
                setCartItems([])
                setCart([])
            }
        } catch (error) {
            console.error('Error al cargar carrito:', error)
            if (error.response) {
                console.error('Error del servidor:', error.response.data)
                console.error('Status:', error.response.status)
            }
            setMensaje('Error al cargar el carrito')
            setCartItems([])
            setCart([])
        }
    }

    // Agrupar items por producto para mostrar cantidad y manejar +/-
    const getGroupedItems = () => {
        const map = {}
        cartItems.forEach(item => {
            const id = item.id
            if (!map[id]) {
                map[id] = { ...item, quantity: 0, cartIds: [] }
            }
            map[id].quantity += 1
            if (item.ID_Carrito) map[id].cartIds.push(item.ID_Carrito)
        })
        return Object.values(map)
    }

    const increaseQty = async (item) => {
        try {
            // POST /api/compras/carrito to add one unit
            await axios.post(SHOPPING_ENDPOINTS.ADD_TO_CART, {
                DNI: currentUser.DNI,
                ID_Producto: item.id,
                Total: item.price || item.Precio || 0
            })
            loadCartFromServer()
        } catch (error) {
            console.error('Error al incrementar cantidad:', error)
            setMensaje('Error al aumentar la cantidad')
        }
    }

    const decreaseQty = async (item) => {
        try {
            // DELETE one of the cart rows for this product
            const cartIdToDelete = item.cartIds && item.cartIds.length ? item.cartIds[0] : null
            if (!cartIdToDelete) return
            await axios.delete(SHOPPING_ENDPOINTS.DELETE_FROM_CART(cartIdToDelete))
            loadCartFromServer()
        } catch (error) {
            console.error('Error al disminuir cantidad:', error)
            setMensaje('Error al disminuir la cantidad')
        }
    }

    const removeGroupFromCart = async (item) => {
        try {
            // Remove all cart rows for this product
            for (const id of (item.cartIds || [])) {
                await axios.delete(SHOPPING_ENDPOINTS.DELETE_FROM_CART(id))
            }
            setMensaje('Producto eliminado del carrito')
            loadCartFromServer()
        } catch (error) {
            console.error('Error al eliminar producto del carrito:', error)
            setMensaje('Error al eliminar producto del carrito')
        }
    }

    const removeFromCart = async (ID_Carrito) => {
        try {
            // DELETE /api/compras/carrito/:ID_Carrito
            await axios.delete(SHOPPING_ENDPOINTS.DELETE_FROM_CART(ID_Carrito))
            setMensaje('Producto eliminado del carrito')
            loadCartFromServer() // Recargar carrito
        } catch (error) {
            console.error('Error al eliminar del carrito:', error)
            setMensaje('Error al eliminar producto del carrito')
        }
    }

    const clearCart = async () => {
        try {
            // Eliminar todos los items del carrito uno por uno
            for (const item of cartItems) {
                await axios.delete(SHOPPING_ENDPOINTS.DELETE_FROM_CART(item.ID_Carrito))
            }
            setMensaje('Carrito vaciado')
            loadCartFromServer()
        } catch (error) {
            console.error('Error al vaciar carrito:', error)
            setMensaje('Error al vaciar el carrito')
        }
    }

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.Total || item.price), 0)
    }

    const getTotalItems = () => {
        return cartItems.length
    }

    const handleCheckout = () => {
        // Verificar si el usuario está verificado (si es cliente)
        // Si no tiene la propiedad Verificado (ej. admin), asumimos que puede comprar o la lógica de backend lo manejará
        // Pero para clientes, la propiedad debe ser 1
        if (currentUser?.Rol === 'cliente' && currentUser?.Verificado !== 1) {
            Swal.fire({
                icon: 'warning',
                title: 'Cuenta no verificada',
                text: 'Debes verificar tu cuenta para poder realizar compras. Por favor, revisa tu correo electrónico.',
                confirmButtonColor: '#B8CFCE',
                confirmButtonText: 'Entendido'
            })
            return
        }

        console.log('Checkout button clicked, navigating to checkout')
        onNavigate('checkout')
    }

    const viewProductDetails = (productId) => {
        onNavigate('product-detail', { productId })
    }

    // Función para verificar si una imagen es Base64 o URL
    const isImageUrl = (img) => {
        if (!img || typeof img !== 'string') return false
        return img.startsWith('data:image/') || img.startsWith('http://') || img.startsWith('https://')
    }

    // Función para renderizar imagen
    const renderProductImage = (item) => {
        const image = item.image || item.image_1 || item.Imagen_1
        if (isImageUrl(image)) {
            return <img src={image} alt={item.name} className="product-image-img" />
        }
        return <span className="product-image-emoji">{image || 'Imagen no disponible'}</span>
    }

    if (!isAuthenticated) {
        return (
            <div className="cart-container">
                <div className="cart-empty">
                    <div className="empty-icon"><AiOutlineShoppingCart /></div>
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
                        <AiOutlineArrowLeft /> Seguir Comprando
                    </button>
                </div>

                <div className="cart-empty">
                    <div className="empty-icon"><AiOutlineShoppingCart /></div>
                    <h2>Tu carrito está vacío</h2>
                    <p>¡Agrega algunos productos increíbles a tu carrito!</p>
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
        <div className="cart-container">
            <div className="cart-header">
                <h1 className="cart-title">Mi Carrito ({getTotalItems()} productos)</h1>
                <div className="header-actions">
                    <button
                        className="clear-cart-btn"
                        onClick={clearCart}
                    >
                        Vaciar Carrito
                    </button>
                    <button
                        className="back-btn"
                        onClick={() => onNavigate('products')}
                    >
                        <AiOutlineArrowLeft /> Seguir Comprando
                    </button>
                </div>
            </div>

            {mensaje && (
                <div className={(() => {
                    let messageClass = "cart-message"
                    if (mensaje.includes('Error')) {
                        messageClass += " error"
                    } else {
                        messageClass += " success"
                    }
                    return messageClass
                })()}>
                    {mensaje}
                </div>
            )}

            <div className="cart-content-wrapper">
                <div className="cart-summary-left">
                    <div className="summary-card">
                        <h3 className="summary-title">Resumen del Pedido</h3>

                        <div className="summary-line">
                            <span>Productos ({getTotalItems()})</span>
                            <span>${getTotalPrice().toLocaleString()}</span>
                        </div>


                        <div className="summary-divider"></div>

                        <div className="summary-total">
                            <span>Total</span>
                            <span>${getTotalPrice().toLocaleString()}</span>
                        </div>

                        <button
                            className="checkout-btn"
                            onClick={handleCheckout}
                        >
                            Finalizar Compra
                        </button>
                    </div>
                </div>

                <div className="cart-items">
                    {getGroupedItems().map(item => (
                        <div
                            key={item.id}
                            className="cart-item"
                            onClick={() => viewProductDetails(item.id)}
                        >
                            <div className="item-image">
                                {renderProductImage(item)}
                                {item.isNew && <div className="new-badge">Nuevo</div>}
                            </div>

                            <div className="item-details">
                                <div className="item-brand">{item.brand}</div>
                                <h3 className="item-name">{item.name}</h3>
                                <p className="item-description">{item.description}</p>
                                <div className="item-rating">
                                    <AiFillStar className="star-icon" />
                                    <span className="rating-value">{item.rating} estrellas</span>
                                </div>
                                <div className="item-price">${(item.price || item.Precio).toLocaleString()}</div>
                                <div className="item-stock">Stock disponible: {item.stock}</div>
                            </div>

                            <div className="item-controls">
                                <div className="quantity-controls">
                                    <button
                                        className="qty-btn"
                                        onClick={(e) => { e.stopPropagation(); decreaseQty(item); }}
                                        disabled={item.quantity <= 0}
                                        title="Disminuir cantidad"
                                    >
                                        -
                                    </button>
                                    <div className="qty-value">{item.quantity}</div>
                                    <button
                                        className="qty-btn"
                                        onClick={(e) => { e.stopPropagation(); increaseQty(item); }}
                                        disabled={item.stock <= item.quantity}
                                        title="Incrementar cantidad"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    className="remove-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeGroupFromCart(item);
                                    }}
                                    title="Eliminar del carrito"
                                >
                                    <AiOutlineDelete /> Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Cart
