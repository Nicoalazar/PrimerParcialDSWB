const Cliente = require("../models/Cliente");
const JsonRepository = require("../repositories/JsonRepository");

const clientesRepo = new JsonRepository("clientes.json");


// GET ALL
const obtenerClientes = (req, res) => {

    const clientes = clientesRepo.getAll();

    res.json(clientes);

};


// GET BY ID
const obtenerClientePorId = (req, res) => {

    const id = parseInt(req.params.id);

    const cliente = clientesRepo.getById(id);

    if (!cliente) {

        return res.status(404).json({
            mensaje: "Cliente no encontrado"
        });

    }

    res.json(cliente);

};


// CREATE
const crearCliente = (req, res) => {

    const { nombre, direccion, zona, contacto, horarioEntrega } = req.body;

    const nuevoCliente = new Cliente(nombre, direccion, zona, contacto, horarioEntrega);

    const clienteCreado = clientesRepo.create(nuevoCliente);

    res.status(201).json({
        mensaje: "Cliente creado",
        cliente: clienteCreado
    });

};


// UPDATE
const actualizarCliente = (req, res) => {

    const id = parseInt(req.params.id);

    const { nombre, direccion, zona, contacto, horarioEntrega } = req.body;

    // solo se pisan los campos que vienen en el body
    const datos = {};
    if (nombre !== undefined) datos.nombre = nombre;
    if (direccion !== undefined) datos.direccion = direccion;
    if (zona !== undefined) datos.zona = zona;
    if (contacto !== undefined) datos.contacto = contacto;
    if (horarioEntrega !== undefined) datos.horarioEntrega = horarioEntrega;

    const cliente = clientesRepo.update(id, datos);

    if (!cliente) {

        return res.status(404).json({
            mensaje: "Cliente no encontrado"
        });

    }

    res.json({
        mensaje: "Cliente actualizado",
        cliente
    });

};


// DELETE
const eliminarCliente = (req, res) => {

    const id = parseInt(req.params.id);

    const eliminado = clientesRepo.delete(id);

    if (!eliminado) {

        return res.status(404).json({
            mensaje: "Cliente no encontrado"
        });

    }

    res.json({
        mensaje: "Cliente eliminado"
    });

};


module.exports = {

    obtenerClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente

};
