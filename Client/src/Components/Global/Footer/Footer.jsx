import logoImagen from "../../../assets/imgs/tuercav4.png";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { AiOutlineEnvironment, AiOutlinePhone, AiOutlineMail } from "react-icons/ai";
import { MdSupportAgent } from "react-icons/md";
import "./Footer.css";

function Footer({ onNavigate }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Logo y descripción */}
        <div className="footer-section">
          <div className="footer-logo">
            <img src={logoImagen} alt="ElectroShop Logo" className="footer-logo-img" />
            <span className="footer-brand">ElectroShop</span>
          </div>
          <p className="footer-description">
            Tu tienda de confianza para los mejores productos electrónicos. 
            Calidad, innovación y servicio excepcional desde 2024.
          </p>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Enlaces Rápidos</h3>
          <ul className="footer-links">
            <li><button className="footer-link-btn" onClick={() => onNavigate?.('home')}>Inicio</button></li>
            <li><button className="footer-link-btn" onClick={() => onNavigate?.('products')}>Productos</button></li>
            <li><button className="footer-link-btn" onClick={() => onNavigate?.('products')}>Ofertas</button></li>
            <li><button className="footer-link-btn" onClick={() => { onNavigate?.('home'); setTimeout(() => { document.querySelector('.location-map')?.scrollIntoView({ behavior: 'smooth' }) }, 100); }}>Contacto</button></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Contacto</h3>
          <div className="footer-contact">
            <p className="footer-contact-item"><AiOutlineEnvironment /> <span>Mariano Acosta 565, B1842ADK Monte Grande, Provincia de Buenos Aires</span></p>
            <p className="footer-contact-item"><AiOutlinePhone /> <a href="tel:+5491125236652">+54 9 11 2523-6652</a></p>
            <p className="footer-contact-item"><AiOutlineMail /> <a href="mailto:electroshop.webshop@gmail.com">electroshop.webshop@gmail.com</a></p>
            <p className="footer-contact-item"><MdSupportAgent /> <a href="mailto:electroshop.webshop.soporte@gmail.com">electroshop.webshop.soporte@gmail.com</a></p>
          </div>
          <div className="footer-social">
            <a href="#facebook" className="social-link" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="#twitter" className="social-link" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#instagram" className="social-link" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#linkedin" className="social-link" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
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