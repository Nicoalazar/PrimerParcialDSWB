const express = require("express");

const router = express.Router();

const { login, perfil } = require("../../controllers/authController");
const { requiereLogin } = require("../../middlewares/auth");
const { validarLogin } = require("../../middlewares/validate");


// login es la única ruta de la API que no pide token
router.post("/login", validarLogin, login);

router.get("/perfil", requiereLogin, perfil);


module.exports = router;
