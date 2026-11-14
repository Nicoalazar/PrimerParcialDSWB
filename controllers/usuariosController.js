const UsuarioService = require("../services/UsuarioService");

// Edición y baja de usuarios (admin). El listado y el alta siguen en
// authController. Sin try/catch: los 400/404 de UsuarioService y los
// CastError de Mongoose los responde el errorHandler.

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
    actualizarUsuario,
    eliminarUsuario
};
