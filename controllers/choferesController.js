// controllers/choferesController.js
const Chofer = require('../models/Chofer');
const Pedido = require('../models/Pedido');

// --- MÉTODOS API & WEB ---

const listarChoferes = async (req, res) => {
    try {
        const choferes = await Chofer.find();
        
        // Si la URL empieza con /api, respondemos con JSON para Postman/Tests
        if (req.originalUrl.startsWith('/api')) {
            return res.json(choferes);
        }
        
        // Si es web, renderizamos la vista Pug
        res.render('choferes/index', { choferes, usuario: req.usuario });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los choferes' });
    }
};

const crearChofer = async (req, res) => {
    try {
        const nuevoChofer = new Chofer(req.body);
        await nuevoChofer.save();
        
        if (req.originalUrl.startsWith('/api')) {
            return res.status(201).json(nuevoChofer);
        }
        
        res.redirect('/choferes');
    } catch (error) {
        if (req.originalUrl.startsWith('/api')) {
            return res.status(400).json({ error: 'Error al crear el chofer', details: error.message });
        }
        res.status(400).render('choferes/crear', { error: 'Error al crear el chofer', datos: req.body });
    }
};

const actualizarChofer = async (req, res) => {
    try {
        const { id } = req.params;
        const choferActualizado = await Chofer.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        
        if (!choferActualizado) {
            return res.status(404).json({ error: 'Chofer no encontrado' });
        }

        if (req.originalUrl.startsWith('/api')) {
            return res.json(choferActualizado);
        }
        
        res.redirect('/choferes');
    } catch (error) {
        if (req.originalUrl.startsWith('/api')) {
            return res.status(400).json({ error: 'Error al actualizar el chofer', details: error.message });
        }
        res.status(400).redirect('/choferes');
    }
};

const eliminarChofer = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar si tiene pedidos asignados usando choferId (como está en el modelo Pedido)
        const pedidosAsignados = await Pedido.findOne({ choferId: id });
        if (pedidosAsignados) {
            const mensaje = 'No se puede eliminar el chofer porque tiene pedidos asignados.';
            if (req.originalUrl.startsWith('/api')) {
                return res.status(400).json({ error: mensaje });
            }
            return res.status(400).send(mensaje);
        }

        const choferEliminado = await Chofer.findByIdAndDelete(id);
        if (!choferEliminado) {
            return res.status(404).json({ error: 'Chofer no encontrado' });
        }

        if (req.originalUrl.startsWith('/api')) {
            return res.status(204).send();
        }
        
        res.redirect('/choferes');
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el chofer' });
    }
};

module.exports = {
    listarChoferes,
    crearChofer,
    actualizarChofer,
    eliminarChofer
};



