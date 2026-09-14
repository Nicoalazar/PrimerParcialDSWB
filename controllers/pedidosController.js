const Pedido = require("../models/Pedido");
const JsonRepository = require("../repositories/JsonRepository");

const pedidosRepo = new JsonRepository("pedidos.json");
const choferesRepo = new JsonRepository("choferes.json");

// orden de transición de estado: sin saltos ni retrocesos
const ESTADOS = ["pendiente", "asignado", "en tránsito", "entregado"];


// GET ALL
const obtenerPedidos = (req, res) => {

    const pedidos = pedidosRepo.getAll();

    res.json(pedidos);

};


// GET BY ID
const obtenerPedidoPorId = (req, res) => {

    const id = parseInt(req.params.id);

    const pedido = pedidosRepo.getById(id);

    if (!pedido) {

        return res.status(404).json({
            mensaje: "Pedido no encontrado"
        });

    }

    res.json(pedido);

};


// CREATE
const crearPedido = (req, res) => {

    const { clienteId, choferId, items, estado, fechaHoraProgramada } = req.body;

    const nuevoPedido = new Pedido(clienteId, choferId, items, estado || ESTADOS[0], fechaHoraProgramada);

    const pedidoCreado = pedidosRepo.create(nuevoPedido);

    res.status(201).json({
        mensaje: "Pedido creado",
        pedido: pedidoCreado
    });

};


// UPDATE
const actualizarPedido = (req, res) => {

    const id = parseInt(req.params.id);

    const { clienteId, choferId, items, estado, fechaHoraProgramada } = req.body;

    // solo se pisan los campos que vienen en el body
    const datos = {};
    if (clienteId !== undefined) datos.clienteId = clienteId;
    if (choferId !== undefined) datos.choferId = choferId;
    if (items !== undefined) datos.items = items;
    if (estado !== undefined) datos.estado = estado;
    if (fechaHoraProgramada !== undefined) datos.fechaHoraProgramada = fechaHoraProgramada;

    const pedido = pedidosRepo.update(id, datos);

    if (!pedido) {

        return res.status(404).json({
            mensaje: "Pedido no encontrado"
        });

    }

    res.json({
        mensaje: "Pedido actualizado",
        pedido
    });

};


// DELETE
const eliminarPedido = (req, res) => {

    const id = parseInt(req.params.id);

    const eliminado = pedidosRepo.delete(id);

    if (!eliminado) {

        return res.status(404).json({
            mensaje: "Pedido no encontrado"
        });

    }

    res.json({
        mensaje: "Pedido eliminado"
    });

};


// PATCH estado
const cambiarEstado = (req, res) => {

    const id = parseInt(req.params.id);

    const { estado } = req.body;

    if (!ESTADOS.includes(estado)) {

        return res.status(400).json({
            mensaje: "Estado inválido",
            estadosValidos: ESTADOS
        });

    }

    const pedido = pedidosRepo.getById(id);

    if (!pedido) {

        return res.status(404).json({
            mensaje: "Pedido no encontrado"
        });

    }

    const indiceActual = ESTADOS.indexOf(pedido.estado);
    const indiceNuevo = ESTADOS.indexOf(estado);

    // solo se permite avanzar al estado siguiente, sin saltos ni retrocesos
    if (indiceNuevo !== indiceActual + 1) {

        return res.status(400).json({
            mensaje: `No se puede pasar de "${pedido.estado}" a "${estado}"`
        });

    }

    const pedidoActualizado = pedidosRepo.update(id, { estado });

    res.json({
        mensaje: "Estado actualizado",
        pedido: pedidoActualizado
    });

};


// GET choferes (solo lectura del seed)
const listarChoferes = (req, res) => {

    const choferes = choferesRepo.getAll();

    res.json(choferes);

};


module.exports = {

    obtenerPedidos,
    obtenerPedidoPorId,
    crearPedido,
    actualizarPedido,
    eliminarPedido,
    cambiarEstado,
    listarChoferes

};
