const express = require("express");

const router = express.Router();

const {

    obtenerClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente

} = require("../../controllers/clientesController");

const { validarCliente, validarClienteUpdate } = require("../../middlewares/validate");
const { autorizar } = require("../../middlewares/auth");


// rutas CRUD

router.get("/", obtenerClientes);

router.get("/:id", obtenerClientePorId);

router.post("/", validarCliente, crearCliente);

router.put("/:id", validarClienteUpdate, actualizarCliente);

// app.js ya exige token para todo el router; borrar queda solo para el admin
router.delete("/:id", autorizar("admin"), eliminarCliente);


module.exports = router;