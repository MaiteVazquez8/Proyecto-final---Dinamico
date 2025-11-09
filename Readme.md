# ElectroShop - Proyecto Final Dinámico

Sistema de comercio electrónico con frontend en React y backend en Node.js/Express con SQLite.

## Estructura del Proyecto

```
Proyecto-final---Dinamico/
├── Client/          # Frontend React
├── Server/          # Backend Node.js/Express
└── README.md        # Este archivo
```

## Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn

## Instalación y Configuración

### 1. Configurar el Servidor (Backend)

```bash
cd Server
npm install
```

### 2. Configurar el Cliente (Frontend)

```bash
cd Client
npm install
```

## Ejecución del Proyecto

### 1. Iniciar el Servidor (Backend)

```bash
cd Server
npm run server
# O para producción:
npm start
```

El servidor se ejecutará en: `http://localhost:3000`

**Nota**: El servidor debe estar ejecutándose ANTES de iniciar el cliente, ya que el frontend hace llamadas a la API del backend.

### 2. Iniciar el Cliente (Frontend)

En una nueva terminal (manteniendo el servidor ejecutándose):

```bash
cd Client
npm run dev
```

El cliente se ejecutará en: `http://localhost:5173`

### 3. Acceso a la Aplicación

- **Frontend**: http://localhost:5173
- **API Backend**: http://localhost:3000/api

## Funcionalidades Implementadas

### Autenticación
- ✅ Registro de clientes con validación completa
- ✅ Login con email y contraseña
- ✅ Registro de personal/administradores
- ✅ Gestión de sesiones

### Productos
- ✅ Visualización de catálogo de productos
- ✅ Filtros por categoría, precio y búsqueda
- ✅ Gestión de productos (CRUD) para administradores
- ✅ Gestión de proveedores

### Carrito y Compras
- ✅ Agregar productos al carrito
- ✅ Gestión de favoritos (Me Gusta)
- ✅ Sistema de compras
- ✅ Historial de compras por cliente

### Roles de Usuario
- ✅ Diferentes roles de usuario (cliente, personal)
- ✅ Autenticación diferenciada por tipo de usuario

## API Endpoints

### Autenticación
- `POST /api/Login` - Iniciar sesión
- `POST /api/registrarCliente` - Registrar cliente
- `POST /api/registrarPersonal` - Registrar personal
- `PUT /api/modificarCliente/:DNI` - Modificar cliente
- `DELETE /api/eliminarCliente/:DNI` - Eliminar cliente

### Productos
- `POST /api/productos/productos` - Crear producto
- `PUT /api/productos/productos/:ID` - Modificar producto
- `DELETE /api/productos/productos/:ID` - Eliminar producto
- `POST /api/productos/proveedor` - Crear proveedor
- `PUT /api/productos/proveedor/:ID` - Modificar proveedor
- `DELETE /api/productos/proveedor/:ID` - Eliminar proveedor

### Compras
- `POST /api/compras/carrito` - Agregar al carrito
- `GET /api/compras/carrito/:DNI` - Ver carrito
- `DELETE /api/compras/carrito/:ID` - Eliminar del carrito
- `POST /api/compras/me-gusta` - Dar me gusta
- `POST /api/compras/compra` - Realizar compra
- `GET /api/compras/compras/:DNI` - Ver historial de compras

## Base de Datos

El proyecto utiliza SQLite con las siguientes tablas principales:

- **Cliente**: Información de clientes registrados
- **Personal**: Información de empleados/administradores
- **Productos**: Catálogo de productos
- **Proveedor**: Información de proveedores
- **Carrito**: Items en el carrito de cada cliente
- **Compras**: Historial de compras realizadas
- **Me_Gusta**: Productos marcados como favoritos
- **Comentarios**: Comentarios de productos
- **Calificaciones**: Calificaciones de productos

## Usuarios de Prueba

Puedes crear usuarios usando el formulario de registro, o usar estos ejemplos si los creas manualmente:

### Cliente de Ejemplo
- DNI: `12345678`
- Email: `cliente@test.com`
- Contraseña: `123456`

### Administrador de Ejemplo  
- DNI: `87654321`
- Email: `admin@electroshop.com`
- Contraseña: `admin123`
- Cargo: `Administrador`

**Nota**: Los usuarios deben ser creados a través de los endpoints de registro correspondientes.

## Tecnologías Utilizadas

### Frontend
- React 19
- Vite
- Axios para peticiones HTTP
- CSS3 con diseño responsive
- React Icons

