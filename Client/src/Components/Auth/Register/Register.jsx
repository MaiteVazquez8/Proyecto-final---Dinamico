import { useState } from "react"
import axios from "axios"
import PasswordInput from "../../Global/PasswordInput/PasswordInput"
import { AUTH_ENDPOINTS } from "../../../config/api"
import "./Register.css"

function Register({ onNavigate }) {
    const [formData, setFormData] = useState({
        DNI: '',
        Nombre: '',
        Apellido: '',
        Mail: '',
        Fecha_Nac: '',
        Contraseña: '',
        Telefono: ''
    })
    const [confirmPassword, setConfirmPassword] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const registroSubmit = async (e) => {
        e.preventDefault()
        setMensaje('')
        setIsLoading(true)

        // Validación de campos requeridos
        if (!formData.DNI || !formData.Nombre || !formData.Apellido || !formData.Mail || !formData.Contraseña) {
            setMensaje('Por favor completa todos los campos obligatorios')
            setIsLoading(false)
            return
        }

        // Validación de contraseñas coincidentes
        if (formData.Contraseña !== confirmPassword) {
            setMensaje('Las contraseñas no coinciden')
            setIsLoading(false)
            return
        }

        try {
            const response = await axios.post(AUTH_ENDPOINTS.REGISTER_CLIENT, formData)

            // Mostrar mensaje de verificación
            const mensajeCompleto = response.data.Mensaje || 'Cliente registrado exitosamente'
            setMensaje(mensajeCompleto)
            
            // Limpiar formulario
            setFormData({
                DNI: '',
                Nombre: '',
                Apellido: '',
                Mail: '',
                Fecha_Nac: '',
                Contraseña: '',
                Telefono: ''
            })
            setConfirmPassword('')

            // Redirigir al login después de 3 segundos para que el usuario vea el mensaje
            setTimeout(() => {
                onNavigate('login')
            }, 3000)

        } catch (error) {
            if (error.response?.data?.Error) {
                setMensaje(error.response.data.Error)
            } else {
                setMensaje('Error al registrar cliente')
            }
        }
        setIsLoading(false)
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">ElectroShop</h1>
                    <p className="login-subtitle">Crea tu cuenta nueva</p>
                </div>

                <form className="login-form" onSubmit={registroSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="DNI">DNI *</label>
                        <input
                            type="number"
                            name="DNI"
                            id="DNI"
                            className="form-input"
                            placeholder="Ingresa tu DNI"
                            value={formData.DNI}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

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
                            id="Contraseña"
                            name="Contraseña"
                            label="Contraseña *"
                            placeholder="Crea una contraseña segura"
                            value={formData.Contraseña}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <PasswordInput
                            id="confirmPassword"
                            name="confirmPassword"
                            label="Confirmar Contraseña *"
                            placeholder="Confirma tu contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        {confirmPassword && formData.Contraseña !== confirmPassword && (
                            <p className="password-error">Las contraseñas no coinciden</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="Telefono">Teléfono</label>
                        <input
                            type="tel"
                            name="Telefono"
                            id="Telefono"
                            className="form-input"
                            placeholder="Ingresa tu teléfono"
                            value={formData.Telefono}
                            onChange={handleInputChange}
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? 'Registrando...' : 'Registrar Cliente'}
                    </button>

                    {mensaje && (
                        <div className={`login-message ${mensaje.includes('Error') || mensaje.includes('completa') || mensaje.includes('ya registrado') ? 'error' : 'success'}`}>
                            {mensaje}
                            {mensaje.includes('verifica tu email') && (
                                <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6' }}>
                                    <strong>Importante:</strong> Revisa tu bandeja de entrada (y la carpeta de spam) para encontrar el email de verificación. 
                                    Haz clic en el enlace del email para activar tu cuenta.
                                </div>
                            )}
                        </div>
                    )}
                </form>

                <div className="auth-switch">
                    <p className="auth-switch-text">
                        ¿Ya tienes una cuenta?{' '}
                        <button
                            type="button"
                            className="auth-switch-link"
                            onClick={() => onNavigate('login')}
                        >
                            Quiero iniciar sesión
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register