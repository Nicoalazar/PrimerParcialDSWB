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


// rutas CRUD

router.get("/", obtenerClientes);

router.get("/:id", obtenerClientePorId);

router.post("/", validarCliente, crearCliente);

router.put("/:id", validarClienteUpdate, actualizarCliente);

router.delete("/:id", eliminarCliente);


module.exports = router;