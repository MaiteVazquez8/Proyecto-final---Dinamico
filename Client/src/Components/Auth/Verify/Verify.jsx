import { useState, useEffect } from "react"
import axios from "axios"
import { AUTH_ENDPOINTS } from "../../../config/api"
import "./Verify.css"

function Verify({ token: initialToken, onNavigate }) {
    const [token, setToken] = useState(initialToken || '')
    const [verificacionEstado, setVerificacionEstado] = useState(initialToken ? 'verificando' : 'input')
    const [mensaje, setMensaje] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (initialToken) {
            verificarToken(initialToken)
        }
    }, [initialToken])

    const verificarToken = async (tokenToVerify) => {
        setVerificacionEstado('verificando')
        setIsLoading(true)
        setMensaje('')

        try {
            const response = await axios.post(AUTH_ENDPOINTS.VALIDAR_CORREO, { token: tokenToVerify })

            setVerificacionEstado('exitoso')
            setMensaje(response.data.Mensaje || 'Usuario verificado correctamente')

            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                if (onNavigate) {
                    onNavigate('login')
                }
            }, 3000)

        } catch (error) {
            setVerificacionEstado('error')
            console.error('Error de verificación:', error)
            if (error.response?.data?.Error) {
                setMensaje(error.response.data.Error)
            } else {
                setMensaje('Error al verificar usuario. El token puede ser inválido o haber expirado.')
            }
        }
        setIsLoading(false)
    }

    const handleManualSubmit = (e) => {
        e.preventDefault()
        if (!token) {
            setMensaje('Por favor ingresa el código de validación')
            return
        }
        verificarToken(token)
    }

    return (
        <div className="verify-container">
            <div className="verify-card">
                <div className="verify-header">
                    <h1 className="verify-title">ElectroShop</h1>
                    <p className="verify-subtitle">Verificación de Cuenta</p>
                </div>

                <div className="verify-content">
                    {verificacionEstado === 'input' && (
                        <form onSubmit={handleManualSubmit} className="verify-form">
                            <p className="verify-instruction">
                                Ingresa el código de validación que enviamos a tu correo electrónico.
                            </p>
                            <div className="form-group">
                                <label htmlFor="token" className="form-label">Código de Validación</label>
                                <input
                                    type="text"
                                    id="token"
                                    className="form-input"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="Ingresa el código aquí"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="verify-button"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Verificando...' : 'Verificar Cuenta'}
                            </button>
                            {mensaje && <p className="error-message">{mensaje}</p>}
                        </form>
                    )}

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
                                onClick={() => setVerificacionEstado('input')}
                            >
                                Intentar nuevamente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Verify

