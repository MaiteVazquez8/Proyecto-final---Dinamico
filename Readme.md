# ElectroShop

E-commerce de productos eléctricos con React + Node.js/Express + SQLite

## Inicio Rápido

### Requisitos
- Node.js 16+
- npm

### Instalación

1. **Instalar dependencias del servidor**
```bash
cd Server
npm install
```

2. **Instalar dependencias del cliente**
```bash
cd Client
npm install
```

### Ejecutar el Proyecto

1. **Iniciar el servidor** (primero)
```bash
cd Server
npm start
```
Servidor corriendo en: `http://localhost:3000`

2. **Iniciar el cliente** (en otra terminal)
```bash
cd Client
npm run dev
```
Cliente corriendo en: `http://localhost:5173`

## Funcionalidades

### Clientes
- Registro e inicio de sesión
- Catálogo de productos con filtros y búsqueda
- Carrito de compras
- Lista de favoritos
- Historial de compras
- Gestión de perfil

### Administradores
- Gestión de productos (CRUD)
- Gestión de proveedores
- Gestión de empleados y gerentes
- Vista de todas las compras

## Tecnologías

**Frontend**
- React 19 + Vite
- Axios
- React Icons
- SweetAlert2
- CSS3 responsive

**Backend**
- Node.js + Express
- SQLite3
- bcrypt (encriptación)
- JWT (autenticación)
- CORS

## Estructura del Proyecto

```
Proyecto-final---Dinamico/
├── Client/                      # Frontend React
│   ├── public/                  # Archivos públicos
│   │   └── favicon.png
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Admin/           # Gestión administrativa
│   │   │   │   ├── ClientManagement/      # Gestión de clientes
│   │   │   │   ├── EmployeeManagement/    # Gestión de empleados
│   │   │   │   ├── ManagerManagement/     # Gestión de gerentes
│   │   │   │   ├── ProductManagement/     # Gestión de productos
│   │   │   │   ├── SalesManagement/       # Gestión de ventas
│   │   │   │   └── SuppliersManagement/   # Gestión de proveedores
│   │   │   ├── Auth/            # Autenticación
│   │   │   │   ├── Login/       # Inicio de sesión
│   │   │   │   ├── Register/    # Registro de usuarios
│   │   │   │   └── Verify/      # Verificación de cuenta
│   │   │   ├── Global/          # Componentes reutilizables
│   │   │   │   ├── Button/
│   │   │   │   ├── Encabezado/  # Navegación principal
│   │   │   │   ├── Footer/
│   │   │   │   ├── PasswordInput/
│   │   │   │   ├── ScrollToTop/
│   │   │   │   └── ServerStatus/
│   │   │   ├── Layout/          # Layout principal
│   │   │   ├── Pages/           # Páginas principales
│   │   │   │   └── Home/        # Página de inicio
│   │   │   ├── Products/        # Catálogo y detalles
│   │   │   │   ├── ProductCard/
│   │   │   │   ├── ProductDetail/
│   │   │   │   └── ProductList/
│   │   │   ├── Shopping/        # Carrito y checkout
│   │   │   │   ├── Cart/
│   │   │   │   ├── Checkout/
│   │   │   │   └── Favorites/
│   │   │   └── UserManagement/  # Perfil de usuario
│   │   │       ├── DeleteUser/
│   │   │       ├── EditUser/
│   │   │       └── Profile/
│   │   ├── assets/              # Recursos estáticos
│   │   │   └── imgs/
│   │   │       ├── banners/     # Imágenes de banners
│   │   │       └── Products/    # Imágenes de productos
│   │   ├── config/              # Configuración
│   │   │   └── api.js           # Endpoints de la API
│   │   ├── styles/              # Estilos globales
│   │   │   ├── global.css
│   │   │   └── variables.css
│   │   ├── App.jsx              # Componente principal
│   │   └── main.jsx             # Punto de entrada
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── Server/                      # Backend Node.js
    ├── src/
    │   ├── Controllers/         # Lógica de negocio
    │   ├── Routers/             # Rutas de la API
    │   ├── DataBase/            # Configuración BD
    │   └── Utils/               # Utilidades
    ├── app.js
    └── package.json
```

## Base de Datos (SQLite)

- **Cliente** - Datos de clientes
- **Personal** - Empleados y administradores
- **Productos** - Catálogo de productos
- **Proveedor** - Información de proveedores
- **Carrito** - Items del carrito por cliente
- **Compras** - Historial de compras
- **Me_Gusta** - Productos favoritos
- **Comentarios** - Comentarios de productos
- **Calificaciones** - Ratings de productos

## API Endpoints Principales

### Autenticación
```
POST   /api/Login                      # Iniciar sesión
POST   /api/registrarCliente           # Registrar cliente
POST   /api/registrarPersonal          # Registrar personal
PUT    /api/modificarCliente/:DNI      # Modificar cliente
DELETE /api/eliminarCliente/:DNI       # Eliminar cliente
```

### Productos
```
POST   /api/productos/productos        # Crear producto
PUT    /api/productos/productos/:ID    # Modificar producto
DELETE /api/productos/productos/:ID    # Eliminar producto
POST   /api/productos/proveedor        # Crear proveedor
PUT    /api/productos/proveedor/:ID    # Modificar proveedor
DELETE /api/productos/proveedor/:ID    # Eliminar proveedor
```

### Compras
```
POST   /api/compras/carrito            # Agregar al carrito
GET    /api/compras/carrito/:DNI       # Ver carrito
DELETE /api/compras/carrito/:ID        # Eliminar del carrito
POST   /api/compras/me-gusta           # Dar me gusta
POST   /api/compras/compra             # Realizar compra
GET    /api/compras/compras/:DNI       # Historial de compras
```
