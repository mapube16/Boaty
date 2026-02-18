# Boaty - Landing Page & Registro de Proveedores 🚢✨

**Boaty** es una plataforma premium on-demand diseñada para conectar a proveedores de servicios náuticos (lanchas, veleros, yates) con el turismo más exclusivo. Este repositorio contiene la landing page principal y el sistema backend para el registro de nuevos socios.

## 🌟 Características

-   **Identidad Visual Premium**: Diseño minimalista y elegante basado en la marca oficial (Azul Marino, Naranja, Crema).
-   **Tipografía de Lujo**: Uso de fuentes *Outfit* para títulos dramáticos e *Inter* para legibilidad.
-   **Experiencia Inmersiva**: Efectos de glassmorphism, parallax y animaciones suaves con Framer Motion.
-   **Registro Automatizado**: Formulario con validación en tiempo real conectado a una base de datos segura.
-   **Backend Robusto**: API construida con Node.js y Express con integración directa a MongoDB Atlas.

## 🛠️ Stack Tecnológico

-   **Frontend**: React + Vite, Tailwind CSS, Framer Motion, Lucide Icons.
-   **Backend**: Node.js, Express, Mongoose.
-   **Base de Datos**: MongoDB Atlas (Cloud).
-   **Dev Ops**: Concurrently para entorno de desarrollo unificado.

## 🚀 Instalación y Uso

### 1. Clonar el repositorio
```bash
git clone <url-del-repo>
cd Boaty
```

### 2. Instalar dependencias
Debes instalar las dependencias tanto en la raíz (frontend) como en la carpeta del servidor.
```bash
npm install
npm --prefix server install
```

### 3. Configuración del Entorno (.env)
Crea un archivo `.env` dentro de la carpeta `server/` con tu string de conexión de MongoDB:
```env
MONGODB_URI=tu_connection_string_de_atlas
PORT=3002
```

### 4. Iniciar el Proyecto
Hemos configurado un comando unificado para que no tengas que abrir varias terminales:
```bash
npm run dev
```
-   **Frontend**: [http://localhost:3000](http://localhost:3000)
-   **Backend**: [http://localhost:3002](http://localhost:3002)

## 📁 Estructura del Proyecto

```text
Boaty/
├── src/                # Frontend (React components, styles)
│   ├── components/     # Piezas visuales (Hero, Navbar, Form, etc.)
│   └── index.css       # Estilos globales y tokens premium
├── server/             # Backend (Express API)
│   ├── models/         # Schemas de Mongoose (Provider)
│   ├── routes/         # Endpoints de la API
│   └── index.js        # Punto de entrada del servidor
└── package.json        # Scripts de automatización y dependencias
```

---
Diseñado y desarrollado para elevar la náutica al nivel on-demand. 🌊
