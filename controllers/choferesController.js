const Chofer = require("../models/Chofer");
const Pedido = require("../models/Pedido");

// Lo usan la API (/api/choferes, responde JSON) y la web (/choferes, renderiza
// o redirige). Sin try/catch: los 400/404 se tiran con statusCode y los
// CastError de Mongoose (id mal formado) los responde el errorHandler.

const esApi = (req) => req.originalUrl.startsWith("/api");

// arma un error con statusCode para que lo responda el errorHandler
const crearError = (mensaje, statusCode) => {
    const error = new Error(mensaje);
    error.statusCode = statusCode;
    return error;
};

// GET /api/choferes o /choferes
const listarChoferes = async (req, res) => {
    const choferes = await Chofer.find();

    if (esApi(req)) {
        return res.json(choferes);
    }

    res.render("choferes/index", { titulo: "Choferes", choferes });
};

// GET /api/choferes/:id
const obtenerChoferPorId = async (req, res) => {
    const chofer = await Chofer.findById(req.params.id);

    if (!chofer) {
        throw crearError("Chofer no encontrado", 404);
    }

    res.json(chofer);
};

// POST /api/choferes o /choferes
const crearChofer = async (req, res) => {
    // solo los campos del chofer: el _id nunca se toma del body
    const { nombre, apellido, vehiculo, zona } = req.body;

    const chofer = await Chofer.create({ nombre, apellido, vehiculo, zona });

    if (esApi(req)) {
        return res.status(201).json({
            mensaje: "Chofer creado",
            chofer
        });
    }

    res.redirect("/choferes");
};

// PUT /api/choferes/:id o POST /choferes/:id/editar
const actualizarChofer = async (req, res) => {
    const { nombre, apellido, vehiculo, zona } = req.body;

    // solo se pisan los campos que vienen en el body
    const datos = {};
    if (nombre !== undefined) datos.nombre = nombre;
    if (apellido !== undefined) datos.apellido = apellido;
    if (vehiculo !== undefined) datos.vehiculo = vehiculo;
    if (zona !== undefined) datos.zona = zona;

    // returnDocument: "after" devuelve el documento ya actualizado (no el de antes)
    const chofer = await Chofer.findByIdAndUpdate(req.params.id, datos, { returnDocument: "after", runValidators: true });

    if (!chofer) {
        throw crearError("Chofer no encontrado", 404);
    }

    if (esApi(req)) {
        return res.json({
            mensaje: "Chofer actualizado",
            chofer
        });
    }

    res.redirect("/choferes");
};

// DELETE /api/choferes/:id o POST /choferes/:id/eliminar
const eliminarChofer = async (req, res) => {
    // no se puede borrar un chofer que tiene pedidos asignados
    if (await Pedido.exists({ choferId: req.params.id })) {
        throw crearError("No se puede eliminar el chofer porque tiene pedidos asignados", 400);
    }

    const eliminado = await Chofer.findByIdAndDelete(req.params.id);

    if (!eliminado) {
        throw crearError("Chofer no encontrado", 404);
    }

    if (esApi(req)) {
        return res.json({
            mensaje: "Chofer eliminado"
        });
    }

    res.redirect("/choferes");
};

module.exports = {
    listarChoferes,
    obtenerChoferPorId,
    crearChofer,
    actualizarChofer,
    eliminarChofer
};
