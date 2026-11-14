const express = require("express");

const router = express.Router();

const Usuario = require("../../models/Usuario");
const UsuarioService = require("../../services/UsuarioService");
const { ROLES } = require("../../models/Usuario");
const { validarUsuario } = require("../../middlewares/validate");
const { validarUsuarioUpdate } = require("../../middlewares/validateUsuarios");
const { autorizar } = require("../../middlewares/auth");

// Gestión de usuarios desde la web: todo el módulo es solo para el admin
// (app.js ya exige sesión con requiereLoginWeb). Usa los mismos validadores
// y el mismo UsuarioService que la API.
router.use(autorizar("admin"));


// En el form de edición la contraseña es opcional: si se deja vacía, no se cambia
const ignorarPasswordVacia = (req, res, next) => {
    if (req.body.password === "") delete req.body.password;
    next();
};


// GET / - listado
router.get("/", async (req, res) => {

    const usuarios = await Usuario.find().sort({ nombre: 1 });

    res.render("usuarios/lista", { titulo: "Usuarios", usuarios });

});


// GET /nuevo - form de alta
router.get("/nuevo", (req, res) => {

    res.render("usuarios/form", { titulo: "Nuevo usuario", editado: null, roles: ROLES });

});


// POST / - alta (mismo validarUsuario que la API)
router.post("/", validarUsuario, async (req, res) => {

    const { nombre, email, password, rol } = req.body;

    await UsuarioService.crear({ nombre, email, password, rol });

    res.redirect("/usuarios");

});


// GET /:id/editar - form de edición
router.get("/:id/editar", async (req, res) => {

    const editado = await Usuario.findById(req.params.id);

    if (!editado) {
        return res.redirect("/usuarios");
    }

    res.render("usuarios/form", { titulo: "Editar usuario", editado, roles: ROLES });

});


// POST /:id/editar - guardar edición (mismo validarUsuarioUpdate que la API)
router.post("/:id/editar", ignorarPasswordVacia, validarUsuarioUpdate, async (req, res) => {

    const { nombre, rol, password } = req.body;

    await UsuarioService.actualizar(req.params.id, { nombre, rol, password }, req.usuario.id);

    res.redirect("/usuarios");

});


// POST /:id/eliminar - baja (el admin no puede borrarse a sí mismo)
router.post("/:id/eliminar", async (req, res) => {

    await UsuarioService.eliminar(req.params.id, req.usuario.id);

    res.redirect("/usuarios");

});


module.exports = router;
