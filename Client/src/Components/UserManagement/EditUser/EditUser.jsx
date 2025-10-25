import { useState } from "react"
import axios from "axios"
import "../../Auth/Login/Login.css"
import "./EditUser.css"

function EditUser({ onNavigate }) {
    const [currentUser, setCurrentUser] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newName, setNewName] = useState('')
    const [newUser, setNewUser] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1) // 1: Verificar usuario, 2: Editar datos

    const verifyUser = async (e) => {
        e.preventDefault()
        setMensaje('')
        setIsLoading(true)

        if (!currentUser || !currentPassword) {
            setMensaje('Por favor completa todos los campos')
            setIsLoading(false)
            return
        }

        try {
            const server = await axios.post('http://localhost:5000/api/verificarUsuario', {
                user: currentUser,
                password: currentPassword
            })
            
            // Si la verificación es exitosa, pasar al paso 2
            setStep(2)
            setNewUser(currentUser) // Pre-llenar con el usuario actual
            setMensaje('')
            
        } catch (error) {
            if (error.response?.data?.mensaje) {
                setMensaje(error.response.data.mensaje)
            } else {
                setMensaje('Error al verificar usuario')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const updateUser = async (e) => {
        e.preventDefault()
        setMensaje('')
        setIsLoading(true)

        if (!newName || !newUser) {
            setMensaje('Por favor completa al menos el nombre y usuario')
            setIsLoading(false)
            return
        }

        try {
            const updateData = {
                currentUser,
                currentPassword,
                newName,
                newUser,
                ...(newPassword && { newPassword })
            }

            const server = await axios.put('http://localhost:5000/api/editarUsuario', updateData)
            
            setMensaje('Usuario actualizado exitosamente')
            
            // Redirigir después de 2 segundos
            setTimeout(() => {
                onNavigate('login')
            }, 2000)
            
        } catch (error) {
            if (error.response?.data?.mensaje) {
                setMensaje(error.response.data.mensaje)
            } else {
                setMensaje('Error al actualizar usuario')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const goBack = () => {
        setStep(1)
        setNewName('')
        setNewUser('')
        setNewPassword('')
        setMensaje('')
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">ElectroShop</h1>
                    <p className="login-subtitle">
                        {step === 1 ? 'Verificar identidad' : 'Editar datos de usuario'}
                    </p>
                </div>

                {step === 1 ? (
                    // Paso 1: Verificar usuario actual
                    <form className="login-form" onSubmit={verifyUser}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="currentUser">Usuario Actual</label>
                            <input 
                                type="text" 
                                name="currentUser" 
                                id="currentUser"
                                className="form-input"
                                placeholder="Ingresa tu usuario actual"
                                value={currentUser}
                                onChange={(e) => setCurrentUser(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label" htmlFor="currentPassword">Contraseña Actual</label>
                            <input 
                                type="password" 
                                name="currentPassword" 
                                id="currentPassword"
                                className="form-input"
                                placeholder="Ingresa tu contraseña actual"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? 'Verificando...' : 'Verificar Usuario'}
                        </button>
                        
                        {mensaje && (
                            <div className={`login-message ${mensaje.includes('Error') || mensaje.includes('completa') ? 'error' : 'success'}`}>
                                {mensaje}
                            </div>
                        )}
                    </form>
                ) : (
                    // Paso 2: Editar datos
                    <form className="login-form" onSubmit={updateUser}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="newName">Nuevo Nombre</label>
                            <input 
                                type="text" 
                                name="newName" 
                                id="newName"
                                className="form-input"
                                placeholder="Ingresa tu nuevo nombre"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="newUser">Nuevo Usuario</label>
                            <input 
                                type="text" 
                                name="newUser" 
                                id="newUser"
                                className="form-input"
                                placeholder="Ingresa tu nuevo usuario"
                                value={newUser}
                                onChange={(e) => setNewUser(e.target.value)}
                                required
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

                        <div className="form-buttons">
                            <button type="button" className="back-button" onClick={goBack}>
                                Volver
                            </button>
                            <button type="submit" className="login-button" disabled={isLoading}>
                                {isLoading ? 'Actualizando...' : 'Actualizar Datos'}
                            </button>
                        </div>
                        
                        {mensaje && (
                            <div className={`login-message ${mensaje.includes('Error') || mensaje.includes('completa') ? 'error' : 'success'}`}>
                                {mensaje}
                            </div>
                        )}
                    </form>
                )}

                <div className="auth-switch">
                    <p className="auth-switch-text">
                        ¿No quieres hacer cambios?{' '}
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
        </div>
    )
}

export default EditUser