// Cliente de FreshRoute: restaurante, comedor o cocina industrial
class Cliente {
    constructor(nombre, direccion, zona, contacto, horarioEntrega) {
        this.nombre = nombre;
        this.direccion = direccion;
        this.zona = zona;
        this.contacto = contacto;
        this.horarioEntrega = horarioEntrega;
    }
}

module.exports = Cliente;
