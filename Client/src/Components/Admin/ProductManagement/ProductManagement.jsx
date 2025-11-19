import { useState, useEffect } from "react"
import axios from "axios"
import { PRODUCT_ENDPOINTS, HEALTH_ENDPOINT } from "../../../config/api"
import Swal from 'sweetalert2'
import "./ProductManagement.css"

function ProductManagement({ currentUser }) {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [suppliers, setSuppliers] = useState([])
    const [showSupplierForm, setShowSupplierForm] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const [formData, setFormData] = useState({
        Nombre: '',
        ID_Proveedor: '',
        Precio: '',
        Descripcion: '',
        Categoria: '',
        Color: '',
        Subcategoria: '',
        Stock: '',
        Imagen_1: '',
        Imagen_2: ''
    })

    const [imagePreview1, setImagePreview1] = useState(null)
    const [imagePreview2, setImagePreview2] = useState(null)

    const [supplierFormData, setSupplierFormData] = useState({
        Nombre: '',
        Mail: '',
        Telefono: '',
        Direccion: ''
    })

    useEffect(() => {
        loadProducts()
        loadSuppliers()
    }, [])

    const loadProducts = async () => {
        try {
            setLoading(true)
            const response = await axios.get(PRODUCT_ENDPOINTS.GET_PRODUCTS)
            const productsData = response.data || []
            
            // Asegurar que los IDs sean números válidos
            const cleanedProducts = productsData.map(product => ({
                ...product,
                ID_Producto: parseInt(product.ID_Producto) || product.ID_Producto
            }))
            
            console.log('Productos cargados del servidor:', cleanedProducts)
            setProducts(cleanedProducts)
        } catch (error) {
            console.error('Error al cargar productos:', error)
            setError('Error al cargar productos')
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    const loadSuppliers = async () => {
        try {
            const response = await axios.get(PRODUCT_ENDPOINTS.GET_SUPPLIERS)
            console.log('Proveedores cargados del servidor:', response.data)
            setSuppliers(response.data || [])
        } catch (error) {
            console.error('Error al cargar proveedores:', error)
            setSuppliers([])
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleImageChange = (e, imageNumber) => {
        const file = e.target.files[0]
        if (!file) return

        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor selecciona un archivo de imagen',
                confirmButtonColor: '#A0A2BA',
                confirmButtonText: 'Aceptar'
            })
            return
        }

        // Validar tamaño (máximo 5MB antes de comprimir)
        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La imagen es demasiado grande. Máximo 5MB',
                confirmButtonColor: '#A0A2BA',
                confirmButtonText: 'Aceptar'
            })
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            const img = new Image()
            img.onload = () => {
                // Crear canvas para comprimir
                const canvas = document.createElement('canvas')
                const maxWidth = 800
                const maxHeight = 800
                
                let width = img.width
                let height = img.height

                // Calcular nuevas dimensiones manteniendo proporción
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width
                        width = maxWidth
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height
                        height = maxHeight
                    }
                }

                canvas.width = width
                canvas.height = height

                // Dibujar imagen redimensionada
                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, width, height)

                // Convertir a base64 con calidad 0.7
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
                
                if (imageNumber === 1) {
                    setFormData(prev => ({ ...prev, Imagen_1: compressedBase64 }))
                    setImagePreview1(compressedBase64)
                } else {
                    setFormData(prev => ({ ...prev, Imagen_2: compressedBase64 }))
                    setImagePreview2(compressedBase64)
                }
            }
            img.src = event.target.result
        }
        reader.readAsDataURL(file)
    }

    const removeImage = (imageNumber) => {
        if (imageNumber === 1) {
            setFormData(prev => ({ ...prev, Imagen_1: '' }))
            setImagePreview1(null)
        } else {
            setFormData(prev => ({ ...prev, Imagen_2: '' }))
            setImagePreview2(null)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            
            // Validar que el servidor esté disponible antes de enviar
            try {
                await axios.get(HEALTH_ENDPOINT)
            } catch (serverCheckError) {
                Swal.fire({
                    icon: 'error',
                    title: 'Servidor no disponible',
                    text: 'No se pudo conectar al servidor. Verifica que esté corriendo en el puerto 3000.',
                    confirmButtonColor: '#A0A2BA',
                    confirmButtonText: 'Aceptar'
                })
                setLoading(false)
                return
            }
            
            if (editingProduct) {
                const productoData = {
                    Nombre: formData.Nombre.trim(),
                    Precio: parseFloat(formData.Precio) || 0,
                    Descripcion: formData.Descripcion?.trim() || '',
                    Stock: parseInt(formData.Stock) || 0
                }
                
                console.log('Enviando datos para modificar producto:', productoData)
                
                await axios.put(PRODUCT_ENDPOINTS.UPDATE_PRODUCT(editingProduct.ID_Producto), productoData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Producto modificado correctamente',
                    confirmButtonColor: '#B8CFCE',
                    confirmButtonText: 'Aceptar'
                })
            } else {
                const productoData = {
                    Nombre: formData.Nombre.trim(),
                    ID_Proveedor: parseInt(formData.ID_Proveedor) || 0,
                    Precio: parseFloat(formData.Precio) || 0,
                    Descripcion: formData.Descripcion?.trim() || '',
                    Categoria: formData.Categoria?.trim() || '',
                    Color: formData.Color?.trim() || '',
                    Subcategoria: formData.Subcategoria?.trim() || '',
                    Stock: parseInt(formData.Stock) || 0,
                    Imagen_1: formData.Imagen_1?.trim() || '',
                    Imagen_2: formData.Imagen_2?.trim() || ''
                }
                
                console.log('Enviando datos del producto:', productoData)
                
                await axios.post(PRODUCT_ENDPOINTS.CREATE_PRODUCT, productoData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Producto agregado correctamente',
                    confirmButtonColor: '#B8CFCE',
                    confirmButtonText: 'Aceptar'
                })
            }
            
            setFormData({
                Nombre: '', ID_Proveedor: '', Precio: '', Descripcion: '',
                Categoria: '', Color: '', Subcategoria: '', Stock: '',
                Imagen_1: '', Imagen_2: ''
            })
            setShowAddForm(false)
            setEditingProduct(null)
            loadProducts()
        } catch (error) {
            console.error('Error al guardar producto:', error)
            console.error('Detalles del error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                code: error.code
            })
            
            let errorMessage = 'No se pudo guardar el producto'
            let errorDetail = ''
            
            if (error.response?.data) {
                errorMessage = error.response.data.Error || errorMessage
                errorDetail = error.response.data.Detalle || ''
            } else if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
                errorMessage = 'Error de conexión. Verifica que el servidor esté corriendo en http://localhost:3000'
            } else if (error.message) {
                errorMessage = error.message
            }
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorDetail ? `${errorMessage}\n\nDetalle: ${errorDetail}` : errorMessage,
                confirmButtonColor: '#A0A2BA',
                confirmButtonText: 'Aceptar'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (product) => {
        setEditingProduct(product)
        setFormData({
            Nombre: product.Nombre || '',
            ID_Proveedor: product.ID_Proveedor || '',
            Precio: product.Precio || '',
            Descripcion: product.Descripcion || '',
            Categoria: product.Categoria || '',
            Color: product.Color || '',
            Subcategoria: product.Subcategoria || '',
            Stock: product.Stock || '',
            Imagen_1: product.Imagen_1 || '',
            Imagen_2: product.Imagen_2 || ''
        })
        
        // Cargar previews de imágenes si existen (base64 o URL)
        if (product.Imagen_1) {
            setImagePreview1(product.Imagen_1.startsWith('data:') || product.Imagen_1.startsWith('http') ? product.Imagen_1 : null)
        } else {
            setImagePreview1(null)
        }
        if (product.Imagen_2) {
            setImagePreview2(product.Imagen_2.startsWith('data:') || product.Imagen_2.startsWith('http') ? product.Imagen_2 : null)
        } else {
            setImagePreview2(null)
        }
        
        setShowAddForm(true)
    }

    const handleDelete = async (ID_Producto) => {
        // Limpiar el ID en caso de que tenga formato extraño (ej: "1:1" -> "1")
        let cleanId = String(ID_Producto).trim()
        
        // Si tiene formato "X:Y", tomar solo la primera parte
        if (cleanId.includes(':')) {
            cleanId = cleanId.split(':')[0]
        }
        
        // Asegurarse de que el ID sea un número válido
        const productId = parseInt(cleanId)
        if (isNaN(productId) || productId <= 0) {
            console.error('ID_Producto inválido:', ID_Producto, '-> Limpiado:', cleanId)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `ID de producto inválido: ${ID_Producto}`,
                confirmButtonColor: '#A0A2BA',
                confirmButtonText: 'Aceptar'
            })
            return
        }
        
        console.log('Eliminando producto con ID:', productId, '(original:', ID_Producto, ')')

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
            // Construir la URL de forma explícita para evitar problemas con el formato del ID
            const url = PRODUCT_ENDPOINTS.DELETE_PRODUCT(String(productId))
            console.log('URL de eliminación:', url)
            
            const response = await axios.delete(url)
            console.log('Respuesta del servidor:', response.data)
            
            Swal.fire({
                icon: 'success',
                title: '¡Eliminado!',
                text: response.data?.Mensaje || 'Producto eliminado correctamente',
                confirmButtonColor: '#B8CFCE',
                confirmButtonText: 'Aceptar'
            })
            loadProducts()
        } catch (error) {
            console.error('Error al eliminar producto:', error)
            console.error('URL que falló:', error.config?.url)
            console.error('Error response:', error.response?.data)
            const errorMessage = error.response?.data?.Error || error.response?.data?.Detalle || error.message || 'No se pudo eliminar el producto'
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonColor: '#A0A2BA',
                confirmButtonText: 'Aceptar'
            })
        }
    }

    const cancelEdit = () => {
        setShowAddForm(false)
        setEditingProduct(null)
        setFormData({
            Nombre: '', ID_Proveedor: '', Precio: '', Descripcion: '',
            Categoria: '', Color: '', Subcategoria: '', Stock: '',
            Imagen_1: '', Imagen_2: ''
        })
        setImagePreview1(null)
        setImagePreview2(null)
    }

    const handleSupplierInputChange = (e) => {
        const { name, value } = e.target
        setSupplierFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSupplierSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const response = await axios.post(PRODUCT_ENDPOINTS.CREATE_SUPPLIER, {
                Nombre: supplierFormData.Nombre,
                Mail: supplierFormData.Mail,
                Telefono: supplierFormData.Telefono,
                Direccion: supplierFormData.Direccion
            })
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Proveedor agregado correctamente',
                confirmButtonColor: '#B8CFCE',
                confirmButtonText: 'Aceptar'
            })
            
            const newSupplierId = response.data?.ID_Proveedor
            
            setSupplierFormData({
                Nombre: '',
                Mail: '',
                Telefono: '',
                Direccion: ''
            })
            setShowSupplierForm(false)
            
            await loadSuppliers()
            
            if (newSupplierId && showAddForm) {
                setFormData(prev => ({
                    ...prev,
                    ID_Proveedor: newSupplierId.toString()
                }))
            }
        } catch (error) {
            console.error('Error al agregar proveedor:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.Error || 'No se pudo agregar el proveedor',
                confirmButtonColor: '#A0A2BA',
                confirmButtonText: 'Aceptar'
            })
        } finally {
            setLoading(false)
        }
    }

    const cancelSupplierForm = () => {
        setShowSupplierForm(false)
        setSupplierFormData({
            Nombre: '',
            Mail: '',
            Telefono: '',
            Direccion: ''
        })
    }

    if (loading && products.length === 0) {
        return <div className="product-management-container">Cargando productos...</div>
    }

    return (
        <div className="product-management-container">
            <div className="management-header">
                <h1>Gestión de Productos</h1>
                <div className="management-actions">
                    <input
                        type="text"
                        placeholder="Buscar por ID, nombre o categoría..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="product-search-input"
                        aria-label="Buscar productos"
                    />
                    <button 
                    className="add-btn"
                    onClick={() => setShowAddForm(true)}
                    disabled={showAddForm}
                >
                    + Agregar Producto
                </button>
                </div>
            </div>

            {showAddForm && (
                <div className="product-form-container">
                    <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                    <form onSubmit={handleSubmit} className="product-form">
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
                            <label>Proveedor:</label>
                            <div className="supplier-select-wrapper">
                                <select
                                    name="ID_Proveedor"
                                    value={formData.ID_Proveedor}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccionar proveedor</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.ID_Proveedor} value={supplier.ID_Proveedor}>
                                            {supplier.Nombre}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className="add-supplier-btn"
                                    onClick={() => setShowSupplierForm(true)}
                                    title="Agregar nuevo proveedor"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Precio:</label>
                                <input
                                    type="number"
                                    name="Precio"
                                    value={formData.Precio}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Stock:</label>
                                <input
                                    type="number"
                                    name="Stock"
                                    value={formData.Stock}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Descripción:</label>
                            <textarea
                                name="Descripcion"
                                value={formData.Descripcion}
                                onChange={handleInputChange}
                                rows="3"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Categoría:</label>
                                <select
                                    name="Categoria"
                                    value={formData.Categoria}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="phones">Smartphones</option>
                                    <option value="laptops">Laptops</option>
                                    <option value="tablets">Tablets</option>
                                    <option value="audio">Audio</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Subcategoría:</label>
                                <input
                                    type="text"
                                    name="Subcategoria"
                                    value={formData.Subcategoria}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Color:</label>
                                <input
                                    type="text"
                                    name="Color"
                                    value={formData.Color}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Imagen 1:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, 1)}
                                    style={{ display: 'none' }}
                                    id="imagen-1-input"
                                />
                                <div className="image-upload-container">
                                    <label htmlFor="imagen-1-input" className="image-upload-btn">
                                        {imagePreview1 ? 'Cambiar Imagen' : 'Seleccionar Imagen 1'}
                                    </label>
                                    {imagePreview1 && (
                                        <div className="image-preview-wrapper">
                                            <img src={imagePreview1} alt="Preview 1" className="image-preview" />
                                            <button
                                                type="button"
                                                className="remove-image-btn"
                                                onClick={() => removeImage(1)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Imagen 2:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, 2)}
                                    style={{ display: 'none' }}
                                    id="imagen-2-input"
                                />
                                <div className="image-upload-container">
                                    <label htmlFor="imagen-2-input" className="image-upload-btn">
                                        {imagePreview2 ? 'Cambiar Imagen' : 'Seleccionar Imagen 2'}
                                    </label>
                                    {imagePreview2 && (
                                        <div className="image-preview-wrapper">
                                            <img src={imagePreview2} alt="Preview 2" className="image-preview" />
                                            <button
                                                type="button"
                                                className="remove-image-btn"
                                                onClick={() => removeImage(2)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="save-btn">
                                {editingProduct ? 'Guardar Cambios' : 'Agregar Producto'}
                            </button>
                            <button type="button" onClick={cancelEdit} className="cancel-btn">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showSupplierForm && (
                <div className="product-form-container">
                    <h2>Nuevo Proveedor</h2>
                    <form onSubmit={handleSupplierSubmit} className="product-form">
                        <div className="form-group">
                            <label>Nombre:</label>
                            <input
                                type="text"
                                name="Nombre"
                                value={supplierFormData.Nombre}
                                onChange={handleSupplierInputChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="Mail"
                                    value={supplierFormData.Mail}
                                    onChange={handleSupplierInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Teléfono:</label>
                                <input
                                    type="text"
                                    name="Telefono"
                                    value={supplierFormData.Telefono}
                                    onChange={handleSupplierInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Dirección:</label>
                            <input
                                type="text"
                                name="Direccion"
                                value={supplierFormData.Direccion}
                                onChange={handleSupplierInputChange}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="save-btn">
                                Agregar Proveedor
                            </button>
                            <button type="button" onClick={cancelSupplierForm} className="cancel-btn">
                                Cancelar
                            </button>
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
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Categoría</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            const q = (searchQuery || '').trim().toLowerCase()
                            const filtered = q
                                ? products.filter(p => {
                                    return (
                                        String(p.ID_Producto).toLowerCase().includes(q) ||
                                        (p.Nombre || '').toLowerCase().includes(q) ||
                                        (p.Categoria || '').toLowerCase().includes(q)
                                    )
                                })
                                : products

                            if (filtered.length === 0) {
                                return (
                                    <tr>
                                        <td colSpan="7" className="empty-message">No hay productos que coincidan</td>
                                    </tr>
                                )
                            }

                            return filtered.map(product => {
                                // Obtener la imagen del producto (preferir Imagen_1, si no hay usar Imagen_2)
                                let productImage = product.Imagen_1 || product.Imagen_2 || null;
                                
                                // Si la imagen existe pero no tiene el prefijo data:, agregarlo
                                let imageSrc = null;
                                if (productImage) {
                                    if (productImage.startsWith('data:image/')) {
                                        // Ya tiene el prefijo correcto
                                        imageSrc = productImage;
                                    } else if (productImage.startsWith('http://') || productImage.startsWith('https://')) {
                                        // Es una URL
                                        imageSrc = productImage;
                                    } else {
                                        // Asumir que es base64 sin prefijo y agregarlo
                                        imageSrc = `data:image/jpeg;base64,${productImage}`;
                                    }
                                }

                                return (
                                    <tr key={product.ID_Producto}>
                                        <td>{product.ID_Producto}</td>
                                        <td className="product-image-cell">
                                            {imageSrc ? (
                                                <img 
                                                    src={imageSrc} 
                                                    alt={product.Nombre || 'Producto'} 
                                                    className="product-thumbnail"
                                                />
                                            ) : (
                                                <div className="no-image-placeholder">Sin imagen</div>
                                            )}
                                        </td>
                                        <td>{product.Nombre}</td>
                                        <td>${product.Precio?.toLocaleString()}</td>
                                        <td>{product.Stock}</td>
                                        <td>{product.Categoria}</td>
                                        <td className="actions-cell">
                                        <button 
                                            className="edit-btn"
                                            onClick={() => handleEdit(product)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                // Asegurarse de pasar solo el ID numérico
                                                const productId = product.ID_Producto
                                                handleDelete(productId)
                                            }}
                                            title={`Eliminar producto ${product.Nombre}`}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                                );
                            })
                        })()}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ProductManagement
