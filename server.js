// Punto de entrada: conecta a MongoDB y recién ahí levanta el servidor.
// La app (rutas y middlewares) está en app.js, separada para poder testearla
// sin abrir un puerto.
const app = require("./app");
const config = require("./config");
const conectarDB = require("./config/db");

const iniciar = async () => {
    try {
        await conectarDB();
        app.listen(config.port, () => {
            console.log("Servidor corriendo en puerto " + config.port);
        });
    } catch (error) {
        console.error("No se pudo conectar a MongoDB:", error.message);
        process.exit(1);
    }
};

iniciar();
