import { useState, useEffect } from "react"
import "./ScrollToTop.css"

function ScrollToTop() {
    const [showScrollTop, setShowScrollTop] = useState(false)

    // Detectar scroll para mostrar/ocultar botón
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Función para ir al inicio de la página
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    return (
        <>
            {showScrollTop && (
                <button 
                    className="scroll-to-top-btn"
                    onClick={scrollToTop}
                    aria-label="Ir al inicio"
                    title="Ir al inicio"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m18 15-6-6-6 6"/>
                    </svg>
                </button>
            )}
        </>
    )
}

export default ScrollToTop