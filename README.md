# 📱 Instagram AI Agent - Sistema Multi-Usuario

Un agente de IA avanzado para automatizar Instagram de forma inteligente, ahora con soporte para **múltiples usuarios** y **entrenamientos personalizados**.

## ✨ Características Principales

- 🧠 **IA Personalizada**: Comentarios generados con IA basados en entrenamiento personalizado
- 👥 **Multi-Usuario**: Soporte completo para múltiples usuarios y cuentas
- 🔐 **Autenticación Segura**: Sistema JWT con registro e inicio de sesión
- 📱 **Múltiples Cuentas**: Cada usuario puede conectar varias cuentas de Instagram
- 🎓 **Entrenamiento Personalizado**: Entrena la IA con tu contenido específico
- 🐳 **Docker Ready**: Configuración completa para Docker (resuelve problemas de dependencias)
- 🔄 **Automatización Inteligente**: Likes y comentarios automáticos
- 📊 **API RESTful**: API completa para integración frontend

## 🚀 Instalación Rápida

### 🐳 Opción 1: Docker (Recomendado)

```bash
# Clonar el repositorio
git clone <tu-repo>
cd instagram-agent

# Ejecutar con Docker
docker-compose up -d

# Verificar funcionamiento
curl http://localhost:3000/api/health
```

### 📦 Opción 2: Instalación Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar servidor
npm start
```

## 🔧 Configuración

### Variables de Entorno Requeridas

```bash
# MongoDB (OBLIGATORIO)
MONGODB_URI=tu_mongodb_uri

# JWT Secret (OBLIGATORIO)
JWT_SECRET=tu_jwt_secret_super_seguro

# Puerto del servidor
PORT=3000

# Claves API de Gemini (mínimo una)
GEMINI_API_KEY_1=tu_clave_api_gemini
```

## 📋 Uso de la API

### 1. Registrar Usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "mi_usuario",
    "email": "mi@email.com",
    "password": "mi_contraseña"
  }'
```

### 2. Agregar Cuenta de Instagram

```bash
curl -X POST http://localhost:3000/api/instagram/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "username": "mi_cuenta_instagram",
    "password": "mi_contraseña_instagram"
  }'
```

### 3. Entrenar la IA

```bash
curl -X POST http://localhost:3000/api/training/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "instagramUsername": "mi_cuenta_instagram",
    "dataType": "text",
    "content": "Mi personalidad y estilo de comentarios..."
  }'
```

## 🎓 Tipos de Entrenamiento Soportados

- 📝 **Texto**: Contenido directo para entrenar la personalidad
- 🎥 **YouTube URLs**: Transcripciones automáticas de videos
- 🎙️ **Audio**: Archivos MP3, WAV con transcripción
- 🌐 **Websites**: Scraping automático de contenido web
- 📄 **Documentos**: PDF, DOC, DOCX, TXT

## 🤖 Funcionamiento del Agente

1. **Procesamiento Automático**: Ejecuta cada 30 segundos para todas las cuentas activas
2. **Comentarios Inteligentes**: Genera comentarios personalizados usando IA
3. **Gestión de Sesiones**: Mantiene cookies separadas por usuario
4. **Interacciones Naturales**: Likes y comentarios que respetan las políticas de Instagram

## 🐳 Docker

### Comandos Útiles

```bash
# Construir y ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f instagram-agent

# Reiniciar
docker-compose restart instagram-agent

# Parar
docker-compose down

# Acceder al contenedor
docker-compose exec instagram-agent /bin/bash
```

### Ventajas de Docker

- ✅ Resuelve problemas de dependencias de Puppeteer/Chrome
- ✅ Entorno consistente en cualquier sistema
- ✅ Fácil escalabilidad y despliegue
- ✅ Aislamiento de procesos

## 📊 Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/instagram/accounts` | Agregar cuenta IG |
| GET | `/api/instagram/accounts` | Listar cuentas IG |
| POST | `/api/training/data` | Agregar entrenamiento |
| GET | `/api/training/data` | Obtener entrenamientos |
| GET | `/api/health` | Estado del sistema |

## 📚 Documentación

- 📖 **API Completa**: Ver `DOCUMENTACION_API.md`
- 🐳 **Guía Docker**: Ver `DOCKER_GUIA.md`
- 🔧 **Guía Técnica**: Ver `MULTI_USER_GUIDE.md`

## 🔒 Seguridad

- 🔐 Autenticación JWT segura
- 🛡️ Passwords hasheados con bcrypt
- 🔒 Datos de usuario completamente aislados
- 🚫 Validación de entrada en todos los endpoints

## 🚀 Despliegue en Producción

### Con Docker

```bash
# Producción con docker-compose
docker-compose -f docker-compose.yml up -d

# Ver logs
docker-compose logs -f instagram-agent

# Monitoreo
docker stats instagram-agent-app
```

### Variables de Entorno de Producción

```bash
NODE_ENV=production
MONGODB_URI=tu_mongodb_produccion
JWT_SECRET=clave_super_segura_produccion
```

## 🛠️ Desarrollo

### Estructura del Proyecto

```
├── src/
│   ├── models/          # Modelos de datos (User, TrainingData)
│   ├── routes/          # Endpoints de la API
│   ├── middleware/      # Autenticación JWT
│   ├── client/          # Cliente Instagram multi-usuario
│   ├── services/        # Servicios de entrenamiento
│   └── Agent/           # Motor de IA
├── scripts/             # Scripts de despliegue
├── Dockerfile           # Configuración Docker
├── docker-compose.yml   # Orquestación de servicios
└── docs/               # Documentación completa
```

### Comandos de Desarrollo

```bash
# Desarrollo local
npm run dev

# Build
npm run build

# Tests
npm test

# Linting
npm run lint
```

## 🔧 Migración desde Versión Anterior

Si tienes la versión anterior (mono-usuario):

1. **Ejecuta el nuevo sistema**
2. **Registra tu usuario** usando `/api/auth/register`
3. **Agrega tus cuentas IG** usando `/api/instagram/accounts`
4. **Re-importa entrenamientos** usando `/api/training/data`

## 🆘 Resolución de Problemas

### Error: Dependencias de Puppeteer

```
GLIBC_2.36 not found
```

**Solución**: ✅ Usar Docker - resuelve automáticamente

### Error: MongoDB conexión

```
MongoDB connection error
```

**Solución**: Verificar URL en `.env` o `docker-compose.yml`

### Error: Puerto en uso

```
Port 3000 already in use
```

**Solución**: Cambiar puerto en `docker-compose.yml`

## 📈 Roadmap

- [ ] 🎨 Dashboard web frontend
- [ ] 📊 Métricas y analytics
- [ ] 🔄 Webhooks para notificaciones
- [ ] 📱 Soporte para más plataformas sociales
- [ ] 🤖 Mejoras en IA conversacional
- [ ] 📋 Plantillas de comentarios

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 💬 Soporte

- 📧 Para soporte técnico, crea un issue
- 📚 Consulta la documentación en `/docs`
- 🐳 Para problemas con Docker, ver `DOCKER_GUIA.md`

---

## 🎉 ¡Disfruta automatizando Instagram de forma inteligente!

**El sistema está completamente listo para producción con Docker.** 🚀

### Demo Rápido

```bash
# 1. Ejecutar sistema
docker-compose up -d

# 2. Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","email":"demo@test.com","password":"demo123"}'

# 3. ¡Listo para usar!
```