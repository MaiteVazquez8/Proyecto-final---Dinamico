import { useState, useEffect } from "react"
import axios from "axios"
import { AUTH_ENDPOINTS } from "../../../config/api"
import Swal from 'sweetalert2'
import PasswordInput from "../../Global/PasswordInput/PasswordInput"
import "./ClientManagement.css"

// Componente de gestión de clientes para super admin
function ClientManagement({ currentUser }) {
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showEditForm, setShowEditForm] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [editingClient, setEditingClient] = useState(null)

    const [formData, setFormData] = useState({
        DNI: '',
        Nombre: '',
        Apellido: '',
        Mail: '',
        Fecha_Nac: '',
        Contraseña: '',
        Telefono: '',
        Direccion: '',
        Cod_Postal: ''
    })

    useEffect(() => {
        loadClients()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const loadClients = async () => {
        try {
            setLoading(true)
            // Comentado temporalmente - no existe endpoint para obtener todos los clientes
            // const response = await axios.get(AUTH_ENDPOINTS.GET_CLIENTS)
            // console.log('Clientes cargados del servidor:', response.data)
            // setClients(response.data || [])
            
            // Temporalmente vacío hasta que se implemente el endpoint
            console.log('Endpoint GET_CLIENTS no disponible - lista vacía')
            setClients([])
        } catch (error) {
            console.error('Error al cargar clientes:', error)
            setError('Error al cargar clientes')
            setClients([])
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
            if (editingClient) {
                await axios.put(AUTH_ENDPOINTS.UPDATE_CLIENT(editingClient.DNI), formData)
                Swal.fire({ 
                    icon: 'success', 
                    title: '¡Éxito!', 
                    text: 'Cliente modificado correctamente', 
                    confirmButtonColor: '#B8CFCE', 
                    confirmButtonText: 'Aceptar' 
                })
            }
            setFormData({
                DNI: '', 
                Nombre: '', 
                Apellido: '', 
                Mail: '', 
                Fecha_Nac: '',
                Contraseña: '', 
                Telefono: '', 
                Direccion: '', 
                Cod_Postal: ''
            })
            setShowEditForm(false)
            setEditingClient(null)
            loadClients()
        } catch (error) {
            console.error('Error al modificar cliente:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.Error || 'No se pudo modificar el cliente',
                confirmButtonColor: '#A0A2BA',
                confirmButtonText: 'Aceptar'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (DNI) => {
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
            text: 'Esta acción eliminará al cliente permanentemente. No podrás revertir esta acción.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#A0A2BA',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })

        if (!result.isConfirmed) return
        
        try {
            const response = await axios.delete(AUTH_ENDPOINTS.DELETE_CLIENT(DNI))
            Swal.fire({
                icon: 'success',
                title: '¡Eliminado!',
                text: response.data?.Mensaje || 'Cliente eliminado correctamente',
                confirmButtonColor: '#B8CFCE',
                confirmButtonText: 'Aceptar'
            })
            loadClients()
        } catch (error) {
            console.error('Error al eliminar cliente:', error)
            const errorMessage = error.response?.data?.Error || error.response?.data?.Detalle || 'No se pudo eliminar el cliente'
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonColor: '#A0A2BA',
                confirmButtonText: 'Aceptar'
            })
        }
    }

    const handleEdit = (client) => {
        setEditingClient(client)
        setFormData({
            DNI: client.DNI || '',
            Nombre: client.Nombre || '',
            Apellido: client.Apellido || '',
            Mail: client.Mail || '',
            Fecha_Nac: client.Fecha_Nac || '',
            Contraseña: '',
            Telefono: client.Telefono || '',
            Direccion: client.Direccion || '',
            Cod_Postal: client.Cod_Postal || ''
        })
        setShowEditForm(true)
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('es-AR')
        } catch {
            return dateString
        }
    }

    if (loading && clients.length === 0) {
        return <div className="client-management-container">Cargando clientes...</div>
    }

    return (
        <div className="client-management-container">
            <div className="management-header">
                <h1>Gestión de Clientes</h1>
                <div className="management-actions">
                    <input
                        type="text"
                        placeholder="Buscar por DNI, nombre o email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="product-search-input"
                        aria-label="Buscar clientes"
                    />
                    <button 
                        className="refresh-btn"
                        onClick={loadClients}
                        title="Actualizar lista de clientes"
                    >
                        Actualizar
                    </button>
                </div>
            </div>

            {showEditForm && editingClient && (
                <div className="client-form-container">
                    <h2>Editar Cliente</h2>
                    <form onSubmit={handleSubmit} className="client-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>DNI:</label>
                                <input
                                    type="number"
                                    name="DNI"
                                    value={formData.DNI}
                                    onChange={handleInputChange}
                                    required
                                    disabled
                                />
                            </div>

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
                                <label>Fecha de Nacimiento:</label>
                                <input
                                    type="date"
                                    name="Fecha_Nac"
                                    value={formData.Fecha_Nac}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Teléfono:</label>
                                <input
                                    type="tel"
                                    name="Telefono"
                                    value={formData.Telefono}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Código Postal:</label>
                                <input
                                    type="number"
                                    name="Cod_Postal"
                                    value={formData.Cod_Postal}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Contraseña (dejar vacío para no cambiar):</label>
                                <PasswordInput
                                    id="Contraseña"
                                    name="Contraseña"
                                    value={formData.Contraseña}
                                    onChange={handleInputChange}
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
                                Guardar Cambios
                            </button>
                            <button 
                                type="button" 
                                onClick={() => {
                                    setShowEditForm(false)
                                    setEditingClient(null)
                                    setFormData({
                                        DNI: '', 
                                        Nombre: '', 
                                        Apellido: '', 
                                        Mail: '', 
                                        Fecha_Nac: '',
                                        Contraseña: '', 
                                        Telefono: '', 
                                        Direccion: '', 
                                        Cod_Postal: ''
                                    })
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

            <div className="clients-table-container">
                <table className="clients-table">
                    <thead>
                        <tr>
                            <th>DNI</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Fecha Nac.</th>
                            <th>Verificado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            const q = (searchQuery || '').trim().toLowerCase()
                            const filtered = q
                                ? clients.filter(client => {
                                    return (
                                        String(client.DNI).toLowerCase().includes(q) ||
                                        (client.Nombre || '').toLowerCase().includes(q) ||
                                        (client.Apellido || '').toLowerCase().includes(q) ||
                                        (client.Mail || '').toLowerCase().includes(q)
                                    )
                                })
                                : clients

                            if (filtered.length === 0) {
                                return (
                                    <tr>
                                        <td colSpan="8" className="empty-message">No hay clientes que coincidan</td>
                                    </tr>
                                )
                            }

                            return filtered.map(client => (
                                <tr key={client.DNI}>
                                    <td>{client.DNI}</td>
                                    <td>{client.Nombre}</td>
                                    <td>{client.Apellido}</td>
                                    <td>{client.Mail}</td>
                                    <td>{client.Telefono || 'N/A'}</td>
                                    <td>{formatDate(client.Fecha_Nac)}</td>
                                    <td>
                                        <span className={`verification-badge ${client.Verificado === 1 ? 'verified' : 'not-verified'}`}>
                                            {client.Verificado === 1 ? '✓ Verificado' : '✗ No Verificado'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button 
                                            className="edit-btn" 
                                            onClick={() => handleEdit(client)}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(client.DNI)}
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

            <div className="clients-summary">
                <div className="summary-item">
                    <span className="summary-label">Total de clientes:</span>
                    <span className="summary-value">{clients.length}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Clientes verificados:</span>
                    <span className="summary-value">{clients.filter(c => c.Verificado === 1).length}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Clientes no verificados:</span>
                    <span className="summary-value">{clients.filter(c => c.Verificado === 0 || c.Verificado === null).length}</span>
                </div>
            </div>
        </div>
    )
}

export default ClientManagement
