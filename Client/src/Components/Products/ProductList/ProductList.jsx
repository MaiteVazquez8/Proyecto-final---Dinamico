import { useState, useEffect } from "react"
import axios from "axios"
import Swal from 'sweetalert2'
import { PRODUCT_ENDPOINTS, SHOPPING_ENDPOINTS } from "../../../config/api"
import { 
    AiOutlineShoppingCart, 
    AiOutlineHeart, 
    AiOutlineSearch,
    AiOutlineLoading3Quarters,
    AiOutlineExclamationCircle,
    AiOutlineInbox
} from "react-icons/ai"
import ProductCard from "../ProductCard/ProductCard"
import "./ProductList.css"

function ProductList({ onNavigate, onLogout, currentUser, isAuthenticated, cart, setCart, favorites, setFavorites }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedSubcategory, setSelectedSubcategory] = useState('all')
    const [priceRange, setPriceRange] = useState('all')
    const [sortBy, setSortBy] = useState('name')
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Cargar productos del servidor
    const loadProducts = async () => {
        try {
            setLoading(true)
            // Obtener productos del servidor
            const response = await axios.get(PRODUCT_ENDPOINTS.GET_PRODUCTS)
            const productsData = response.data || []

            // Mapear los productos del servidor al formato esperado por el frontend
            const mappedProducts = productsData.map(product => {
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

                    return {
                        id: product.ID_Producto,
                        name: product.Nombre || 'Producto sin nombre',
                        category: product.Categoria?.toLowerCase() || 'other',
                        price: product.Precio || 0,
                        image: product.Imagen_1 || null,
                        image_1: product.Imagen_1 || null,
                        image_2: product.Imagen_2 || null,
                        Imagen_2: product.Imagen_2 || null,
                        description: product.Descripcion || 'Sin descripción disponible',
                        brand: getBrand(product.Nombre),
                        rating: product.Promedio_Calificacion || 4.5,
                        stock: product.Stock || 0,
                        isNew: false, // Por defecto no es nuevo, se puede actualizar según lógica de negocio
                        color: product.Color,
                        subcategoria: product.Subcategoria
                    }
                })
                
            setProducts(mappedProducts)
            setError('')
        } catch (err) {
            console.error('Error al cargar productos:', err)
            setError('Error al cargar productos del servidor')
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProducts()

        const onPurchase = (e) => {
            // Reload products when a purchase happens
            loadProducts()
        }

        const onStorage = (ev) => {
            if (ev.key === 'lastPurchase') {
                loadProducts()
            }
        }

        window.addEventListener('purchaseCompleted', onPurchase)
        window.addEventListener('storage', onStorage)

        return () => {
            window.removeEventListener('purchaseCompleted', onPurchase)
            window.removeEventListener('storage', onStorage)
        }
    }, [])

    // Estructura de categorías y subcategorías
    const categoriesData = {
        'all': { label: 'Todas las categorías', subcategories: [] },
        'Cables': {
            label: 'Cables',
            subcategories: [
                { value: 'all', label: 'Todas las subcategorías' },
                { value: 'Baja Tensión', label: 'Baja Tensión' },
                { value: 'Media y Alta Tensión', label: 'Media y Alta Tensión' },
                { value: 'Telefonía y Estructurales', label: 'Telefonía y Estructurales' },
                { value: 'Especiales', label: 'Especiales' }
            ]
        },
        'Morseteria y Herrajes': {
            label: 'Morseteria y Herrajes',
            subcategories: [
                { value: 'all', label: 'Todas las subcategorías' },
                { value: 'Morseteria', label: 'Morseteria' },
                { value: 'Herrajes', label: 'Herrajes' },
                { value: 'Conectores', label: 'Conectores' },
                { value: 'Empalmes y Terminales', label: 'Empalmes y Terminales' },
                { value: 'Aisladores', label: 'Aisladores' },
                { value: 'Seleccionadores', label: 'Seleccionadores' }
            ]
        },
        'Accesorios': {
            label: 'Accesorios',
            subcategories: [
                { value: 'all', label: 'Todas las subcategorías' },
                { value: 'Cintas Aislantes', label: 'Cintas Aislantes' },
                { value: 'Accesorios de Protección', label: 'Accesorios de Protección' }
            ]
        },
        'Iluminación': {
            label: 'Iluminación',
            subcategories: [
                { value: 'all', label: 'Todas las subcategorías' },
                { value: 'Lámparas Led', label: 'Lámparas Led' },
                { value: 'Decorativas', label: 'Decorativas' },
                { value: 'Industriales Led', label: 'Industriales Led' },
                { value: 'Luminarias Vacias', label: 'Luminarias Vacias' },
                { value: 'Domótica', label: 'Domótica' }
            ]
        },
        'Linea Industrial': {
            label: 'Linea Industrial',
            subcategories: [
                { value: 'all', label: 'Todas las subcategorías' },
                { value: 'Interruptores', label: 'Interruptores' },
                { value: 'Fichas y Bases', label: 'Fichas y Bases' },
                { value: 'Motores Eléctricos', label: 'Motores Eléctricos' },
                { value: 'Arranque y Protección de Motores', label: 'Arranque y Protección de Motores' },
                { value: 'Mando y Señalización', label: 'Mando y Señalización' },
                { value: 'Automatización', label: 'Automatización' },
                { value: 'Capacitores y Reles Varimetricos', label: 'Capacitores y Reles Varimetricos' },
                { value: 'Seccionadores', label: 'Seccionadores' }
            ]
        },
        'Linea Domiciliaria': {
            label: 'Linea Domiciliaria',
            subcategories: [
                { value: 'all', label: 'Todas las subcategorías' },
                { value: 'Teclas de Embutir', label: 'Teclas de Embutir' },
                { value: 'Térmicas y Disyuntores', label: 'Térmicas y Disyuntores' },
                { value: 'Cañería', label: 'Cañería' },
                { value: 'Cajas', label: 'Cajas' }
            ]
        },
        'Cajas y Gabinetes': {
            label: 'Cajas y Gabinetes',
            subcategories: [
                { value: 'all', label: 'Todas las subcategorías' },
                { value: 'Metálicos', label: 'Metálicos' },
                { value: 'PVC', label: 'PVC' }
            ]
        },
        'Herramientas': {
            label: 'Herramientas',
            subcategories: [
                { value: 'all', label: 'Todas las subcategorías' },
                { value: 'De Mano', label: 'De Mano' },
                { value: 'Eléctricas', label: 'Eléctricas' }
            ]
        },
        'Tableros y Obras': {
            label: 'Tableros y Obras',
            subcategories: [
                { value: 'all', label: 'Todas las subcategorías' },
                { value: 'Tableros', label: 'Tableros' }
            ]
        },
        'Energías Renovables': {
            label: 'Energías Renovables',
            subcategories: [
                { value: 'all', label: 'Todas las subcategorías' },
                { value: 'Equipos', label: 'Equipos' }
            ]
        }
    }

    const categories = Object.keys(categoriesData).map(key => ({
        value: key,
        label: categoriesData[key].label
    }))

    // Obtener subcategorías según la categoría seleccionada
    const getSubcategories = () => {
        if (selectedCategory === 'all') return []
        return categoriesData[selectedCategory]?.subcategories || []
    }

    // Resetear subcategoría cuando cambia la categoría
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value)
        setSelectedSubcategory('all')
    }

    // Funciones para manejar favoritos y carrito
    const toggleFavorite = async (productId) => {
        if (!isAuthenticated) {
            onNavigate('login')
            return
        }

        try {
            if (favorites.includes(productId)) {
                // Remover de favoritos (localmente por ahora)
                setFavorites(prev => prev.filter(id => id !== productId))
            } else {
                // Agregar a favoritos usando el servidor
                await axios.post(SHOPPING_ENDPOINTS.LIKE_PRODUCT, {
                    DNI: currentUser.DNI,
                    ID_Producto: productId
                })
                setFavorites(prev => [...prev, productId])
            }
        } catch (error) {
            console.error('Error al manejar favoritos:', error)
        }
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
            const product = products.find(p => p.id === productId)
            if (!product) {
                console.error('Producto no encontrado')
                return
            }

            console.log('Agregando producto al carrito:', {
                DNI: currentUser.DNI,
                ID_Producto: productId,
                Total: product.price
            })

            // Agregar al carrito usando el servidor (igual que favoritos)
            const response = await axios.post(SHOPPING_ENDPOINTS.ADD_TO_CART, {
                DNI: currentUser.DNI,
                ID_Producto: productId,
                Total: product.price
            })
            
            console.log('Respuesta del servidor al agregar:', response.data)
            
            // Actualizar el estado local (igual que favoritos)
            setCart(prev => [...prev, { id: productId, quantity: 1 }])
            console.log('Producto agregado al carrito exitosamente. Estado local actualizado.')
            
            // Pequeño delay para asegurar que el servidor procesó la inserción
            setTimeout(() => {
                console.log('Recargando carrito después de agregar producto...')
            }, 300)
        } catch (error) {
            console.error('Error al agregar al carrito:', error)
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

    // Función para verificar si el producto está en el carrito
    // Esta función verifica en el estado local, pero el servidor es la fuente de verdad
    const isInCart = (productId) => {
        return cart.some(item => item.id === productId)
    }

    const viewProductDetails = (productId) => {
        onNavigate('product-detail', { productId })
    }

    const getCartItemCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0)
    }

    // Función auxiliar para simplificar el texto de resultados
    const getResultsText = (count) => {
        let productText = "producto"
        let foundText = "encontrado"
        if (count !== 1) {
            productText = "productos"
            foundText = "encontrados"
        }
        return `${count} ${productText} ${foundText}`
    }

    const priceRanges = [
        { value: 'all', label: 'Todos los precios' },
        { value: '0-300000', label: 'Hasta $300.000' },
        { value: '300000-600000', label: '$300.000 - $600.000' },
        { value: '600000-1000000', label: '$600.000 - $1.000.000' },
        { value: '1000000-1500000', label: '$1.000.000 - $1.500.000' },
        { value: '1500000+', label: 'Más de $1.500.000' }
    ]

    const sortOptions = [
        { value: 'name', label: 'Nombre A-Z' },
        { value: 'price-low', label: 'Precio: Menor a Mayor' },
        { value: 'price-high', label: 'Precio: Mayor a Menor' },
        { value: 'rating', label: 'Mejor Valorados' },
        { value: 'newest', label: 'Más Nuevos' }
    ]

    // Filtrar y ordenar productos
    const filteredAndSortedProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.subcategoria && product.subcategoria.toLowerCase().includes(searchTerm.toLowerCase()))
            
            const matchesCategory = selectedCategory === 'all' || 
                product.category?.toLowerCase() === selectedCategory.toLowerCase() ||
                product.Categoria?.toLowerCase() === selectedCategory.toLowerCase()
            
            const matchesSubcategory = selectedSubcategory === 'all' || 
                !selectedSubcategory ||
                product.subcategoria?.toLowerCase() === selectedSubcategory.toLowerCase() ||
                product.Subcategoria?.toLowerCase() === selectedSubcategory.toLowerCase()

            let matchesPrice = true
            if (priceRange !== 'all') {
                const [min, max] = priceRange.split('-').map(p => p.replace('+', ''))
                if (max) {
                    matchesPrice = product.price >= parseInt(min) && product.price <= parseInt(max)
                } else {
                    matchesPrice = product.price >= parseInt(min)
                }
            }

            return matchesSearch && matchesCategory && matchesSubcategory && matchesPrice
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name)
                case 'price-low':
                    return a.price - b.price
                case 'price-high':
                    return b.price - a.price
                case 'rating':
                    return b.rating - a.rating
                case 'newest':
                    return b.isNew - a.isNew
                default:
                    return 0
            }
        })

    const handleCartClick = () => {
        if (!isAuthenticated) {
            onNavigate('login')
            return
        }
        onNavigate('cart')
    }

    const handleFavoritesClick = () => {
        if (!isAuthenticated) {
            onNavigate('login')
            return
        }
        onNavigate('favorites')
    }

    if (loading) {
        return (
            <div className="products-container">
                <div className="loading-container">
                    <div className="loading-spinner"><AiOutlineLoading3Quarters /></div>
                    <p>Cargando productos...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="products-container">
            {error && (
                <div className="error-message">
                    <AiOutlineExclamationCircle />
                    <p>Error: {error}</p>
                </div>
            )}
            
            {/* Header de Catálogo */}
            <div className="products-header">
                <div className="products-title-section">
                    <h1 className="products-title">Catálogo</h1>
                    <p className="products-subtitle">Descubre nuestra amplia gama de productos tecnológicos</p>
                </div>
                <div className="cart-summary">
                    <button className="cart-btn" onClick={handleCartClick}>
                        <AiOutlineShoppingCart /> Carrito ({getCartItemCount()})
                    </button>
                    <button className="favorites-btn" onClick={handleFavoritesClick}>
                        <AiOutlineHeart /> Favoritos ({favorites.length})
                    </button>
                </div>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="products-filters">
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar productos o marcas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="search-icon"><AiOutlineSearch /></span>
                </div>

                <div className="filters-row">
                    <div className="filter-group">
                        <label className="filter-label">Categoría</label>
                        <select
                            className="filter-select"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                        >
                            {categories.map(category => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {getSubcategories().length > 0 && (
                        <div className="filter-group">
                            <label className="filter-label">Subcategoría</label>
                            <select
                                className="filter-select"
                                value={selectedSubcategory}
                                onChange={(e) => setSelectedSubcategory(e.target.value)}
                            >
                                {getSubcategories().map(subcategory => (
                                    <option key={subcategory.value} value={subcategory.value}>
                                        {subcategory.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="filter-group">
                        <label className="filter-label">Precio</label>
                        <select
                            className="filter-select"
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                        >
                            {priceRanges.map(range => (
                                <option key={range.value} value={range.value}>
                                    {range.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Ordenar por</label>
                        <select
                            className="filter-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Resultados */}
            <div className="products-results">
                <div className="results-header">
                    <span className="results-count">
                        {getResultsText(filteredAndSortedProducts.length)}
                    </span>
                </div>

                {/* Grid de productos */}
                <div className="products-grid">
                    {filteredAndSortedProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={addToCart}
                            onToggleFavorite={toggleFavorite}
                            onViewDetails={viewProductDetails}
                            isFavorite={favorites.includes(product.id)}
                            isInCart={isInCart(product.id)}
                            isAuthenticated={isAuthenticated}
                        />
                    ))}
                </div>

                {filteredAndSortedProducts.length === 0 && (
                    <div className="no-results">
                        <div className="no-results-icon"><AiOutlineInbox /></div>
                        <h3>No se encontraron productos</h3>
                        <p>Intenta ajustar tus filtros de búsqueda</p>
                    </div>
                )}
            </div>

            {/* Mensaje para usuarios no autenticados */}
            {!isAuthenticated && (
                <div className="guest-footer">
                    <div className="guest-message">
                        <p>¿Quieres poder comprar? <strong>Inicia sesión</strong></p>
                    </div>
                    <button
                        className="login-prompt-btn"
                        onClick={() => onNavigate('login')}
                    >
                        Iniciar Sesión
                    </button>
                </div>
            )}
        </div>
    )
}

export default ProductList