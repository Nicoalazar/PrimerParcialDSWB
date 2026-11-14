const express = require("express");

const router = express.Router();

const {
    listarChoferes,
    obtenerChoferPorId,
    crearChofer,
    actualizarChofer,
    eliminarChofer
} = require("../../controllers/choferesController");

const { validarChofer, validarChoferUpdate } = require("../../middlewares/validate");
const { autorizar } = require("../../middlewares/auth");


// rutas CRUD (app.js ya exige token para todo el router)

router.get("/", listarChoferes);

router.get("/:id", obtenerChoferPorId);

router.post("/", validarChofer, crearChofer);

router.put("/:id", validarChoferUpdate, actualizarChofer);

// borrar queda solo para el admin (y se rechaza si el chofer tiene pedidos)
router.delete("/:id", autorizar("admin"), eliminarChofer);


module.exports = router;
