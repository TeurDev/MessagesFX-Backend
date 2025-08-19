// Importar los módulos necesarios
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const sha256 = require('sha256');
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer');
require('dotenv').config(); // Cargar variables de entorno

const { User, Message } = require('./models');      // Importar Modelos

// Configuración
const app = express();  // Crear la aplicación Express

app.use(express.static('public'));
app.use('/img', express.static(__dirname + '/img'));    // Ruta para servir imágenes
app.use(express.json({ limit: '10mb' }));               // Recibir JSON con límite de 10MB
app.use(express.urlencoded({ limit: '10mb', extended: true }));   

// Usar variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro';  // Clave secreta para firmar el token
const PORT = process.env.PORT || 8080;

// Conectar a MongoDB usando la variable de entorno
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Conectado a MongoDB correctamente"))
.catch((error) => console.error("Error al conectar a MongoDB:", error));

// Middleware para manejar archivos demasiado grandes
app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        res.status(413).send({ ok: false, error: 'El archivo es demasiado grande.' });
    } else {
        next(err); // Pasar el error a otros manejadores
    }
});

// --- MIDDLEWARES --- //

// Middleware de autenticación con JWT y verificar el token
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];     // Obtener el token del encabezado
    if (!token) {
        console.log("Error: Token no proporcionado");
        return res.status(401).send({ ok: false, error: "Token no proporcionado" });
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET); // Decodifica el token
        console.log("Token válido, ID del usuario:", decoded.id); 
        req.userId = decoded.id; // Guarda el ID del usuario
        next();
    } catch (error) {
        console.log("Error al validar token:", error.message);
        res.status(401).send({ ok: false, error: "Token inválido" });// Enviar respuesta de error
    }
};

// --- RUTAS PARA USUARIOS --- //

// Registrar un usuario con subida de imagen
app.post('/register', async (req, res) => {
    const { name, password, image } = req.body;

    // Validar que se proporcionen los datos requeridos
    if (!name || !password || !image) {
        return res.status(400).send({ ok: false, error: "Faltan campos requeridos" });
    }

    try {
        const hashedPassword = sha256(password);

        // Generar un nombre único para la imagen y guardar el archivo
        const filePath = `img/${Date.now()}.jpg`;                   // Ruta de la imagen
        fs.writeFileSync(filePath, Buffer.from(image, 'base64'));   // Guardar la imagen

        // Crear el usuario en la base de datos
        const newUser = new User({
            name,
            password: hashedPassword,
            image: filePath, // Ruta de la imagen
        });

        await newUser.save();
        res.send({ ok: true });
    } catch (error) {
        console.error("Error al registrar usuario:", error.message);
        res.status(500).send({ ok: false, error: "Error al registrar usuario" });
    }
});

// Iniciar sesión con usuario y contraseña
app.post('/login', async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).send({ ok: false, error: "Faltan campos requeridos" });
    }

    const hashedPassword = sha256(password); // Encriptar la contraseña
    const user = await User.findOne({ name, password: hashedPassword }); // Buscar usuario

    if (!user) {
        return res.status(401).send({ ok: false, error: "Usuario o contraseña incorrectos" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });  // Crear token JWT que expira en 1 día

    res.send({ ok: true, token, name: user.name, image: user.image });
});

// Listar usuarios registrados
app.get('/users', authenticate, async (req, res) => {
    try {
        const users = await User.find();
        res.send({ ok: true, users });
    } catch (error) {
        res.status(500).send({ ok: false, error: "Error al obtener usuarios" });
    }
});

// --- RUTAS PARA MENSAJES --- //

// Enviar un mensaje
app.post('/messages', authenticate, async (req, res) => {
    const { to, message, image } = req.body;

    if (!to || !message) {
        return res.status(400).send({ ok: false, error: "Faltan campos requeridos" });
    }

    let filePath = null;
    if (image) {
        filePath = `img/${Date.now()}.jpg`;
        fs.writeFileSync(filePath, Buffer.from(image, 'base64'));
    }

    const sentTime = new Date().toISOString(); // Fecha y hora actual para el mensaje
    const newMessage = new Message({
        from: req.userId,
        to,
        message,
        image: filePath,
        sent: sentTime,
    });

    try {
        await newMessage.save();
        res.send({ ok: true, newMessage });
    } catch (error) {
        console.error("Error al enviar mensaje:", error.message);
        res.status(500).send({ ok: false, error: "Error al enviar mensaje" });
    }
});

// Obtener mensajes con un usuario por su ID 
app.get('/messages/:id', authenticate, async (req, res) => {
    try {
        const messages = await Message.find({ to: req.params.id }).populate('from', 'name image');
        res.send({ ok: true, messages });
    } catch (error) {
        res.status(500).send({ ok: false, error: "Error al obtener mensajes" });
    }
});

// Eliminar un mensaje por su ID 
app.delete('/messages/:id', authenticate, async (req, res) => {
    const messageId = req.params.id;

    try {
        // Buscar el mensaje por su ID
        const message = await Message.findById(messageId);

        // Validar si el mensaje existe
        if (!message) {
            return res.status(404).send({ ok: false, error: "Mensaje no encontrado" });
        }

        // Eliminar el mensaje
        await Message.findByIdAndDelete(messageId);

        res.send({ ok: true, message: "Mensaje eliminado correctamente" });
    } catch (error) {
        res.status(500).send({ ok: false, error: "Error al eliminar el mensaje", details: error.message });
    }
});

// --- RUTAS PARA IMAGENES --- //

// Actualizar la imagen de un usuario en base64
app.put('/users', authenticate, async (req, res) => {
    const { image } = req.body;

    if (!image) {
        return res.status(400).send({ ok: false, error: "No se proporcionó ninguna imagen" });
    }

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).send({ ok: false, error: "Usuario no encontrado" });
        }

        // Generar un nombre único para la imagen y guardar el archivo
        const filePath = `img/${Date.now()}.jpg`;                 // Ruta de la imagen
        fs.writeFileSync(filePath, Buffer.from(image, 'base64')); // Guardar la imagen

        // Actualizar la ruta de la imagen en la base de datos
        user.image = filePath;
        await user.save();

        res.send({ ok: true, user });
    } catch (error) {
        console.error("Error al actualizar imagen de usuario:", error.message);
        res.status(500).send({ ok: false, error: "Error al actualizar la imagen" });
    }
});

// Iniciar el servidor
app.listen(PORT, () => { 
    console.log(`Servidor alojado en http://localhost:${PORT} `);  // Depuración
});
