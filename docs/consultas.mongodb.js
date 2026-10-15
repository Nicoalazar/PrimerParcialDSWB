// Playground FreshRoute B2B — solo consultas de lectura
// Cómo usarlo: seleccioná UN bloque y elegí "Run Selected Lines From Playground"
// (clic derecho o el ícono ▶ de arriba). Si corrés todo el archivo,
// solo se muestra el resultado de la última consulta.

use("freshroute");

// 1. Colecciones de la base
db.getCollectionNames();

// 2. Cantidad de documentos por colección
({
  clientes: db.clientes.countDocuments(),
  pedidos: db.pedidos.countDocuments(),
  choferes: db.choferes.countDocuments()
});

// 3. Todos los clientes
db.clientes.find();

// 4. Clientes de una zona, mostrando solo algunos campos
db.clientes.find(
  { zona: "Norte" },
  { nombre: 1, direccion: 1, horarioEntrega: 1 }
);

// 5. Todos los choferes
db.choferes.find();

// 6. Pedidos pendientes
db.pedidos.find({ estado: "pendiente" });

// 7. Pedidos que todavía no se entregaron, ordenados por fecha programada
db.pedidos
  .find({ estado: { $ne: "entregado" } })
  .sort({ fechaHoraProgramada: 1 });

// 8. Pedidos que incluyen un producto (búsqueda dentro del arreglo de ítems)
db.pedidos.find({ "items.descripcion": /pollo/i });

// 9. Cantidad de pedidos por estado
db.pedidos.aggregate([
  { $group: { _id: "$estado", cantidad: { $sum: 1 } } },
  { $sort: { cantidad: -1 } }
]);

// 10. Pedidos con el nombre del cliente y del chofer
//     (es lo mismo que hace populate() en las vistas de la app)
db.pedidos.aggregate([
  { $lookup: { from: "clientes", localField: "clienteId", foreignField: "_id", as: "cliente" } },
  { $lookup: { from: "choferes", localField: "choferId", foreignField: "_id", as: "chofer" } },
  { $unwind: "$cliente" },
  { $unwind: "$chofer" },
  {
    $project: {
      _id: 0,
      cliente: "$cliente.nombre",
      chofer: { $concat: ["$chofer.nombre", " ", "$chofer.apellido"] },
      estado: 1,
      fechaHoraProgramada: 1,
      items: 1
    }
  }
]);

// 11. Total de unidades por pedido (suma de las cantidades de los ítems)
db.pedidos.aggregate([
  { $project: { estado: 1, totalUnidades: { $sum: "$items.cantidad" } } }
]);

// 12. Cantidad de pedidos asignados a cada chofer
db.pedidos.aggregate([
  { $group: { _id: "$choferId", pedidos: { $sum: 1 } } },
  { $lookup: { from: "choferes", localField: "_id", foreignField: "_id", as: "chofer" } },
  { $unwind: "$chofer" },
  { $project: { _id: 0, chofer: "$chofer.nombre", pedidos: 1 } }
]);