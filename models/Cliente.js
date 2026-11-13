const mongoose = require("mongoose");

// Cliente de FreshRoute: restaurante, comedor o cocina industrial
const clienteSchema = new mongoose.Schema(
    {
        nombre: { type: String, required: true, trim: true },
        direccion: { type: String, required: true, trim: true },
        zona: { type: String, required: true, trim: true },
        contacto: { type: String, required: true, trim: true },
        horarioEntrega: { type: String, required: true, trim: true }
    },
    { versionKey: false }
);

module.exports = mongoose.model("Cliente", clienteSchema, "clientes");
