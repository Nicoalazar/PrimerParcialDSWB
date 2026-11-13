const mongoose = require("mongoose");
const config = require("./index");

// Conexión única a MongoDB. Por defecto usa MONGO_URI (local o Atlas);
// los tests le pasan su propia URI para no tocar la base de desarrollo.
const conectarDB = async (uri = config.mongoUri) => {
    await mongoose.connect(uri);

    console.log("MongoDB conectado: " + mongoose.connection.name);
};

module.exports = conectarDB;
