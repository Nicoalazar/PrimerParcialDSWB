// routes/api/choferesRoutes.js
const express = require('express');
const router = express.Router();
const choferesController = require('../../controllers/choferesController');
const { requiereLogin, autorizar } = require('../../middlewares/auth');
const { validarChofer, validarChoferUpdate } = require('../../middlewares/validate');

// Listar todos los choferes (requiere estar logueado)
router.get('/', requiereLogin, choferesController.listarChoferes);

// Crear chofer (requiere estar logueado, validamos el body)
router.post('/', requiereLogin, validarChofer, choferesController.crearChofer);

// Actualizar chofer (requiere estar logueado, validamos la actualización parcial/total)
router.put('/:id', requiereLogin, validarChoferUpdate, choferesController.actualizarChofer);

// Eliminar chofer (solo administradores, como pide el issue)
router.delete('/:id', requiereLogin, autorizar('admin'), choferesController.eliminarChofer);

module.exports = router;