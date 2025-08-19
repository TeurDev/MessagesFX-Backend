# MessageFX Backend

<a href="README_es.md"> <img src="https://img.shields.io/badge/ES-Versión en Español aquí-blue?style=for-the-badge" alt="ES"> </a>

## 📝 Description  
Backend server for **[MessageFX](https://github.com/TeurDev/MessagesFX)**, a messaging application. Built with **Node.js** and **Express**, it manages users, messages, and profile images, storing all data in **MongoDB**.


## 📖 Detailed Description  
The **[MessageFX](https://github.com/TeurDev/MessagesFX) Backend** handles all the business logic, data storage, and API endpoints for the messaging application.  

- Developed with **Node.js** and **Express**.  
- Connects to a **MongoDB** database for persistent storage of users and messages.  
- Uses a **middleware** to manage authentication with **tokens** that last one day for login verification.  

### 🗂️ Data Models
The system uses two main models:

- **User**  
  - Name  
  - Password  
  - Avatar image  

- **Message**  
  - `from`: sender of the message  
  - `to`: recipient of the message  
  - `message`: text message  
  - `image`: optional image attached to the message  
  - `send`: date and time of sending  

### 🔄 API Routes
#### Users:
- Register a new user  
- Upload/update avatar image  
- Login with username and password  
- List all registered users  

#### Messages:
- Send a message  
- Get messages with a specific user (by ID)  
- Delete a message (by ID)  

#### Images:
- Update user avatar in base64 format  

### 🔧 Main Technologies
- **Runtime:** Node.js  
- **Framework:** Express  
- **Database:** MongoDB (NoSQL)  
- **Authentication:** Token-based (valid for 1 day)  
