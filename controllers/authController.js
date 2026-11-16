const AuthService = require("../services/AuthService");
const Usuario = require("../models/Usuario");

// Sin try/catch, igual que el resto de los controllers: Express 5 manda
// los errores (401 de AuthService, 400 de Mongoose) al errorHandler.

// POST /api/auth/login (público)
const login = async (req, res) => {
    const { email, password } = req.body;

    const { usuario, token } = await AuthService.login(email, password);

    res.json({
        mensaje: "Sesión iniciada",
        token,
        usuario
    });
};

// GET /api/auth/perfil → datos del usuario dueño del token
const perfil = async (req, res) => {
    const usuario = await Usuario.findById(req.usuario.id);

    if (!usuario) {
        return res.status(404).json({
            mensaje: "Usuario no encontrado"
        });
    }

    res.json(usuario);
};

// La gestión de usuarios (listado, alta, edición y baja) está en usuariosController.

module.exports = {
    login,
    perfil
};
