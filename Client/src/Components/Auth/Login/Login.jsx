import { useState } from "react"
import axios from "axios"
import "./Login.css"

function Login({ onNavigate, onLogin }) {
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const LoginSubmit = async (e) => {
    e.preventDefault()
    setMensaje('')
    setIsLoading(true)

    // Validación simple
    if (!user || !password) {
      setMensaje('Por favor completa todos los campos')
      setIsLoading(false)
      return
    }

    try {
      const server = await axios.post('http://localhost:3000/api/loginUsuario', {
        user,
        password
      })

      // Mostrar mensaje de éxito
      setMensaje('¡Inicio de sesión exitoso! Redirigiendo...')

      // Delay de 2 segundos antes de redirigir a productos
      setTimeout(() => {
        // Llamar a onLogin con los datos del usuario
        onLogin({
          username: user,
          ...server.data
        })
      }, 2000)

    } catch (error) {
      if (error.response?.data?.mensaje) {
        setMensaje(error.response.data.mensaje)
      } else {
        setMensaje('Error al iniciar sesión')
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
            <label className="form-label" htmlFor="user">Usuario</label>
            <input
              type="text"
              name="user"
              id="user"
              className="form-input"
              placeholder="Ingresa tu usuario"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
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
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          {mensaje && (
            <div className={`login-message ${mensaje.includes('Error') || mensaje.includes('completa') ? 'error' : 'success'}`}>
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