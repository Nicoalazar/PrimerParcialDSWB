// Carga los datos de ejemplo de /data en MongoDB: npm run seed
// Borra las colecciones y las vuelve a llenar, así que sirve también para
// dejar la base como al principio después de probar.
require("dotenv").config();

const mongoose = require("mongoose");
const conectarDB = require("./config/db");
const Cliente = require("./models/Cliente");
const Chofer = require("./models/Chofer");
const Pedido = require("./models/Pedido");

const clientesSeed = require("./data/clientes.json");
const choferesSeed = require("./data/choferes.json");
const pedidosSeed = require("./data/pedidos.json");

const sembrar = async () => {
    await conectarDB();

    await Promise.all([Cliente.deleteMany(), Chofer.deleteMany(), Pedido.deleteMany()]);

    // en los JSON los pedidos referencian ids numéricos: se guarda la
    // equivalencia id numérico → _id de Mongo para traducirlos
    const idsClientes = {};
    for (const { id, ...datos } of clientesSeed) {
        const cliente = await Cliente.create(datos);
        idsClientes[id] = cliente._id;
    }

    const idsChoferes = {};
    for (const { id, ...datos } of choferesSeed) {
        const chofer = await Chofer.create(datos);
        idsChoferes[id] = chofer._id;
    }

    for (const { id, clienteId, choferId, ...datos } of pedidosSeed) {
        await Pedido.create({
            ...datos,
            clienteId: idsClientes[clienteId],
            choferId: idsChoferes[choferId]
        });
    }

    console.log(`Seed cargado: ${clientesSeed.length} clientes, ${choferesSeed.length} choferes, ${pedidosSeed.length} pedidos`);
};

sembrar()
    .catch((error) => {
        console.error("No se pudo cargar el seed:", error.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
