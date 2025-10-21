import { useState } from "react";
import { AiFillOpenAI } from "react-icons/ai";
import axios from 'axios'

function Encabezado({ onNavigate, currentPage }) {
  const handleNavigation = (page) => {
    onNavigate(page)
  }

  const [user, setUser] = useState('')
  const [Password, setPassword] = useState('')
  const [Name, setName] = useState('')

  const [Mensaje, Setmensaje] = useState()

  const Registrosubmit = async (e) => {
    e.preventDefault()
    Setmensaje('')

    try {
      const Server = await axios.post('http://localhost:5000/api/registroUsuario', {
        user,
        Password,
        Name


      })
      Setmensaje(Server.data.mensaje) || 'registrado'
      setName('')
      setUser('')
      setPassword('')
    }
    catch (error) {
      // console.error(error)
      // console.log(error)
    }

  }

  return (
    <>
      <header className="encabezado">
        <div className="logo-container">
          <h1><AiFillOpenAI /></h1>
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

      <form onSubmit={Registrosubmit}>
        <h1>Registro de usuario</h1>

        <label htmlFor="usuario:"></label>
        <input type="text" name="user" id="user" required
          value={user} onChange={e => setUser(e.target.value)} />


        <label htmlFor="contraseña:"></label>
        <input type="password" name="password" id="password" required
          value={Password} onChange={e => setPassword(e.target.value)} />


        <label htmlFor="nombre::"></label>
        <input type="text" name="name" id="name" required
          value={Name} onChange={e => setName(e.target.value)} />

        <input type="submit" value="registrar" />
      </form>
      {Mensaje && <h1>{Mensaje}</h1>}
    </>
  )
}

export default Encabezado