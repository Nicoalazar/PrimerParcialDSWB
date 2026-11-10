const AuthService = require("../services/AuthService");

// Middlewares de autenticación y autorización.
//
// cargarUsuario (global): busca el token en el header "Authorization: Bearer …"
// (API / Postman) o en la cookie "token" (vistas web). Si es válido deja el
// payload en req.usuario y en res.locals.usuario (para las vistas). No corta
// el request: decidir si hace falta sesión es tarea de requiereLogin*.

const crearError = (mensaje, statusCode) => {
    const error = new Error(mensaje);
    error.statusCode = statusCode;
    return error;
};

const leerToken = (req) => {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
        return header.slice(7);
    }
    return req.cookies ? req.cookies.token : undefined;
};

const cargarUsuario = (req, res, next) => {
    const token = leerToken(req);

    if (token) {
        try {
            req.usuario = AuthService.verificarToken(token);
            res.locals.usuario = req.usuario;
        } catch (error) {
            // token vencido o adulterado: se trata como si no hubiera sesión
            req.tokenInvalido = true;
        }
    }

    next();
};

// API: sin usuario → 401 en JSON
const requiereLogin = (req, res, next) => {
    if (!req.usuario) {
        const mensaje = req.tokenInvalido ? "Token inválido o vencido" : "Se requiere iniciar sesión";
        return next(crearError(mensaje, 401));
    }
    next();
};

// Web: sin usuario → al formulario de login
const requiereLoginWeb = (req, res, next) => {
    if (!req.usuario) {
        if (req.tokenInvalido) res.clearCookie("token");
        return res.redirect("/login");
    }
    next();
};

// autorizar("admin") → solo deja pasar a esos roles (403 para el resto).
// Va después de requiereLogin*, así que req.usuario ya existe.
const autorizar = (...roles) => (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
        return next(crearError("No tenés permisos para realizar esta acción", 403));
    }
    next();
};

module.exports = {
    cargarUsuario,
    requiereLogin,
    requiereLoginWeb,
    autorizar
};
