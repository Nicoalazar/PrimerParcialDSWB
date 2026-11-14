const express = require("express");

const router = express.Router();

const { listarUsuarios, crearUsuario } = require("../../controllers/authController");
const { actualizarUsuario, eliminarUsuario } = require("../../controllers/usuariosController");
const { autorizar } = require("../../middlewares/auth");
const { validarUsuario } = require("../../middlewares/validate");
const { validarUsuarioUpdate } = require("../../middlewares/validateUsuarios");


// app.js ya exige token; acá además solo entra el admin
router.use(autorizar("admin"));

router.get("/", listarUsuarios);

router.post("/", validarUsuario, crearUsuario);

router.put("/:id", validarUsuarioUpdate, actualizarUsuario);

router.delete("/:id", eliminarUsuario);


module.exports = router;
