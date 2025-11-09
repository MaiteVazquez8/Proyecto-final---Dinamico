import { useState } from "react"
import axios from "axios"
import PasswordInput from "../../Global/PasswordInput/PasswordInput"
import "./Login.css"

function Login({ onNavigate, onLogin }) {
  const [mail, setMail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const LoginSubmit = async (e) => {
    e.preventDefault()
    setMensaje('')
    setIsLoading(true)

    // Validación simple
    if (!mail || !password) {
      setMensaje('Por favor completa todos los campos')
      setIsLoading(false)
      return
    }

    try {
      console.log('Intentando iniciar sesión con:', { Mail: mail })
      const response = await axios.post('http://localhost:3000/api/Login', {
        Mail: mail,
        Contraseña: password
      })

      console.log('Respuesta del servidor:', response.data)

      // Mostrar mensaje de éxito
      const cargo = response.data.Cargo?.toLowerCase()
      const mensajePersonalizado = response.data.Mensaje || '¡Inicio de sesión exitoso! Redirigiendo...'
      setMensaje(mensajePersonalizado)

      // Delay de 1.5 segundos antes de redirigir
      setTimeout(() => {
        // Llamar a onLogin con los datos del usuario
        console.log('Enviando datos de usuario al Layout:', {
          DNI: response.data.DNI,
          Nombre: response.data.Nombre,
          Cargo: response.data.Cargo,
          Mail: mail
        })
        onLogin({
          DNI: response.data.DNI,
          Nombre: response.data.Nombre,
          Cargo: response.data.Cargo,
          Mail: mail
        })
        setIsLoading(false)
      }, 1500)

    } catch (error) {
      console.error('Error en login:', error)
      console.error('Error response:', error.response)
      if (error.response?.data?.Error) {
        setMensaje(error.response.data.Error)
      } else {
        setMensaje('Error al iniciar sesión. Verifica tu email y contraseña.')
      }
      setIsLoading(false)
    }
  }
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">ElectroShop</h1>
          <p className="login-subtitle">Inicia sesión en tu cuenta</p>
        </div>

        <form className="login-form" onSubmit={LoginSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="mail">Email</label>
            <input
              type="email"
              name="mail"
              id="mail"
              className="form-input"
              placeholder="Ingresa tu email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <PasswordInput
              id="password"
              name="password"
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {(() => {
              if (isLoading) {
                return 'Iniciando sesión...'
              } else {
                return 'Iniciar Sesión'
              }
            })()}
          </button>

          {mensaje && (
            <div className={(() => {
              let messageClass = "login-message"
              if (mensaje.includes('Error') || mensaje.includes('completa')) {
                messageClass += " error"
              } else {
                messageClass += " success"
              }
              return messageClass
            })()}>
              {mensaje}
            </div>
          )}
        </form>

        <div className="auth-switch">
          <p className="auth-switch-text">
            ¿No tienes una cuenta?{' '}
            <button
              type="button"
              className="auth-switch-link"
              onClick={() => onNavigate('register')}
            >
              Quieres registrarte
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login