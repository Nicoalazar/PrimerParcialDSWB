const Usuario = require("../models/Usuario");
const UsuarioService = require("../services/UsuarioService");

// Gestión de usuarios (solo admin): listado, alta, edición y baja.
// Sin try/catch: los 400/404 de UsuarioService y los CastError de Mongoose
// los responde el errorHandler.

// GET /api/usuarios
const listarUsuarios = async (req, res) => {
    const usuarios = await Usuario.find();
    res.json(usuarios);
};

// POST /api/usuarios: alta de usuarios, no hay registro abierto
const crearUsuario = async (req, res) => {
    const { nombre, email, password, rol } = req.body;

    const usuario = await UsuarioService.crear({ nombre, email, password, rol });

    res.status(201).json({
        mensaje: "Usuario creado",
        usuario
    });
};

// PUT /api/usuarios/:id
const actualizarUsuario = async (req, res) => {
    const { nombre, rol, password } = req.body;

    const usuario = await UsuarioService.actualizar(req.params.id, { nombre, rol, password }, req.usuario.id);

    res.json({
        mensaje: "Usuario actualizado",
        usuario
    });
};

// DELETE /api/usuarios/:id
const eliminarUsuario = async (req, res) => {
    await UsuarioService.eliminar(req.params.id, req.usuario.id);

    res.json({
        mensaje: "Usuario eliminado"
    });
};

module.exports = {
    listarUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
};
