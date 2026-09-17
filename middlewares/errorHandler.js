const notFound = (req, res, next) => {

    res.status(404).json({
        mensaje: "Ruta no encontrada"
    });

};


const errorHandler = (err, req, res, next) => {

    const status = err.statusCode || 500;

    // los 4xx son errores esperados (validación, transición inválida, etc.):
    // alcanza con un warning corto. La traza completa queda solo para los 500.
    if (status >= 500) {
        console.error(err);
    } else {
        console.warn(`[${status}] ${err.message}`);
    }

    res.status(status).json({
        mensaje: err.message || "Error interno del servidor"
    });

};


module.exports = {
    notFound,
    errorHandler
};