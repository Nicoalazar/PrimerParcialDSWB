const express = require('express');
const router = express.Router();
const choferesController = require('../../controllers/choferesController');
const { requiereLogin, autorizar } = require('../../middlewares/auth');
const { validarChofer, validarChoferUpdate } = require('../../middlewares/validate');

// Listar todos los choferes
router.get('/', requiereLogin, choferesController.listarChoferes);

// Obtener un chofer por ID
router.get('/:id', requiereLogin, choferesController.obtenerChoferPorId);

// Crear chofer (admin y operador, según el README)
router.post('/', requiereLogin, autorizar('admin', 'operador'), validarChofer, choferesController.crearChofer);

// Actualizar chofer (admin y operador)
router.put('/:id', requiereLogin, autorizar('admin', 'operador'), validarChoferUpdate, choferesController.actualizarChofer);

// Eliminar chofer (SOLO administradores)
router.delete('/:id', requiereLogin, autorizar('admin'), choferesController.eliminarChofer);

module.exports = router;
