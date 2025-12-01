import { useState, useEffect } from "react"
import axios from "axios"
import { PRODUCT_ENDPOINTS } from "../../../config/api"
import Swal from 'sweetalert2'
import '../ProductManagement/ProductManagement.css'

function SuppliersManagement() {
    const [suppliers, setSuppliers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const [formData, setFormData] = useState({
        Nombre: '',
        Mail: '',
        Telefono: '',
        Direccion: ''
    })
    const [editingSupplier, setEditingSupplier] = useState(null)

    useEffect(() => {
        loadSuppliers()
    }, [])

    const loadSuppliers = async () => {
        try {
            setLoading(true)
            const response = await axios.get(PRODUCT_ENDPOINTS.GET_SUPPLIERS)
            setSuppliers(response.data || [])
        } catch (err) {
            console.error('Error al cargar proveedores:', err)
            setError('Error al cargar proveedores')
            setSuppliers([])
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            // Mapear Mail -> Email para coincidir con la API
            const payload = {
                ...formData,
                Email: formData.Mail
            }

            if (editingSupplier) {
                // Edit existing supplier
                await axios.put(PRODUCT_ENDPOINTS.UPDATE_SUPPLIER(editingSupplier), payload)
                Swal.fire({ icon: 'success', title: '¡Éxito!', text: 'Proveedor modificado correctamente', confirmButtonColor: '#B8CFCE', confirmButtonText: 'Aceptar' })
            } else {
                // Create new supplier
                await axios.post(PRODUCT_ENDPOINTS.CREATE_SUPPLIER, payload)
                Swal.fire({ icon: 'success', title: '¡Éxito!', text: 'Proveedor agregado correctamente', confirmButtonColor: '#B8CFCE', confirmButtonText: 'Aceptar' })
            }

            setFormData({ Nombre: '', Mail: '', Telefono: '', Direccion: '' })
            setShowAddForm(false)
            setEditingSupplier(null)
            loadSuppliers()
        } catch (err) {
            console.error('Error al guardar proveedor:', err)
            Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.Error || 'No se pudo guardar el proveedor', confirmButtonColor: '#A0A2BA', confirmButtonText: 'Aceptar' })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (ID_Proveedor) => {
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
            await axios.delete(PRODUCT_ENDPOINTS.DELETE_SUPPLIER(ID_Proveedor))
            Swal.fire({ icon: 'success', title: '¡Eliminado!', text: 'Proveedor eliminado correctamente', confirmButtonColor: '#B8CFCE', confirmButtonText: 'Aceptar' })
            loadSuppliers()
        } catch (err) {
            console.error('Error al eliminar proveedor:', err)
            Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.Error || 'No se pudo eliminar el proveedor', confirmButtonColor: '#A0A2BA', confirmButtonText: 'Aceptar' })
        }
    }

    if (loading && suppliers.length === 0) return <div className="product-management-container">Cargando proveedores...</div>

    return (
        <div className="product-management-container">
            <div className="management-header">
                <h1>Gestión de Proveedores</h1>
                <div className="management-actions">
                    <input
                        type="text"
                        placeholder="Buscar por ID, nombre o email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="product-search-input"
                        aria-label="Buscar proveedores"
                    />
                    <button className="add-btn" onClick={() => setShowAddForm(true)} disabled={showAddForm}>+ Agregar Proveedor</button>
                </div>
            </div>

            {showAddForm && (
                <div className="product-form-container">
                    <h2>Nuevo Proveedor</h2>
                    <form onSubmit={handleSubmit} className="product-form">
                        <div className="form-group">
                            <label>Nombre:</label>
                            <input type="text" name="Nombre" value={formData.Nombre} onChange={handleInputChange} required />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email:</label>
                                <input type="email" name="Mail" value={formData.Mail} onChange={handleInputChange} />
                            </div>

                            <div className="form-group">
                                <label>Teléfono:</label>
                                <input type="text" name="Telefono" value={formData.Telefono} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Dirección:</label>
                            <input type="text" name="Direccion" value={formData.Direccion} onChange={handleInputChange} />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="save-btn">{editingSupplier ? 'Guardar Cambios' : 'Agregar Proveedor'}</button>
                            <button type="button" className="cancel-btn" onClick={() => { setShowAddForm(false); setEditingSupplier(null); setFormData({ Nombre: '', Mail: '', Telefono: '', Direccion: '' }) }}>Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <div className="products-table-container">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Dirección</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            const q = (searchQuery || '').trim().toLowerCase()
                            const filtered = q ? suppliers.filter(s => {
                                return (
                                    String(s.ID_Proveedor).toLowerCase().includes(q) ||
                                    (s.Nombre || '').toLowerCase().includes(q) ||
                                    (s.Mail || '').toLowerCase().includes(q)
                                )
                            }) : suppliers

                            if (filtered.length === 0) {
                                return (
                                    <tr>
                                        <td colSpan="6" className="empty-message">No hay proveedores que coincidan</td>
                                    </tr>
                                )
                            }

                            return filtered.map(s => (
                                <tr key={s.ID_Proveedor}>
                                    <td>{s.ID_Proveedor}</td>
                                    <td>{s.Nombre}</td>
                                    <td>{s.Mail}</td>
                                    <td>{s.Telefono}</td>
                                    <td>{s.Direccion}</td>
                                    <td className="actions-cell">
                                        <button className="edit-btn" onClick={() => {
                                            setShowAddForm(true)
                                            setEditingSupplier(s.ID_Proveedor)
                                            setFormData({ Nombre: s.Nombre || '', Mail: s.Mail || '', Telefono: s.Telefono || '', Direccion: s.Direccion || '' })
                                        }}>Editar</button>
                                        <button className="delete-btn" onClick={() => handleDelete(s.ID_Proveedor)}>Eliminar</button>
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

export default SuppliersManagement
