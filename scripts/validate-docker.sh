#!/bin/bash

# Script de validación para Docker

echo "🔍 Validando configuración Docker..."

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Instálalo desde: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar que Docker Compose esté instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado."
    exit 1
fi

echo "✅ Docker está instalado: $(docker --version)"
echo "✅ Docker Compose está instalado: $(docker-compose --version)"

# Verificar archivos necesarios
FILES=("Dockerfile" "docker-compose.yml" ".dockerignore")
for file in "${FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file existe"
    else
        echo "❌ $file no encontrado"
        exit 1
    fi
done

# Verificar estructura del proyecto
DIRS=("src" "cookies" "logs")
for dir in "${DIRS[@]}"; do
    if [[ -d "$dir" ]] || [[ "$dir" == "cookies" ]] || [[ "$dir" == "logs" ]]; then
        echo "✅ Directorio $dir OK"
    else
        echo "❌ Directorio $dir no encontrado"
    fi
done

# Crear directorios necesarios
mkdir -p cookies logs
echo "✅ Directorios cookies y logs creados"

# Verificar configuración de Docker Compose
if docker-compose config &> /dev/null; then
    echo "✅ Configuración de docker-compose.yml válida"
else
    echo "❌ Error en docker-compose.yml"
    docker-compose config
    exit 1
fi

echo ""
echo "🎉 Validación completa! El proyecto está listo para Docker."
echo ""
echo "Próximos pasos:"
echo "1. docker-compose up -d"
echo "2. docker-compose logs -f instagram-agent"
echo "3. curl http://localhost:3000/api/health"