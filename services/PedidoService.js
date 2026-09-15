const JsonRepository = require("../repositories/JsonRepository");
const Pedido = require("../models/Pedido");

const pedidosRepo = new JsonRepository("pedidos.json");
const clientesRepo = new JsonRepository("clientes.json");
const choferesRepo = new JsonRepository("choferes.json");

const ESTADOS = ["pendiente", "asignado", "en tránsito", "entregado"];

class PedidoService {
    crearPedido(datos) {
        const { clienteId, choferId, items, fechaHoraProgramada } = datos;

        // 1. Validar existencia de clienteId en clientes.json
        const cliente = clientesRepo.getById(Number(clienteId));
        if (!cliente) {
            const error = new Error(`El cliente con id ${clienteId} no existe`);
            error.statusCode = 400;
            throw error;
        }

        // 2. Validar existencia de choferId en choferes.json
        const chofer = choferesRepo.getById(Number(choferId));
        if (!chofer) {
            const error = new Error(`El chofer con id ${choferId} no existe`);
            error.statusCode = 400;
            throw error;
        }

        // 3. Crear instancia con estado inicial 'pendiente'
        const nuevoPedido = new Pedido(
            Number(clienteId),
            Number(choferId),
            items,
            ESTADOS[0],
            fechaHoraProgramada
        );

        return pedidosRepo.create(nuevoPedido);
    }

    cambiarEstado(id, nuevoEstado) {
        const pedido = pedidosRepo.getById(Number(id));
        if (!pedido) {
            const error = new Error("Pedido no encontrado");
            error.statusCode = 404;
            throw error;
        }

        if (!ESTADOS.includes(nuevoEstado)) {
            const error = new Error(`Estado inválido. Valores permitidos: ${ESTADOS.join(", ")}`);
            error.statusCode = 400;
            throw error;
        }

        const indiceActual = ESTADOS.indexOf(pedido.estado);
        const indiceNuevo = ESTADOS.indexOf(nuevoEstado);

        // Solo transición al estado siguiente: sin saltos ni retrocesos
        if (indiceNuevo !== indiceActual + 1) {
            const error = new Error(`Transición inválida: no se puede pasar de "${pedido.estado}" a "${nuevoEstado}"`);
            error.statusCode = 400;
            throw error;
        }

        return pedidosRepo.update(Number(id), { estado: nuevoEstado });
    }
}

module.exports = new PedidoService();