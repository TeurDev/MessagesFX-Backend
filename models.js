const mongoose = require('mongoose');// Importar Mongoose

// Esquema de Usuario
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 1, unique: true, match: /^[a-zA-Z0-9]+$/ },    // Nombre de Usuario
    password: { type: String, required: true, minlength: 4 },                                                   // Contraseña
    image: { type: String, required: true },                                                                    // Imagen de perfil
});

// Esquema de Mensaje
const messageSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },// Referencia a Usuario que envia
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Referencia a Usuario que recibe
    message: { type: String, required: true, trim: true, minlength: 1 },        // Mensaje
    image: { type: String },                                                    // Imagen adjunta(opcional)
    sent: { type: String, required: true, trim: true, minlength: 10 },          // Fecha y hora de envio
});

// Crear Modelos
const User = mongoose.model('User', userSchema);           // Modelo de Usuario
const Message = mongoose.model('Message', messageSchema);  // Modelo de Mensaje

module.exports = { User, Message };                        // Exportar Modelos
