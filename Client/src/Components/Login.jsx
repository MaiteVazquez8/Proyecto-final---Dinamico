import { useState } from "react"
import axios from "axios"
import "./Login.css"

function Login() {
    const[user,Setuser]=useState('')
    const[password,Setpassword]=useState('')
    const[Mensaje, SetMensaje]=useState('')

    const LoginSubmit=async(e)=>{
        e.preventDefault()
        SetMensaje('')
        try{
            const server=await axios.post()

        }
        catch(error){
            console.error(error)

        }

    }
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">ElectroStore</h1>
          <p className="login-subtitle">Inicia sesión en tu cuenta</p>
        </div>
        
        <form className="login-form" onSubmit={LoginSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="user">Usuario</label>
            <input 
              type="text" 
              name="user" 
              id="user"
              className="form-input"
              placeholder="Ingresa tu usuario"
              value={user}
              onChange={(e) => Setuser(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              name="password" 
              id="password"
              className="form-input"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => Setpassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
          
          {Mensaje && (
            <div className={`login-message ${Mensaje.includes('error') ? 'error' : 'success'}`}>
              {Mensaje}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default Login