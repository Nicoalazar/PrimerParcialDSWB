const mongoose = require("mongoose");

// Chofer de FreshRoute: se carga con el seed y es de solo lectura (no es un módulo)
const choferSchema = new mongoose.Schema(
    {
        nombre: { type: String, required: true, trim: true },
        apellido: { type: String, required: true, trim: true },
        vehiculo: { type: String, required: true, trim: true },
        zona: { type: String, required: true, trim: true }
    },
    { versionKey: false }
);

module.exports = mongoose.model("Chofer", choferSchema, "choferes");
