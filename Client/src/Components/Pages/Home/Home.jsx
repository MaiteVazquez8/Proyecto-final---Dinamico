import { useState, useEffect } from "react"
import axios from "axios"
import { 
    AiOutlineLeft,
    AiOutlineRight,
    AiOutlineEnvironment,
    AiOutlineMail,
    AiOutlinePhone
} from "react-icons/ai"
import { MdSupportAgent } from "react-icons/md"
import HomeProductCard from "./HomeProductCard"
import empresaImagen from "../../../assets/imgs/tuercav3.png"
import bannerElecProd from "../../../assets/imgs/banners/banner-elec-prod.jpg"
import bannerElectroMarca from "../../../assets/imgs/banners/banner-Electro-marca.jpg"
import "./Home.css"

function Home({ onNavigate }) {
    const [currentBanner, setCurrentBanner] = useState(0)
    const [currentFeatured, setCurrentFeatured] = useState(0)
    const [currentBestSelling, setCurrentBestSelling] = useState(0)
    const [featuredProducts, setFeaturedProducts] = useState([])
    const [bestSellingProducts, setBestSellingProducts] = useState([])
    const [loading, setLoading] = useState(true)

    // Banners estáticos desde la carpeta banners
    const banners = [
        {
            id: 1,
            image: bannerElecProd,
            title: "Productos Electrónicos",
            subtitle: "Descubre nuestra amplia gama de productos electrónicos de alta calidad",
            link: 'products'
        },
        {
            id: 2,
            image: bannerElectroMarca,
            title: "ElectroShop",
            subtitle: "Tu tienda de confianza para los mejores productos electrónicos",
            link: 'home'
        }
    ]

    // Cargar productos del servidor
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true)
                const response = await axios.get('http://localhost:3000/api/productos/productos')
                const products = response.data || []
                
                // Función para determinar el tipo de imagen basado en la categoría
                const getImageType = (categoria) => {
                    if (!categoria) return 'tool'
                    const cat = categoria.toLowerCase()
                    if (cat.includes('phone') || cat.includes('smartphone') || cat.includes('teléfono')) return 'mobile'
                    if (cat.includes('laptop') || cat.includes('notebook') || cat.includes('portátil')) return 'laptop'
                    if (cat.includes('tablet') || cat.includes('ipad')) return 'tablet'
                    if (cat.includes('audio') || cat.includes('auricular') || cat.includes('headphone')) return 'audio'
                    if (cat.includes('herramienta') || cat.includes('tool')) return 'tool'
                    if (cat.includes('iluminación') || cat.includes('iluminacion') || cat.includes('light') || cat.includes('lampara')) return 'lighting'
                    if (cat.includes('industrial') || cat.includes('linea industrial')) return 'industrial'
                    return 'tool'
                }
                
                // Formatear precio
                const formatPrice = (precio) => {
                    if (!precio) return '$0'
                    return `$${precio.toLocaleString('es-AR')}`
                }
                
                // Mapear productos a formato de Home
                const mappedProducts = products.map(product => ({
                    id: product.ID_Producto,
                    name: product.Nombre || 'Producto sin nombre',
                    price: formatPrice(product.Precio),
                    imageType: getImageType(product.Categoria),
                    image_1: product.Imagen_1 || null,
                    badge: product.Stock > 0 ? '' : 'SIN STOCK'
                }))
                
                // Los primeros productos son destacados, los más vendidos son los que tienen más ventas
                setFeaturedProducts(mappedProducts.slice(0, 8))
                
                // Ordenar por Cant_Ventas (más vendidos) y tomar los primeros 8
                const sortedBySales = [...mappedProducts].sort((a, b) => {
                    const productA = products.find(p => p.ID_Producto === a.id)
                    const productB = products.find(p => p.ID_Producto === b.id)
                    return (productB?.Cant_Ventas || 0) - (productA?.Cant_Ventas || 0)
                })
                setBestSellingProducts(sortedBySales.slice(0, 8))
            } catch (err) {
                console.error('Error al cargar productos:', err)
                setFeaturedProducts([])
                setBestSellingProducts([])
            } finally {
                setLoading(false)
            }
        }

        loadProducts()
    }, [])

    // Configuración del carrusel
    const itemsPerPage = 3
    const maxFeaturedIndex = Math.max(0, featuredProducts.length - itemsPerPage)
    const maxBestSellingIndex = Math.max(0, bestSellingProducts.length - itemsPerPage)

    // Auto-slide del banner
    useEffect(() => {
        if (banners.length === 0) return
        const timer = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    const nextBanner = () => {
        if (banners.length === 0) return
        setCurrentBanner((prev) => (prev + 1) % banners.length)
    }

    const prevBanner = () => {
        if (banners.length === 0) return
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

    // Función para manejar click en banner
    const handleBannerClick = (banner) => {
        if (banner.link) {
            onNavigate(banner.link)
        }
    }

    // Función para manejar click en tarjetas de productos
    const handleProductClick = (productId) => {
        onNavigate('product-detail', { productId })
    }

    // Funciones auxiliares para simplificar los botones de navegación
    const getPrevButtonClass = (isDisabled) => {
        let buttonClass = "section-nav prev"
        if (isDisabled) {
            buttonClass += " disabled"
        }
        return buttonClass
    }

    const getNextButtonClass = (isDisabled) => {
        let buttonClass = "section-nav next"
        if (isDisabled) {
            buttonClass += " disabled"
        }
        return buttonClass
    }

    return (
        <div className="home-container">
            {/* Banner Section */}
            {banners.length > 0 && (
                <section 
                    className="banner-section" 
                    style={{ 
                        backgroundImage: `url(${banners[currentBanner]?.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        cursor: 'pointer'
                    }}
                    onClick={() => handleBannerClick(banners[currentBanner])}
                >
                    <div className="banner-container">
                        <button 
                            className="banner-nav prev" 
                            onClick={(e) => {
                                e.stopPropagation()
                                prevBanner()
                            }}
                        >
                            <AiOutlineLeft />
                        </button>
                        <button 
                            className="banner-nav next" 
                            onClick={(e) => {
                                e.stopPropagation()
                                nextBanner()
                            }}
                        >
                            <AiOutlineRight />
                        </button>
                    </div>
                </section>
            )}

            {/* Destacado Section */}
            <section className="featured-section">
                <div className="section-container">
                    <div className="section-header">
                        {/* Botón anterior - se deshabilita si estamos en el inicio */}
                        <button
                            className={getPrevButtonClass(currentFeatured === 0)}
                            onClick={prevFeatured}
                            disabled={currentFeatured === 0}
                        >
                            <AiOutlineLeft />
                        </button>
                        <h2 className="section-title">Destacado</h2>
                        {/* Botón siguiente - se deshabilita si estamos al final */}
                        <button
                            className={getNextButtonClass(currentFeatured === maxFeaturedIndex)}
                            onClick={nextFeatured}
                            disabled={currentFeatured === maxFeaturedIndex}
                        >
                            <AiOutlineRight />
                        </button>
                    </div>
                    <div className="carousel-container">
                        <div className="carousel-viewport">
                            <div
                                className="products-carousel"
                                style={{ transform: `translateX(-${currentFeatured * 320}px)` }}
                            >
                                {featuredProducts.map((product) => (
                                    <HomeProductCard
                                        key={product.id}
                                        product={product}
                                        onClick={handleProductClick}
                                    />
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
                        {/* Botón anterior - se deshabilita si estamos en el inicio */}
                        <button
                            className={getPrevButtonClass(currentBestSelling === 0)}
                            onClick={prevBestSelling}
                            disabled={currentBestSelling === 0}
                        >
                            <AiOutlineLeft />
                        </button>
                        <h2 className="section-title">Más Vendido</h2>
                        {/* Botón siguiente - se deshabilita si estamos al final */}
                        <button
                            className={getNextButtonClass(currentBestSelling === maxBestSellingIndex)}
                            onClick={nextBestSelling}
                            disabled={currentBestSelling === maxBestSellingIndex}
                        >
                            <AiOutlineRight />
                        </button>
                    </div>
                    <div className="carousel-container">
                        <div className="carousel-viewport">
                            <div
                                className="products-carousel"
                                style={{ transform: `translateX(-${currentBestSelling * 320}px)` }}
                            >
                                {bestSellingProducts.map((product) => (
                                    <HomeProductCard
                                        key={product.id}
                                        product={product}
                                        onClick={handleProductClick}
                                    />
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
                                <p><strong>Dirección:</strong> Mariano Acosta 565, B1842ADK Monte Grande, Provincia de Buenos Aires</p>
                                <p><strong>Teléfono:</strong> +54 9 11 2523-6652</p>
                                <p><strong>Email:</strong> electroshop.webshop@gmail.com</p>
                            </div>
                        </div>
                        <div className="about-image">
                            <div className="store-photo">
                                <img src={empresaImagen} alt="ElectroShop - Nuestra Empresa" className="store-image" />
                            </div>
                        </div>
                    </div>

                    <div className="location-map">
                        <div className="map-container">
                            <h4>Mapa</h4>
                            <div className="map-iframe-container">
                                <iframe 
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3275.401769073871!2d-58.47729842488715!3d-34.82098966900426!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcd1687e6db657%3A0xec6f0e216b4a8031!2sMariano%20Acosta%20565%2C%20B1842ADK%20Monte%20Grande%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1763252139703!5m2!1ses-419!2sar" 
                                    width="100%" 
                                    height="300" 
                                    style={{border:0}} 
                                    allowFullScreen="" 
                                    loading="lazy" 
                                    referrerPolicy="no-referrer-when-downgrade">
                                </iframe>
                                <div className="contact-info">
                                    <div className="contact-item">
                                        <AiOutlineEnvironment className="contact-icon" />
                                        <span>Mariano Acosta 565, B1842ADK Monte Grande, Provincia de Buenos Aires</span>
                                    </div>
                                    <div className="contact-item">
                                        <AiOutlinePhone className="contact-icon" />
                                        <a href="tel:+5491125236652">+54 9 11 2523-6652</a>
                                    </div>
                                    <div className="contact-item">
                                        <AiOutlineMail className="contact-icon" />
                                        <a href="mailto:electroshop.webshop@gmail.com">electroshop.webshop@gmail.com</a>
                                    </div>
                                    <div className="contact-item">
                                        <MdSupportAgent className="contact-icon" />
                                        <a href="mailto:electroshop.webshop.soporte@gmail.com">electroshop.webshop.soporte@gmail.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
