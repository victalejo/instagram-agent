# 📱 Sistema Multi-Usuario para Agente IA de Instagram

Este sistema ha sido completamente actualizado para soportar múltiples usuarios, cada uno con sus propias cuentas de Instagram y datos de entrenamiento personalizados.

## 🚀 Características Principales

- **Autenticación de Usuarios**: Sistema seguro de registro e inicio de sesión
- **Múltiples Cuentas de Instagram**: Cada usuario puede conectar varias cuentas de Instagram
- **Entrenamiento Personalizado**: Datos de entrenamiento específicos para cada cuenta de Instagram
- **Gestión de Cuentas**: Activar/desactivar cuentas específicas
- **Sesiones Aisladas**: Los datos y cookies de cada usuario se mantienen separados

## 🔑 Configuración Inicial

### Variables de Entorno Requeridas

```bash
# Configuración de MongoDB (OBLIGATORIO)
MONGODB_URI=mongodb://mongo:9c5769956e2edf84959b@server.iaportafolio.com:4500/?tls=false

# Clave secreta JWT para autenticación (OBLIGATORIO)
JWT_SECRET=tu-clave-secreta-jwt-super-segura

# Puerto del servidor
PORT=3000

# Claves API de Gemini (mínimo una requerida)
GEMINI_API_KEY_1=tu_clave_api_gemini
```

### Instalación y Ejecución

#### 🐳 Opción 1: Docker (Recomendado)

```bash
# Clonar y navegar al directorio
cd instagram-agent

# Ejecutar con Docker Compose
docker-compose up -d

# Verificar que funciona
curl http://localhost:3000/api/health
```

#### 📦 Opción 2: Instalación Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar el servidor
npm start
```

> **💡 Nota:** Docker resuelve automáticamente todos los problemas de dependencias de Puppeteer y Chrome. Es la opción más confiable para producción.

## 📋 Endpoints de la API

### 🔐 Autenticación

#### Registrar Usuario
Crea una nueva cuenta de usuario en el sistema.

**Endpoint:** `POST /api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "username": "mi_usuario",
  "email": "mi_email@ejemplo.com",
  "password": "mi_contraseña_segura"
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "683cf50517849f9d77e77c01",
    "username": "mi_usuario",
    "email": "mi_email@ejemplo.com"
  }
}
```

**Errores Posibles:**
- `400`: Faltan campos requeridos o el usuario ya existe
- `500`: Error interno del servidor

#### Iniciar Sesión
Autentica a un usuario existente.

**Endpoint:** `POST /api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "username": "mi_usuario",
  "password": "mi_contraseña_segura"
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "683cf50517849f9d77e77c01",
    "username": "mi_usuario",
    "email": "mi_email@ejemplo.com",
    "instagramAccounts": []
  }
}
```

**Errores Posibles:**
- `400`: Faltan username o password
- `401`: Credenciales inválidas
- `500`: Error interno del servidor

---

### 📱 Gestión de Cuentas de Instagram

#### Agregar Cuenta de Instagram
Conecta una nueva cuenta de Instagram al usuario autenticado.

**Endpoint:** `POST /api/instagram/accounts`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_JWT
```

**Body:**
```json
{
  "username": "mi_cuenta_instagram",
  "password": "contraseña_instagram"
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Instagram account added successfully",
  "account": {
    "username": "mi_cuenta_instagram",
    "isActive": true
  }
}
```

**Errores Posibles:**
- `400`: Faltan credenciales o la cuenta ya existe
- `401`: Token de acceso requerido o inválido
- `500`: Error interno del servidor

#### Obtener Cuentas de Instagram
Lista todas las cuentas de Instagram del usuario autenticado.

**Endpoint:** `GET /api/instagram/accounts`

**Headers:**
```
Authorization: Bearer TU_TOKEN_JWT
```

**Respuesta Exitosa (200):**
```json
{
  "accounts": [
    {
      "username": "mi_cuenta_instagram",
      "isActive": true,
      "lastActive": "2025-06-02T00:50:26.017Z"
    }
  ]
}
```

#### Activar/Desactivar Cuenta de Instagram
Cambia el estado activo de una cuenta específica.

**Endpoint:** `PUT /api/instagram/accounts/{username}/toggle`

**Headers:**
```
Authorization: Bearer TU_TOKEN_JWT
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Account activated",
  "account": {
    "username": "mi_cuenta_instagram",
    "isActive": true
  }
}
```

