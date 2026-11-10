const express = require("express");

const router = express.Router();

const AuthService = require("../../services/AuthService");
const config = require("../../config");

// En la web el token viaja en una cookie httpOnly (el JavaScript del navegador
// no la puede leer) en lugar del header Authorization que usa la API.
// Es una cookie de sesión: el vencimiento real lo marca el propio token (JWT_EXPIRES_IN).
const opcionesCookie = {
    httpOnly: true,
    sameSite: "lax",
    secure: config.entorno === "production"
};


// GET /login - formulario
router.get("/login", (req, res) => {

    if (req.usuario) return res.redirect("/pedidos");

    res.render("auth/login", { titulo: "Iniciar sesión" });

});


// POST /login - usa el mismo AuthService que POST /api/auth/login
router.post("/login", async (req, res) => {

    const { email, password } = req.body;

    try {
        const { token } = await AuthService.login(email || "", password || "");
        res.cookie("token", token, opcionesCookie);
        res.redirect("/pedidos");
    } catch (error) {
        // credenciales incorrectas: se vuelve a mostrar el form con el mensaje.
        // Cualquier otro error sigue al errorHandler.
        if (error.statusCode !== 401) throw error;
        res.status(401).render("auth/login", { titulo: "Iniciar sesión", error: error.message, email });
    }

});


// POST /logout - borra la cookie
router.post("/logout", (req, res) => {

    res.clearCookie("token");

    res.redirect("/login");

});


module.exports = router;
