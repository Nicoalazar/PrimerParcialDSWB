const express = require("express");

const router = express.Router();

const {

    obtenerClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente

} = require("../../controllers/clientesController");


// rutas CRUD

router.get("/", obtenerClientes);

router.get("/:id", obtenerClientePorId);

router.post("/", crearCliente);

router.put("/:id", actualizarCliente);

router.delete("/:id", eliminarCliente);


module.exports = router;
