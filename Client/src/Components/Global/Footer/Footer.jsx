import { AiFillOpenAI } from "react-icons/ai";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Logo y descripción */}
        <div className="footer-section">
          <div className="footer-logo">
            <AiFillOpenAI />
            <span className="footer-brand">ElectroShop</span>
          </div>
          <p className="footer-description">
            Tu tienda de confianza para los mejores productos electrónicos. 
            Calidad, innovación y servicio excepcional desde 2024.
          </p>
        </div>

        {/* Enlaces rápidos */}
        <div className="footer-section">
          <h3 className="footer-title">Enlaces Rápidos</h3>
          <ul className="footer-links">
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#productos">Productos</a></li>
            <li><a href="#ofertas">Ofertas</a></li>
            <li><a href="#contacto">Contacto</a></li>
          </ul>
        </div>

        {/* Categorías */}
        <div className="footer-section">
          <h3 className="footer-title">Categorías</h3>
          <ul className="footer-links">
            <li><a href="#phones">Teléfonos</a></li>
            <li><a href="#laptops">Laptops</a></li>
            <li><a href="#tablets">Tablets</a></li>
            <li><a href="#audio">Audio</a></li>
          </ul>
        </div>

        {/* Contacto */}
        <div className="footer-section">
          <h3 className="footer-title">Contacto</h3>
          <div className="footer-contact">
            <p>📧 info@electroshop.com</p>
            <p>📞 +1 (555) 123-4567</p>
            <p>📍 123 Tech Street, Digital City</p>
          </div>
          <div className="footer-social">
            <a href="#facebook" className="social-link">📘</a>
            <a href="#twitter" className="social-link">🐦</a>
            <a href="#instagram" className="social-link">📷</a>
            <a href="#linkedin" className="social-link">💼</a>
          </div>
        </div>
      </div>

      {/* Línea divisoria */}
      <div className="footer-divider"></div>

      {/* Copyright */}
      <div className="footer-bottom">
        <div className="footer-copyright">
          <p>&copy; {currentYear} ElectroShop. Todos los derechos reservados.</p>
        </div>
        <div className="footer-legal">
          <a href="#privacy">Política de Privacidad</a>
          <span className="separator">|</span>
          <a href="#terms">Términos de Servicio</a>
          <span className="separator">|</span>
          <a href="#cookies">Cookies</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer