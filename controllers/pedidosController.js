const PedidoService = require("../services/PedidoService");
const Pedido = require("../models/Pedido");
const Chofer = require("../models/Chofer");

// Ningún controller lleva try/catch: si PedidoService tira un error (o falla
// una consulta a Mongo), Express 5 lo agarra solo y lo manda al errorHandler.

// GET ALL
const obtenerPedidos = async (req, res) => {
    const pedidos = await Pedido.find();
    res.json(pedidos);
};

// GET BY ID
const obtenerPedidoPorId = async (req, res) => {
    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
        return res.status(404).json({
            mensaje: "Pedido no encontrado"
        });
    }

    res.json(pedido);
};

// CREATE (Usa PedidoService)
const crearPedido = async (req, res) => {
    const pedidoCreado = await PedidoService.crearPedido(req.body);
    res.status(201).json({
        mensaje: "Pedido creado",
        pedido: pedidoCreado
    });
};

// UPDATE (Usa PedidoService)
const actualizarPedido = async (req, res) => {
    const { clienteId, choferId, items, fechaHoraProgramada } = req.body;

    const datos = {};
    if (clienteId !== undefined) datos.clienteId = clienteId;
    if (choferId !== undefined) datos.choferId = choferId;
    if (items !== undefined) datos.items = items;
    if (fechaHoraProgramada !== undefined) datos.fechaHoraProgramada = fechaHoraProgramada;

    const pedido = await PedidoService.actualizarPedido(req.params.id, datos);

    res.json({
        mensaje: "Pedido actualizado",
        pedido
    });
};

// DELETE
const eliminarPedido = async (req, res) => {
    const eliminado = await Pedido.findByIdAndDelete(req.params.id);

    if (!eliminado) {
        return res.status(404).json({
            mensaje: "Pedido no encontrado"
        });
    }

    res.json({
        mensaje: "Pedido eliminado"
    });
};

// PATCH estado (Usa PedidoService)
const cambiarEstado = async (req, res) => {
    const { estado } = req.body;

    const pedidoActualizado = await PedidoService.cambiarEstado(req.params.id, estado);

    res.json({
        mensaje: "Estado actualizado",
        pedido: pedidoActualizado
    });
};

// GET choferes (solo lectura del seed)
const listarChoferes = async (req, res) => {
    const choferes = await Chofer.find();
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
