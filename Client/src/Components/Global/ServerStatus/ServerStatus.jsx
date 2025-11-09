import { useState, useEffect } from 'react'
import axios from 'axios'
import './ServerStatus.css'

function ServerStatus() {
  const [serverStatus, setServerStatus] = useState('checking') // 'checking', 'online', 'offline'
  const [errorCode, setErrorCode] = useState(404)
  const [errorMessage, setErrorMessage] = useState('')

  const checkServerStatus = async () => {
    try {
      setServerStatus('checking')
      await axios.get('http://localhost:3000/api', { timeout: 5000 })
      setServerStatus('online')
      setErrorCode(404)
      setErrorMessage('')
    } catch (error) {
      console.error('Error al conectar con el servidor:', error)
      setServerStatus('offline')
      
      // Capturar código de error del backend
      const statusCode = error.response?.status || 404
      setErrorCode(statusCode)
      
      // Mensajes según el código de error
      const errorMessages = {
        400: 'Solicitud incorrecta',
        401: 'No autorizado',
        403: 'Acceso prohibido',
        404: 'Servidor no encontrado',
        500: 'Error interno del servidor',
        502: 'Bad Gateway',
        503: 'Servicio no disponible',
        504: 'Gateway Timeout'
      }
      
      setErrorMessage(errorMessages[statusCode] || 'Error del servidor')
    }
  }

  useEffect(() => {
    checkServerStatus()

    // Verificar estado del servidor cada 30 segundos
    const interval = setInterval(checkServerStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleRetry = () => {
    checkServerStatus()
  }

  if (serverStatus === 'online') {
    return null // No mostrar nada si está conectado
  }

  if (serverStatus === 'offline') {
    // Convertir el código de error a array de dígitos
    const errorDigits = errorCode.toString().split('')
    
    return (
      <div className="error-404-container">
        <div className="error-404-content">
          {/* Error Code dinámico */}
          <div className="error-code">
            {errorDigits.map((digit, index) => (
              <span key={index} className="error-number">{digit}</span>
            ))}
          </div>

          <h1 className="error-title">{errorMessage || 'Error del servidor'}</h1>
          <p className="error-message">
            {errorCode === 404 
              ? 'Este no es el servidor que estás buscando.'
              : 'Ha ocurrido un error al conectar con el servidor.'}
          </p>

          <div className="error-details">
            <p>No se pudo conectar al servidor en <code>http://localhost:3000</code></p>
            <p>Código de error: <strong>{errorCode}</strong></p>
            {errorCode === 404 && <p>Asegúrate de que el servidor esté ejecutándose</p>}
          </div>
          
          <div className="error-actions">
            <button onClick={handleRetry} className="retry-button">
              Intentar de nuevo
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="home-button"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Estado de verificación
  return (
    <div className="checking-status">
      <div className="status-content">
        <div className="loading-spinner"></div>
        <span>Verificando conexión...</span>
      </div>
    </div>
  )
}

export default ServerStatus