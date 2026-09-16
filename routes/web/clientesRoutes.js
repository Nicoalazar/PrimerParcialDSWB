const express = require("express");

const router = express.Router();

const Cliente = require("../../models/Cliente");
const JsonRepository = require("../../repositories/JsonRepository");

const clientesRepo = new JsonRepository("clientes.json");


// GET / - listado
router.get("/", (req, res) => {

    const clientes = clientesRepo.getAll();

    res.render("clientes/lista", { titulo: "Clientes", clientes });

});


// GET /nuevo - form de alta
router.get("/nuevo", (req, res) => {

    res.render("clientes/form", { titulo: "Nuevo cliente", cliente: null });

});


// POST / - alta
router.post("/", (req, res) => {

    const { nombre, direccion, zona, contacto, horarioEntrega } = req.body;

    const nuevoCliente = new Cliente(nombre, direccion, zona, contacto, horarioEntrega);

    clientesRepo.create(nuevoCliente);

    res.redirect("/clientes");

});


// GET /:id/editar - form de edición
router.get("/:id/editar", (req, res) => {

    const id = parseInt(req.params.id);

    const cliente = clientesRepo.getById(id);

    if (!cliente) {
        return res.redirect("/clientes");
    }

    res.render("clientes/form", { titulo: "Editar cliente", cliente });

});


// POST /:id/editar - guardar edición
router.post("/:id/editar", (req, res) => {

    const id = parseInt(req.params.id);

    const { nombre, direccion, zona, contacto, horarioEntrega } = req.body;

    clientesRepo.update(id, { nombre, direccion, zona, contacto, horarioEntrega });

    res.redirect("/clientes");

});


// POST /:id/eliminar - borrar
router.post("/:id/eliminar", (req, res) => {

    const id = parseInt(req.params.id);

    clientesRepo.delete(id);

    res.redirect("/clientes");

});


module.exports = router;
