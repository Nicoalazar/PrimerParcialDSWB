require("dotenv").config();

// Configuración de la app en un solo lugar: el resto del código lee de acá
// y no de process.env directamente.
const config = {
    entorno: process.env.NODE_ENV || "development",
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/freshroute",
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h"
};

// sin secreto no se pueden firmar tokens: mejor fallar al arrancar que en el primer login
if (!config.jwtSecret) {
    throw new Error("Falta la variable de entorno JWT_SECRET (ver .env.example)");
}

module.exports = config;