#### Eliminar Cuenta de Instagram
Elimina permanentemente una cuenta de Instagram y todos sus datos de entrenamiento.

**Endpoint:** `DELETE /api/instagram/accounts/{username}`

**Headers:**
```
Authorization: Bearer TU_TOKEN_JWT
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Instagram account deleted successfully"
}
```

---

### 🎓 Gestión de Datos de Entrenamiento

#### Agregar Datos de Entrenamiento
Añade contenido de entrenamiento para personalizar el comportamiento de la IA.

**Endpoint:** `POST /api/training/data`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_JWT
```

**Body:**
```json
{
  "instagramUsername": "mi_cuenta_instagram",
  "dataType": "text",
  "content": "Soy apasionado por la tecnología y la innovación. Me encanta compartir conocimientos sobre desarrollo web, IA y transformación digital.",
  "metadata": {
    "source": "entrada_manual",
    "category": "personalidad"
  }
}
```

**Tipos de Datos Soportados:**
- `text`: Texto plano
- `audio`: Transcripción de audio
- `pdf`: Contenido extraído de PDF
- `website`: Contenido web scrapeado

**Respuesta Exitosa (201):**
```json
{
  "message": "Training data added successfully",
  "data": {
    "id": "683cf55217849f9d77e77c13",
    "dataType": "text",
    "instagramUsername": "mi_cuenta_instagram",
    "createdAt": "2025-06-02T00:50:26.017Z"
  }
}
```

#### Obtener Datos de Entrenamiento por Cuenta
Recupera todos los datos de entrenamiento para una cuenta específica de Instagram.

**Endpoint:** `GET /api/training/data/{instagramUsername}`

**Headers:**
```
Authorization: Bearer TU_TOKEN_JWT
```

**Respuesta Exitosa (200):**
```json
{
  "instagramUsername": "mi_cuenta_instagram",
  "totalItems": 1,
  "data": [
    {
      "id": "683cf55217849f9d77e77c13",
      "dataType": "text",
      "content": "Soy apasionado por la tecnología y la innovación...",
      "metadata": {
        "source": "entrada_manual"
      },
      "createdAt": "2025-06-02T00:50:26.017Z"
    }
  ]
}
```

#### Obtener Todos los Datos de Entrenamiento
Recupera todos los datos de entrenamiento del usuario, agrupados por cuenta de Instagram.

**Endpoint:** `GET /api/training/data`

**Headers:**
```
Authorization: Bearer TU_TOKEN_JWT
```

**Respuesta Exitosa (200):**
```json
{
  "totalItems": 1,
  "byAccount": {
    "mi_cuenta_instagram": [
      {
        "id": "683cf55217849f9d77e77c13",
        "dataType": "text",
        "content": "Soy apasionado por la tecnología...",
        "metadata": {},
        "createdAt": "2025-06-02T00:50:26.017Z"
      }
    ]
  }
}
```

#### Eliminar Datos de Entrenamiento
Elimina un elemento específico de datos de entrenamiento.

**Endpoint:** `DELETE /api/training/data/{id}`

**Headers:**
```
Authorization: Bearer TU_TOKEN_JWT
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Training data deleted successfully"
}
```

---

### 🏥 Monitoreo del Sistema

#### Verificación de Estado
Verifica que el servidor esté funcionando correctamente.

**Endpoint:** `GET /api/health`

**Respuesta (200):**
```json
{
  "status": "OK",
  "timestamp": "2025-06-02T00:48:59.280Z"
}
```

## 🔒 Seguridad y Autenticación

### Tokens JWT
- Todos los endpoints protegidos requieren un token JWT válido
- Los tokens se incluyen en el header `Authorization: Bearer TOKEN`
- Los tokens expiran después de 7 días
- Genera un nuevo token haciendo login nuevamente

### Manejo de Errores
Todos los endpoints devuelven errores en formato JSON:

```json
{
  "message": "Descripción del error"
}
```

**Códigos de Estado HTTP:**
- `200`: Éxito
- `201`: Creado exitosamente
- `400`: Solicitud incorrecta
- `401`: No autorizado
- `403`: Prohibido
- `404`: No encontrado
- `500`: Error interno del servidor

## 💡 Ejemplos de Uso

### Flujo Completo de Usuario

```bash
# 1. Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan_dev",
    "email": "juan@ejemplo.com",
    "password": "contraseña123"
  }'

# 2. Iniciar sesión
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan_dev",
    "password": "contraseña123"
  }'

