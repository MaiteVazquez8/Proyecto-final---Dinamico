// Configuración de endpoints de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Endpoints de autenticación
export const AUTH_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/Login`,
    REGISTER_CLIENT: `${API_BASE_URL}/registrarCliente`,
    REGISTER_PERSONAL: `${API_BASE_URL}/registrarPersonal`,
    UPDATE_CLIENT: (dni) => `${API_BASE_URL}/modificarCliente/${dni}`,
    DELETE_CLIENT: (dni) => `${API_BASE_URL}/eliminarCliente/${dni}`,
    UPDATE_PERSONAL: (dni) => `${API_BASE_URL}/modificarPersonal/${dni}`,
    DELETE_PERSONAL: (dni) => `${API_BASE_URL}/eliminarPersonal/${dni}`,
    GET_CLIENTS: `${API_BASE_URL}/clientes`,
};

// Endpoints de productos
export const PRODUCT_ENDPOINTS = {
    GET_PRODUCTS: `${API_BASE_URL}/productos/productos`,
    CREATE_PRODUCT: `${API_BASE_URL}/productos/productos`,
    UPDATE_PRODUCT: (id) => `${API_BASE_URL}/productos/productos/${id}`,
    DELETE_PRODUCT: (id) => `${API_BASE_URL}/productos/productos/${id}`,
    GET_SUPPLIERS: `${API_BASE_URL}/productos/proveedor`,
    CREATE_SUPPLIER: `${API_BASE_URL}/productos/proveedor`,
    UPDATE_SUPPLIER: (id) => `${API_BASE_URL}/productos/proveedor/${id}`,
    DELETE_SUPPLIER: (id) => `${API_BASE_URL}/productos/proveedor/${id}`,
};

// Endpoints de compras
export const SHOPPING_ENDPOINTS = {
    ADD_TO_CART: `${API_BASE_URL}/compras/carrito`,
    GET_CART: (dni) => `${API_BASE_URL}/compras/carrito/${dni}`,
    DELETE_FROM_CART: (id) => `${API_BASE_URL}/compras/carrito/${id}`,
    LIKE_PRODUCT: `${API_BASE_URL}/compras/me-gusta`,
    MAKE_PURCHASE: `${API_BASE_URL}/compras/compra`,
    GET_PURCHASES: (dni) => `${API_BASE_URL}/compras/compras/${dni}`,
    GET_ALL_PURCHASES: `${API_BASE_URL}/compras/compras`,
    UPDATE_PURCHASE_STATUS: (id) => `${API_BASE_URL}/compras/compras/${id}`,
    ADD_COMMENT: `${API_BASE_URL}/compras/comentarios`,
    GET_COMMENTS: (productId) => `${API_BASE_URL}/compras/comentarios/${productId}`,
};

// Endpoint de salud del servidor
export const HEALTH_ENDPOINT = `${API_BASE_URL}/health`;

// Funciones mock (si son necesarias)
export const getMockClientData = () => {
    // Retorna datos mock si es necesario
    return null;
};

export const getMockEmployeesData = () => {
    // Retorna datos mock si es necesario
    return null;
};

export const getMockManagersData = () => {
    // Retorna datos mock si es necesario
    return null;
};
