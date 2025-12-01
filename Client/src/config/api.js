// Configuración de endpoints de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Endpoints de autenticación
export const AUTH_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/login`,
    CONFIRMAR_2FA: `${API_BASE_URL}/auth/2fa/confirmar`,
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
    ENVIAR_VALIDACION: `${API_BASE_URL}/auth/enviar-validacion`,
    VALIDAR_CORREO: `${API_BASE_URL}/auth/validar-correo`,
    REGISTER_CLIENT: `${API_BASE_URL}/auth/clientes`,
    UPDATE_CLIENT: (dni) => `${API_BASE_URL}/auth/clientes/${dni}`,
    DELETE_CLIENT: (dni) => `${API_BASE_URL}/auth/clientes/${dni}`,
    GET_CLIENTS: `${API_BASE_URL}/auth/clientes`,
    REGISTER_PERSONAL: `${API_BASE_URL}/auth/personal`,
    UPDATE_PERSONAL: (dni) => `${API_BASE_URL}/auth/personal/${dni}`,
    DELETE_PERSONAL: (dni) => `${API_BASE_URL}/auth/personal/${dni}`,
    GET_EMPLOYEES: `${API_BASE_URL}/auth/empleados`,
    GET_MANAGERS: `${API_BASE_URL}/auth/gerentes`,
};

// Endpoints de productos
export const PRODUCT_ENDPOINTS = {
    GET_PRODUCTS: `${API_BASE_URL}/productos`,
    CREATE_PRODUCT: `${API_BASE_URL}/productos`,
    UPDATE_PRODUCT: (id) => `${API_BASE_URL}/productos/${id}`,
    DELETE_PRODUCT: (id) => `${API_BASE_URL}/productos/${id}`,
    GET_SUPPLIERS: `${API_BASE_URL}/proveedores`,
    CREATE_SUPPLIER: `${API_BASE_URL}/proveedores`,
    UPDATE_SUPPLIER: (id) => `${API_BASE_URL}/proveedores/${id}`,
    DELETE_SUPPLIER: (id) => `${API_BASE_URL}/proveedores/${id}`,
};

// Endpoints de compras
export const SHOPPING_ENDPOINTS = {
    ADD_TO_CART: `${API_BASE_URL}/carrito/agregar`,
    GET_CART: (dni) => `${API_BASE_URL}/carrito/${dni}`,
    DELETE_FROM_CART: (id) => `${API_BASE_URL}/carrito/eliminar/${id}`,
    LIKE_PRODUCT: `${API_BASE_URL}/me-gusta`,
    MAKE_PURCHASE: `${API_BASE_URL}/compras/compra`,
    GET_PURCHASES: (dni) => `${API_BASE_URL}/compras/${dni}`,
    GET_ALL_PURCHASES: `${API_BASE_URL}/compras/all`,
    UPDATE_PURCHASE_STATUS: (id) => `${API_BASE_URL}/compras/estado/${id}`,
    ADD_COMMENT: `${API_BASE_URL}/comentarios/crear`,
    GET_COMMENTS: (productId) => `${API_BASE_URL}/comentarios/${productId}`,
};

// Endpoint de salud del servidor
export const HEALTH_ENDPOINT = `${API_BASE_URL}`;

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
