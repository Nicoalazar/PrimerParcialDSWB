const Chofer = require('../models/Chofer');
const Pedido = require('../models/Pedido');

// Helper para crear errores con statusCode para el errorHandler de Express 5
const crearError = (mensaje, statusCode) => {
    const error = new Error(mensaje);
    error.statusCode = statusCode;
    return error;
};

// GET /api/choferes o /choferes
const listarChoferes = async (req, res) => {
    const choferes = await Chofer.find();
    
    if (req.originalUrl.startsWith('/api')) {
        return res.json(choferes);
    }
    
    res.render('choferes/index', { choferes, usuario: req.usuario, titulo: 'Listado de Choferes' });
};

// GET /api/choferes/:id
const obtenerChoferPorId = async (req, res) => {
    const chofer = await Chofer.findById(req.params.id);
    if (!chofer) {
        throw crearError("Chofer no encontrado", 404);
    }
    res.json(chofer);
};

// POST /api/choferes o /choferes/crear
const crearChofer = async (req, res) => {
    const { nombre, apellido, vehiculo, zona } = req.body;

    const nuevoChofer = await Chofer.create({
        nombre,
        apellido,
        vehiculo,
        zona
    });
    
    if (req.originalUrl.startsWith('/api')) {
        return res.status(201).json(nuevoChofer);
    }
    
    res.redirect('/choferes');
};

// PUT /api/choferes/:id o POST /choferes/actualizar/:id
const actualizarChofer = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, vehiculo, zona } = req.body;

    const choferActualizado = await Chofer.findByIdAndUpdate(
        id,
        { nombre, apellido, vehiculo, zona },
        { new: true, runValidators: true }
    );
    
    if (!choferActualizado) {
        throw crearError("Chofer no encontrado", 404);
    }

    if (req.originalUrl.startsWith('/api')) {
        return res.json(choferActualizado);
    }
    
    res.redirect('/choferes');
};

// DELETE /api/choferes/:id o POST /choferes/eliminar/:id
const eliminarChofer = async (req, res) => {
    const { id } = req.params;

    // Validar si tiene pedidos asignados
    const pedidosAsignados = await Pedido.findOne({ choferId: id });
    if (pedidosAsignados) {
        throw crearError('No se puede eliminar el chofer porque tiene pedidos asignados.', 400);
    }

    const choferEliminado = await Chofer.findByIdAndDelete(id);
    if (!choferEliminado) {
        throw crearError("Chofer no encontrado", 404);
    }

    if (req.originalUrl.startsWith('/api')) {
        return res.status(204).send();
    }
    
    res.redirect('/choferes');
};

module.exports = {
    listarChoferes,
    obtenerChoferPorId,
    crearChofer,
    actualizarChofer,
    eliminarChofer
};

