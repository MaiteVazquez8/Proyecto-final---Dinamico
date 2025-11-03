import { useState } from "react"
import axios from "axios"
import "../../Auth/Login/Login.css"
import "./EditUser.css"

function EditUser({ onNavigate }) {
    const [newName, setNewName] = useState('')
    const [newUser, setNewUser] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const updateProfile = async (e) => {
        e.preventDefault()
        setMensaje('')
        setIsLoading(true)

        // Validaciones básicas
        if (!newName && !newUser && !newPassword) {
            setMensaje('Por favor modifica al menos un campo')
            setIsLoading(false)
            return
        }

        if (!confirmPassword) {
            setMensaje('Por favor ingresa tu contraseña actual para confirmar los cambios')
            setIsLoading(false)
            return
        }

        if (newPassword && newPassword.length < 6) {
            setMensaje('La nueva contraseña debe tener al menos 6 caracteres')
            setIsLoading(false)
            return
        }

        try {
            // Primero verificar la contraseña actual
            const verifyResponse = await axios.post('http://localhost:5000/api/verificarUsuario', {
                user: 'currentUser', // Esto debería venir del contexto del usuario logueado
                password: confirmPassword
            })

            // Si la verificación es exitosa, proceder con la actualización
            const updateData = {
                currentUser: 'currentUser', // Esto debería venir del contexto
                currentPassword: confirmPassword,
                ...(newName && { newName }),
                ...(newUser && { newUser }),
                ...(newPassword && { newPassword })
            }

            const updateResponse = await axios.put('http://localhost:5000/api/editarUsuario', updateData)
            
            setMensaje('Perfil actualizado exitosamente')
            
            // Limpiar formulario
            setNewName('')
            setNewUser('')
            setNewPassword('')
            setConfirmPassword('')
            
            // Redirigir después de 2 segundos
            setTimeout(() => {
                onNavigate('home')
            }, 2000)
            
        } catch (error) {
            if (error.response?.data?.mensaje) {
                setMensaje(error.response.data.mensaje)
            } else {
                setMensaje('Error al actualizar el perfil')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">ElectroShop</h1>
                    <p className="login-subtitle">Editar mi perfil</p>
                </div>

                <form className="login-form" onSubmit={updateProfile}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="newName">Nuevo Nombre (Opcional)</label>
                        <input 
                            type="text" 
                            name="newName" 
                            id="newName"
                            className="form-input"
                            placeholder="Deja vacío para mantener el actual"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="newUser">Nuevo Usuario (Opcional)</label>
                        <input 
                            type="text" 
                            name="newUser" 
                            id="newUser"
                            className="form-input"
                            placeholder="Deja vacío para mantener el actual"
                            value={newUser}
                            onChange={(e) => setNewUser(e.target.value)}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label" htmlFor="newPassword">Nueva Contraseña (Opcional)</label>
                        <input 
                            type="password" 
                            name="newPassword" 
                            id="newPassword"
                            className="form-input"
                            placeholder="Deja vacío para mantener la actual"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="confirmPassword">Contraseña Actual (Para confirmar)</label>
                        <input 
                            type="password" 
                            name="confirmPassword" 
                            id="confirmPassword"
                            className="form-input"
                            placeholder="Ingresa tu contraseña actual"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? 'Actualizando...' : 'Guardar Cambios'}
                    </button>
                    
                    {mensaje && (
                        <div className={`login-message ${mensaje.includes('Error') || mensaje.includes('completa') || mensaje.includes('contraseña') ? 'error' : 'success'}`}>
                            {mensaje}
                        </div>
                    )}
                </form>

                <div className="auth-switch">
                    <p className="auth-switch-text">
                        ¿No quieres hacer cambios?{' '}
                        <button 
                            type="button"
                            className="auth-switch-link"
                            onClick={() => onNavigate('home')}
                        >
                            Volver al inicio
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default EditUser