import { useState } from "react";
import { AiFillOpenAI } from "react-icons/ai";
import axios from "axios"

function Encabezado({ onNavigate, currentPage }) {
  const handleNavigation = (page) => {
    onNavigate(page)
  }

  const[user,Setuser]=useState('')
  const[password,Setpassword]=useState('')
  const[name,Setname]=useState('')

  const[mensaje,Setmensaje]=useState()
  const Registrosubmit=async(e)=>{
    e.preventDefault
    Setmensaje('')

    try{
      const Server=await axios.post('http://localhost:3000/api/registrarusuario',{
        user,
        password,
        name

      })
      Setmensaje(Server.data.mensaje)||'registrado'
      Setname('')
      Setuser('')
      Setpassword('')
    }
    catch(error){
      console.error(error)
    }

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

    <form action="" onSubmit={Registrosubmit}>
    <h1>Registro de usuario</h1>
    
    <label htmlFor="usuario:"></label>
    <input type="text" name="user" id="user" required
    value={user} onChange={Setuser(e=>e.target.value)}/>


    <label htmlFor="contraseña:"></label>
    <input type="password" name="password" id="password" required
    value={password} onChange={Setpassword(e=>e.target.value)}/>


    <label htmlFor="nombre::"></label>
    <input type="text" name="name" id="name" required
    value={name} onChange={Setname(e=>e.target.value)}/>

    <input type="submit" value="registrar" />
    </form>
    {mensaje && <h1>{mensaje}</h1>}
    </>
  )
}

export default Encabezado