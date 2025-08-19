# MessageFX Backend

<a href="README.md"> <img src="https://img.shields.io/badge/EN-English Version here-red?style=for-the-badge" alt="EN"> </a>

## 📝 Descripción  
Servidor backend para **[MessageFX](https://github.com/TeurDev/MessagesFX)**, una aplicación de mensajería. Construido con **Node.js** y **Express**, gestiona usuarios, mensajes e imágenes de perfil, almacenando todos los datos en **MongoDB**.

## 📖 Descripción Detallada  
El **backend de [MessageFX](https://github.com/TeurDev/MessagesFX)** gestiona toda la lógica, almacenamiento de datos y endpoints API para la aplicación de mensajería.  

- Desarrollado con **Node.js** y **Express**.  
- Conecta con una base de datos **MongoDB** para almacenar usuarios y mensajes de manera persistente.  
- Utiliza un **middleware** para la autenticación mediante **tokens** que duran un día para verificar los logins.  

### 🗂️ Modelos de Datos
El sistema utiliza dos modelos principales:

- **Usuario**  
  - Nombre  
  - Contraseña  
  - Imagen de avatar  

- **Mensaje**  
  - `from`: remitente del mensaje  
  - `to`: destinatario del mensaje  
  - `message`: texto del mensaje  
  - `image`: imagen opcional adjunta al mensaje  
  - `send`: fecha y hora de envío  

### 🔄 Rutas de la API
#### Usuarios:
- Registrar un nuevo usuario  
- Subir/actualizar avatar  
- Iniciar sesión con usuario y contraseña  
- Listar todos los usuarios registrados  

#### Mensajes:
- Enviar un mensaje  
- Obtener mensajes con un usuario específico (por ID)  
- Eliminar un mensaje (por ID)  

#### Imágenes:
- Actualizar avatar de usuario en formato base64  

### 🔧 Tecnologías Principales
- **Runtime:** Node.js  
- **Framework:** Express  
- **Base de datos:** MongoDB (NoSQL)  
- **Autenticación:** Basada en token (válido por 1 día)  
