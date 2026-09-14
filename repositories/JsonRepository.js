const fs = require("fs");
const path = require("path");

// Repositorio genérico para persistencia en archivos JSON.
// Cada módulo instancia uno con el nombre de su archivo en /data.
class JsonRepository {
    constructor(nombreArchivo) {
        this.rutaArchivo = path.join(__dirname, "../data", nombreArchivo);
    }

    // leer archivo
    leer() {
        const data = fs.readFileSync(this.rutaArchivo, "utf-8");
        return data.trim() ? JSON.parse(data) : [];
    }

    // guardar archivo
    guardar(items) {
        fs.writeFileSync(this.rutaArchivo, JSON.stringify(items, null, 2));
    }

    getAll() {
        return this.leer();
    }

    getById(id) {
        return this.leer().find(item => item.id === id) || null;
    }

    // el id se genera acá, nunca se toma del body
    create(datos) {
        const items = this.leer();
        const nuevoId = items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
        const nuevo = { id: nuevoId, ...datos };
        items.push(nuevo);
        this.guardar(items);
        return nuevo;
    }

    update(id, datos) {
        const items = this.leer();
        const indice = items.findIndex(item => item.id === id);
        if (indice === -1) return null;
        // el id no se puede pisar desde el body
        items[indice] = { ...items[indice], ...datos, id };
        this.guardar(items);
        return items[indice];
    }

    delete(id) {
        const items = this.leer();
        const nuevos = items.filter(item => item.id !== id);
        if (nuevos.length === items.length) return false;
        this.guardar(nuevos);
        return true;
    }
}

module.exports = JsonRepository;
