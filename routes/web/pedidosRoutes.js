const express = require("express");
const router = express.Router();

const Pedido = require("../../models/Pedido");
const Cliente = require("../../models/Cliente");
const Chofer = require("../../models/Chofer");
const pedidoService = require("../../services/PedidoService");
const { validarPedido } = require("../../middlewares/validate");

const { ESTADOS } = Pedido;

// Las rutas son async: si PedidoService tira un error o falla una consulta,
// Express 5 lo manda al errorHandler sin necesidad de try/catch.

// Middleware para transformar el formulario al formato que espera validarPedido
function normalizarBodyWeb(req, res, next) {
    const { clienteId, choferId, fechaHoraProgramada, item_descripcion, item_cantidad } = req.body;

    // Convertimos a array por si vino un solo elemento
    const descripciones = Array.isArray(item_descripcion)
        ? item_descripcion
        : item_descripcion ? [item_descripcion] : [];

    const cantidades = Array.isArray(item_cantidad)
        ? item_cantidad
        : item_cantidad ? [item_cantidad] : [];

    const items = [];

    // Recorremos las filas: solo guardamos las que tienen descripción escrita
    for (let i = 0; i < descripciones.length; i++) {
        const desc = descripciones[i] ? descripciones[i].trim() : "";
        const cant = cantidades[i] ? Number(cantidades[i]) : NaN;

        if (desc !== "") {
            items.push({
                descripcion: desc,
                cantidad: isNaN(cant) ? undefined : cant
            });
        }
    }

    // Reemplazamos req.body con los campos que espera la API
    // (clienteId y choferId llegan del select como texto con el _id de Mongo)
    req.body = {
        clienteId,
        choferId,
        fechaHoraProgramada,
        items
    };

    next();
}

// GET / - Listado. populate reemplaza clienteId/choferId por el documento referenciado
router.get("/", async (req, res) => {
    const pedidos = await Pedido.find().populate("clienteId").populate("choferId");

    const pedidosConDatos = pedidos.map((p) => ({
        id: p.id,
        fechaHoraProgramada: p.fechaHoraProgramada,
        estado: p.estado,
        // si el cliente/chofer fue borrado, populate deja null
        clienteNombre: p.clienteId ? p.clienteId.nombre : "(cliente eliminado)",
        choferNombre: p.choferId ? p.choferId.nombre : "(chofer eliminado)"
    }));

    res.render("pedidos/lista", { titulo: "Pedidos", pedidos: pedidosConDatos });
});

// GET /nuevo - Formulario
router.get("/nuevo", async (req, res) => {
    const clientes = await Cliente.find();
    const choferes = await Chofer.find();
    res.render("pedidos/form", { titulo: "Nuevo pedido", clientes, choferes });
});

// POST / - Guardar validando contra el mismo middleware de la API
router.post("/", normalizarBodyWeb, validarPedido, async (req, res) => {
    await pedidoService.crearPedido(req.body);
    res.redirect("/pedidos");
});

// GET /:id/editar - Formulario de edición de pedido
router.get("/:id/editar", async (req, res) => {
    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
        return res.redirect("/pedidos");
    }

    const clientes = await Cliente.find();
    const choferes = await Chofer.find();

    res.render("pedidos/form", {
        titulo: "Editar pedido",
        pedido,
        clientes,
        choferes
    });
});

// POST /:id/editar - Guardar edición (pasa por PedidoService, igual que PUT /api/pedidos/:id)
router.post("/:id/editar", normalizarBodyWeb, validarPedido, async (req, res) => {
    await pedidoService.actualizarPedido(req.params.id, req.body);
    res.redirect("/pedidos");
});

// POST /:id/eliminar - Borrar pedido
router.post("/:id/eliminar", async (req, res) => {
    await Pedido.findByIdAndDelete(req.params.id);
    res.redirect("/pedidos");
});

// POST /:id/estado - Avanzar estado
router.post("/:id/estado", async (req, res) => {
    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
        return res.redirect("/pedidos");
    }

    const indiceActual = ESTADOS.indexOf(pedido.estado);
    if (indiceActual < ESTADOS.length - 1) {
        const siguienteEstado = ESTADOS[indiceActual + 1];
        await pedidoService.cambiarEstado(pedido.id, siguienteEstado);
    }

    res.redirect(`/pedidos/${pedido.id}`);
});

// GET /:id - Detalle (al final de las rutas GET para no solaparse)
router.get("/:id", async (req, res) => {
    const pedido = await Pedido.findById(req.params.id).populate("clienteId").populate("choferId");

    if (!pedido) {
        return res.redirect("/pedidos");
    }

    const indiceActual = ESTADOS.indexOf(pedido.estado);
    const proximoEstado = indiceActual < ESTADOS.length - 1 ? ESTADOS[indiceActual + 1] : null;

    res.render("pedidos/detalle", {
        titulo: "Detalle del pedido",
        pedido,
        cliente: pedido.clienteId,
        chofer: pedido.choferId,
        proximoEstado
    });
});

module.exports = router;
