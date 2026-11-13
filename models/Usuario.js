const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["admin", "operador"];

// Usuario del sistema (personal de FreshRoute). No hay registro abierto:
// los usuarios los da de alta un admin.
const usuarioSchema = new mongoose.Schema(
    {
        nombre: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        // select: false → nunca viaja en un find() salvo que se pida con .select("+password")
        password: { type: String, required: true, minlength: 6, select: false },
        rol: { type: String, enum: ROLES, default: "operador" }
    },
    { versionKey: false }
);

// se guarda el hash, nunca la contraseña en texto plano
usuarioSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

usuarioSchema.methods.compararPassword = function (passwordIngresada) {
    return bcrypt.compare(passwordIngresada, this.password);
};

// aunque el documento tenga el hash cargado, no se manda en las respuestas
usuarioSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.password;
        return ret;
    }
});

const Usuario = mongoose.model("Usuario", usuarioSchema, "usuarios");

module.exports = Usuario;
module.exports.ROLES = ROLES;
