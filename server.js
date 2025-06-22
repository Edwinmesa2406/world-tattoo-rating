const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const port = 8000;

// Middleware para parsear JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware para CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Middleware para deshabilitar el caché
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Expires', '-1');
    res.set('Pragma', 'no-cache');
    next();
});

// Middleware de logging para debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Función auxiliar para leer/escribir mensajes
const messagesFile = path.join(__dirname, 'data', 'messages.json');

async function readMessages() {
    try {
        const data = await fs.readFile(messagesFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writeMessages(messages) {
    await fs.writeFile(messagesFile, JSON.stringify(messages, null, 2));
}

// API Endpoints para mensajes
app.post('/api/messages', async (req, res) => {
    try {
        const messages = await readMessages();
        const newMessage = {
            id: Date.now().toString(),
            ...req.body,
            fecha: new Date().toISOString(),
            leido: false
        };
        messages.push(newMessage);
        await writeMessages(messages);
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el mensaje' });
    }
});

app.get('/api/messages', async (req, res) => {
    try {
        const messages = await readMessages();
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los mensajes' });
    }
});

app.patch('/api/messages/:id', async (req, res) => {
    try {
        const messages = await readMessages();
        const index = messages.findIndex(m => m.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Mensaje no encontrado' });
        }
        messages[index] = { ...messages[index], ...req.body };
        await writeMessages(messages);
        res.json(messages[index]);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el mensaje' });
    }
});

app.delete('/api/messages/:id', async (req, res) => {
    try {
        const messages = await readMessages();
        const filteredMessages = messages.filter(m => m.id !== req.params.id);
        await writeMessages(filteredMessages);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el mensaje' });
    }
});

// Servir archivos estáticos DESPUÉS de las rutas de API
app.use(express.static(__dirname, {
    etag: false,
    lastModified: false
}));

// Rutas para las páginas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
    console.log(`Ruta no encontrada: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    console.log('Rutas de API disponibles:');
    console.log('  POST /api/messages - Crear mensaje');
    console.log('  GET /api/messages - Obtener mensajes');
    console.log('  PATCH /api/messages/:id - Actualizar mensaje');
    console.log('  DELETE /api/messages/:id - Eliminar mensaje');
});
