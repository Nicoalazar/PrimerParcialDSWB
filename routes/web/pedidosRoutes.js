const express = require("express");
const router = express.Router();

const JsonRepository = require("../../repositories/JsonRepository");
const pedidoService = require("../../services/PedidoService");
const { validarPedido } = require("../../middlewares/validate");

const pedidosRepo = new JsonRepository("pedidos.json");
const clientesRepo = new JsonRepository("clientes.json");
const choferesRepo = new JsonRepository("choferes.json");

const ESTADOS = ["pendiente", "asignado", "en tránsito", "entregado"];

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

    // Reemplazamos req.body con los tipos exactos
    req.body = {
        clienteId: clienteId !== undefined ? Number(clienteId) : undefined,
        choferId: choferId !== undefined ? Number(choferId) : undefined,
        fechaHoraProgramada,
        items
    };

    next();
}

// GET / - Listado
router.get("/", (req, res) => {
    const pedidos = pedidosRepo.getAll();
    const clientes = clientesRepo.getAll();
    const choferes = choferesRepo.getAll();

    const pedidosConDatos = pedidos.map((p) => {
        const cliente = clientes.find((c) => c.id === p.clienteId);
        const chofer = choferes.find((ch) => ch.id === p.choferId);
        return {
            ...p,
            clienteNombre: cliente ? cliente.nombre : `ID ${p.clienteId}`,
            choferNombre: chofer ? chofer.nombre : `ID ${p.choferId}`
        };
    });

    res.render("pedidos/lista", { titulo: "Pedidos", pedidos: pedidosConDatos });
});

// GET /nuevo - Formulario
router.get("/nuevo", (req, res) => {
    const clientes = clientesRepo.getAll();
    const choferes = choferesRepo.getAll();
    res.render("pedidos/form", { titulo: "Nuevo pedido", clientes, choferes });
});

// POST / - Guardar validando contra el mismo middleware de la API
router.post("/", normalizarBodyWeb, validarPedido, (req, res, next) => {
    try {
        pedidoService.crearPedido(req.body);
        res.redirect("/pedidos");
    } catch (error) {
        next(error);
    }
});

// =========================================================
// RUTAS NUEVAS: EDICIÓN Y ELIMINACIÓN
// =========================================================

// GET /:id/editar - Formulario de edición de pedido
router.get("/:id/editar", (req, res) => {
    const id = Number(req.params.id);
    const pedido = pedidosRepo.getById(id);

    if (!pedido) {
        return res.redirect("/pedidos");
    }

    const clientes = clientesRepo.getAll();
    const choferes = choferesRepo.getAll();

    res.render("pedidos/form", { 
        titulo: "Editar pedido", 
        pedido, 
        clientes, 
        choferes 
    });
});

// POST /:id/editar - Guardar edición
router.post("/:id/editar", normalizarBodyWeb, validarPedido, (req, res, next) => {
    try {
        const id = Number(req.params.id);
        pedidosRepo.update(id, req.body);
        res.redirect("/pedidos");
    } catch (error) {
        next(error);
    }
});

// POST /:id/eliminar - Borrar pedido
router.post("/:id/eliminar", (req, res) => {
    const id = Number(req.params.id);
    pedidosRepo.delete(id);
    res.redirect("/pedidos");
});

// POST /:id/estado - Avanzar estado
router.post("/:id/estado", (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const pedido = pedidosRepo.getById(id);

        if (!pedido) {
            return res.redirect("/pedidos");
        }

        const indiceActual = ESTADOS.indexOf(pedido.estado);
        if (indiceActual < ESTADOS.length - 1) {
            const siguienteEstado = ESTADOS[indiceActual + 1];
            pedidoService.cambiarEstado(id, siguienteEstado);
        }

        res.redirect(`/pedidos/${id}`);
    } catch (error) {
        next(error);
    }
});

// GET /:id - Detalle (al final de las rutas GET para no solaparse)
router.get("/:id", (req, res) => {
    const id = Number(req.params.id);
    const pedido = pedidosRepo.getById(id);

    if (!pedido) {
        return res.redirect("/pedidos");
    }

    const cliente = clientesRepo.getById(pedido.clienteId);
    const chofer = choferesRepo.getById(pedido.choferId);

    const indiceActual = ESTADOS.indexOf(pedido.estado);
    const proximoEstado = indiceActual < ESTADOS.length - 1 ? ESTADOS[indiceActual + 1] : null;

    res.render("pedidos/detalle", {
        titulo: `Pedido #${pedido.id}`,
        pedido,
        cliente,
        chofer,
        proximoEstado
    });
});

module.exports = router;