// routes/web/choferesRoutes.js
const express = require('express');
const router = express.Router();
const choferesController = require('../../controllers/choferesController');
const { autorizar } = require('../../middlewares/auth');
const Chofer = require('../../models/Chofer');

// Listado web (como app.js ya protege con requiereLoginWeb, acá solo listamos)
router.get('/', choferesController.listarChoferes);

// Formulario de alta (solo admin)
router.get('/crear', autorizar('admin'), (req, res) => {
    res.render('choferes/crear', { titulo: 'Nuevo Chofer', chofer: null });
});
router.post('/', autorizar('admin'), choferesController.crearChofer);

// Formulario de edición (solo admin)
router.get('/editar/:id', autorizar('admin'), async (req, res) => {
    try {
        const chofer = await Chofer.findById(req.params.id);
        if (!chofer) {
            return res.redirect('/choferes');
        }
        res.render('choferes/editar', { titulo: 'Editar Chofer', chofer });
    } catch (error) {
        res.status(500).send('Error al cargar el formulario de edición');
    }
});
router.post('/actualizar/:id', autorizar('admin'), choferesController.actualizarChofer);

// Baja web (solo admin, tal como pide el issue)
router.post('/eliminar/:id', autorizar('admin'), choferesController.eliminarChofer);

module.exports = router;

