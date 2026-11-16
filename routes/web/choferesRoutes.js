const express = require("express");

const router = express.Router();

const Chofer = require("../../models/Chofer");
const choferesController = require("../../controllers/choferesController");
const { validarChofer, validarChoferUpdate } = require("../../middlewares/validate");
const { autorizar } = require("../../middlewares/auth");

// app.js ya exige sesión con requiereLoginWeb. Admin y operador crean y editan;
// borrar es solo para el admin (igual que en la API).


// GET / - listado
router.get("/", choferesController.listarChoferes);


// GET /nuevo - form de alta
router.get("/nuevo", (req, res) => {

    res.render("choferes/form", { titulo: "Nuevo chofer", chofer: null });

});


// POST / - alta (mismo validarChofer que la API)
router.post("/", validarChofer, choferesController.crearChofer);


// GET /:id/editar - form de edición
router.get("/:id/editar", async (req, res) => {

    const chofer = await Chofer.findById(req.params.id);

    if (!chofer) {
        return res.redirect("/choferes");
    }

    res.render("choferes/form", { titulo: "Editar chofer", chofer });

});


// POST /:id/editar - guardar edición (mismo validarChoferUpdate que la API)
router.post("/:id/editar", validarChoferUpdate, choferesController.actualizarChofer);


// POST /:id/eliminar - baja (solo admin; rechaza si tiene pedidos asignados)
router.post("/:id/eliminar", autorizar("admin"), choferesController.eliminarChofer);


module.exports = router;
