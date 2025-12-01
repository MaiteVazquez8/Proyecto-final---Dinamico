import { useState } from "react"
import axios from "axios"
import PasswordInput from "../../Global/PasswordInput/PasswordInput"
import { AUTH_ENDPOINTS } from "../../../config/api"
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
      console.log('Intentando iniciar sesión con:', { Email: mail })
      const response = await axios.post(AUTH_ENDPOINTS.LOGIN, {
        Email: mail,
        Password: password
      })

      console.log('Respuesta del servidor:', response.data)

      // Preparar datos del usuario
      const userData = {
        ...response.data,
        lastLogin: new Date().toISOString()
      }

      // Guardar en localStorage
      try {
        localStorage.setItem('currentUser', JSON.stringify(userData))
        console.log('Usuario guardado en localStorage:', userData)
      } catch (error) {
        console.error('Error al guardar en localStorage:', error)
      }

      // Mostrar mensaje de éxito
      const mensajePersonalizado = response.data.mensaje || `¡Bienvenido ${userData.Nombre}!`
      setMensaje(mensajePersonalizado)

      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        onLogin(userData)
        setIsLoading(false)
      }, 1500)

    } catch (error) {
      console.error('Error en login:', error)
      console.error('Error response:', error.response)

      if (error.response?.status === 403) {
        setMensaje('Tu cuenta no ha sido verificada. Por favor, verifica tu email.')
      } else if (error.response?.data?.mensaje) {
        setMensaje(error.response.data.mensaje)
      } else if (error.response?.data?.Error) {
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
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          {mensaje && (
            <div className={`login-message ${mensaje.includes('Error') || mensaje.includes('completa') || mensaje.includes('incorrecta') || mensaje.includes('verificada') ? 'error' : 'success'}`}>
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
              Registrarse
            </button>
          </p>
          <p className="auth-switch-text" style={{ marginTop: '10px' }}>
            ¿Tienes un código de validación?{' '}
            <button
              type="button"
              className="auth-switch-link"
              onClick={() => onNavigate('verify')}
            >
              Validar Cuenta
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login