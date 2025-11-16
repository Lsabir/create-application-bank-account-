#!/bin/bash

# 🛑 Script d'arrêt pour les Microservices Bancaires

set -e

echo "🛑 Arrêt des microservices..."

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Arrêter les services Java
services=("config-server" "auth-service" "account-service" "document-service" "api-gateway")

for service in "${services[@]}"; do
    pid_file="microservices/${service}.pid"
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            print_step "Arrêt de $service (PID: $pid)..."
            kill "$pid" 2>/dev/null || true
            rm -f "$pid_file"
            print_success "$service arrêté"
        else
            rm -f "$pid_file"
        fi
    fi
done

# Arrêter le frontend
if [ -f "frontend.pid" ]; then
    pid=$(cat "frontend.pid")
    if ps -p "$pid" > /dev/null 2>&1; then
        print_step "Arrêt du frontend (PID: $pid)..."
        kill "$pid" 2>/dev/null || true
        rm -f "frontend.pid"
        print_success "Frontend arrêté"
    else
        rm -f "frontend.pid"
    fi
fi

# Arrêter les bases de données (optionnel)
read -p "Voulez-vous arrêter les bases de données MySQL ? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd microservices
    docker compose down
    cd ..
    print_success "Bases de données arrêtées"
fi

print_success "Tous les services sont arrêtés"

