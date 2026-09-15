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


module.exports = {
    validarCliente,
    validarPedido
};