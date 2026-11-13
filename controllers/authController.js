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

// GET /api/usuarios (admin)
const listarUsuarios = async (req, res) => {
    const usuarios = await Usuario.find();
    res.json(usuarios);
};

// POST /api/usuarios (admin): alta de usuarios, no hay registro abierto
const crearUsuario = async (req, res) => {
    const { nombre, email, password, rol } = req.body;

    if (await Usuario.exists({ email: email.toLowerCase() })) {
        return res.status(400).json({
            mensaje: `Ya existe un usuario con el email ${email}`
        });
    }

    const usuario = await Usuario.create({ nombre, email, password, rol });

    res.status(201).json({
        mensaje: "Usuario creado",
        usuario
    });
};

module.exports = {
    login,
    perfil,
    listarUsuarios,
    crearUsuario
};
