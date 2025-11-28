const db = require('./db')
const { encriptarPassword } = require('../Utils/hash')

//Crear superAdmin
async function crearSuperAdmin() {
    try {
        const superAdminDatos = {
            DNI: 9999,
            Nombre: 'Super',
            Apellido: 'Admin',
            Mail: 'admin@electroshop.com',
            Fecha_Nacimiento: '1990-01-01',
            Contraseña: 'admin123',
            Telefono: 1234567890,
            Direccion: 'Oficina Central',
            Cargo: 'Super Admin'
        }

        db.get(
            'SELECT * FROM Personal WHERE DNI = ? OR Mail = ?',
            [superAdminDatos.DNI, superAdminDatos.Mail],
            async (Error, existing) => {
                if (Error) {
                    console.error('Error al verificar si existe el Super Admin:', Error.message)
                    return
                }

                // Si ya hay uno, no se vuelve a crear
                if (existing) {
                    console.log('El Super Admin ya existe en la base de datos.')
                    return
                }

                const hash = await encriptarPassword(superAdminDatos.Contraseña)

                const query = `INSERT INTO Personal (DNI, Nombre, Apellido, Mail, Fecha_Nacimiento, Contraseña, Telefono, Direccion, Cargo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

                db.run(
                    query,
                    [
                        superAdminDatos.DNI,
                        superAdminDatos.Nombre,
                        superAdminDatos.Apellido,
                        superAdminDatos.Mail,
                        superAdminDatos.Fecha_Nacimiento,
                        hash,
                        superAdminDatos.Telefono,
                        superAdminDatos.Direccion,
                        superAdminDatos.Cargo
                    ],
                    function (Error) {
                        if (Error) {
                            console.error('Error al crear el Super Admin:', Error.message)
                        } else {
                            console.log('Super Admin creado exitosamente.')
                        }
                    }
                )
            }
        )
    } catch (Error) {
        console.error('Error al crear el Super Admin:', Error)
    }
}

// Si el archivo se ejecuta directamente desde la terminal (node crearSuperAdmin.js), entonces se llama automáticamente a la función
if (require.main === module) {
    crearSuperAdmin()

    // Espera unos segundos para que termine la operación y luego cierra el proceso
    setTimeout(() => {
        db.close((Error) => {
            if (Error) console.error('Error al cerrar la base de datos:', Error.message)
            else console.log('Conexión con la base de datos cerrada correctamente.')
            process.exit(0)
        })
    }, 2000)
}

module.exports = crearSuperAdmin