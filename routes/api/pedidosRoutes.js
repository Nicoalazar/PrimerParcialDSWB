const express = require("express");

const router = express.Router();

// router aparte para /api/choferes: solo lectura del seed, no es un módulo con CRUD propio
const choferesRouter = express.Router();

const {

    obtenerPedidos,
    obtenerPedidoPorId,
    crearPedido,
    actualizarPedido,
    eliminarPedido,
    cambiarEstado,
    listarChoferes

} = require("../../controllers/pedidosController");

const { validarPedido, validarPedidoUpdate } = require("../../middlewares/validate");
const { autorizar } = require("../../middlewares/auth");


// rutas CRUD

router.get("/", obtenerPedidos);

router.get("/:id", obtenerPedidoPorId);

router.post("/", validarPedido, crearPedido);

router.put("/:id", validarPedidoUpdate, actualizarPedido);

// app.js ya exige token para todo el router; borrar queda solo para el admin
router.delete("/:id", autorizar("admin"), eliminarPedido);

router.patch("/:id/estado", cambiarEstado);


// choferes: sin POST/PUT/DELETE

choferesRouter.get("/", listarChoferes);


module.exports = router;
module.exports.choferesRouter = choferesRouter;