import { useState } from "react"
import "./ProductList.css"

function ProductList({ onNavigate, onLogout, currentUser, isAuthenticated, cart, setCart, favorites, setFavorites }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [priceRange, setPriceRange] = useState('all')
    const [sortBy, setSortBy] = useState('name')

    // Base de datos de productos
    const products = [
        {
            id: 1,
            name: 'iPhone 15 Pro Max',
            category: 'phones',
            price: 1199,
            image: '📱',
            description: 'El iPhone más avanzado con chip A17 Pro y cámara de 48MP',
            brand: 'Apple',
            rating: 4.8,
            stock: 15,
            isNew: true
        },
        {
            id: 2,
            name: 'MacBook Pro M3',
            category: 'laptops',
            price: 1999,
            image: '💻',
            description: 'Potencia profesional con el nuevo chip M3 y pantalla Liquid Retina XDR',
            brand: 'Apple',
            rating: 4.9,
            stock: 8,
            isNew: true
        },
        {
            id: 3,
            name: 'AirPods Pro 2',
            category: 'audio',
            price: 249,
            image: '🎧',
            description: 'Audio espacial personalizado con cancelación activa de ruido',
            brand: 'Apple',
            rating: 4.7,
            stock: 25,
            isNew: false
        },
        {
            id: 4,
            name: 'iPad Pro 12.9"',
            category: 'tablets',
            price: 1099,
            image: '📱',
            description: 'La experiencia iPad definitiva con chip M2 y pantalla Liquid Retina XDR',
            brand: 'Apple',
            rating: 4.8,
            stock: 12,
            isNew: false
        },
        {
            id: 5,
            name: 'Samsung Galaxy S24 Ultra',
            category: 'phones',
            price: 1299,
            image: '📱',
            description: 'Smartphone premium con S Pen integrado y cámara de 200MP',
            brand: 'Samsung',
            rating: 4.6,
            stock: 20,
            isNew: true
        },
        {
            id: 6,
            name: 'Dell XPS 13 Plus',
            category: 'laptops',
            price: 1399,
            image: '💻',
            description: 'Ultrabook premium con procesador Intel Core i7 de 12va generación',
            brand: 'Dell',
            rating: 4.5,
            stock: 10,
            isNew: false
        },
        {
            id: 7,
            name: 'Sony WH-1000XM5',
            category: 'audio',
            price: 399,
            image: '🎧',
            description: 'Auriculares inalámbricos con la mejor cancelación de ruido del mercado',
            brand: 'Sony',
            rating: 4.8,
            stock: 18,
            isNew: false
        },
        {
            id: 8,
            name: 'Surface Pro 9',
            category: 'tablets',
            price: 999,
            image: '📱',
            description: 'Tablet 2 en 1 con procesador Intel Core i5 y Windows 11',
            brand: 'Microsoft',
            rating: 4.4,
            stock: 14,
            isNew: false
        }
    ]

    const categories = [
        { value: 'all', label: 'Todas las categorías' },
        { value: 'phones', label: 'Smartphones' },
        { value: 'laptops', label: 'Laptops' },
        { value: 'tablets', label: 'Tablets' },
        { value: 'audio', label: 'Audio y Sonido' }
    ]

    // Funciones para manejar favoritos y carrito
    const toggleFavorite = (productId) => {
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

    const addToCart = (productId) => {
        if (!isAuthenticated) {
            onNavigate('login')
            return
        }
        
        // Solo agregar si el producto NO está en el carrito
        const existingItem = cart.find(item => item.id === productId)
        if (!existingItem) {
            setCart(prev => [...prev, { id: productId, quantity: 1 }])
        }
        // Si ya está en el carrito, no hacer nada
    }

    // Función para verificar si el producto está en el carrito
    const isInCart = (productId) => {
        return cart.some(item => item.id === productId)
    }

    const viewProductDetails = (productId) => {
        onNavigate('product-detail', { productId })
    }

    const getCartItemCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0)
    }

    const priceRanges = [
        { value: 'all', label: 'Todos los precios' },
        { value: '0-300', label: '$0 - $300' },
        { value: '300-600', label: '$300 - $600' },
        { value: '600-1000', label: '$600 - $1,000' },
        { value: '1000-1500', label: '$1,000 - $1,500' },
        { value: '1500+', label: '$1,500+' }
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
                product.brand.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory

            let matchesPrice = true
            if (priceRange !== 'all') {
                const [min, max] = priceRange.split('-').map(p => p.replace('+', ''))
                if (max) {
                    matchesPrice = product.price >= parseInt(min) && product.price <= parseInt(max)
                } else {
                    matchesPrice = product.price >= parseInt(min)
                }
            }

            return matchesSearch && matchesCategory && matchesPrice
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

    return (
        <div className="products-container">
            {/* Header de Productos */}
            <div className="products-header">
                <div className="products-title-section">
                    <h1 className="products-title">Productos</h1>
                    <p className="products-subtitle">Descubre nuestra amplia gama de productos tecnológicos</p>
                </div>
                <div className="cart-summary">
                    <button className="cart-btn" onClick={handleCartClick}>
                        🛒 Carrito ({getCartItemCount()})
                    </button>
                    <button className="favorites-btn" onClick={handleFavoritesClick}>
                        ❤️ Favoritos ({favorites.length})
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
                    <span className="search-icon">🔍</span>
                </div>

                <div className="filters-row">
                    <div className="filter-group">
                        <label className="filter-label">Categoría</label>
                        <select
                            className="filter-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(category => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </div>

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
                        {filteredAndSortedProducts.length} producto{filteredAndSortedProducts.length !== 1 ? 's' : ''} encontrado{filteredAndSortedProducts.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Grid de productos */}
                <div className="products-grid">
                    {filteredAndSortedProducts.map(product => (
                        <div 
                            key={product.id} 
                            className="product-card"
                            onClick={() => viewProductDetails(product.id)}
                        >
                            {product.isNew && <div className="new-badge">Nuevo</div>}

                            <div className="product-image-container">
                                <div className="product-image">{product.image}</div>
                                <button
                                    className={`favorite-btn ${favorites.includes(product.id) ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(product.id);
                                    }}
                                >
                                    {favorites.includes(product.id) ? '❤️' : '🤍'}
                                </button>
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
                                        className={`add-to-cart-btn ${isInCart(product.id) ? 'in-cart' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(product.id);
                                        }}
                                        disabled={product.stock === 0}
                                    >
                                        {product.stock === 0 
                                            ? 'Sin Stock' 
                                            : isInCart(product.id) 
                                                ? 'Ya está en el carrito' 
                                                : 'Agregar al Carrito'
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredAndSortedProducts.length === 0 && (
                    <div className="no-results">
                        <div className="no-results-icon">🔍</div>
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