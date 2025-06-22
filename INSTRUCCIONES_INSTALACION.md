# World Tattoo Rating - Instrucciones de Instalación

## Requisitos Previos
- Node.js instalado en tu sistema
- Visual Studio Code
- Extensión Live Server (opcional, para desarrollo frontend)

## Estructura del Proyecto
```
world-tattoo-rating/
├── index.html              # Página principal
├── admin.html              # Panel de administrador
├── registro.html           # Página de registro
├── style.css               # Estilos CSS
├── script.js               # JavaScript principal
├── admin.js                # JavaScript del panel admin
├── registro.js             # JavaScript del registro
├── server.js               # Servidor Express
├── package.json            # Dependencias del proyecto
└── data/
    └── messages.json       # Base de datos de mensajes
```

## Instalación

### 1. Crear el proyecto
```bash
mkdir world-tattoo-rating
cd world-tattoo-rating
```

### 2. Inicializar npm
```bash
npm init -y
```

### 3. Instalar dependencias
```bash
npm install express
```

### 4. Crear la carpeta data
```bash
mkdir data
```

### 5. Copiar todos los archivos
Copia todos los archivos proporcionados en sus respectivas ubicaciones.

### 6. Ejecutar el servidor
```bash
node server.js
```

### 7. Abrir en el navegador
Visita: http://localhost:8000

## Funcionalidades

### Formulario de Contacto
- Los mensajes se envían a través de la API REST
- Se almacenan en `data/messages.json`
- Aparecen automáticamente en el panel de administrador

### Panel de Administrador
- URL: http://localhost:8000/admin.html
- Contraseña: admin123
- Muestra todos los mensajes de contacto
- Permite marcar como leído y eliminar mensajes

### Características Técnicas
- API REST completa (GET, POST, PATCH, DELETE)
- Almacenamiento persistente en JSON
- Interfaz responsive con Tailwind CSS
- Actualización automática de datos
- Sistema de notificaciones

## Solución de Problemas

### Error de Puerto en Uso
Si aparece error de puerto 8000 en uso:
```bash
# Verificar procesos en el puerto
lsof -i :8000

# Detener proceso si es necesario
kill [PID]
```

### Problemas con el Formulario
- Verificar que el servidor esté corriendo
- Comprobar la consola del navegador para errores
- Asegurar que `data/messages.json` exista

## Notas Importantes
- El servidor debe estar corriendo para que funcione el formulario de contacto
- Los mensajes se guardan en `data/messages.json`
- El panel de administrador requiere contraseña: admin123
- Todos los archivos deben estar en la misma carpeta del proyecto
