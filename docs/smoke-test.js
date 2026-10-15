const BASE = process.argv[2] || process.env.BASE_URL || "http://localhost:3000";

// ObjectId con formato válido que no existe en la base (para probar los 404)
const ID_INEXISTENTE = "000000000000000000000000";

let ok = 0;
let fallos = 0;
const creados = { clientes: [], pedidos: [] };

async function pedir(metodo, ruta, body) {
    // redirect manual: si no, fetch sigue el 302 y siempre veríamos un 200
    const opciones = { method: metodo, redirect: "manual" };

    if (body !== undefined) {
        opciones.headers = { "Content-Type": "application/json" };
        opciones.body = JSON.stringify(body);
    }

    const respuesta = await fetch(BASE + ruta, opciones);
    const texto = await respuesta.text();

    let datos = texto;
    try {
        datos = JSON.parse(texto);
    } catch (e) {
        // las rutas web devuelven HTML, se deja el texto crudo
    }

    return { status: respuesta.status, datos };
}

async function verificar(descripcion, esperado, metodo, ruta, body) {
    const { status, datos } = await pedir(metodo, ruta, body);
    const paso = status === esperado;

    if (paso) {
        ok++;
    } else {
        fallos++;
    }

    const marca = paso ? "OK  " : "FALLA";
    const detalle = datos && datos.mensaje ? ` — ${datos.mensaje}` : "";
    console.log(`${marca} [${status}/${esperado}] ${metodo} ${ruta} · ${descripcion}${detalle}`);

    return datos;
}

