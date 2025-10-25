import { useState } from "react"
import axios from "axios"
import "./Register.css"

function Register({ onNavigate }) {
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [mensaje, setMensaje] = useState('')

    const registroSubmit = async (e) => {
        e.preventDefault()
        setMensaje('')

        // Validación simple
        if (!name || !user || !password) {
            setMensaje('Por favor completa todos los campos')
            return
        }

        try {
            const server = await axios.post('http://localhost:3000/api/registroUsuario', {
                user,
                Password: password,
                Name: name
            })

            setMensaje('Usuario registrado exitosamente')
            setName('')
            setUser('')
            setPassword('')
        } catch (error) {
            if (error.response?.data?.mensaje) {
                setMensaje(error.response.data.mensaje)
            } else {
                setMensaje('Error al registrar usuario')
            }
        }
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
                        <label className="form-label" htmlFor="name">Nombre</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            className="form-input"
                            placeholder="Ingresa tu nombre completo"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="user">Usuario</label>
                        <input
                            type="text"
                            name="user"
                            id="user"
                            className="form-input"
                            placeholder="Elige un nombre de usuario"
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
                            placeholder="Crea una contraseña segura"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-button">
                        Registrar Usuario
                    </button>

                    {mensaje && (
                        <div className={`login-message ${mensaje.includes('Error') || mensaje.includes('completa') ? 'error' : 'success'}`}>
                            {mensaje}
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