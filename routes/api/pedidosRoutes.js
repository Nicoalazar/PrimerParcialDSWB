const express = require("express");
const router = express.Router();

const {
    obtenerPedidos,
    obtenerPedidoPorId,
    crearPedido,
    actualizarPedido,
    eliminarPedido,
    cambiarEstado
} = require("../../controllers/pedidosController");

const { validarPedido, validarPedidoUpdate } = require("../../middlewares/validate");
const { autorizar } = require("../../middlewares/auth");

// rutas CRUD de pedidos

router.get("/", obtenerPedidos);

router.get("/:id", obtenerPedidoPorId);

router.post("/", validarPedido, crearPedido);

router.put("/:id", validarPedidoUpdate, actualizarPedido);

// app.js ya exige token para todo el router; borrar queda solo para el admin
router.delete("/:id", autorizar("admin"), eliminarPedido);

router.patch("/:id/estado", cambiarEstado);

module.exports = router;

