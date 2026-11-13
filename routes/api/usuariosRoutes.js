const express = require("express");

const router = express.Router();

const { listarUsuarios, crearUsuario } = require("../../controllers/authController");
const { autorizar } = require("../../middlewares/auth");
const { validarUsuario } = require("../../middlewares/validate");


// app.js ya exige token; acá además solo entra el admin
router.use(autorizar("admin"));

router.get("/", listarUsuarios);

router.post("/", validarUsuario, crearUsuario);


module.exports = router;
