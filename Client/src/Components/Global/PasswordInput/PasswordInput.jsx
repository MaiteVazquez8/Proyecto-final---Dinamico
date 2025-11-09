import { useState } from "react"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import "./PasswordInput.css"

function PasswordInput({ 
    id, 
    name, 
    value, 
    onChange, 
    placeholder, 
    className = "", 
    required = false,
    label,
    htmlFor,
    showLabel = true
}) {
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className={`password-input-wrapper ${!showLabel ? 'no-label' : ''}`}>
            {label && showLabel && (
                <label className="form-label" htmlFor={htmlFor || id}>
                    {label}
                </label>
            )}
            <div className="password-input-container">
                <input
                    type={showPassword ? "text" : "password"}
                    id={id}
                    name={name}
                    className={`form-input password-input ${className}`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                />
                <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                    {showPassword ? (
                        <AiOutlineEyeInvisible className="password-icon" />
                    ) : (
                        <AiOutlineEye className="password-icon" />
                    )}
                </button>
            </div>
        </div>
    )
}

export default PasswordInput

