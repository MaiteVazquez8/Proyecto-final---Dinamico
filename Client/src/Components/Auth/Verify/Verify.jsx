import { useState, useEffect } from "react"
import axios from "axios"
import "./Verify.css"

function Verify({ token, onNavigate }) {
    const [verificacionEstado, setVerificacionEstado] = useState('verificando')
    const [mensaje, setMensaje] = useState('')

    useEffect(() => {
        const verificarToken = async () => {
            if (!token) {
                setVerificacionEstado('error')
                setMensaje('Token no proporcionado')
                return
            }

            try {
                // COMENTADO POR AHORA - La verificación está deshabilitada temporalmente
                // const response = await axios.get(`http://localhost:3000/api/verificacion/${token}`)
                
                // Simulación de verificación exitosa mientras está comentado
                const response = {
                    data: {
                        Verificado: true,
                        Mensaje: 'Usuario verificado correctamente (simulado)'
                    }
                }
                
                // if (response.data.Verificado) {
                //     setVerificacionEstado('exitoso')
                //     setMensaje(response.data.Mensaje || 'Usuario verificado correctamente')
                //     
                //     // Redirigir al login después de 3 segundos
                //     setTimeout(() => {
                //         if (onNavigate) {
                //             onNavigate('login')
                //         }
                //     }, 3000)
                // } else {
                //     setVerificacionEstado('error')
                //     setMensaje(response.data.Mensaje || 'Error al verificar usuario')
                // }
                
                // Código temporal mientras la verificación está comentada
                if (response.data.Verificado) {
                    setVerificacionEstado('exitoso')
                    setMensaje(response.data.Mensaje || 'Usuario verificado correctamente')
                    
                    // Redirigir al login después de 3 segundos
                    setTimeout(() => {
                        if (onNavigate) {
                            onNavigate('login')
                        }
                    }, 3000)
                } else {
                    setVerificacionEstado('error')
                    setMensaje(response.data.Error || 'Error al verificar usuario')
                }
            } catch (error) {
                setVerificacionEstado('error')
                if (error.response?.data?.Error) {
                    setMensaje(error.response.data.Error)
                } else {
                    setMensaje('Error al verificar usuario. El token puede ser inválido o haber expirado.')
                }
            }
        }

        verificarToken()
    }, [token, onNavigate])

    return (
        <div className="verify-container">
            <div className="verify-card">
                <div className="verify-header">
                    <h1 className="verify-title">ElectroShop</h1>
                    <p className="verify-subtitle">Verificación de Cuenta</p>
                </div>

                <div className="verify-content">
                    {verificacionEstado === 'verificando' && (
                        <div className="verify-loading">
                            <div className="spinner"></div>
                            <p>Verificando tu cuenta...</p>
                        </div>
                    )}

                    {verificacionEstado === 'exitoso' && (
                        <div className="verify-success">
                            <div className="success-icon">✓</div>
                            <h2>¡Cuenta Verificada!</h2>
                            <p>{mensaje}</p>
                            <p className="redirect-message">Serás redirigido al login en unos segundos...</p>
                            <button 
                                className="verify-button"
                                onClick={() => onNavigate && onNavigate('login')}
                            >
                                Ir al Login
                            </button>
                        </div>
                    )}

                    {verificacionEstado === 'error' && (
                        <div className="verify-error">
                            <div className="error-icon">✗</div>
                            <h2>Error de Verificación</h2>
                            <p>{mensaje}</p>
                            <button 
                                className="verify-button"
                                onClick={() => onNavigate && onNavigate('login')}
                            >
                                Ir al Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Verify

