// Utilidades compartidas por los tests (node:test + supertest).
// Cada archivo de test levanta su propia MongoDB en memoria con
// mongodb-memory-server: no hace falta tener Mongo instalado y nunca se toca
// la base de desarrollo ni la de Atlas.

// valores fijos para que los tests no dependan del .env de cada uno
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "secreto-solo-para-tests";

const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const Usuario = require("../models/Usuario");
const Cliente = require("../models/Cliente");
const Chofer = require("../models/Chofer");

const ID_INEXISTENTE = "000000000000000000000000";

let servidor;

// el logger y los warnings del errorHandler ensucian la salida de los tests
const silenciarLogs = () => {
    console.log = () => {};
    console.warn = () => {};
};

const iniciarBase = async () => {
    silenciarLogs();
    servidor = await MongoMemoryServer.create();
    await mongoose.connect(servidor.getUri());
};

const cerrarBase = async () => {
    await mongoose.disconnect();
    await servidor.stop();
};

// Carga un admin, un operador, un cliente y un chofer, y devuelve sus ids
// junto con un token de cada usuario (obtenido por el login real).
const cargarDatos = async () => {
    await mongoose.connection.dropDatabase();

    await Usuario.create({ nombre: "Admin", email: "admin@test.com", password: "admin123", rol: "admin" });
    await Usuario.create({ nombre: "Operador", email: "operador@test.com", password: "operador123", rol: "operador" });

    const cliente = await Cliente.create({
        nombre: "Restaurante Test",
        direccion: "Calle 1",
        zona: "Centro",
        contacto: "11 1111 1111",
        horarioEntrega: "08:00 a 10:00"
    });

    const chofer = await Chofer.create({ nombre: "Juan", apellido: "Pérez", vehiculo: "Camión 1", zona: "Centro" });

    const tokenAdmin = await obtenerToken("admin@test.com", "admin123");
    const tokenOperador = await obtenerToken("operador@test.com", "operador123");

    return {
        idCliente: cliente.id,
        idChofer: chofer.id,
        tokenAdmin,
        tokenOperador
    };
};

const obtenerToken = async (email, password) => {
    const respuesta = await request(app).post("/api/auth/login").send({ email, password });
    return respuesta.body.token;
};

module.exports = {
    app,
    request,
    ID_INEXISTENTE,
    iniciarBase,
    cerrarBase,
    cargarDatos
};
