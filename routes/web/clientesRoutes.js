const express = require("express");

const router = express.Router();

const Cliente = require("../../models/Cliente");
const JsonRepository = require("../../repositories/JsonRepository");
const { validarCliente, validarClienteUpdate } = require("../../middlewares/validate");

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
// Antes no pasaba por ningún validador: un POST vacío guardaba un cliente
// con solo el id. Ahora usa el mismo validarCliente que la API. (BUG-01)
router.post("/", validarCliente, (req, res) => {

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
// Mismo problema que el alta: no validaba nada, se podía dejar un cliente
// con campos vacíos. Ahora usa validarClienteUpdate, igual que la API. (BUG-11)
router.post("/:id/editar", validarClienteUpdate, (req, res) => {

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