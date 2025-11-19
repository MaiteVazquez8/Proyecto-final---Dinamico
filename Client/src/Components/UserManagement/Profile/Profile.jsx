import { useState, useEffect } from "react"
import axios from "axios"
import { AUTH_ENDPOINTS, getMockClientData } from "../../../config/api"
import logoImagen from "../../../assets/imgs/tuercav4.png"
import "../../Auth/Login/Login.css"
import "./Profile.css"

function Profile({ onNavigate, currentUser }) {
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadUserData = async () => {
            if (!currentUser?.DNI) {
                // Si no hay DNI, usar los datos básicos del currentUser
                setUserData(currentUser)
                setLoading(false)
                return
            }

            // Solo cargar desde la DB si es cliente
            const cargo = currentUser?.Cargo?.toLowerCase()
            if (cargo === 'cliente') {
                try {
                    // Endpoint no disponible - usar datos simulados
                    console.log('Endpoint GET_CLIENT no disponible - usando datos simulados')
                    const mockData = getMockClientData(currentUser.DNI)
                    setUserData(mockData)
                } catch (error) {
                    console.error('Error al cargar datos del usuario:', error)
                    // Si falla, usar los datos básicos del currentUser
                    setUserData(currentUser)
                } finally {
                    setLoading(false)
                }
            } else {
                // Para personal (empleados, gerentes), usar los datos del currentUser
                setUserData(currentUser)
                setLoading(false)
            }
        }

        loadUserData()
    }, [currentUser])

    // Obtener valores a mostrar
    const nombreCompleto = userData 
        ? `${userData.Nombre || ''} ${userData.Apellido || ''}`.trim() || userData.Nombre || 'No disponible'
        : currentUser?.Nombre 
            ? `${currentUser.Nombre || ''} ${currentUser.Apellido || ''}`.trim() || currentUser.Nombre
            : 'No disponible'
    
    const usuario = (userData?.DNI || currentUser?.DNI) 
        ? `DNI: ${userData?.DNI || currentUser.DNI}` 
        : currentUser?.Mail || 'No disponible'

    const email = userData?.Mail || currentUser?.Mail || 'No disponible'
    const telefono = userData?.Telefono || currentUser?.Telefono || null
    const direccion = userData?.Direccion || currentUser?.Direccion || null
    const codPostal = userData?.Cod_Postal || currentUser?.Cod_Postal || null
    const cargo = userData?.Cargo || currentUser?.Cargo || null

    if (loading) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="logo-header-container">
                            <img src={logoImagen} alt="ElectroShop Logo" className="login-logo-img" />
                            <h1 className="login-title">ElectroShop</h1>
                        </div>
                        <p className="login-subtitle">Mi Perfil</p>
                    </div>
                    <p>Cargando información...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-header-container">
                        <img src={logoImagen} alt="ElectroShop Logo" className="login-logo-img" />
                        <h1 className="login-title">ElectroShop</h1>
                    </div>
                    <p className="login-subtitle">Mi Perfil</p>
                </div>

                <div className="profile-info">
                    <div className="profile-field">
                        <label className="profile-label">Usuario:</label>
                        <span className="profile-value">{usuario}</span>
                    </div>
                    <div className="profile-field">
                        <label className="profile-label">Nombre:</label>
                        <span className="profile-value">{nombreCompleto}</span>
                    </div>
                    <div className="profile-field">
                        <label className="profile-label">Email:</label>
                        <span className="profile-value">{email}</span>
                    </div>
                    {cargo && (
                        <div className="profile-field">
                            <label className="profile-label">Cargo:</label>
                            <span className="profile-value">{cargo}</span>
                        </div>
                    )}
                    {telefono && (
                        <div className="profile-field">
                            <label className="profile-label">Teléfono:</label>
                            <span className="profile-value">{telefono}</span>
                        </div>
                    )}
                    {direccion && (
                        <div className="profile-field">
                            <label className="profile-label">Dirección:</label>
                            <span className="profile-value">{direccion}</span>
                        </div>
                    )}
                    {codPostal && (
                        <div className="profile-field">
                            <label className="profile-label">Código Postal:</label>
                            <span className="profile-value">{codPostal}</span>
                        </div>
                    )}
                </div>

                <div className="profile-actions">
                    <button 
                        className="profile-button edit-button"
                        onClick={() => onNavigate('edit')}
                    >
                        Editar Perfil
                    </button>
                    
                    <button 
                        className="profile-button delete-button"
                        onClick={() => onNavigate('delete')}
                    >
                        Eliminar Cuenta
                    </button>
                </div>

                <div className="auth-switch">
                    <p className="auth-switch-text">
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

export default Profile