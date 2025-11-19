import { useState, useEffect } from "react"
import axios from "axios"
import { AUTH_ENDPOINTS, getMockManagersData } from "../../../config/api"
import Swal from 'sweetalert2'
import PasswordInput from "../../Global/PasswordInput/PasswordInput"
import "./ManagerManagement.css"

function ManagerManagement({ currentUser }) {
    const [managers, setManagers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingManager, setEditingManager] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')

    const [formData, setFormData] = useState({
        DNI: '',
        Nombre: '',
        Apellido: '',
        Mail: '',
        Fecha_Nacimiento: '',
        Contraseña: '',
        Telefono: '',
        Direccion: '',
        Cargo: 'Gerente'
    })

    useEffect(() => {
        loadManagers()
    }, [])

    const loadManagers = async () => {
        try {
            setLoading(true)
            // Endpoint no disponible - usar datos simulados
            console.log('Endpoint GET_MANAGERS no disponible - usando datos simulados')
            const mockData = getMockManagersData()
            setManagers(mockData || [])
        } catch (error) {
            console.error('Error al cargar gerentes:', error)
            setError('Error al cargar gerentes')
            setManagers([])
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            if (editingManager) {
                await axios.put(AUTH_ENDPOINTS.UPDATE_PERSONAL(editingManager.DNI), formData)
                Swal.fire({ icon: 'success', title: '¡Éxito!', text: 'Gerente modificado correctamente', confirmButtonColor: '#B8CFCE', confirmButtonText: 'Aceptar' })
            } else {
                await axios.post(AUTH_ENDPOINTS.REGISTER_PERSONAL, formData)
                Swal.fire({ icon: 'success', title: '¡Éxito!', text: 'Gerente agregado correctamente', confirmButtonColor: '#B8CFCE', confirmButtonText: 'Aceptar' })
            }
            setFormData({ DNI: '', Nombre: '', Apellido: '', Mail: '', Fecha_Nacimiento: '', Contraseña: '', Telefono: '', Direccion: '', Cargo: 'Gerente' })
            setShowAddForm(false)
            setEditingManager(null)
            loadManagers()
        } catch (error) {
            console.error('Error al agregar gerente:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.Error || 'No se pudo agregar el gerente',
                confirmButtonColor: '#A0A2BA',
                confirmButtonText: 'Aceptar'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (manager) => {
        setEditingManager(manager)
        setFormData({
            DNI: manager.DNI || '',
            Nombre: manager.Nombre || '',
            Apellido: manager.Apellido || '',
            Mail: manager.Mail || '',
            Fecha_Nacimiento: manager.Fecha_Nacimiento || '',
            Contraseña: '',
            Telefono: manager.Telefono || '',
            Direccion: manager.Direccion || '',
            Cargo: manager.Cargo || 'Gerente'
        })
        setShowAddForm(true)
    }

    const handleDelete = async (DNI) => {
        // Validar que el DNI no esté vacío
        if (!DNI) {
            console.error('DNI inválido:', DNI)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'DNI inválido',
                confirmButtonColor: '#A0A2BA',
                confirmButtonText: 'Aceptar'
            })
            return
        }

        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'No podrás revertir esta acción',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#B8CFCE',
            cancelButtonColor: '#A0A2BA',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (!result.isConfirmed) return
        
        try {
            const response = await axios.delete(AUTH_ENDPOINTS.DELETE_PERSONAL(DNI))
            Swal.fire({
                icon: 'success',
                title: '¡Eliminado!',
                text: response.data?.Mensaje || 'Gerente eliminado correctamente',
                confirmButtonColor: '#B8CFCE',
                confirmButtonText: 'Aceptar'
            })
            loadManagers()
        } catch (error) {
            console.error('Error al eliminar gerente:', error)
            const errorMessage = error.response?.data?.Error || error.response?.data?.Detalle || 'No se pudo eliminar el gerente'
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonColor: '#A0A2BA',
                confirmButtonText: 'Aceptar'
            })
        }
    }

    if (loading && managers.length === 0) {
        return <div className="manager-management-container">Cargando gerentes...</div>
    }

    return (
        <div className="manager-management-container">
            <div className="management-header">
                <h1>Gestión de Gerentes</h1>
                <div className="management-actions">
                    <input
                        type="text"
                        placeholder="Buscar por DNI, nombre o email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="product-search-input"
                        aria-label="Buscar gerentes"
                    />
                    <button 
                        className="add-btn"
                        onClick={() => { setShowAddForm(true); setEditingManager(null); setFormData({ DNI: '', Nombre: '', Apellido: '', Mail: '', Fecha_Nacimiento: '', Contraseña: '', Telefono: '', Direccion: '', Cargo: 'Gerente' }) }}
                        disabled={showAddForm}
                    >
                        + Agregar Gerente
                    </button>
                </div>
            </div>

            {showAddForm && (
                <div className="manager-form-container">
                    <h2>{editingManager ? 'Editar Gerente' : 'Nuevo Gerente'}</h2>
                    <form onSubmit={handleSubmit} className="manager-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>DNI:</label>
                                <input
                                    type="number"
                                    name="DNI"
                                    value={formData.DNI}
                                    onChange={handleInputChange}
                                    required
                                    disabled={!!editingManager}
                                />
                            </div>

                            <div className="form-group">
                                <label>Cargo:</label>
                                <select
                                    name="Cargo"
                                    value={formData.Cargo}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="Gerente">Gerente</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Nombre:</label>
                                <input
                                    type="text"
                                    name="Nombre"
                                    value={formData.Nombre}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Apellido:</label>
                                <input
                                    type="text"
                                    name="Apellido"
                                    value={formData.Apellido}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="Mail"
                                    value={formData.Mail}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Fecha de Nacimiento:</label>
                                <input
                                    type="date"
                                    name="Fecha_Nacimiento"
                                    value={formData.Fecha_Nacimiento}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Teléfono:</label>
                                <input
                                    type="tel"
                                    name="Telefono"
                                    value={formData.Telefono}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Contraseña:</label>
                                <PasswordInput
                                    id="Contraseña"
                                    name="Contraseña"
                                    value={formData.Contraseña}
                                    onChange={handleInputChange}
                                    required={!editingManager}
                                    showLabel={false}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Dirección:</label>
                            <input
                                type="text"
                                name="Direccion"
                                value={formData.Direccion}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="save-btn">
                                {editingManager ? 'Guardar Cambios' : 'Agregar Gerente'}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => {
                                    setShowAddForm(false)
                                    setEditingManager(null)
                                    setFormData({ DNI: '', Nombre: '', Apellido: '', Mail: '', Fecha_Nacimiento: '', Contraseña: '', Telefono: '', Direccion: '', Cargo: 'Gerente' })
                                }} 
                                className="cancel-btn"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <div className="managers-table-container">
                <table className="managers-table">
                    <thead>
                        <tr>
                            <th>DNI</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Email</th>
                            <th>Cargo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            const q = (searchQuery || '').trim().toLowerCase()
                            const filtered = q
                                ? managers.filter(m => {
                                    return (
                                        String(m.DNI).toLowerCase().includes(q) ||
                                        (m.Nombre || '').toLowerCase().includes(q) ||
                                        (m.Apellido || '').toLowerCase().includes(q) ||
                                        (m.Mail || '').toLowerCase().includes(q)
                                    )
                                })
                                : managers

                            if (filtered.length === 0) {
                                return (
                                    <tr>
                                        <td colSpan="6" className="empty-message">No hay gerentes que coincidan</td>
                                    </tr>
                                )
                            }

                            return filtered.map(manager => (
                                <tr key={manager.DNI}>
                                    <td>{manager.DNI}</td>
                                    <td>{manager.Nombre}</td>
                                    <td>{manager.Apellido}</td>
                                    <td>{manager.Mail}</td>
                                    <td>{manager.Cargo}</td>
                                    <td className="actions-cell">
                                        <button 
                                            className="edit-btn"
                                            onClick={() => handleEdit(manager)}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(manager.DNI)}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        })()}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ManagerManagement

