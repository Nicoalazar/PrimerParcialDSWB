// Validación del PUT de usuarios (API y formulario de edición web).
// Está en un archivo aparte de validate.js para no pisar los cambios que
// otros issues hacen sobre ese archivo. Usa el mismo rechazar() de validate.js:
// 400 con { mensaje, errores } en la API y la página de error en la web.
//
// Valida solo los campos que vinieron (edición parcial); si no vino ninguno, 400.
// El email no se edita.

const { ROLES } = require("../models/Usuario");
const { rechazar } = require("./validate");

const validarUsuarioUpdate = (req, res, next) => {

    const { nombre, rol, password } = req.body;
    const errores = [];

    const vinoAlgunCampo = [nombre, rol, password].some((valor) => valor !== undefined);

    if (!vinoAlgunCampo) {
        errores.push("hay que mandar al menos un campo para actualizar (nombre, rol o password)");
    }

    if (nombre !== undefined && (!nombre || typeof nombre !== "string")) {
        errores.push("nombre debe ser texto");
    }

    if (rol !== undefined && !ROLES.includes(rol)) {
        errores.push(`rol debe ser uno de: ${ROLES.join(", ")}`);
    }

    if (password !== undefined && (typeof password !== "string" || password.length < 6)) {
        errores.push("password debe tener al menos 6 caracteres");
    }

    if (errores.length > 0) {

        return rechazar(req, res, "Datos de usuario inválidos", errores);

    }

    next();

};

module.exports = {
    validarUsuarioUpdate
};
