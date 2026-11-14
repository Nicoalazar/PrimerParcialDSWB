const Pedido = require("../models/Pedido");
const Cliente = require("../models/Cliente");
const Chofer = require("../models/Chofer");

const { ESTADOS } = Pedido;

// arma un error con statusCode para que lo responda el errorHandler
const crearError = (mensaje, statusCode) => {
    const error = new Error(mensaje);
    error.statusCode = statusCode;
    return error;
};

class PedidoService {
    async validarReferencias(clienteId, choferId) {
        if (clienteId !== undefined && !(await Cliente.exists({ _id: clienteId }))) {
            throw crearError(`El cliente con id ${clienteId} no existe`, 400);
        }

        if (choferId !== undefined && !(await Chofer.exists({ _id: choferId }))) {
            throw crearError(`El chofer con id ${choferId} no existe`, 400);
        }
    }

    async crearPedido(datos, usuarioId) {
        const { clienteId, choferId, items, fechaHoraProgramada } = datos;

        // 1. Validar que existan el cliente y el chofer en la base
        await this.validarReferencias(clienteId, choferId);

        // 2. Crear el pedido y registrar el estado inicial en el historial
        return Pedido.create({
            clienteId,
            choferId,
            items,
            estado: ESTADOS[0],
            fechaHoraProgramada,
            historial: [
                {
                    estado: ESTADOS[0],
                    usuarioId
                }
            ]
        });
    }

    async actualizarPedido(id, datos) {
        const pedido = await Pedido.findById(id);
        if (!pedido) {
            throw crearError("Pedido no encontrado", 404);
        }

        await this.validarReferencias(datos.clienteId, datos.choferId);

        // el estado no se cambia por acá, solo por cambiarEstado
        Object.assign(pedido, datos);
        return pedido.save();
    }

    async cambiarEstado(id, nuevoEstado, usuarioId) {
        const pedido = await Pedido.findById(id);
        if (!pedido) {
            throw crearError("Pedido no encontrado", 404);
        }

        if (!ESTADOS.includes(nuevoEstado)) {
            throw crearError(`Estado inválido. Valores permitidos: ${ESTADOS.join(", ")}`, 400);
        }

        const indiceActual = ESTADOS.indexOf(pedido.estado);
        const indiceNuevo = ESTADOS.indexOf(nuevoEstado);

        // Solo transición al estado siguiente: sin saltos ni retrocesos
        if (indiceNuevo !== indiceActual + 1) {
            throw crearError(`Transición inválida: no se puede pasar de "${pedido.estado}" a "${nuevoEstado}"`, 400);
        }

        pedido.estado = nuevoEstado;
        
        // Registrar la nueva transición en el historial
        pedido.historial.push({
            estado: nuevoEstado,
            usuarioId
        });

        return pedido.save();
    }
}

module.exports = new PedidoService();