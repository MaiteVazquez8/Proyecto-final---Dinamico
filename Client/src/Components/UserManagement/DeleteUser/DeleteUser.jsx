import { useState } from "react"
import axios from "axios"
import "../../Auth/Login/Login.css"
import "./DeleteUser.css"

function DeleteUser({ onNavigate }) {
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMensaje('')

        // Validación simple
        if (!user || !password) {
            setMensaje('Por favor completa todos los campos')
            return
        }

        setShowConfirmation(true)
    }

    const confirmDelete = async () => {
        setIsLoading(true)
        setShowConfirmation(false)

        try {
            const server = await axios.delete('http://localhost:5000/api/eliminarUsuario', {
                data: { user, password }
            })
            
            setMensaje('Usuario eliminado exitosamente')
            setUser('')
            setPassword('')
            
            // Redirigir después de 2 segundos
            setTimeout(() => {
                onNavigate('login')
            }, 2000)
            
        } catch (error) {
            if (error.response?.data?.mensaje) {
                setMensaje(error.response.data.mensaje)
            } else {
                setMensaje('Error al eliminar usuario')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const cancelDelete = () => {
        setShowConfirmation(false)
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">ElectroShop</h1>
                    <p className="login-subtitle">Eliminar cuenta de usuario</p>
                </div>
                
                <form className="login-form" onSubmit={handleSubmit}>
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
                            placeholder="Confirma tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="warning-message">
                        <p>⚠️ Esta acción no se puede deshacer. Tu cuenta será eliminada permanentemente.</p>
                    </div>

                    <button type="submit" className="delete-button" disabled={isLoading}>
                        {isLoading ? 'Eliminando...' : 'Eliminar Cuenta'}
                    </button>
                    
                    {mensaje && (
                        <div className={`login-message ${mensaje.includes('Error') || mensaje.includes('completa') ? 'error' : 'success'}`}>
                            {mensaje}
                        </div>
                    )}
                </form>

                <div className="auth-switch">
                    <p className="auth-switch-text">
                        ¿Cambiaste de opinión?{' '}
                        <button 
                            type="button"
                            className="auth-switch-link"
                            onClick={() => onNavigate('login')}
                        >
                            Volver al inicio
                        </button>
                    </p>
                </div>
            </div>

            {/* Modal de confirmación */}
            {showConfirmation && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">Confirmar Eliminación</h3>
                        <p className="modal-text">
                            ¿Estás seguro de que deseas eliminar tu cuenta? 
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="modal-buttons">
                            <button className="modal-btn cancel" onClick={cancelDelete}>
                                Cancelar
                            </button>
                            <button className="modal-btn confirm" onClick={confirmDelete}>
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DeleteUser