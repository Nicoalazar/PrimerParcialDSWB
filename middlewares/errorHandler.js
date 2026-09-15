const notFound = (req, res, next) => {

    res.status(404).json({
        mensaje: "Ruta no encontrada"
    });

};


const errorHandler = (err, req, res, next) => {

    console.error(err);

    const status = err.statusCode || 500;

    res.status(status).json({
        mensaje: err.message || "Error interno del servidor"
    });

};


module.exports = {
    notFound,
    errorHandler
};