async function main() {
    console.log(`\nSmoke test contra ${BASE}\n${"=".repeat(60)}`);

    console.log("\n--- Módulo Clientes (API) ---");
    const clientes = await verificar("listar", 200, "GET", "/api/clientes");
    const idClienteSeed = clientes.length ? clientes[0]._id : ID_INEXISTENTE;
    await verificar("obtener por id", 200, "GET", `/api/clientes/${idClienteSeed}`);
    await verificar("id inexistente", 404, "GET", `/api/clientes/${ID_INEXISTENTE}`);
    await verificar("id con formato inválido", 400, "GET", "/api/clientes/abc");

    const alta = await verificar("alta válida", 201, "POST", "/api/clientes", {
        nombre: "SMOKE TEST",
        direccion: "Calle Falsa 123",
        zona: "Centro",
        contacto: "QA - 11 0000 0000",
        horarioEntrega: "08:00 a 09:00"
    });

    const idCliente = alta && alta.cliente ? alta.cliente._id : null;
    if (idCliente) creados.clientes.push(idCliente);

    await verificar("alta sin campos", 400, "POST", "/api/clientes", {});
    await verificar("alta con campo de tipo incorrecto", 400, "POST", "/api/clientes", {
        nombre: 123,
        direccion: "x",
        zona: "x",
        contacto: "x",
        horarioEntrega: "x"
    });
    await verificar("edición parcial", 200, "PUT", `/api/clientes/${idCliente}`, { zona: "Norte" });
    await verificar("edición sin campos", 400, "PUT", `/api/clientes/${idCliente}`, {});
    await verificar("edición de inexistente", 404, "PUT", `/api/clientes/${ID_INEXISTENTE}`, { zona: "Norte" });
    await verificar("baja de inexistente", 404, "DELETE", `/api/clientes/${ID_INEXISTENTE}`);

    console.log("\n--- Choferes (solo lectura) ---");
    const choferes = await verificar("listar choferes", 200, "GET", "/api/choferes");
    const idChofer = choferes.length ? choferes[0]._id : ID_INEXISTENTE;
    await verificar("alta de chofer no existe", 404, "POST", "/api/choferes", { nombre: "x" });
    await verificar("baja de chofer no existe", 404, "DELETE", `/api/choferes/${idChofer}`);

    console.log("\n--- Módulo Pedidos (API) ---");
    const pedidos = await verificar("listar", 200, "GET", "/api/pedidos");
    const idPedidoSeed = pedidos.length ? pedidos[0]._id : ID_INEXISTENTE;
    await verificar("obtener por id", 200, "GET", `/api/pedidos/${idPedidoSeed}`);
    await verificar("id inexistente", 404, "GET", `/api/pedidos/${ID_INEXISTENTE}`);

    const altaPedido = await verificar("alta válida", 201, "POST", "/api/pedidos", {
        clienteId: idCliente,
        choferId: idChofer,
        items: [{ descripcion: "Cajón de prueba", cantidad: 1 }],
        fechaHoraProgramada: "2026-09-30T08:00:00"
    });

    const idPedido = altaPedido && altaPedido.pedido ? altaPedido.pedido._id : null;
    if (idPedido) creados.pedidos.push(idPedido);

    if (altaPedido && altaPedido.pedido && altaPedido.pedido.estado !== "pendiente") {
        fallos++;
        console.log(`FALLA el pedido nuevo debería nacer en "pendiente" y nació en "${altaPedido.pedido.estado}"`);
    }

    await verificar("alta con cliente inexistente", 400, "POST", "/api/pedidos", {
        clienteId: ID_INEXISTENTE,
        choferId: idChofer,
        items: [{ descripcion: "x", cantidad: 1 }],
        fechaHoraProgramada: "2026-09-30T08:00:00"
    });
    await verificar("alta con chofer inexistente", 400, "POST", "/api/pedidos", {
        clienteId: idCliente,
        choferId: ID_INEXISTENTE,
        items: [{ descripcion: "x", cantidad: 1 }],
        fechaHoraProgramada: "2026-09-30T08:00:00"
    });
    await verificar("alta con clienteId mal formado", 400, "POST", "/api/pedidos", {
        clienteId: 1,
        choferId: idChofer,
        items: [{ descripcion: "x", cantidad: 1 }],
        fechaHoraProgramada: "2026-09-30T08:00:00"
    });
    await verificar("alta sin items", 400, "POST", "/api/pedidos", {
        clienteId: idCliente,
        choferId: idChofer,
        items: [],
        fechaHoraProgramada: "2026-09-30T08:00:00"
    });
    await verificar("alta con cantidad 0 (la rechaza el schema)", 400, "POST", "/api/pedidos", {
        clienteId: idCliente,
        choferId: idChofer,
        items: [{ descripcion: "x", cantidad: 0 }],
        fechaHoraProgramada: "2026-09-30T08:00:00"
    });
    await verificar("edición parcial", 200, "PUT", `/api/pedidos/${idPedido}`, {
        fechaHoraProgramada: "2026-10-01T09:00:00"
    });
    await verificar("edición de inexistente", 404, "PUT", `/api/pedidos/${ID_INEXISTENTE}`, {
        fechaHoraProgramada: "2026-10-01T09:00:00"
    });

    console.log("\n--- Transiciones de estado ---");
    await verificar("pendiente → asignado", 200, "PATCH", `/api/pedidos/${idPedido}/estado`, { estado: "asignado" });
    await verificar("salto asignado → entregado", 400, "PATCH", `/api/pedidos/${idPedido}/estado`, { estado: "entregado" });
    await verificar("retroceso asignado → pendiente", 400, "PATCH", `/api/pedidos/${idPedido}/estado`, { estado: "pendiente" });
    await verificar("estado inexistente", 400, "PATCH", `/api/pedidos/${idPedido}/estado`, { estado: "cancelado" });
    await verificar("sin estado en el body", 400, "PATCH", `/api/pedidos/${idPedido}/estado`, {});
    await verificar("asignado → en tránsito", 200, "PATCH", `/api/pedidos/${idPedido}/estado`, { estado: "en tránsito" });
    await verificar("en tránsito → entregado", 200, "PATCH", `/api/pedidos/${idPedido}/estado`, { estado: "entregado" });
    await verificar("pedido inexistente", 404, "PATCH", `/api/pedidos/${ID_INEXISTENTE}/estado`, { estado: "asignado" });

    console.log("\n--- 404 ---");
    await verificar("ruta inexistente", 404, "GET", "/api/loquesea");

    console.log("\n--- Vistas web ---");
    await verificar("home", 200, "GET", "/");
    await verificar("listado de clientes", 200, "GET", "/clientes");
    await verificar("form de alta de cliente", 200, "GET", "/clientes/nuevo");
    await verificar("form de edición de cliente", 200, "GET", `/clientes/${idCliente}/editar`);
    await verificar("listado de pedidos", 200, "GET", "/pedidos");
    await verificar("form de alta de pedido", 200, "GET", "/pedidos/nuevo");
    await verificar("form de edición de pedido", 200, "GET", `/pedidos/${idPedido}/editar`);
    await verificar("detalle de pedido", 200, "GET", `/pedidos/${idPedido}`);
    await verificar("detalle inexistente redirige", 302, "GET", `/pedidos/${ID_INEXISTENTE}`);

    console.log("\n--- Limpieza ---");
    for (const id of creados.pedidos) {
        await verificar("borrar pedido de prueba", 200, "DELETE", `/api/pedidos/${id}`);
    }
    for (const id of creados.clientes) {
        await verificar("borrar cliente de prueba", 200, "DELETE", `/api/clientes/${id}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log(`${ok} OK · ${fallos} FALLA(S)`);
    console.log("Si algo quedó a medias, npm run seed deja la base como al principio\n");

    process.exit(fallos > 0 ? 1 : 0);
}

main().catch((error) => {
    console.error("\nNo se pudo completar el smoke test:", error.message);
    console.error(`¿Está levantado el servidor en ${BASE}?`);
    process.exit(1);
});
