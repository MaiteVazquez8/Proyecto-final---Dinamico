// Configuración centralizada de URLs del servidor
export const API_BASE_URL = 'http://localhost:3000/api';

// Endpoints de autenticación
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/Login`,
  REGISTER_CLIENT: `${API_BASE_URL}/Login/registrarCliente`,
  REGISTER_PERSONAL: `${API_BASE_URL}/Login/registrarPersonal`,
  // GET_CLIENTS: `${API_BASE_URL}/Login/clientes`, // No existe en el servidor - comentado
  // GET_CLIENT: (dni) => `${API_BASE_URL}/Login/cliente/${dni}`, // Existe pero no está implementado en el servidor
  UPDATE_CLIENT: (dni) => `${API_BASE_URL}/Login/modificarCliente/${dni}`,
  UPDATE_PERSONAL: (dni) => `${API_BASE_URL}/Login/modificarPersonal/${dni}`,
  DELETE_CLIENT: (dni) => `${API_BASE_URL}/Login/eliminarCliente/${dni}`,
  DELETE_PERSONAL: (dni) => `${API_BASE_URL}/Login/eliminarPersonal/${dni}`,
  GET_EMPLOYEES: `${API_BASE_URL}/Login/empleados`,
  GET_MANAGERS: `${API_BASE_URL}/Login/gerentes`,
  // GET_PERSONAL: `${API_BASE_URL}/Login/personal`, // Endpoint no existe en el servidor
  // VERIFICATION: `${API_BASE_URL}/verificacion/${token}` // Comentado por ahora
};

// Función simulada para obtener datos del cliente cuando el endpoint no está disponible
export const getMockClientData = (dni) => {
  return {
    DNI: dni,
    Nombre: 'Usuario',
    Apellido: 'Demo',
    Mail: 'demo@example.com',
    Telefono: '123456789',
    Direccion: 'Dirección demo',
    Cod_Postal: '12345',
    Fecha_Nac: '1990-01-01'
  };
};

// Función simulada para obtener datos de empleados cuando el endpoint no está disponible
export const getMockEmployeesData = () => {
  return [
    {
      DNI: '11111111',
      Nombre: 'Empleado',
      Apellido: 'Demo 1',
      Mail: 'empleado1@demo.com',
      Telefono: '111111111',
      Cargo: 'Empleado'
    },
    {
      DNI: '22222222',
      Nombre: 'Empleado',
      Apellido: 'Demo 2',
      Mail: 'empleado2@demo.com',
      Telefono: '222222222',
      Cargo: 'Empleado'
    }
  ];
};

// Función simulada para obtener datos de gerentes cuando el endpoint no está disponible
export const getMockManagersData = () => {
  return [
    {
      DNI: '33333333',
      Nombre: 'Gerente',
      Apellido: 'Demo 1',
      Mail: 'gerente1@demo.com',
      Telefono: '333333333',
      Cargo: 'Gerente'
    },
    {
      DNI: '44444444',
      Nombre: 'Gerente',
      Apellido: 'Demo 2',
      Mail: 'gerente2@demo.com',
      Telefono: '444444444',
      Cargo: 'Gerente'
    }
  ];
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
  LIKE_TO_CART: `${API_BASE_URL}/compras/me-gusta-al-carrito`,
  GET_COMMENTS: (productId) => `${API_BASE_URL}/compras/comentarios/${productId}`,
  ADD_COMMENT: `${API_BASE_URL}/compras/comentario`,
  RATE_PRODUCT: `${API_BASE_URL}/compras/calificacion`,
  MAKE_PURCHASE: `${API_BASE_URL}/compras/compra`,
  GET_PURCHASES: (dni) => `${API_BASE_URL}/compras/compras/${dni}`,
  GET_ALL_PURCHASES: `${API_BASE_URL}/compras/all`,
  UPDATE_PURCHASE_STATUS: (id) => `${API_BASE_URL}/compras/estado/${id}`,
};

// Endpoint de health check
export const HEALTH_ENDPOINT = `${API_BASE_URL}`;

// Endpoint para eliminación de usuario (si existe)
export const DELETE_USER_ENDPOINT = `${API_BASE_URL}/eliminarUsuario`;
