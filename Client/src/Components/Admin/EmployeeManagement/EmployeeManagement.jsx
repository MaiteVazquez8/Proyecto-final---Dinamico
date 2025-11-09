import { useState, useEffect } from "react"
import axios from "axios"
import Swal from 'sweetalert2'
import PasswordInput from "../../Global/PasswordInput/PasswordInput"
import "./EmployeeManagement.css"

function EmployeeManagement({ currentUser }) {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [editingEmployee, setEditingEmployee] = useState(null)

    const [formData, setFormData] = useState({
        DNI: '',
        Nombre: '',
        Apellido: '',
        Mail: '',
        Fecha_Nacimiento: '',
        Contraseña: '',
        Telefono: '',
        Direccion: '',
        Cargo: 'Empleado'
    })

    useEffect(() => {
        loadEmployees()
    }, [])

    const loadEmployees = async () => {
        try {
            setLoading(true)
            const response = await axios.get('http://localhost:3000/api/empleados')
            console.log('Empleados cargados del servidor:', response.data)
            setEmployees(response.data || [])
        } catch (error) {
            console.error('Error al cargar empleados:', error)
            setError('Error al cargar empleados')
            setEmployees([])
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
            if (editingEmployee) {
                await axios.put(`http://localhost:3000/api/modificarPersonal/${editingEmployee.DNI}`, formData)
                Swal.fire({ icon: 'success', title: '¡Éxito!', text: 'Empleado modificado correctamente', confirmButtonColor: '#B8CFCE', confirmButtonText: 'Aceptar' })
            } else {
                await axios.post('http://localhost:3000/api/registrarPersonal', formData)
                Swal.fire({ icon: 'success', title: '¡Éxito!', text: 'Empleado agregado correctamente', confirmButtonColor: '#B8CFCE', confirmButtonText: 'Aceptar' })
            }
            setFormData({
                DNI: '', Nombre: '', Apellido: '', Mail: '', Fecha_Nacimiento: '',
                Contraseña: '', Telefono: '', Direccion: '', Cargo: 'Empleado'
            })
            setShowAddForm(false)
            setEditingEmployee(null)
            loadEmployees()
        } catch (error) {
            console.error('Error al agregar empleado:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.Error || 'No se pudo agregar el empleado',
                confirmButtonColor: '#A0A2BA',
                confirmButtonText: 'Aceptar'
            })
        } finally {
            setLoading(false)
        }
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
            const response = await axios.delete(`http://localhost:3000/api/eliminarPersonal/${DNI}`)
            Swal.fire({
                icon: 'success',
                title: '¡Eliminado!',
                text: response.data?.Mensaje || 'Empleado eliminado correctamente',
                confirmButtonColor: '#B8CFCE',
                confirmButtonText: 'Aceptar'
            })
            loadEmployees()
        } catch (error) {
            console.error('Error al eliminar empleado:', error)
            const errorMessage = error.response?.data?.Error || error.response?.data?.Detalle || 'No se pudo eliminar el empleado'
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonColor: '#A0A2BA',
                confirmButtonText: 'Aceptar'
            })
        }
    }

    const handleEdit = (employee) => {
        setEditingEmployee(employee)
        setFormData({
            DNI: employee.DNI || '',
            Nombre: employee.Nombre || '',
            Apellido: employee.Apellido || '',
            Mail: employee.Mail || '',
            Fecha_Nacimiento: employee.Fecha_Nacimiento || '',
            Contraseña: '',
            Telefono: employee.Telefono || '',
            Direccion: employee.Direccion || '',
            Cargo: employee.Cargo || 'Empleado'
        })
        setShowAddForm(true)
    }

    if (loading && employees.length === 0) {
        return <div className="employee-management-container">Cargando empleados...</div>
    }

    return (
        <div className="employee-management-container">
            <div className="management-header">
                <h1>Gestión de Empleados</h1>
                <div className="management-actions">
                    <input
                        type="text"
                        placeholder="Buscar por DNI, nombre o email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="product-search-input"
                        aria-label="Buscar empleados"
                    />
                    <button 
                        className="add-btn"
                        onClick={() => { setShowAddForm(true); setEditingEmployee(null); setFormData({ DNI: '', Nombre: '', Apellido: '', Mail: '', Fecha_Nacimiento: '', Contraseña: '', Telefono: '', Direccion: '', Cargo: 'Empleado' }) }}
                        disabled={showAddForm}
                    >
                        + Agregar Empleado
                    </button>
                </div>
            </div>

            {showAddForm && (
                <div className="employee-form-container">
                    <h2>Nuevo Empleado</h2>
                    <form onSubmit={handleSubmit} className="employee-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>DNI:</label>
                                <input
                                    type="number"
                                    name="DNI"
                                    value={formData.DNI}
                                    onChange={handleInputChange}
                                    required
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
                                    <option value="Empleado">Empleado</option>
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
                                    required
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
                                {editingEmployee ? 'Guardar Cambios' : 'Agregar Empleado'}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => {
                                    setShowAddForm(false)
                                    setEditingEmployee(null)
                                    setFormData({ DNI: '', Nombre: '', Apellido: '', Mail: '', Fecha_Nacimiento: '', Contraseña: '', Telefono: '', Direccion: '', Cargo: 'Empleado' })
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

            <div className="employees-table-container">
                <table className="employees-table">
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
                                ? employees.filter(emp => {
                                    return (
                                        String(emp.DNI).toLowerCase().includes(q) ||
                                        (emp.Nombre || '').toLowerCase().includes(q) ||
                                        (emp.Apellido || '').toLowerCase().includes(q) ||
                                        (emp.Mail || '').toLowerCase().includes(q)
                                    )
                                })
                                : employees

                            if (filtered.length === 0) {
                                return (
                                    <tr>
                                        <td colSpan="6" className="empty-message">No hay empleados que coincidan</td>
                                    </tr>
                                )
                            }

                            return filtered.map(employee => (
                                <tr key={employee.DNI}>
                                    <td>{employee.DNI}</td>
                                    <td>{employee.Nombre}</td>
                                    <td>{employee.Apellido}</td>
                                    <td>{employee.Mail}</td>
                                    <td>{employee.Cargo}</td>
                                    <td className="actions-cell">
                                        <button className="edit-btn" onClick={() => handleEdit(employee)}>Editar</button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(employee.DNI)}
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

export default EmployeeManagement

