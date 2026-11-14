// Middlewares de validación de body para POST/PUT de Clientes y Pedidos,
// y para el login y el alta de usuarios.
// Si falta algo o el tipo no es el esperado, responde 400 con { mensaje, errores }
// y no deja pasar el request al controller.
//
// POST (validarCliente / validarPedido): exige TODOS los campos, porque es un alta.
// PUT (validarClienteUpdate / validarPedidoUpdate): valida solo los campos que
// vinieron en el body (edición parcial); si no vino ninguno, responde 400.
//
// clienteId y choferId tienen que tener formato de id de MongoDB (ObjectId);
// que además existan en la base lo verifica PedidoService.

const { isValidObjectId } = require("mongoose");
const { ROLES } = require("../models/Usuario");

// Responde el 400: en la API (Postman) devuelve JSON { mensaje, errores };
// en los formularios web muestra la pagina de error con la lista de errores.
const rechazar = (req, res, mensaje, errores) => {
    if (req.originalUrl.startsWith("/api")) {
        return res.status(400).json({ mensaje, errores });
    }
    res.status(400).render("error", { titulo: "Datos inválidos", status: 400, mensaje, errores });
};

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

        return rechazar(req, res, "Datos de cliente inválidos", errores);

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

        return rechazar(req, res, "Datos de cliente inválidos", errores);

    }

    next();

};


const validarPedido = (req, res, next) => {

    const { clienteId, choferId, items, fechaHoraProgramada } = req.body;
    const errores = [];

    if (!isValidObjectId(clienteId)) {
        errores.push("clienteId es obligatorio y debe ser un id de MongoDB válido");
    }

    if (!isValidObjectId(choferId)) {
        errores.push("choferId es obligatorio y debe ser un id de MongoDB válido");
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

        return rechazar(req, res, "Datos de pedido inválidos", errores);

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

    if (clienteId !== undefined && !isValidObjectId(clienteId)) {
        errores.push("clienteId debe ser un id de MongoDB válido");
    }

    if (choferId !== undefined && !isValidObjectId(choferId)) {
        errores.push("choferId debe ser un id de MongoDB válido");
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

        return rechazar(req, res, "Datos de pedido inválidos", errores);

    }

    next();

};


const validarLogin = (req, res, next) => {

    const { email, password } = req.body;
    const errores = [];

    if (!email || typeof email !== "string") {
        errores.push("email es obligatorio y debe ser texto");
    }

    if (!password || typeof password !== "string") {
        errores.push("password es obligatorio y debe ser texto");
    }

    if (errores.length > 0) {

        return rechazar(req, res, "Datos de login inválidos", errores);

    }

    next();

};


const validarUsuario = (req, res, next) => {

    const { nombre, email, password, rol } = req.body;
    const errores = [];

    if (!nombre || typeof nombre !== "string") {
        errores.push("nombre es obligatorio y debe ser texto");
    }

    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
        errores.push("email es obligatorio y debe tener formato de email");
    }

    if (!password || typeof password !== "string" || password.length < 6) {
        errores.push("password es obligatorio y debe tener al menos 6 caracteres");
    }

    if (rol !== undefined && !ROLES.includes(rol)) {
        errores.push(`rol debe ser uno de: ${ROLES.join(", ")}`);
    }

    if (errores.length > 0) {

        return rechazar(req, res, "Datos de usuario inválidos", errores);

    }

    next();

};


module.exports = {
    validarLogin,
    validarUsuario,
    validarCliente,
    validarClienteUpdate,
    validarPedido,
    validarPedidoUpdate,
    // lo reusan los validadores de otros archivos (validateUsuarios.js)
    rechazar
};