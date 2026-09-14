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


// rutas CRUD

router.get("/", obtenerPedidos);

router.get("/:id", obtenerPedidoPorId);

router.post("/", crearPedido);

router.put("/:id", actualizarPedido);

router.delete("/:id", eliminarPedido);

router.patch("/:id/estado", cambiarEstado);


// choferes: sin POST/PUT/DELETE

choferesRouter.get("/", listarChoferes);


module.exports = router;
module.exports.choferesRouter = choferesRouter;
