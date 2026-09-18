# Post para la "oficina del grupo" (campus)

Lo publica **un solo integrante**. Copiar el texto de abajo, reemplazar los `<<COMPLETAR>>` y pegarlo en el foro. Ahí el profesor deja la devolución.

---

**Empresa de Desarrollo:** LosBuleanos

**Caso asignado:** #<<COMPLETAR>> — FreshRoute B2B (logística de distribución refrigerada)

**Comentario:**

Para esta primera entrega desarrollamos el backend de FreshRoute B2B en Node.js y Express 5 con esquema MVC y persistencia en archivos JSON. Implementamos dos módulos funcionales con CRUD completo, **Clientes** y **Pedidos**, cada uno con su API REST (probada con Postman) y sus vistas web en Pug. Los pedidos referencian a un cliente y a un chofer del seed, tienen una lista de ítems y un estado que solo puede avanzar de a un paso (`pendiente → asignado → en tránsito → entregado`), regla que aplica un servicio de negocio (`PedidoService`) junto con la validación de que el cliente y el chofer existan.

Agregamos middlewares de logging, validación de datos y manejo centralizado de errores (400 / 404 / 500), un repositorio genérico para leer y escribir los JSON, y una colección Postman con evidencia de cada endpoint. Trabajamos en sprints cortos con ramas por sprint, pull requests y revisión cruzada. Para la segunda entrega queda el módulo de Choferes con CRUD completo y la migración de la persistencia a MongoDB.

**Link a la carpeta Drive:** <<COMPLETAR>>

**Repositorio:** https://github.com/Nicoalazar/PrimerParcialDSWB

**Integrantes:**

- Nicolás Zalazar
- Laura Olivera
- Christian Albornoz
- Belén Lau
- Fernando Guevara
