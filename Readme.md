# Proyecto realizado en React + Node + JS + SQLite3

Proyecto Final Integrador: Sistema de Gestión e-Commerce

## Datos del curso
- Materia: Diseño Web Dinámico
- Curso: 6to 3ra
- Grupo de taller: 6.8
- Docente: Gareis Pablo

## Subdivisión de tareas
- Backend: Vázquez Maite
- Frontend: Álvarez Santiago
- Documentacion: Villalva Joaquín
- Marketing: Gomez Nayla

## Tecnologías utilizadas
- React + JavaScript SWC
- Node JS
- Express
- Nodemon
- Dotenv
- SQLite3
- Axios
- Cors

## Arquitectura del Sistema

### Estructura de Directorios

```
ElectroShop/
├── Client/                                 
│   ├── src/
│   │   ├── Components/                     
│   │   │   ├── Auth/                       
│   │   │   │   ├── Login/
│   │   │   │   │   ├── Login.jsx           
│   │   │   │   │   └── Login.css           
│   │   │   │   └── Register/
│   │   │   │       ├── Register.jsx        
│   │   │   │       └── Register.css        
│   │   │   ├── Global/                     
│   │   │   │   ├── Encabezado/
│   │   │   │   │   ├── Encabezado.jsx      
│   │   │   │   │   └── Encabezado.css      
│   │   │   │   └── Footer/
│   │   │   │       ├── Footer.jsx          
│   │   │   │       └── Footer.css          
│   │   │   ├── Layout/                     
│   │   │   │   ├── Layout.jsx              
│   │   │   │   └── Layout.css              
│   │   │   ├── Pages/                      
│   │   │   │   └── Home/
│   │   │   │       ├── Home.jsx            
│   │   │   │       └── Home.css            
│   │   │   ├── Products/                   
│   │   │   │   ├── ProductList/
│   │   │   │   │   ├── ProductList.jsx     
│   │   │   │   │   └── ProductList.css     
│   │   │   │   └── ProductDetail/
│   │   │   │       ├── ProductDetail.jsx   
│   │   │   │       └── ProductDetail.css   
│   │   │   ├── Shopping/                   
│   │   │   │   ├── Cart/
│   │   │   │   │   ├── Cart.jsx            
│   │   │   │   │   └── Cart.css            
│   │   │   │   └── Favorites/
│   │   │   │       ├── Favorites.jsx       
│   │   │   │       └── Favorites.css       
│   │   │   └── UserManagement/             
│   │   │       ├── EditUser/
│   │   │       │   ├── EditUser.jsx        
│   │   │       │   └── EditUser.css        
│   │   │       └── DeleteUser/
│   │   │           ├── DeleteUser.jsx      
│   │   │           └── DeleteUser.css      
│   │   ├── App.jsx                         
│   │   ├── main.jsx                        
│   │   └── Global.css                      
│   ├── public/                             
│   ├── package.json                        
│   └── vite.config.js                      
├── Server/                                 
│   ├── src/
│   │   ├── Controllers/                    
│   │   │   └── Login.Controller.js         
│   │   ├── DataBase/                       
│   │   │   ├── db.js                       
│   │   │   └── Sistema.db                  
│   │   ├── Routers/                        
│   │   │   └── Login.Router.js             
│   │   └── Utils/                          
│   │       └── hash.js                     
│   ├── app.js                              
│   ├── package.json                        
│   └── .env                                             
└── README.md                               
```