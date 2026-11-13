const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const config = require("../config");

// arma un error con statusCode para que lo responda el errorHandler
const crearError = (mensaje, statusCode) => {
    const error = new Error(mensaje);
    error.statusCode = statusCode;
    return error;
};

// Lógica de autenticación compartida por la API (token en el body de la
// respuesta) y la web (token en una cookie).
class AuthService {
    generarToken(usuario) {
        // en el token va solo lo necesario para autorizar, nunca la contraseña
        return jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        );
    }

    // devuelve el payload o tira error si el token es inválido o venció
    verificarToken(token) {
        return jwt.verify(token, config.jwtSecret);
    }

    async login(email, password) {
        const usuario = await Usuario.findOne({ email: String(email).toLowerCase() }).select("+password");

        // mismo mensaje si no existe el email o si la contraseña no coincide:
        // así no se puede averiguar qué emails están registrados
        if (!usuario || !(await usuario.compararPassword(password))) {
            throw crearError("Email o contraseña incorrectos", 401);
        }

        return { usuario, token: this.generarToken(usuario) };
    }
}

module.exports = new AuthService();
