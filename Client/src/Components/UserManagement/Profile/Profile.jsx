import { useState } from "react"
import "../../Auth/Login/Login.css"
import "./Profile.css"

function Profile({ onNavigate, currentUser }) {
    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">ElectroShop</h1>
                    <p className="login-subtitle">Mi Perfil</p>
                </div>

                <div className="profile-info">
                    <div className="profile-field">
                        <label className="profile-label">Usuario:</label>
                        <span className="profile-value">{currentUser?.username || 'No disponible'}</span>
                    </div>
                    <div className="profile-field">
                        <label className="profile-label">Nombre:</label>
                        <span className="profile-value">{currentUser?.name || 'No disponible'}</span>
                    </div>
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