# 3. Agregar cuenta de Instagram
curl -X POST http://localhost:3000/api/instagram/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "username": "juan_instagram",
    "password": "password_instagram"
  }'

# 4. Agregar datos de entrenamiento
curl -X POST http://localhost:3000/api/training/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "instagramUsername": "juan_instagram",
    "dataType": "text",
    "content": "Me especializo en desarrollo web con React y Node.js..."
  }'
```

## 🤖 Funcionamiento del Agente IA

### Proceso de Automatización
1. **Ejecución Cíclica**: El sistema procesa todas las cuentas activas cada 30 segundos
2. **Personalización**: Usa los datos de entrenamiento específicos de cada cuenta
3. **Interacciones**: Da "like" y comenta en publicaciones automáticamente
4. **Gestión de Sesiones**: Mantiene cookies separadas para cada cuenta
5. **Logging**: Registra todas las actividades y errores

### Personalización de Comentarios
- Los comentarios se generan usando IA basada en el contenido de entrenamiento
- Cada cuenta tiene su propia "personalidad" definida por sus datos de entrenamiento
- Los comentarios cumplen con las políticas de spam de Instagram
- Máximo 300 caracteres por comentario

## 🛠️ Desarrollo Frontend

### Ejemplo con JavaScript

```javascript
class InstagramAgentAPI {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  async register(username, email, password) {
    const response = await fetch(`${this.baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await response.json();
    if (data.token) {
      this.token = data.token;
      localStorage.setItem('token', this.token);
    }
    return data;
  }

  async addInstagramAccount(username, password) {
    const response = await fetch(`${this.baseURL}/api/instagram/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  }

  async addTrainingData(instagramUsername, content, dataType = 'text') {
    const response = await fetch(`${this.baseURL}/api/training/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ instagramUsername, dataType, content })
    });
    return response.json();
  }
}

// Uso
const api = new InstagramAgentAPI();
await api.register('usuario', 'email@ejemplo.com', 'password');
await api.addInstagramAccount('mi_instagram', 'password_ig');
```

## 🐳 Uso con Docker

### Comandos Básicos

```bash
# Construir y ejecutar
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f instagram-agent

# Parar el servicio
docker-compose down

# Reiniciar
docker-compose restart instagram-agent

# Acceder al contenedor
docker-compose exec instagram-agent /bin/bash
```

### Resolución de Problemas con Docker

**Problema:** Error de dependencias de Puppeteer/Chrome
```
GLIBC_2.36 not found
```

**Solución:** ✅ Automáticamente resuelto con Docker. El contenedor incluye todas las dependencias necesarias.

**Problema:** Puerto en uso
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"  # Usar puerto 3001
```

Para más detalles sobre Docker, consulta: `DOCKER_GUIA.md`

## 🔧 Migración desde Sistema Monousuario

Si estás migrando desde la versión anterior de un solo usuario:

1. **Crea un usuario**: Registra una cuenta en el nuevo sistema
2. **Transfiere credenciales**: Agrega tus cuentas de Instagram usando la API
3. **Migra datos de entrenamiento**: Re-importa tu contenido de entrenamiento
4. **Actualiza configuración**: El sistema creará nuevos archivos de cookies

## 📞 Soporte y Resolución de Problemas

### Problemas Comunes

**Error: "Access token required"**
- Solución: Incluye el header `Authorization: Bearer TOKEN` en tu solicitud

**Error: "Instagram account already added"**
- Solución: La cuenta ya existe, puedes activarla/desactivarla en su lugar

**Error: "MongoDB connection error"**
- Solución: Verifica que la URL de MongoDB sea correcta y que el servicio esté activo

### Logs del Sistema
El sistema proporciona logs detallados para:
- Intentos de autenticación
- Procesamiento de cuentas de Instagram
- Operaciones de datos de entrenamiento
- Estado de ejecución del agente

## 🚀 Siguiente Pasos

1. **Desarrolla una interfaz web**: Crea una aplicación frontend para gestionar usuarios y cuentas
2. **Implementa webhooks**: Recibe notificaciones cuando el agente realiza acciones
3. **Añade más tipos de entrenamiento**: Soporte para videos, imágenes, etc.
4. **Escalabilidad**: Implementa cache y optimizaciones para múltiples usuarios concurrentes

---

**¡El sistema está listo para producción!** 🎉

Para soporte técnico o preguntas, consulta los logs del sistema o revisa la documentación técnica en inglés.