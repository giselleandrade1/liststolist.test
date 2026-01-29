#!/bin/bash

# 🚀 Script de desenvolvimento local para LembraFácil

set -e

echo "🧠 LembraFácil - Local Development Setup"
echo "=========================================="

# Verificar Java
if ! command -v java &> /dev/null; then
    echo "❌ Java não encontrado. Instale Java 17+:"
    echo "   https://adoptium.net/"
    exit 1
fi

# Verificar Maven
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven não encontrado. Instale Maven 3.8+:"
    echo "   https://maven.apache.org/download.cgi"
    exit 1
fi

echo "✅ Java version: $(java -version 2>&1 | head -n 1)"
echo "✅ Maven version: $(mvn -version | head -n 1)"
echo ""

# Compilar projeto
echo "📦 Compilando projeto..."
mvn clean compile

# Executar testes
echo ""
echo "🧪 Executando testes..."
mvn test

# Verificar se há Python ou Node para servir frontend
echo ""
if command -v python3 &> /dev/null; then
    echo "🌐 Frontend disponível em: http://localhost:8080"
    echo "   Executando: python3 -m http.server 8080 --directory public"
    echo ""
    echo "⚠️  Para testar os endpoints serverless, instale Vercel CLI:"
    echo "   npm i -g vercel"
    echo "   vercel dev"
    echo ""
    python3 -m http.server 8080 --directory public
elif command -v npx &> /dev/null; then
    echo "🌐 Frontend disponível em: http://localhost:8080"
    echo "   Executando: npx serve public -l 8080"
    echo ""
    npx serve public -l 8080
else
    echo "⚠️  Instale Python 3 ou Node.js para servir o frontend"
    echo "   Projeto compilado com sucesso!"
fi
