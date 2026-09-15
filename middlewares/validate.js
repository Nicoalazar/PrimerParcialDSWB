// Middlewares de validación de body para POST/PUT de Clientes y Pedidos.
// Si falta algo o el tipo no es el esperado, responde 400 con { mensaje, errores }
// y no deja pasar el request al controller.
//
// POST (validarCliente / validarPedido): exige TODOS los campos, porque es un alta.
// PUT (validarClienteUpdate / validarPedidoUpdate): valida solo los campos que
// vinieron en el body (edición parcial); si no vino ninguno, responde 400.

const validarCliente = (req, res, next) => {

    const { nombre, direccion, zona, contacto, horarioEntrega } = req.body;
    const errores = [];

    if (!nombre || typeof nombre !== "string") {
        errores.push("nombre es obligatorio y debe ser texto");
    }

    if (!direccion || typeof direccion !== "string") {
        errores.push("direccion es obligatoria y debe ser texto");
    }

    if (!zona || typeof zona !== "string") {
        errores.push("zona es obligatoria y debe ser texto");
    }

    if (!contacto || typeof contacto !== "string") {
        errores.push("contacto es obligatorio y debe ser texto");
    }

    if (!horarioEntrega || typeof horarioEntrega !== "string") {
        errores.push("horarioEntrega es obligatorio y debe ser texto");
    }

    if (errores.length > 0) {

        return res.status(400).json({
            mensaje: "Datos de cliente inválidos",
            errores
        });

    }

    next();

};


const validarClienteUpdate = (req, res, next) => {

    const { nombre, direccion, zona, contacto, horarioEntrega } = req.body;
    const errores = [];

    const vinoAlgunCampo = [nombre, direccion, zona, contacto, horarioEntrega]
        .some((valor) => valor !== undefined);

    if (!vinoAlgunCampo) {
        errores.push("hay que mandar al menos un campo para actualizar");
    }

    if (nombre !== undefined && (!nombre || typeof nombre !== "string")) {
        errores.push("nombre debe ser texto");
    }

    if (direccion !== undefined && (!direccion || typeof direccion !== "string")) {
        errores.push("direccion debe ser texto");
    }

    if (zona !== undefined && (!zona || typeof zona !== "string")) {
        errores.push("zona debe ser texto");
    }

    if (contacto !== undefined && (!contacto || typeof contacto !== "string")) {
        errores.push("contacto debe ser texto");
    }

    if (horarioEntrega !== undefined && (!horarioEntrega || typeof horarioEntrega !== "string")) {
        errores.push("horarioEntrega debe ser texto");
    }

    if (errores.length > 0) {

        return res.status(400).json({
            mensaje: "Datos de cliente inválidos",
            errores
        });

    }

    next();

};


const validarPedido = (req, res, next) => {

    const { clienteId, choferId, items, fechaHoraProgramada } = req.body;
    const errores = [];

    if (clienteId === undefined || isNaN(Number(clienteId))) {
        errores.push("clienteId es obligatorio y debe ser numérico");
    }

    if (choferId === undefined || isNaN(Number(choferId))) {
        errores.push("choferId es obligatorio y debe ser numérico");
    }

    if (!Array.isArray(items) || items.length === 0) {
        errores.push("items es obligatorio y debe ser un arreglo con al menos un ítem");
    } else {
        items.forEach((item, i) => {
            if (!item.descripcion || typeof item.descripcion !== "string") {
                errores.push(`items[${i}].descripcion es obligatorio y debe ser texto`);
            }
            if (item.cantidad === undefined || isNaN(Number(item.cantidad))) {
                errores.push(`items[${i}].cantidad es obligatorio y debe ser numérico`);
            }
        });
    }

    if (!fechaHoraProgramada || typeof fechaHoraProgramada !== "string") {
        errores.push("fechaHoraProgramada es obligatoria y debe ser texto");
    }

    if (errores.length > 0) {

        return res.status(400).json({
            mensaje: "Datos de pedido inválidos",
            errores
        });

    }

    next();

};


const validarPedidoUpdate = (req, res, next) => {

    const { clienteId, choferId, items, fechaHoraProgramada } = req.body;
    const errores = [];

    const vinoAlgunCampo = [clienteId, choferId, items, fechaHoraProgramada]
        .some((valor) => valor !== undefined);

    if (!vinoAlgunCampo) {
        errores.push("hay que mandar al menos un campo para actualizar");
    }

    if (clienteId !== undefined && isNaN(Number(clienteId))) {
        errores.push("clienteId debe ser numérico");
    }

    if (choferId !== undefined && isNaN(Number(choferId))) {
        errores.push("choferId debe ser numérico");
    }

    if (items !== undefined) {
        if (!Array.isArray(items) || items.length === 0) {
            errores.push("items debe ser un arreglo con al menos un ítem");
        } else {
            items.forEach((item, i) => {
                if (!item.descripcion || typeof item.descripcion !== "string") {
                    errores.push(`items[${i}].descripcion es obligatorio y debe ser texto`);
                }
                if (item.cantidad === undefined || isNaN(Number(item.cantidad))) {
                    errores.push(`items[${i}].cantidad es obligatorio y debe ser numérico`);
                }
            });
        }
    }

    if (fechaHoraProgramada !== undefined && (!fechaHoraProgramada || typeof fechaHoraProgramada !== "string")) {
        errores.push("fechaHoraProgramada debe ser texto");
    }

    if (errores.length > 0) {

        return res.status(400).json({
            mensaje: "Datos de pedido inválidos",
            errores
        });

    }

    next();

};


module.exports = {
    validarCliente,
    validarClienteUpdate,
    validarPedido,
    validarPedidoUpdate
};