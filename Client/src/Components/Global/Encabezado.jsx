import { AiFillOpenAI } from "react-icons/ai";

function Encabezado({ onNavigate, currentPage }) {
  const handleNavigation = (page) => {
    onNavigate(page)
  }

  return (
    <>
    <header className="encabezado">
        <div className="logo-container">
          <h1><AiFillOpenAI/></h1>
          <span className="brand-name">ElectroStore</span>
        </div>
        <nav className="menu">
            <button 
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => handleNavigation('home')}
            >
              Inicio
            </button>
            <button 
              className={`nav-link ${currentPage === 'login' ? 'active' : ''}`}
              onClick={() => handleNavigation('login')}
            >
              Login
            </button>
            <button 
              className={`nav-link ${currentPage === 'register' ? 'active' : ''}`}
              onClick={() => handleNavigation('register')}
            >
              Registrar Usuario
            </button>
            <button 
              className={`nav-link ${currentPage === 'delete' ? 'active' : ''}`}
              onClick={() => handleNavigation('delete')}
            >
              Eliminar Usuario
            </button>
        </nav>
    </header>
    </>
  )
}

export default Encabezado