// las rutas de la API responden JSON; el resto (vistas web) responde una página
const esApi = (req) => req.originalUrl.startsWith("/api");

const responder = (req, res, status, mensaje) => {
    if (esApi(req)) {
        return res.status(status).json({ mensaje });
    }
    res.status(status).render("error", { titulo: "Error", status, mensaje });
};


const notFound = (req, res, next) => {

    responder(req, res, 404, "Ruta no encontrada");

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

    // los 4xx son errores esperados (validación, transición inválida, 401/403, etc.):
    // alcanza con un warning corto. La traza completa queda solo para los 500.
    if (status >= 500) {
        console.error(err);
        // al cliente no se le muestra el detalle interno de un 500
        mensaje = "Error interno del servidor";
    } else {
        console.warn(`[${status}] ${mensaje}`);
    }

    responder(req, res, status, mensaje);

};


module.exports = {
    notFound,
    errorHandler
};
