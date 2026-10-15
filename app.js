require("dotenv").config();

const express = require("express");
const path = require("path");
const conectarDB = require("./config/db");
const logger = require("./middlewares/logger");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// configuracion de vistas (Pug)
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// middlewares globales
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// vista de prueba
app.get("/", (req, res) => {
    res.render("index", { titulo: "FreshRoute B2B" });
});

// rutas API (JSON, se prueban con Postman)
app.use("/api/clientes", require("./routes/api/clientesRoutes"));

const pedidosRoutes = require("./routes/api/pedidosRoutes");
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/choferes", pedidosRoutes.choferesRouter);

// rutas web (vistas Pug)
app.use("/clientes", require("./routes/web/clientesRoutes"));
app.use("/pedidos", require("./routes/web/pedidosRoutes"));

// 404 para rutas inexistentes y manejo centralizado de errores (siempre al final)
app.use(notFound);
app.use(errorHandler);

// el servidor recién escucha cuando la base está conectada
const iniciar = async () => {
    try {
        await conectarDB();
        app.listen(PORT, () => {
            console.log("Servidor corriendo en puerto " + PORT);
        });
    } catch (error) {
        console.error("No se pudo conectar a MongoDB:", error.message);
        process.exit(1);
    }
};

iniciar();
