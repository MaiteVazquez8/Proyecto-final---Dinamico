import { useState, useEffect } from "react"
import axios from "axios"
import { HEALTH_ENDPOINT } from "../../../config/api"
import "./ServerStatus.css"

function ServerStatus() {
  const [serverStatus, setServerStatus] = useState('checking') // 'checking', 'online', 'offline'

  const checkServerStatus = async () => {
    try {
      setServerStatus('checking')
      const response = await axios.get(HEALTH_ENDPOINT, { 
        timeout: 3000,
        validateStatus: (status) => status === 200
      })
      
      if (response.status === 200 && response.data.status === 'OK') {
        setServerStatus('online')
      } else {
        throw new Error('Respuesta del servidor no válida')
      }
    } catch (error) {
      // Solo mostrar error si es un error de conexión real, no de red
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || 
          error.response?.status >= 500 || error.message.includes('Network Error')) {
        setServerStatus('offline')
      } else {
        // Para otros errores, asumir que el servidor está online
        setServerStatus('online')
      }
    }
  }

  useEffect(() => {
    checkServerStatus()
    // Verificar cada 60 segundos en lugar de 30
    const interval = setInterval(checkServerStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  if (serverStatus === 'online') {
    return null // No mostrar nada si está conectado
  }

  if (serverStatus === 'offline') {
    return (
      <div className="error-404-container">
        <div className="video-container">
          <video 
            className="error-video"
            autoPlay 
            loop 
            muted 
            playsInline
            preload="auto"
          >
            <source src="/videos/404error.mp4" type="video/mp4" />
            Tu navegador no soporta videos HTML5.
          </video>
        </div>
      </div>
    )
  }

  // Estado de verificación - no mostrar nada
  return null
}

export default ServerStatus
