import { useState } from "react"
import Encabezado from "./Global/Encabezado"
import Login from "./Login"
import "./Layout.css"

function Layout() {
  const [currentPage, setCurrentPage] = useState('home')

  const renderPage = () => {
    switch(currentPage) {
      case 'login':
        return <Login />
      case 'register':
        return <div className="page-content"><h2>Registrar Usuario</h2><p>Página de registro en desarrollo...</p></div>
      case 'delete':
        return <div className="page-content"><h2>Eliminar Usuario</h2><p>Página de eliminación en desarrollo...</p></div>
      default:
        return <div className="page-content"><h2>ElectroStore</h2><p>Bienvenido a nuestra tienda de electrónicos</p></div>
    }
  }

  return (
    <>
      <Encabezado onNavigate={setCurrentPage} currentPage={currentPage}/>
      <main className="main-content">
        {renderPage()}
      </main>
    </>
  )
}

export default Layout