### Backend
- Node.js
- Express.js
- SQLite3
- bcrypt para encriptación de contraseñas
- CORS para manejo de peticiones cross-origin
- dotenv para variables de entorno

## Características Técnicas

- **Responsive Design**: Adaptable a dispositivos móviles y desktop
- **Seguridad**: Contraseñas encriptadas con bcrypt
- **Validación**: Validación tanto en frontend como backend
- **Estado Global**: Manejo de estado centralizado en React
- **API RESTful**: Endpoints bien estructurados siguiendo convenciones REST
- **Base de Datos**: SQLite para facilidad de desarrollo y despliegue
- **Comunicación Directa**: Frontend usa axios directamente sin capas de abstracción

## Desarrollo

### Estructura del Frontend
```
Client/
├── public/
│   ├── favicon.png     # Icono de la aplicación
│   └── vite.svg        # Logo de Vite
├── src/
│   ├── Components/
│   │   ├── Admin/                    # Componentes de administración
│   │   │   ├── EmployeeManagement/   # Gestión de empleados
│   │   │   │   ├── EmployeeManagement.jsx
│   │   │   │   └── EmployeeManagement.css
│   │   │   ├── ManagerManagement/    # Gestión de gerentes
│   │   │   │   ├── ManagerManagement.jsx
│   │   │   │   └── ManagerManagement.css
│   │   │   ├── ProductManagement/    # Gestión de productos
│   │   │   │   ├── ProductManagement.jsx
│   │   │   │   └── ProductManagement.css
│   │   │   └── SuppliersManagement/  # Gestión de proveedores
│   │   │       └── SuppliersManagement.jsx
│   │   ├── Auth/                     # Autenticación
│   │   │   ├── Login/                # Login de usuarios
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Login.css
│   │   │   └── Register/             # Registro de usuarios
│   │   │       ├── Register.jsx
│   │   │       └── Register.css
│   │   ├── Global/                   # Componentes globales compartidos
│   │   │   ├── Button/               # Botón reutilizable
│   │   │   │   ├── Button.jsx
│   │   │   │   └── Button.css
│   │   │   ├── Encabezado/           # Encabezado/Navegación
│   │   │   │   ├── Encabezado.jsx
│   │   │   │   └── Encabezado.css
│   │   │   ├── Footer/               # Pie de página
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Footer.css
│   │   │   ├── PasswordInput/        # Input de contraseña
│   │   │   │   ├── PasswordInput.jsx
│   │   │   │   └── PasswordInput.css
│   │   │   ├── ScrollToTop/          # Botón scroll to top
│   │   │   │   ├── ScrollToTop.jsx
│   │   │   │   └── ScrollToTop.css
│   │   │   └── ServerStatus/         # Estado del servidor
│   │   │       ├── ServerStatus.jsx
│   │   │       └── ServerStatus.css
│   │   ├── Layout/                   # Layout principal
│   │   │   ├── Layout.jsx
│   │   │   └── Layout.css
│   │   ├── Pages/                    # Páginas principales
│   │   │   └── Home/                 # Página de inicio
│   │   │       ├── Home.jsx
│   │   │       ├── Home.css
│   │   │       └── HomeProductCard.jsx
│   │   ├── Products/                 # Componentes de productos
│   │   │   ├── ProductCard/          # Tarjeta de producto
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   └── ProductCard.css
│   │   │   ├── ProductDetail/        # Detalle de producto
│   │   │   │   ├── ProductDetail.jsx
│   │   │   │   └── ProductDetail.css
│   │   │   └── ProductList/          # Lista de productos
│   │   │       ├── ProductList.jsx
│   │   │       └── ProductList.css
│   │   ├── Shopping/                 # Componentes de compras
│   │   │   ├── Cart/                 # Carrito de compras
│   │   │   │   ├── Cart.jsx
│   │   │   │   └── Cart.css
│   │   │   ├── Checkout/             # Proceso de pago
│   │   │   │   ├── Checkout.jsx
│   │   │   │   └── Checkout.css
│   │   │   └── Favorites/            # Favoritos
│   │   │       ├── Favorites.jsx
│   │   │       └── Favorites.css
│   │   └── UserManagement/           # Gestión de usuario
│   │       ├── DeleteUser/           # Eliminar usuario
│   │       │   ├── DeleteUser.jsx
│   │       │   └── DeleteUser.css
│   │       ├── EditUser/             # Editar usuario
│   │       │   ├── EditUser.jsx
│   │       │   └── EditUser.css
│   │       └── Profile/              # Perfil de usuario
│   │           ├── Profile.jsx
│   │           └── Profile.css
│   ├── assets/                       # Recursos estáticos
│   │   ├── imgs/                     # Imágenes
│   │   │   ├── Products/             # Imágenes de productos
│   │   │   │   ├── HER-ELE-001_a1.jpg
│   │   │   │   ├── HER-ELE-001_a2.jpg
│   │   │   │   ├── HER-ELE-002_a1.jpg
│   │   │   │   ├── HER-ELE-002_a2.jpg
│   │   │   │   ├── HER-ELE-003_a1.jpg
│   │   │   │   ├── HER-ELE-003_a2.jpg
│   │   │   │   ├── HER-MAN-001_a1.jpg
│   │   │   │   ├── HER-MAN-001_a2.jpg
│   │   │   │   ├── HER-MAN-002_a1.jpg
│   │   │   │   ├── HER-MAN-002_a2.jpg
│   │   │   │   ├── ILU-DEC-001_a1.jpg
│   │   │   │   ├── ILU-DEC-001_a2.jpg
│   │   │   │   ├── ILU-LED-005_a1.jpg
│   │   │   │   ├── ILU-LED-005_a2.jpg
│   │   │   │   ├── IND-AUT-002_a1.jpg
│   │   │   │   ├── IND-AUT-002_a2.jpg
│   │   │   │   ├── IND-FIC-001_a1.jpg
│   │   │   │   └── IND-FIC-001_a2.jpg
│   │   │   ├── tuercav3.png
│   │   │   └── tuercav4.png
│   │   └── react.svg
│   ├── styles/                       # Estilos globales
│   │   ├── global.css                # Estilos globales
│   │   ├── variables.css             # Variables CSS
│   │   └── README.md                 # Documentación de estilos
│   ├── App.jsx                       # Componente principal de la aplicación
│   ├── main.jsx                      # Punto de entrada de la aplicación
│   └── Global.css                    # Estilos globales adicionales
├── index.html                        # HTML principal
├── vite.config.js                    # Configuración de Vite
├── eslint.config.js                  # Configuración de ESLint
├── package.json                      # Dependencias y scripts
└── package-lock.json                 # Lock file de dependencias
```

