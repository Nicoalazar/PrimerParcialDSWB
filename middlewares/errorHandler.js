const notFound = (req, res, next) => {

    res.status(404).json({
        mensaje: "Ruta no encontrada"
    });

};


const errorHandler = (err, req, res, next) => {

    let status = err.statusCode || 500;
    let mensaje = err.message || "Error interno del servidor";

    // errores propios de Mongoose: son datos mal enviados, no fallas del servidor
    if (err.name === "CastError") {
        // ej: GET /api/clientes/abc → "abc" no tiene formato de ObjectId
        status = 400;
        mensaje = `Id inválido: ${err.value}`;
    } else if (err.name === "ValidationError") {
        // el schema rechazó el documento (campo requerido, enum, mínimo, etc.)
        status = 400;
        mensaje = "Datos inválidos: " + Object.values(err.errors).map((e) => e.message).join(", ");
    }

    // los 4xx son errores esperados (validación, transición inválida, etc.):
    // alcanza con un warning corto. La traza completa queda solo para los 500.
    if (status >= 500) {
        console.error(err);
    } else {
        console.warn(`[${status}] ${mensaje}`);
    }

    res.status(status).json({
        mensaje
    });

};


module.exports = {
    notFound,
    errorHandler
};
