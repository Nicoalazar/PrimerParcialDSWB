const mongoose = require("mongoose");

// Conexión única a MongoDB. La URI sale de .env (MONGO_URI); si no está,
// se usa una base local.
const conectarDB = async () => {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/freshroute";

    await mongoose.connect(uri);

    console.log("MongoDB conectado: " + mongoose.connection.name);
};

module.exports = conectarDB;