### Descripción de Componentes Principales

#### Componentes de Autenticación (`Auth/`)
- **Login**: Formulario de inicio de sesión para clientes y personal
- **Register**: Formulario de registro para nuevos usuarios

#### Componentes de Productos (`Products/`)
- **ProductList**: Lista completa de productos con filtros y búsqueda
- **ProductCard**: Tarjeta individual de producto para mostrar en listas
- **ProductDetail**: Vista detallada de un producto específico

#### Componentes de Compras (`Shopping/`)
- **Cart**: Carrito de compras del usuario
- **Checkout**: Proceso de finalización de compra
- **Favorites**: Lista de productos favoritos del usuario

#### Componentes de Administración (`Admin/`)
- **ProductManagement**: CRUD completo de productos
- **EmployeeManagement**: Gestión de empleados
- **ManagerManagement**: Gestión de gerentes
- **SuppliersManagement**: Gestión de proveedores

#### Componentes de Usuario (`UserManagement/`)
- **Profile**: Perfil del usuario actual
- **EditUser**: Edición de datos del usuario
- **DeleteUser**: Eliminación de cuenta de usuario

#### Componentes Globales (`Global/`)
- **Encabezado**: Barra de navegación principal
- **Footer**: Pie de página
- **Button**: Botón reutilizable con estilos consistentes
- **PasswordInput**: Input de contraseña con validación
- **ScrollToTop**: Botón para volver arriba de la página
- **ServerStatus**: Indicador del estado de conexión con el servidor

#### Layout y Páginas
- **Layout**: Componente contenedor principal que maneja el enrutamiento y estado global
- **Home**: Página de inicio con productos destacados

### Estructura del Backend
```
Server/src/
├── Controllers/        # Lógica de negocio
├── Routers/           # Definición de rutas
├── DataBase/          # Configuración de BD
└── Utils/             # Utilidades (hash, etc.)
```

## Próximas Mejoras

- [ ] Implementar JWT para autenticación
- [ ] Agregar paginación en productos
- [ ] Sistema de notificaciones
- [ ] Integración con pasarelas de pago
- [ ] Dashboard de analytics para administradores
- [ ] Sistema de reviews y ratings más completo
- [ ] Optimización de imágenes
- [ ] Tests unitarios y de integración

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es para fines educativos.