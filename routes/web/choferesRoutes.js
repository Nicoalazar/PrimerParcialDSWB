const express = require('express');
const router = express.Router();
const choferesController = require('../../controllers/choferesController');
const { autorizar } = require('../../middlewares/auth');
const { validarChofer, validarChoferUpdate } = require('../../middlewares/validate');
const Chofer = require('../../models/Chofer');

// Listado web
router.get('/', choferesController.listarChoferes);

// Formulario de alta (admin y operador)
router.get('/nuevo', autorizar('admin', 'operador'), (req, res) => {
    res.render('choferes/crear', { titulo: 'Nuevo Chofer', chofer: null });
});
router.post('/', autorizar('admin', 'operador'), validarChofer, choferesController.crearChofer);

// Formulario de edición (admin y operador)
router.get('/:id/editar', autorizar('admin', 'operador'), async (req, res) => {
    const chofer = await Chofer.findById(req.params.id);
    if (!chofer) {
        return res.redirect('/choferes');
    }
    res.render('choferes/editar', { titulo: 'Editar Chofer', chofer });
});
router.post('/:id/actualizar', autorizar('admin', 'operador'), validarChoferUpdate, choferesController.actualizarChofer);

// Baja web (SOLO administradores)
router.post('/:id/eliminar', autorizar('admin'), choferesController.eliminarChofer);

module.exports = router;