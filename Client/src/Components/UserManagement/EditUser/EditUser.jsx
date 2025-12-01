import { useState, useEffect } from "react"
import axios from "axios"
import { AUTH_ENDPOINTS, getMockClientData } from "../../../config/api"
import PasswordInput from "../../Global/PasswordInput/PasswordInput"
import logoImagen from "../../../assets/imgs/tuercav4.png"
import "../../Auth/Login/Login.css"
import "./EditUser.css"

function EditUser({ onNavigate, currentUser }) {
    const [formData, setFormData] = useState({
        Nombre: '',
        Apellido: '',
        Mail: '',
        Telefono: '',
        Direccion: '',
        Cod_Postal: '',
        Fecha_Nac: ''
    })
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)

    // Cargar datos del usuario al montar el componente
    useEffect(() => {
        const loadUserData = async () => {
            if (!currentUser?.DNI) {
                setLoadingData(false)
                return
            }

            try {
                // Endpoint no disponible - usar datos simulados combinados con currentUser
                console.log('Endpoint GET_CLIENT no disponible - usando datos simulados')
                const mockData = getMockClientData(currentUser.DNI)
                const userData = { ...mockData, ...currentUser }

                // Prellenar el formulario con los datos actuales
                setFormData({
                    Nombre: userData.Nombre || '',
                    Apellido: userData.Apellido || '',
                    Mail: userData.Mail || '',
                    Telefono: userData.Telefono || '',
                    Direccion: userData.Direccion || '',
                    Cod_Postal: userData.Cod_Postal || '',
                    Fecha_Nac: userData.Fecha_Nac || ''
                })
            } catch (error) {
                console.error('Error al cargar datos del usuario:', error)
                // Si falla, usar los datos básicos del currentUser
                if (currentUser) {
                    setFormData(prev => ({
                        ...prev,
                        Nombre: currentUser.Nombre || prev.Nombre,
                        Apellido: currentUser.Apellido || prev.Apellido,
                        Mail: currentUser.Mail || prev.Mail
                    }))
                }
            } finally {
                setLoadingData(false)
            }
        }

        loadUserData()
    }, [currentUser])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const updateProfile = async (e) => {
        e.preventDefault()
        setMensaje('')
        setIsLoading(true)

        // Validaciones básicas
        if (!formData.Nombre || !formData.Apellido || !formData.Mail) {
            setMensaje('Nombre, Apellido y Email son campos obligatorios')
            setIsLoading(false)
            return
        }

        if (!confirmPassword) {
            setMensaje('Por favor ingresa tu contraseña actual para confirmar los cambios')
            setIsLoading(false)
            return
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.Mail)) {
            setMensaje('Por favor ingresa un email válido')
            setIsLoading(false)
            return
        }

        if (newPassword && newPassword.length < 6) {
            setMensaje('La nueva contraseña debe tener al menos 6 caracteres')
            setIsLoading(false)
            return
        }

        try {
            // Usar DNI para verificar (el email puede haber cambiado en el form)
            if (!currentUser.DNI) {
                setMensaje('Error: No se pudo identificar al usuario (Falta DNI)')
                setIsLoading(false)
                return
            }

            const verifyResponse = await axios.post(AUTH_ENDPOINTS.LOGIN, {
                DNI: currentUser.DNI,
                Password: confirmPassword
            })

            // Verificar si la respuesta tiene accessToken o requiere2FA (login exitoso)
            if (!verifyResponse.data.accessToken && !verifyResponse.data.requiere2FA) {
                setMensaje('Contraseña actual incorrecta')
                setIsLoading(false)
                return
            }

            // Preparar datos para actualizar
            const updateData = {
                Nombre: formData.Nombre,
                Apellido: formData.Apellido,
                Mail: formData.Mail,
                Telefono: formData.Telefono || null,
                Direccion: formData.Direccion || null,
                Cod_Postal: formData.Cod_Postal || null,
                Fecha_Nac: formData.Fecha_Nac || null,
                ...(newPassword && {
                    Contraseña: newPassword,
                    Password: newPassword
                })
            }

            // Determinar endpoint basado en el rol (si existe) o intentar Client por defecto
            const isClient = (currentUser.Rol || currentUser.rol || 'cliente').toLowerCase() === 'cliente';
            const endpoint = isClient
                ? AUTH_ENDPOINTS.UPDATE_CLIENT(currentUser.DNI)
                : AUTH_ENDPOINTS.UPDATE_PERSONAL(currentUser.DNI);

            // Actualizar el usuario
            const updateResponse = await axios.put(endpoint, updateData)

            setMensaje(updateResponse.data.Mensaje || 'Perfil actualizado exitosamente')

            // Actualizar el currentUser en localStorage si el email cambió
            if (formData.Mail !== currentUser.Mail) {
                const updatedUser = { ...currentUser, Mail: formData.Mail, Nombre: formData.Nombre, Apellido: formData.Apellido }
                localStorage.setItem('currentUser', JSON.stringify(updatedUser))
            }

            // Limpiar campos de contraseña
            setNewPassword('')
            setConfirmPassword('')

            // Redirigir después de 2 segundos
            setTimeout(() => {
                onNavigate('profile')
            }, 2000)

        } catch (error) {
            console.error('Error al actualizar perfil:', error)
            if (error.response?.data?.Error) {
                setMensaje(error.response.data.Error)
            } else {
                setMensaje('Error al actualizar el perfil. Verifica tu contraseña actual.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-header-container">
                        <img src={logoImagen} alt="ElectroShop Logo" className="login-logo-img" />
                        <h1 className="login-title">ElectroShop</h1>
                    </div>
                    <p className="login-subtitle">Editar mi perfil</p>
                </div>

                {loadingData ? (
                    <p>Cargando datos...</p>
                ) : (
                    <form className="login-form" onSubmit={updateProfile}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="Nombre">Nombre *</label>
                            <input
                                type="text"
                                name="Nombre"
                                id="Nombre"
                                className="form-input"
                                placeholder="Ingresa tu nombre"
                                value={formData.Nombre}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="Apellido">Apellido *</label>
                            <input
                                type="text"
                                name="Apellido"
                                id="Apellido"
                                className="form-input"
                                placeholder="Ingresa tu apellido"
                                value={formData.Apellido}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="Mail">Email *</label>
                            <input
                                type="email"
                                name="Mail"
                                id="Mail"
                                className="form-input"
                                placeholder="Ingresa tu email"
                                value={formData.Mail}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="Telefono">Teléfono</label>
                            <input
                                type="tel"
                                name="Telefono"
                                id="Telefono"
                                className="form-input"
                                placeholder="Ingresa tu teléfono (opcional)"
                                value={formData.Telefono}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="Direccion">Dirección</label>
                            <input
                                type="text"
                                name="Direccion"
                                id="Direccion"
                                className="form-input"
                                placeholder="Ingresa tu dirección (opcional)"
                                value={formData.Direccion}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="Cod_Postal">Código Postal</label>
                            <input
                                type="text"
                                name="Cod_Postal"
                                id="Cod_Postal"
                                className="form-input"
                                placeholder="Ingresa tu código postal (opcional)"
                                value={formData.Cod_Postal}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="Fecha_Nac">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                name="Fecha_Nac"
                                id="Fecha_Nac"
                                className="form-input"
                                value={formData.Fecha_Nac}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <PasswordInput
                                id="newPassword"
                                name="newPassword"
                                label="Nueva Contraseña (Opcional)"
                                placeholder="Deja vacío para mantener la actual"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <PasswordInput
                                id="confirmPassword"
                                name="confirmPassword"
                                label="Contraseña Actual (Para confirmar) *"
                                placeholder="Ingresa tu contraseña actual"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {mensaje && (
                            <div className={`login-message ${mensaje.includes('Error') || mensaje.includes('completa') || mensaje.includes('contraseña') || mensaje.includes('obligatorio') ? 'error' : 'success'}`}>
                                {mensaje}
                            </div>
                        )}

                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? 'Actualizando...' : 'Guardar Cambios'}
                        </button>
                    </form>
                )}

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