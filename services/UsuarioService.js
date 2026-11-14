const Usuario = require("../models/Usuario");

// arma un error con statusCode para que lo responda el errorHandler
const crearError = (mensaje, statusCode) => {
    const error = new Error(mensaje);
    error.statusCode = statusCode;
    return error;
};

// Reglas de la gestión de usuarios, compartidas por la API (/api/usuarios)
// y las vistas del admin (/usuarios).
class UsuarioService {
    async crear({ nombre, email, password, rol }) {
        if (await Usuario.exists({ email: String(email).toLowerCase() })) {
            throw crearError(`Ya existe un usuario con el email ${email}`, 400);
        }

        return Usuario.create({ nombre, email, password, rol });
    }

    // Se editan nombre, rol y contraseña (el email no se cambia).
    // Se usa save() y no findByIdAndUpdate() para que corra el pre("save")
    // del modelo y la contraseña nueva se guarde hasheada.
    async actualizar(id, { nombre, rol, password }, idSolicitante) {
        const usuario = await Usuario.findById(id);

        if (!usuario) {
            throw crearError("Usuario no encontrado", 404);
        }

        // si el admin se saca su propio rol, el sistema podría quedar sin admins
        if (usuario.id === String(idSolicitante) && rol !== undefined && rol !== "admin") {
            throw crearError("Un administrador no puede quitarse su propio rol de admin", 400);
        }

        if (nombre !== undefined) usuario.nombre = nombre;
        if (rol !== undefined) usuario.rol = rol;
        if (password !== undefined) usuario.password = password;

        await usuario.save();

        return usuario;
    }

    async eliminar(id, idSolicitante) {
        if (String(id) === String(idSolicitante)) {
            throw crearError("Un administrador no puede eliminarse a sí mismo", 400);
        }

        const eliminado = await Usuario.findByIdAndDelete(id);

        if (!eliminado) {
            throw crearError("Usuario no encontrado", 404);
        }

        return eliminado;
    }
}

module.exports = new UsuarioService();
