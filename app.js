const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("./middlewares/logger");
const { cargarUsuario, requiereLogin, requiereLoginWeb } = require("./middlewares/auth");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

// Arma la app de Express sin conectarse a la base ni escuchar un puerto:
// de eso se encarga server.js. Así los tests pueden usarla con supertest.
const app = express();

// configuracion de vistas (Pug)
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// middlewares globales
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// si el request trae un token válido (header o cookie), deja el usuario en req.usuario
app.use(cargarUsuario);
// confirma en la base que el dueño del token sigue existiendo (y toma su rol actual)
app.use(require("./middlewares/usuarioActivo").verificarUsuarioActivo);

app.get("/", (req, res) => {
    res.render("index", { titulo: "FreshRoute B2B" });
});

// rutas API (JSON, se prueban con Postman). Todo salvo el login pide token.
app.use("/api/auth", require("./routes/api/authRoutes"));
app.use("/api/usuarios", requiereLogin, require("./routes/api/usuariosRoutes"));
app.use("/api/clientes", requiereLogin, require("./routes/api/clientesRoutes"));

const pedidosRoutes = require("./routes/api/pedidosRoutes");
app.use("/api/pedidos", requiereLogin, pedidosRoutes);
// Reemplazamos la ruta vieja de choferes que salía de pedidosRoutes por el nuevo módulo independiente:
app.use("/api/choferes", requiereLogin, require("./routes/api/choferesRoutes"));

// rutas web (vistas Pug). Sin sesión, redirigen a /login.
app.use("/", require("./routes/web/authRoutes"));
app.use("/clientes", requiereLoginWeb, require("./routes/web/clientesRoutes"));
app.use("/pedidos", requiereLoginWeb, require("./routes/web/pedidosRoutes"));
app.use("/choferes", requiereLoginWeb, require("./routes/web/choferesRoutes"));
app.use("/usuarios", requiereLoginWeb, require("./routes/web/usuariosRoutes"));

// 404 para rutas inexistentes y manejo centralizado de errores (siempre al final)
app.use(notFound);
app.use(errorHandler);

module.exports = app;



