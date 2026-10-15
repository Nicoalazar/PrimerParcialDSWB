const Cliente = require("../models/Cliente");

// Los controllers no llevan try/catch: si una promesa falla (por ejemplo un
// id con formato inválido), Express 5 la manda sola al errorHandler.


// GET ALL
const obtenerClientes = async (req, res) => {

    const clientes = await Cliente.find();

    res.json(clientes);

};


// GET BY ID
const obtenerClientePorId = async (req, res) => {

    const cliente = await Cliente.findById(req.params.id);

    if (!cliente) {

        return res.status(404).json({
            mensaje: "Cliente no encontrado"
        });

    }

    res.json(cliente);

};


// CREATE
const crearCliente = async (req, res) => {

    const { nombre, direccion, zona, contacto, horarioEntrega } = req.body;

    const clienteCreado = await Cliente.create({ nombre, direccion, zona, contacto, horarioEntrega });

    res.status(201).json({
        mensaje: "Cliente creado",
        cliente: clienteCreado
    });

};


// UPDATE
const actualizarCliente = async (req, res) => {

    const { nombre, direccion, zona, contacto, horarioEntrega } = req.body;

    // solo se pisan los campos que vienen en el body
    const datos = {};
    if (nombre !== undefined) datos.nombre = nombre;
    if (direccion !== undefined) datos.direccion = direccion;
    if (zona !== undefined) datos.zona = zona;
    if (contacto !== undefined) datos.contacto = contacto;
    if (horarioEntrega !== undefined) datos.horarioEntrega = horarioEntrega;

    // returnDocument: "after" devuelve el documento ya actualizado (no el de antes)
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, datos, { returnDocument: "after", runValidators: true });

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
const eliminarCliente = async (req, res) => {

    const eliminado = await Cliente.findByIdAndDelete(req.params.id);

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
