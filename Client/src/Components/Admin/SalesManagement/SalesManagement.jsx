import { useState, useEffect } from "react"
import axios from "axios"
import { SHOPPING_ENDPOINTS } from "../../../config/api"
import Swal from 'sweetalert2'
import "./SalesManagement.css"

function SalesManagement({ currentUser }) {
    const [compras, setCompras] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        console.log('SalesManagement: Component mounted')
        console.log('SalesManagement: currentUser:', currentUser)
        loadCompras()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const loadCompras = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await axios.get(SHOPPING_ENDPOINTS.GET_ALL_PURCHASES)
            console.log('Compras cargadas:', response.data)
            setCompras(response.data || [])
        } catch (error) {
            console.error('Error al cargar compras:', error)

            // Mensaje específico si el endpoint no existe
            if (error.response?.status === 404) {
                setError('El endpoint de compras no está disponible en el servidor. Por favor, contacta al administrador del sistema.')
            } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                setError('No se puede conectar con el servidor. Verifica que el servidor esté ejecutándose.')
            } else {
                setError('Error al cargar compras. Por favor, intenta nuevamente.')
            }

            setCompras([])
        } finally {
            setLoading(false)
        }
    }

    const handleEstadoChange = async (ID_Compra, nuevoEstado) => {
        try {
            console.log('Cambiando estado - ID_Compra:', ID_Compra, 'Nuevo estado:', nuevoEstado)

            // Validar que ID_Compra sea válido
            if (!ID_Compra) {
                throw new Error('ID de compra no válido')
            }

            // Normalizar estado antes de enviar
            const estadoNormalizado = nuevoEstado === 'Preparando' ? 'En preparación' : nuevoEstado

            console.log('Enviando petición - ID_Compra:', ID_Compra, 'Estado:', estadoNormalizado)

            const response = await axios.put(SHOPPING_ENDPOINTS.UPDATE_PURCHASE_STATUS(ID_Compra), {
                Estado_Envio: estadoNormalizado
            })

            console.log('Respuesta del servidor:', response.data)

            if (response.data.Mensaje) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Estado de envío actualizado correctamente',
                    confirmButtonColor: '#B8CFCE',
                    confirmButtonText: 'Aceptar',
                    timer: 2000
                })

                // Actualizar el estado local con el estado normalizado
                setCompras(prevCompras =>
                    prevCompras.map(compra =>
                        compra.ID_Compra === ID_Compra
                            ? { ...compra, Estado_Envio: estadoNormalizado }
                            : compra
                    )
                )
            }
        } catch (error) {
            console.error('Error al actualizar estado:', error)
            console.error('Error response:', error.response?.data)
            console.error('Error status:', error.response?.status)

            const errorMessage = error.response?.data?.Error ||
                error.response?.data?.Detalle ||
                error.message ||
                'No se pudo actualizar el estado'

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonColor: '#A0A2BA',
                confirmButtonText: 'Aceptar'
            })
        }
    }

    const estadosEnvio = [
        'No preparado',
        'En preparación',
        'Preparado',
        'Enviado'
    ]

    const getEstadoColor = (estado) => {
        // Normalizar estado para comparación
        const estadoNormalizado = estado?.toLowerCase() || ''
        if (estadoNormalizado.includes('no preparado')) {
            return '#FF8E8E'
        }
        if (estadoNormalizado.includes('preparación') || estadoNormalizado.includes('preparando')) {
            return '#FFA500'
        }
        if (estadoNormalizado.includes('preparado')) {
            return '#4CAF50'
        }
        if (estadoNormalizado.includes('enviado')) {
            return '#2196F3'
        }
        return '#7F8CAA'
    }

    const parseDescripcion = (descripcion) => {
        try {
            if (typeof descripcion === 'string') {
                return JSON.parse(descripcion)
            }
            return descripcion || {}
        } catch {
            return {}
        }
    }

    const formatDate = (fecha) => {
        if (!fecha) return 'N/A'
        try {
            const date = new Date(fecha)
            return date.toLocaleDateString('es-AR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return fecha
        }
    }

    const formatPrice = (precio) => {
        if (!precio) return '$0'
        return `$${Number(precio).toLocaleString('es-AR')}`
    }

    // Filtrar compras según búsqueda
    const filteredCompras = compras.filter(compra => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        const descripcion = parseDescripcion(compra.Descripcion)
        return (
            compra.ID_Compra.toString().includes(query) ||
            compra.DNI.toString().includes(query) ||
            (descripcion.Nombre && descripcion.Nombre.toLowerCase().includes(query)) ||
            (descripcion.Email && descripcion.Email.toLowerCase().includes(query)) ||
            (compra.Estado_Envio && compra.Estado_Envio.toLowerCase().includes(query))
        )
    })

    console.log('SalesManagement: Rendering. Loading:', loading, 'Compras:', compras.length, 'Error:', error)

    if (loading) {
        console.log('SalesManagement: Showing loading state')
        return (
            <div className="sales-management-container">
                <div className="loading-message">Cargando compras...</div>
            </div>
        )
    }

    console.log('SalesManagement: Rendering main content')
    return (
        <div className="sales-management-container">
            <div className="management-header">
                <h1>Gestión de Compras</h1>
                <div className="management-actions">
                    <input
                        type="text"
                        placeholder="Buscar por ID, DNI, nombre o email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="product-search-input"
                        aria-label="Buscar compras"
                    />
                    <button
                        className="refresh-btn"
                        onClick={loadCompras}
                        title="Actualizar lista de compras"
                    >
                        Actualizar
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {filteredCompras.length === 0 ? (
                <div className="empty-state">
                    <p>No hay compras registradas</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="sales-table-container">
                        <table className="sales-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>DNI Cliente</th>
                                    <th>Cliente</th>
                                    <th>Fecha</th>
                                    <th>Total</th>
                                    <th>Tipo de Envío</th>
                                    <th>Estado de Envío</th>
                                    <th>Dirección</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCompras.map((compra) => {
                                    const descripcion = parseDescripcion(compra.Descripcion)
                                    // Mapear 'Preparando' a 'En preparación' para consistencia
                                    let estadoActual = compra.Estado_Envio || 'No preparado'
                                    if (estadoActual === 'Preparando') {
                                        estadoActual = 'En preparación'
                                    }

                                    return (
                                        <tr key={compra.ID_Compra}>
                                            <td>{compra.ID_Compra}</td>
                                            <td>{compra.DNI}</td>
                                            <td>
                                                <div className="client-info">
                                                    <strong>{descripcion.Nombre || 'N/A'} {descripcion.Apellido || ''}</strong>
                                                    <span className="client-email">{descripcion.Email || ''}</span>
                                                </div>
                                            </td>
                                            <td>{formatDate(compra.Fecha_Compra)}</td>
                                            <td className="price-cell">{formatPrice(compra.Total)}</td>
                                            <td>{compra.Tipo_Envio || 'N/A'}</td>
                                            <td>
                                                <span
                                                    className="estado-badge"
                                                    style={{ backgroundColor: getEstadoColor(estadoActual) }}
                                                >
                                                    {estadoActual}
                                                </span>
                                            </td>
                                            <td className="address-cell">
                                                {compra.Tipo_Envio === 'Retiro en Sucursal' ? (
                                                    <span className="retiro-sucursal">Retiro en Sucursal</span>
                                                ) : (
                                                    <div>
                                                        {descripcion.Direccion && <div>{descripcion.Direccion}</div>}
                                                        {descripcion.Ciudad && <div>{descripcion.Ciudad}</div>}
                                                        {descripcion.Provincia && <div>{descripcion.Provincia}</div>}
                                                        {descripcion.CodigoPostal && <div>CP: {descripcion.CodigoPostal}</div>}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <select
                                                    className="estado-select"
                                                    value={estadoActual}
                                                    onChange={(e) => {
                                                        const nuevoEstado = e.target.value
                                                        handleEstadoChange(compra.ID_Compra, nuevoEstado)
                                                    }}
                                                    style={{
                                                        borderColor: getEstadoColor(estadoActual),
                                                        backgroundColor: getEstadoColor(estadoActual) + '20'
                                                    }}
                                                >
                                                    {estadosEnvio.map(estado => (
                                                        <option key={estado} value={estado}>
                                                            {estado}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="sales-cards-container">
                        {filteredCompras.map((compra) => {
                            const descripcion = parseDescripcion(compra.Descripcion)
                            // Mapear 'Preparando' a 'En preparación' para consistencia
                            let estadoActual = compra.Estado_Envio || 'No preparado'
                            if (estadoActual === 'Preparando') {
                                estadoActual = 'En preparación'
                            }

                            return (
                                <div key={compra.ID_Compra} className="sales-card">
                                    <div className="sales-card-content">
                                        <div className="card-header">
                                            <div className="card-id">Compra #{compra.ID_Compra}</div>
                                            <div className="card-date">{formatDate(compra.Fecha_Compra)}</div>
                                        </div>

                                        <div className="card-body">
                                            <div className="card-row">
                                                <span className="card-label">DNI Cliente:</span>
                                                <span className="card-value">{compra.DNI}</span>
                                            </div>

                                            <div className="card-row">
                                                <span className="card-label">Cliente:</span>
                                                <div className="card-value">
                                                    <div className="card-client-info">
                                                        <span className="card-client-name">
                                                            {descripcion.Nombre || 'N/A'} {descripcion.Apellido || ''}
                                                        </span>
                                                        <span className="card-client-email">{descripcion.Email || ''}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="card-row">
                                                <span className="card-label">Total:</span>
                                                <span className="card-value card-price">{formatPrice(compra.Total)}</span>
                                            </div>

                                            <div className="card-row">
                                                <span className="card-label">Tipo de Envío:</span>
                                                <span className="card-value">{compra.Tipo_Envio || 'N/A'}</span>
                                            </div>

                                            {compra.Tipo_Envio !== 'Retiro en Sucursal' && (
                                                <div className="card-row">
                                                    <span className="card-label">Dirección:</span>
                                                    <div className="card-value" style={{ textAlign: 'left' }}>
                                                        {descripcion.Direccion && <div>{descripcion.Direccion}</div>}
                                                        {descripcion.Ciudad && <div>{descripcion.Ciudad}</div>}
                                                        {descripcion.Provincia && <div>{descripcion.Provincia}</div>}
                                                        {descripcion.CodigoPostal && <div>CP: {descripcion.CodigoPostal}</div>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="card-status-section">
                                        <span className="card-status-label">Estado de Envío:</span>
                                        <span
                                            className="card-status-badge"
                                            style={{ backgroundColor: getEstadoColor(estadoActual) }}
                                        >
                                            {estadoActual}
                                        </span>
                                        <div className="card-actions">
                                            <select
                                                className="card-estado-select"
                                                value={estadoActual}
                                                onChange={(e) => {
                                                    const nuevoEstado = e.target.value
                                                    handleEstadoChange(compra.ID_Compra, nuevoEstado)
                                                }}
                                                style={{
                                                    borderColor: getEstadoColor(estadoActual),
                                                    backgroundColor: getEstadoColor(estadoActual) + '20'
                                                }}
                                            >
                                                {estadosEnvio.map(estado => (
                                                    <option key={estado} value={estado}>
                                                        {estado}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}

            <div className="sales-summary">
                <div className="summary-item">
                    <span className="summary-label">Total de compras:</span>
                    <span className="summary-value">{compras.length}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Total ingresos:</span>
                    <span className="summary-value">
                        {formatPrice(compras.reduce((acc, compra) => acc + (Number(compra.Total) || 0), 0))}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default SalesManagement
