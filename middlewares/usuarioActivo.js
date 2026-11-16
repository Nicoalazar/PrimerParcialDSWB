const { isValidObjectId } = require("mongoose");
const Usuario = require("../models/Usuario");

// Va en app.js justo después de cargarUsuario (middlewares/auth.js).
//
// El JWT sigue siendo válido aunque el usuario se haya borrado o le hayan
// cambiado el rol. Este middleware confirma en la base que el dueño del token
// existe:
// - si no existe, borra req.usuario y marca req.tokenInvalido, igual que
//   cargarUsuario con un token vencido. Así requiereLogin responde 401 y
//   requiereLoginWeb borra la cookie y redirige a /login, sin cambiar auth.js.
// - si existe, toma nombre y rol de la base, así un cambio de rol hecho por
//   el admin vale en el momento y no recién cuando vence el token.
const verificarUsuarioActivo = async (req, res, next) => {
    if (!req.usuario) return next();

    const usuario = isValidObjectId(req.usuario.id) ? await Usuario.findById(req.usuario.id) : null;

    if (!usuario) {
        delete req.usuario;
        delete res.locals.usuario;
        req.tokenInvalido = true;
        return next();
    }

    req.usuario = { ...req.usuario, nombre: usuario.nombre, rol: usuario.rol };
    res.locals.usuario = req.usuario;

    next();
};

module.exports = { verificarUsuarioActivo };
