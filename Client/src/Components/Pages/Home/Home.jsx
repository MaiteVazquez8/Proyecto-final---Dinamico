import { useState, useEffect } from "react"
import "./Home.css"

function Home({ onNavigate }) {
    const [currentBanner, setCurrentBanner] = useState(0)
    const [currentFeatured, setCurrentFeatured] = useState(0)
    const [currentBestSelling, setCurrentBestSelling] = useState(0)


    // Datos de los banners
    const banners = [
        {
            id: 1,
            title: "Nuevos iPhone 15",
            subtitle: "La innovación en tus manos",
            image: "📱",
            color: "#1d1d1f"
        },
        {
            id: 2,
            title: "MacBook Pro M3",
            subtitle: "Potencia profesional",
            image: "💻",
            color: "#2d2d2f"
        },
        {
            id: 3,
            title: "AirPods Pro",
            subtitle: "Audio excepcional",
            image: "🎧",
            color: "#3d3d3f"
        }
    ]

    // Productos destacados (más productos para el carrusel)
    const featuredProducts = [
        {
            id: 1,
            name: "iPhone 15 Pro",
            price: "$999",
            image: "📱",
            badge: "NUEVO"
        },
        {
            id: 2,
            name: "MacBook Air",
            price: "$1,199",
            image: "💻",
            badge: ""
        },
        {
            id: 3,
            name: "iPad Pro",
            price: "$799",
            image: "📱",
            badge: ""
        },
        {
            id: 4,
            name: "Apple Watch",
            price: "$399",
            image: "⌚",
            badge: ""
        },
        {
            id: 5,
            name: "AirPods Max",
            price: "$549",
            image: "🎧",
            badge: ""
        },
        {
            id: 11,
            name: "iPhone 15",
            price: "$799",
            image: "📱",
            badge: "NUEVO"
        },
        {
            id: 12,
            name: "iPad Air",
            price: "$599",
            image: "📱",
            badge: ""
        },
        {
            id: 13,
            name: "Mac Studio",
            price: "$1,999",
            image: "🖥️",
            badge: ""
        }
    ]

    // Productos más vendidos (más productos para el carrusel)
    const bestSellingProducts = [
        {
            id: 6,
            name: "iPhone 14",
            price: "$699",
            image: "📱",
            badge: "VENDIDO"
        },
        {
            id: 7,
            name: "MacBook Pro",
            price: "$1,999",
            image: "💻",
            badge: ""
        },
        {
            id: 8,
            name: "AirPods Pro",
            price: "$249",
            image: "🎧",
            badge: ""
        },
        {
            id: 9,
            name: "iPad Air",
            price: "$599",
            image: "📱",
            badge: ""
        },
        {
            id: 10,
            name: "Apple TV",
            price: "$179",
            image: "📺",
            badge: ""
        },
        {
            id: 14,
            name: "iPhone 13",
            price: "$599",
            image: "📱",
            badge: "VENDIDO"
        },
        {
            id: 15,
            name: "AirPods 3",
            price: "$179",
            image: "🎧",
            badge: ""
        },
        {
            id: 16,
            name: "Magic Mouse",
            price: "$79",
            image: "🖱️",
            badge: ""
        }
    ]

    // Configuración del carrusel
    const itemsPerPage = 3
    const maxFeaturedIndex = Math.max(0, featuredProducts.length - itemsPerPage)
    const maxBestSellingIndex = Math.max(0, bestSellingProducts.length - itemsPerPage)

    // Auto-slide del banner
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [banners.length])



    const nextBanner = () => {
        setCurrentBanner((prev) => (prev + 1) % banners.length)
    }



    const prevBanner = () => {
        setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)
    }

    // Funciones para carrusel de productos destacados
    const nextFeatured = () => {
        setCurrentFeatured((prev) => Math.min(prev + 1, maxFeaturedIndex))
    }

    const prevFeatured = () => {
        setCurrentFeatured((prev) => Math.max(prev - 1, 0))
    }

    // Funciones para carrusel de más vendidos
    const nextBestSelling = () => {
        setCurrentBestSelling((prev) => Math.min(prev + 1, maxBestSellingIndex))
    }

    const prevBestSelling = () => {
        setCurrentBestSelling((prev) => Math.max(prev - 1, 0))
    }

    // Función para manejar click en tarjetas de productos
    const handleProductClick = (productId) => {
        onNavigate('product-detail', { productId })
    }

    return (
        <div className="home-container">
            {/* Banner Section */}
            <section className="banner-section">
                <div className="banner-container">
                    <button className="banner-nav prev" onClick={prevBanner}>‹</button>
                    <div className="banner-content" style={{ backgroundColor: banners[currentBanner].color }}>
                        <div className="banner-text">
                            <h1 className="banner-title">{banners[currentBanner].title}</h1>
                            <p className="banner-subtitle">{banners[currentBanner].subtitle}</p>
                        </div>
                        <div className="banner-image">
                            {banners[currentBanner].image}
                        </div>
                    </div>
                    <button className="banner-nav next" onClick={nextBanner}>›</button>
                </div>
            </section>

            {/* Destacado Section */}
            <section className="featured-section">
                <div className="section-container">
                    <div className="section-header">
                        <button
                            className={`section-nav prev ${currentFeatured === 0 ? 'disabled' : ''}`}
                            onClick={prevFeatured}
                            disabled={currentFeatured === 0}
                        >
                            ‹
                        </button>
                        <h2 className="section-title">Destacado</h2>
                        <button
                            className={`section-nav next ${currentFeatured === maxFeaturedIndex ? 'disabled' : ''}`}
                            onClick={nextFeatured}
                            disabled={currentFeatured === maxFeaturedIndex}
                        >
                            ›
                        </button>
                    </div>
                    <div className="carousel-container">
                        <div className="carousel-viewport">
                            <div
                                className="products-carousel"
                                style={{ transform: `translateX(-${currentFeatured * 320}px)` }}
                            >
                                {featuredProducts.map((product) => (
                                    <div 
                                        key={product.id} 
                                        className="home-product-card"
                                        onClick={() => handleProductClick(product.id)}
                                    >
                                        {product.badge && <span className="product-badge">{product.badge}</span>}
                                        <div className="product-image">{product.image}</div>
                                        <div className="product-info">
                                            <h3 className="product-name">{product.name}</h3>
                                            <p className="product-price">{product.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Más Vendido Section */}
            <section className="bestselling-section">
                <div className="section-container">
                    <div className="section-header">
                        <button
                            className={`section-nav prev ${currentBestSelling === 0 ? 'disabled' : ''}`}
                            onClick={prevBestSelling}
                            disabled={currentBestSelling === 0}
                        >
                            ‹
                        </button>
                        <h2 className="section-title">Más Vendido</h2>
                        <button
                            className={`section-nav next ${currentBestSelling === maxBestSellingIndex ? 'disabled' : ''}`}
                            onClick={nextBestSelling}
                            disabled={currentBestSelling === maxBestSellingIndex}
                        >
                            ›
                        </button>
                    </div>
                    <div className="carousel-container">
                        <div className="carousel-viewport">
                            <div
                                className="products-carousel"
                                style={{ transform: `translateX(-${currentBestSelling * 320}px)` }}
                            >
                                {bestSellingProducts.map((product) => (
                                    <div 
                                        key={product.id} 
                                        className="home-product-card"
                                        onClick={() => handleProductClick(product.id)}
                                    >
                                        {product.badge && <span className="product-badge bestselling">{product.badge}</span>}
                                        <div className="product-image">{product.image}</div>
                                        <div className="product-info">
                                            <h3 className="product-name">{product.name}</h3>
                                            <p className="product-price">{product.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sobre ElectroShop Section */}
            <section className="about-section">
                <div className="about-container">
                    <h2 className="section-title">Sobre ElectroShop</h2>
                    <div className="about-content">
                        <div className="about-text">
                            <h3 className="about-subtitle">Objetivos</h3>
                            <p>
                                Brindar la mejor experiencia de compra en tecnología, ofreciendo productos
                                de calidad superior con un servicio al cliente excepcional.
                            </p>

                            <h3 className="about-subtitle">Sucursal</h3>
                            <div className="contact-info">
                                <p><strong>Dirección:</strong> Av. Tecnología 123, Digital City</p>
                                <p><strong>Teléfono:</strong> +1 (555) 123-4567</p>
                                <p><strong>Email:</strong> info@electroshop.com</p>
                            </div>
                        </div>
                        <div className="about-image">
                            <div className="store-photo">📷</div>
                        </div>
                    </div>

                    <div className="location-map">
                        <div className="map-container">
                            <h4>Mapa</h4>
                            <div className="map-placeholder">
                                <div className="map-icon">🗺️</div>
                                <p>Ubicación de la tienda</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    )
}

export default Home