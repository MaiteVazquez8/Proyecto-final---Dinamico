import { useState, useEffect } from "react"
import "./Home.css"

function Home({ onNavigate }) {
    const [currentSlide, setCurrentSlide] = useState(0)

    // Datos del carousel (con IDs que coinciden con los productos)
    const slides = [
        {
            id: 1, // iPhone 15 Pro Max
            title: "iPhone 15 Pro Max",
            description: "La innovación en tus manos",
            image: "📱",
            price: "$1,199"
        },
        {
            id: 2, // MacBook Pro M3
            title: "MacBook Pro M3",
            description: "Potencia profesional",
            image: "💻",
            price: "$1,999"
        },
        {
            id: 3, // AirPods Pro 2
            title: "AirPods Pro 2",
            description: "Audio de calidad superior",
            image: "🎧",
            price: "$249"
        }
    ]

    // Auto-slide del carousel
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 4000)
        return () => clearInterval(timer)
    }, [slides.length])

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }

    const handleViewDetails = () => {
        const currentProduct = slides[currentSlide]
        onNavigate('product-detail', { productId: currentProduct.id })
    }

    return (
        <div className="home-container">
            {/* Carousel de Novedades */}
            <section className="carousel-section">
                <div className="carousel-container">
                    <h2 className="section-title">Últimas Novedades</h2>
                    <div className="carousel">
                        <button className="carousel-btn prev" onClick={prevSlide}>‹</button>
                        <div className="carousel-content">
                            <div className="slide active">
                                <div className="slide-image">
                                    {slides[currentSlide].image}
                                </div>
                                <div className="slide-info">
                                    <h3 className="slide-title">{slides[currentSlide].title}</h3>
                                    <p className="slide-description">{slides[currentSlide].description}</p>
                                    <p className="slide-price">{slides[currentSlide].price}</p>
                                    <button className="slide-btn" onClick={handleViewDetails}>Ver Detalles</button>
                                </div>
                            </div>
                        </div>
                        <button className="carousel-btn next" onClick={nextSlide}>›</button>
                    </div>
                    <div className="carousel-indicators">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(index)}
                            ></button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sobre ElectroShop */}
            <section className="about-section">
                <div className="about-container">
                    <h2 className="section-title">Sobre ElectroShop</h2>
                    <div className="about-content">
                        <div className="about-text">
                            <h3 className="about-subtitle">Nuestra Identidad</h3>
                            <p>
                                ElectroShop es más que una tienda de electrónicos. Somos pioneros en tecnología,
                                comprometidos con ofrecer los productos más innovadores del mercado. Desde 2024,
                                hemos sido el puente entre la tecnología de vanguardia y nuestros clientes.
                            </p>
                            <h3 className="about-subtitle">Nuestro Propósito</h3>
                            <p>
                                Democratizar el acceso a la tecnología de calidad, brindando productos excepcionales
                                con el mejor servicio al cliente. Creemos que la tecnología debe mejorar la vida
                                de las personas, y trabajamos cada día para hacer esa visión realidad.
                            </p>
                        </div>
                        <div className="about-visual">
                            <div className="brand-showcase">
                                <div className="brand-icon">🚀</div>
                                <h4>Innovación</h4>
                                <p>Productos de última generación</p>
                            </div>
                            <div className="brand-showcase">
                                <div className="brand-icon">⭐</div>
                                <h4>Calidad</h4>
                                <p>Solo las mejores marcas</p>
                            </div>
                            <div className="brand-showcase">
                                <div className="brand-icon">🤝</div>
                                <h4>Confianza</h4>
                                <p>Servicio excepcional</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sobre Nosotros */}
            <section className="team-section">
                <div className="team-container">
                    <h2 className="section-title">Sobre Nosotros</h2>

                    <div className="team-grid">
                        <div className="team-member">
                            <div className="member-avatar">👨‍💻</div>
                            <h3 className="member-name">Alvarez Santiago</h3>
                            <p className="member-role">Frontend Developer</p>
                            <p className="member-description">
                                Responsable del desarrollo de la interfaz de usuario y experiencia del cliente.
                            </p>
                        </div>
                        <div className="team-member">
                            <div className="member-avatar">👩‍💼</div>
                            <h3 className="member-name">Vázquez Maite</h3>
                            <p className="member-role">Backend Developer</p>
                            <p className="member-description">
                                Encargada del desarrollo del servidor, APIs y base de datos del sistema.
                            </p>
                        </div>
                        <div className="team-member">
                            <div className="member-avatar">📝</div>
                            <h3 className="member-name">Villalva Joaquín</h3>
                            <p className="member-role">Documentación</p>
                            <p className="member-description">
                                Responsable de la documentación técnica y manuales del proyecto.
                            </p>
                        </div>
                        <div className="team-member">
                            <div className="member-avatar">📈</div>
                            <h3 className="member-name">Gomez Nayla</h3>
                            <p className="member-role">Marketing</p>
                            <p className="member-description">
                                Encargada de la estrategia de marketing y promoción del e-commerce.
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* Sucursal */}
            <section className="location-section">
                <div className="location-container">
                    <h2 className="section-title">Nuestra Sucursal</h2>
                    <div className="location-content">
                        <div className="location-info">
                            <h3 className="location-title">Visítanos</h3>
                            <div className="location-details">
                                <p><span className="location-icon">📍</span> Av. Tecnología 123, Digital City</p>
                                <p><span className="location-icon">🕒</span> Lun - Vie: 9:00 AM - 8:00 PM</p>
                                <p><span className="location-icon">🕒</span> Sáb - Dom: 10:00 AM - 6:00 PM</p>
                                <p><span className="location-icon">📞</span> +1 (555) 123-4567</p>
                                <p><span className="location-icon">📧</span> info@electroshop.com</p>
                            </div>
                            <button className="directions-btn">Cómo Llegar</button>
                        </div>
                        <div className="location-map">
                            <div className="map-placeholder">
                                <div className="map-icon">🗺️</div>
                                <p>Mapa Interactivo</p>
                                <small>Haz clic para ver en Google Maps</small>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home