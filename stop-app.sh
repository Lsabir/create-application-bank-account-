#!/bin/bash

# 🛑 Script d'arrêt pour l'Application Bancaire

echo "🛑 Arrêt de l'application bancaire..."

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Arrêter le backend
if [ -f "backend/backend.pid" ]; then
    BACKEND_PID=$(cat backend/backend.pid)
    print_step "Arrêt du backend (PID: $BACKEND_PID)..."
    
    if kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID"
        sleep 2
        
        # Force kill si nécessaire
        if kill -0 "$BACKEND_PID" 2>/dev/null; then
            kill -9 "$BACKEND_PID"
            print_warning "Backend arrêté de force"
        else
            print_success "Backend arrêté normalement"
        fi
    else
        print_warning "Backend déjà arrêté"
    fi
    
    rm -f backend/backend.pid
else
    print_step "Recherche de processus backend Java..."
    pkill -f "bank-account-api" || print_warning "Aucun processus backend trouvé"
fi

# Arrêter le frontend
if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    print_step "Arrêt du frontend (PID: $FRONTEND_PID)..."
    
    if kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID"
        sleep 1
        
        # Force kill si nécessaire
        if kill -0 "$FRONTEND_PID" 2>/dev/null; then
            kill -9 "$FRONTEND_PID"
            print_warning "Frontend arrêté de force"
        else
            print_success "Frontend arrêté normalement"
        fi
    else
        print_warning "Frontend déjà arrêté"
    fi
    
    rm -f frontend.pid
else
    print_step "Recherche de processus frontend Next.js..."
    pkill -f "next-server" || pkill -f "npm.*dev" || pkill -f "yarn.*dev" || print_warning "Aucun processus frontend trouvé"
fi

# Arrêter les processus sur les ports spécifiques
print_step "Vérification des ports 3000 et 8080..."

# Port 3000 (frontend)
FRONTEND_PORT_PID=$(lsof -ti:3000 2>/dev/null || true)
if [ ! -z "$FRONTEND_PORT_PID" ]; then
    print_step "Arrêt du processus sur le port 3000..."
    kill "$FRONTEND_PORT_PID" 2>/dev/null || kill -9 "$FRONTEND_PORT_PID" 2>/dev/null || true
fi

# Port 8080 (backend)
BACKEND_PORT_PID=$(lsof -ti:8080 2>/dev/null || true)
if [ ! -z "$BACKEND_PORT_PID" ]; then
    print_step "Arrêt du processus sur le port 8080..."
    kill "$BACKEND_PORT_PID" 2>/dev/null || kill -9 "$BACKEND_PORT_PID" 2>/dev/null || true
fi

# Nettoyer les fichiers temporaires
print_step "Nettoyage des fichiers temporaires..."
rm -f *.pid
rm -f backend/backend.log
rm -f frontend.log

print_success "🎉 Application arrêtée avec succès !"
echo ""
echo "Pour redémarrer l'application :"
echo "  ./start-app.sh"
