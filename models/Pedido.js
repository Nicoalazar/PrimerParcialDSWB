// Pedido de FreshRoute: encargo de un cliente asignado a un chofer del seed para reparto
class Pedido {
    constructor(clienteId, choferId, items, estado, fechaHoraProgramada) {
        this.clienteId = clienteId;
        this.choferId = choferId;
        this.items = items;
        this.estado = estado;
        this.fechaHoraProgramada = fechaHoraProgramada;
    }
}

module.exports = Pedido;
