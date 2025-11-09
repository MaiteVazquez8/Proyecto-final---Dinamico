import { useState, useEffect } from "react"
import axios from "axios"
import { 
    AiOutlineMobile,
    AiOutlineLaptop,
    AiOutlineAudio,
    AiOutlineCamera,
    AiOutlineEnvironment,
    AiOutlineLeft,
    AiOutlineRight,
    AiOutlineTool,
    AiOutlineBulb,
    AiOutlineSetting
} from "react-icons/ai"
import HomeProductCard from "./HomeProductCard"
import empresaImagen from "../../../assets/imgs/tuercav3.png"
import "./Home.css"

function Home({ onNavigate }) {
    const [currentBanner, setCurrentBanner] = useState(0)
    const [currentFeatured, setCurrentFeatured] = useState(0)
    const [currentBestSelling, setCurrentBestSelling] = useState(0)
    const [featuredProducts, setFeaturedProducts] = useState([])
    const [bestSellingProducts, setBestSellingProducts] = useState([])
    const [banners, setBanners] = useState([])
    const [loading, setLoading] = useState(true)
    const [imageErrors, setImageErrors] = useState({})

    // Colores para los banners (paleta ElectroShop)
    const bannerColors = ["#333446", "#7F8CAA", "#B8CFCE"]

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
                
                // Crear banners dinámicos desde los primeros 3 productos disponibles
                let bannerProducts = []
                
                if (products.length > 0) {
                    // Tomar hasta 3 productos únicos para los banners
                    const uniqueProducts = products.slice(0, Math.min(3, products.length))
                    
                    bannerProducts = uniqueProducts.map((product, index) => {
                        // Obtener imagen del producto
                        const productImage = product.Imagen_1 || product.Imagen_2 || null
                        
                        // Crear subtítulo desde descripción o categoría
                        let subtitle = product.Descripcion || product.Categoria || product.Subcategoria || 'Producto destacado'
                        // Limitar la descripción a 60 caracteres si es muy larga
                        if (subtitle && subtitle.length > 60) {
                            subtitle = subtitle.substring(0, 60) + '...'
                        }
                        
                        return {
                            id: product.ID_Producto,
                            title: product.Nombre || 'Producto',
                            subtitle: subtitle,
                            image: productImage,
                            imageType: getImageType(product.Categoria),
                            color: bannerColors[index % bannerColors.length],
                            productId: product.ID_Producto
                        }
                    })
                    
                    // Si hay menos de 3 productos pero más de 0, reutilizar productos para completar
                    if (bannerProducts.length < 3 && products.length > 0) {
                        while (bannerProducts.length < 3) {
                            const productIndex = bannerProducts.length % products.length
                            const product = products[productIndex]
                            const productImage = product.Imagen_1 || product.Imagen_2 || null
                            let subtitle = product.Descripcion || product.Categoria || product.Subcategoria || 'Producto destacado'
                            if (subtitle && subtitle.length > 60) {
                                subtitle = subtitle.substring(0, 60) + '...'
                            }
                            
                            bannerProducts.push({
                                id: product.ID_Producto * 100 + bannerProducts.length,
                                title: product.Nombre || 'Producto',
                                subtitle: subtitle,
                                image: productImage,
                                imageType: getImageType(product.Categoria),
                                color: bannerColors[bannerProducts.length % bannerColors.length],
                                productId: product.ID_Producto
                            })
                        }
                    }
                }
                
                setBanners(bannerProducts)
                
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
    }, [banners.length])



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

    // Función para renderizar imagen o icono del banner
    const renderBannerImage = (banner) => {
        if (!banner) return null
        
        // Si hay error en la imagen o no hay imagen, mostrar icono
        const hasImageError = imageErrors[banner.id]
        const shouldShowIcon = !banner.image || hasImageError
        
        if (!shouldShowIcon && banner.image) {
            // Verificar si es base64 o URL
            let imageSrc = banner.image
            if (!imageSrc.startsWith('data:image/') && !imageSrc.startsWith('http://') && !imageSrc.startsWith('https://')) {
                imageSrc = `data:image/jpeg;base64,${banner.image}`
            }
            
            return (
                <img 
                    src={imageSrc} 
                    alt={banner.title}
                    style={{
                        maxWidth: '200px',
                        maxHeight: '120px',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                        borderRadius: '8px'
                    }}
                    onError={() => {
                        // Si falla la carga de la imagen, marcar error
                        setImageErrors(prev => ({ ...prev, [banner.id]: true }))
                    }}
                />
            )
        }
        
        // Mostrar icono según tipo
        const iconProps = {
            size: 120,
            color: 'white'
        }
        
        switch (banner.imageType) {
            case 'mobile':
                return <AiOutlineMobile {...iconProps} />
            case 'laptop':
                return <AiOutlineLaptop {...iconProps} />
            case 'audio':
                return <AiOutlineAudio {...iconProps} />
            case 'tool':
                return <AiOutlineTool {...iconProps} />
            case 'lighting':
                return <AiOutlineBulb {...iconProps} />
            case 'industrial':
                return <AiOutlineSetting {...iconProps} />
            default:
                return <AiOutlineTool {...iconProps} />
        }
    }
    
    // Función para manejar click en banner
    const handleBannerClick = (banner) => {
        if (banner.productId) {
            onNavigate('product-detail', { productId: banner.productId })
        }
    }

    // Función para manejar click en tarjetas de productos
    const handleProductClick = (productId) => {
        onNavigate('product-detail', { productId })
    }

    const currentBannerColor = banners.length > 0 ? banners[currentBanner]?.color || bannerColors[0] : bannerColors[0]

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
                    style={{ backgroundColor: currentBannerColor, cursor: 'pointer' }}
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
                        <div className="banner-content">
                            <div className="banner-text">
                                <h1 className="banner-title">{banners[currentBanner]?.title || 'Producto'}</h1>
                                <p className="banner-subtitle">{banners[currentBanner]?.subtitle || 'Producto destacado'}</p>
                            </div>
                            <div className="banner-image">
                                {renderBannerImage(banners[currentBanner])}
                            </div>
                        </div>
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
                                <p><strong>Dirección:</strong> Av. Tecnología 123, Digital City</p>
                                <p><strong>Teléfono:</strong> +1 (555) 123-4567</p>
                                <p><strong>Email:</strong> info@electroshop.com</p>
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
                            <div className="map-placeholder">
                                <div className="map-icon"><AiOutlineEnvironment /></div>
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