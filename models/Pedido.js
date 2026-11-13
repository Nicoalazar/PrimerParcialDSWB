const mongoose = require("mongoose");

const ESTADOS = ["pendiente", "asignado", "en tránsito", "entregado"];

const itemSchema = new mongoose.Schema(
    {
        descripcion: { type: String, required: true, trim: true },
        cantidad: { type: Number, required: true, min: 1 }
    },
    { _id: false }
);

// Pedido de FreshRoute: encargo de un cliente asignado a un chofer para reparto.
// clienteId y choferId guardan el _id del documento referenciado (ref → populate).
const pedidoSchema = new mongoose.Schema(
    {
        clienteId: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required: true },
        choferId: { type: mongoose.Schema.Types.ObjectId, ref: "Chofer", required: true },
        items: {
            type: [itemSchema],
            validate: (items) => items.length > 0
        },
        estado: { type: String, enum: ESTADOS, default: ESTADOS[0] },
        fechaHoraProgramada: { type: String, required: true }
    },
    { versionKey: false }
);

const Pedido = mongoose.model("Pedido", pedidoSchema, "pedidos");

module.exports = Pedido;
module.exports.ESTADOS = ESTADOS;
