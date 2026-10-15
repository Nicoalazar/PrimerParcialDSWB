const express = require("express");

const router = express.Router();

const Cliente = require("../../models/Cliente");
const { validarCliente, validarClienteUpdate } = require("../../middlewares/validate");

// Las rutas son async: si una consulta a Mongo falla, Express 5 manda el
// error al errorHandler sin necesidad de try/catch.


// GET / - listado
router.get("/", async (req, res) => {

    const clientes = await Cliente.find();

    res.render("clientes/lista", { titulo: "Clientes", clientes });

});


// GET /nuevo - form de alta
router.get("/nuevo", (req, res) => {

    res.render("clientes/form", { titulo: "Nuevo cliente", cliente: null });

});


// POST / - alta (mismo validarCliente que la API)
router.post("/", validarCliente, async (req, res) => {

    const { nombre, direccion, zona, contacto, horarioEntrega } = req.body;

    await Cliente.create({ nombre, direccion, zona, contacto, horarioEntrega });

    res.redirect("/clientes");

});


// GET /:id/editar - form de edición
router.get("/:id/editar", async (req, res) => {

    const cliente = await Cliente.findById(req.params.id);

    if (!cliente) {
        return res.redirect("/clientes");
    }

    res.render("clientes/form", { titulo: "Editar cliente", cliente });

});


// POST /:id/editar - guardar edición (mismo validarClienteUpdate que la API)
router.post("/:id/editar", validarClienteUpdate, async (req, res) => {

    const { nombre, direccion, zona, contacto, horarioEntrega } = req.body;

    await Cliente.findByIdAndUpdate(
        req.params.id,
        { nombre, direccion, zona, contacto, horarioEntrega },
        { runValidators: true }
    );

    res.redirect("/clientes");

});


// POST /:id/eliminar - borrar
router.post("/:id/eliminar", async (req, res) => {

    await Cliente.findByIdAndDelete(req.params.id);

    res.redirect("/clientes");

});


module.exports = router;
