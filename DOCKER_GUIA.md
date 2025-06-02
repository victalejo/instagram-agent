# 🐳 Guía de Docker para Instagram Agent Multi-Usuario

Esta guía te ayudará a ejecutar el sistema Instagram Agent usando Docker, resolviendo todos los problemas de dependencias y compatibilidad.

## 🚀 Inicio Rápido

### 1. Construir y Ejecutar

```bash
# Opción 1: Usar docker-compose (Recomendado)
docker-compose up -d

# Opción 2: Usar scripts automatizados
./scripts/deploy.sh

# Opción 3: Construcción manual
docker build -t instagram-agent .
docker run -d -p 3000:3000 --name instagram-agent-app instagram-agent
```

### 2. Verificar que funciona

```bash
# Verificar estado del contenedor
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f instagram-agent

# Probar health check
curl http://localhost:3000/api/health
```

## 📋 Requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- Al menos 2GB RAM disponible
- Puertos 3000 disponible

## 🔧 Configuración

### Variables de Entorno

Edita el archivo `docker-compose.yml` para configurar:

```yaml
environment:
  - NODE_ENV=production
  - MONGODB_URI=tu_mongodb_uri
  - JWT_SECRET=tu_jwt_secret_super_seguro
  - PORT=3000
  - GEMINI_API_KEY_1=tu_api_key_1
  - GEMINI_API_KEY_2=tu_api_key_2
  # ... más claves API
```

### Volúmenes Persistentes

```yaml
volumes:
  - ./cookies:/app/cookies    # Cookies de Instagram
  - ./logs:/app/logs         # Logs de la aplicación
```

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Reiniciar
docker-compose restart instagram-agent

# Ver logs
docker-compose logs -f instagram-agent

# Acceder al shell del contenedor
docker-compose exec instagram-agent /bin/bash

# Ver estadísticas de recursos
docker stats instagram-agent-app
```

### Actualización de la Aplicación

```bash
# Método 1: Script automatizado
./scripts/deploy.sh

# Método 2: Manual
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Debugging

```bash
# Ver logs detallados
docker-compose logs --tail=100 instagram-agent

# Ejecutar comandos dentro del contenedor
docker-compose exec instagram-agent npm run health-check

# Inspeccionar el contenedor
docker inspect instagram-agent-app
```

## 🔍 Resolución de Problemas

### Error: Puppeteer no puede iniciar Chrome

**Síntoma:**
```
Failed to launch the browser process!
GLIBC_2.36 not found
```

**Solución:**
✅ Ya resuelto en nuestro Dockerfile usando `node:18-bullseye-slim` con todas las dependencias necesarias.

### Error: Permisos insuficientes

**Síntoma:**
```
Permission denied: cannot create directory
```

**Solución:**
```bash
# Crear directorios con permisos correctos
mkdir -p cookies logs
sudo chown -R $USER:$USER cookies logs
```

### Error: Puerto 3000 en uso

**Síntoma:**
```
Port 3000 is already in use
```

**Solución:**
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"  # Usar puerto 3001 en su lugar
```

### Error: MongoDB conexión fallida

**Síntoma:**
```
MongoDB connection error
```

**Solución:**
1. Verificar la URL de MongoDB en `docker-compose.yml`
2. Asegurar que MongoDB sea accesible desde Docker
3. Verificar credenciales

### Error: Contenedor se cierra inmediatamente

**Solución:**
```bash
# Ver logs para identificar el problema
docker-compose logs instagram-agent

# Ejecutar en modo interactivo para debugging
docker run -it --rm instagram-agent /bin/bash
```

## 📊 Monitoreo

### Health Checks

```bash
# Health check manual
curl http://localhost:3000/api/health

# Ver estado del health check en Docker
docker inspect instagram-agent-app | grep -A 10 Health
```

### Logs Estructurados

```bash
# Logs en tiempo real con timestamps
docker-compose logs -f -t instagram-agent

# Filtrar logs por nivel
docker-compose logs instagram-agent | grep "error"
docker-compose logs instagram-agent | grep "info"
```

### Métricas de Rendimiento

```bash
# Uso de recursos en tiempo real
docker stats instagram-agent-app

# Información detallada del sistema
docker-compose exec instagram-agent cat /proc/meminfo
docker-compose exec instagram-agent df -h
```

## 🚀 Despliegue en Producción

### 1. Optimizaciones de Producción

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  instagram-agent:
    build: .
    restart: always
    environment:
      - NODE_ENV=production
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 2. Configuración de Nginx (Opcional)

```nginx
# nginx.conf
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Automatización con CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy Instagram Agent
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          ssh user@server 'cd /app && ./scripts/deploy.sh'
```

## 🛡️ Seguridad

### Configuración Segura

```yaml
# Usar usuario no-root
user: "1001:1001"

# Limitar capacidades
cap_drop:
  - ALL
cap_add:
  - SYS_ADMIN  # Solo para Puppeteer

# Configuración de seguridad
security_opt:
  - no-new-privileges:true
  - seccomp:unconfined  # Solo para Puppeteer
```

### Variables de Entorno Seguras

```bash
# Usar archivo .env para secretos
# .env
MONGODB_URI=mongodb://...
JWT_SECRET=...
GEMINI_API_KEY_1=...

# Referenciar en docker-compose.yml
env_file:
  - .env
```

## 📱 Desarrollo Local

### Desarrollo con Hot Reload

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  instagram-agent-dev:
    build:
      context: .
      target: development
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev
```

### Testing

```bash
# Ejecutar tests dentro del contenedor
docker-compose exec instagram-agent npm test

# Linting
docker-compose exec instagram-agent npm run lint

# Build check
docker-compose exec instagram-agent npm run build
```

## 📈 Escalabilidad

### Múltiples Instancias

```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  instagram-agent:
    build: .
    deploy:
      replicas: 3
  
  nginx:
    image: nginx
    ports:
      - "80:80"
    depends_on:
      - instagram-agent
```

```bash
# Escalar horizontalmente
docker-compose up -d --scale instagram-agent=3
```

## 🎯 Mejores Prácticas

1. **Usar etiquetas específicas**: `instagram-agent:v1.0.0` en lugar de `latest`
2. **Limitar recursos**: Configurar límites de CPU y memoria
3. **Logs rotativos**: Configurar rotación automática de logs
4. **Backups regulares**: Backup de volúmenes `cookies` y `logs`
5. **Monitoreo**: Usar herramientas como Prometheus/Grafana
6. **Actualizaciones**: Mantener imagen base actualizada

## 🆘 Soporte

Si encuentras problemas:

1. **Verifica logs**: `docker-compose logs -f instagram-agent`
2. **Consulta documentación**: Ver `DOCUMENTACION_API.md`
3. **Revisa health check**: `curl http://localhost:3000/api/health`
4. **Inspecciona contenedor**: `docker inspect instagram-agent-app`

---

## 🎉 ¡Listo para Producción!

Con esta configuración Docker, tu Instagram Agent debería funcionar sin problemas de dependencias. El sistema está optimizado para:

- ✅ Compatibilidad completa con Puppeteer
- ✅ Gestión automática de dependencias
- ✅ Seguridad mejorada
- ✅ Fácil escalabilidad
- ✅ Monitoreo integrado
- ✅ Despliegue automatizado

¡El contenedor resolverá todos los problemas de GLIBC y dependencias del sistema! 🚀