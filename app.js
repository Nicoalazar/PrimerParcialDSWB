const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// configuración de vistas (Pug)
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// vista de prueba
app.get("/", (req, res) => {
    res.render("index", { titulo: "FreshRoute B2B" });
});

// rutas API (JSON, se prueban con Thunder Client) — se montan en Sprint 2 y 3
app.use("/api/clientes", require("./routes/api/clientesRoutes"));

const pedidosRoutes = require("./routes/api/pedidosRoutes");
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/choferes", pedidosRoutes.choferesRouter);

// rutas web (vistas Pug) — se montan en Sprint 6 y 7
// app.use("/clientes", require("./routes/web/clientesRoutes"));
// app.use("/pedidos", require("./routes/web/pedidosRoutes"));

app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto " + PORT);
});
