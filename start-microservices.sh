#!/bin/bash

# 🏦 Script de démarrage pour les Microservices Bancaires
# Compatible macOS et Linux

set -e

echo "🏦 ========================================"
echo "   MICROSERVICES BANCAIRES - DÉMARRAGE"
echo "========================================"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
print_step() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier Docker
check_docker() {
    if command -v docker >/dev/null 2>&1; then
        if docker info >/dev/null 2>&1; then
            print_success "Docker est actif"
            return 0
        else
            print_warning "Docker n'est pas démarré"
            echo "Démarrez Docker Desktop puis réessayez"
            echo "Ou exécutez : open -a Docker"
            return 1
        fi
    else
        print_error "Docker n'est pas installé"
        echo "Installez Docker Desktop depuis : https://www.docker.com/products/docker-desktop"
        return 1
    fi
}

# Démarrer les bases de données
start_databases() {
    print_step "Démarrage des bases de données MySQL..."
    
    local project_root=$(pwd)
    cd "$project_root/microservices"
    
    if docker compose up -d >/dev/null 2>&1; then
        print_success "Bases de données démarrées"
        print_step "Attente que MySQL soit prêt..."
        sleep 10
        
        # Vérifier que les conteneurs sont actifs
        if docker compose ps | grep -q "Up"; then
            print_success "MySQL est prêt"
            echo "  - account-mysql: localhost:3307 (account/account)"
            echo "  - document-mysql: localhost:3308 (document/document)"
            cd "$project_root"
            return 0
        else
            print_error "Les conteneurs MySQL ne sont pas actifs"
            cd "$project_root"
            return 1
        fi
    else
        print_error "Échec du démarrage des bases de données"
        cd "$project_root"
        return 1
    fi
}

# Compiler les microservices
build_services() {
    print_step "Compilation des microservices avec Maven..."
    
    local project_root=$(pwd)
    cd "$project_root/microservices"
    
    if command -v mvn >/dev/null 2>&1; then
        print_step "Compilation en cours (cela peut prendre quelques minutes)..."
        mvn clean package -DskipTests -q
        print_success "Compilation réussie"
        cd "$project_root"
        return 0
    else
        print_error "Maven n'est pas installé"
        echo "Installez Maven : brew install maven"
        cd "$project_root"
        return 1
    fi
}

# Démarrer un service
start_service() {
    local service_name=$1
    local port=$2
    local project_root=$(pwd)
    local log_file="${project_root}/microservices/${service_name}.log"
    local pid_file="${project_root}/microservices/${service_name}.pid"
    
    print_step "Démarrage de $service_name..."
    
    cd "${project_root}/microservices"
    
    # Nettoyer l'ancien processus si existe
    if [ -f "$pid_file" ]; then
        old_pid=$(cat "$pid_file")
        if ps -p "$old_pid" > /dev/null 2>&1; then
            kill "$old_pid" 2>/dev/null || true
        fi
        rm -f "$pid_file"
    fi
    
    # Démarrer le service
    mvn -q -pl "$service_name" -am spring-boot:run > "$log_file" 2>&1 &
    local pid=$!
    echo $pid > "$pid_file"
    
    cd "$project_root"
    
    # Attendre que le service démarre
    print_step "Attente du démarrage de $service_name..."
    for i in {1..60}; do
        if curl -s "http://localhost:$port/actuator/health" >/dev/null 2>&1 || \
           curl -s "http://localhost:$port/swagger-ui" >/dev/null 2>&1 || \
           curl -s "http://localhost:$port" >/dev/null 2>&1; then
            print_success "$service_name démarré sur le port $port"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    print_warning "$service_name n'a pas répondu dans les temps (vérifiez les logs)"
    return 1
}

# Démarrer le frontend
start_frontend() {
    print_step "Démarrage du frontend Next.js..."
    
    # Vérifier si node_modules existe
    if [ ! -d "node_modules" ]; then
        print_step "Installation des dépendances..."
        if command -v npm >/dev/null 2>&1; then
            npm install
        elif command -v yarn >/dev/null 2>&1; then
            yarn install
        else
            print_error "npm ou yarn requis"
            return 1
        fi
    fi
    
    # Nettoyer l'ancien processus si existe
    if [ -f "frontend.pid" ]; then
        old_pid=$(cat "frontend.pid")
        if ps -p "$old_pid" > /dev/null 2>&1; then
            kill "$old_pid" 2>/dev/null || true
        fi
        rm -f "frontend.pid"
    fi
    
    # Démarrer le serveur de développement
    if command -v npm >/dev/null 2>&1; then
        npm run dev > frontend.log 2>&1 &
    elif command -v yarn >/dev/null 2>&1; then
        yarn dev > frontend.log 2>&1 &
    fi
    
    FRONTEND_PID=$!
    echo $FRONTEND_PID > frontend.pid
    
    # Attendre que le frontend démarre
    print_step "Attente du démarrage du frontend..."
    for i in {1..20}; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            print_success "Frontend démarré sur http://localhost:3000"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    print_warning "Le frontend n'a pas répondu dans les temps (vérifiez les logs)"
    return 1
}

# Afficher les informations finales
show_info() {
    echo ""
    print_success "🎉 MICROSERVICES DÉMARRÉS AVEC SUCCÈS !"
    echo ""
    echo "📱 Frontend (Interface utilisateur) :"
    echo "   👉 http://localhost:3000"
    echo ""
    echo "🔧 Microservices :"
    echo "   - Config Server: http://localhost:8888"
    echo "   - Auth Service: http://localhost:8080/swagger-ui"
    echo "   - Account Service: http://localhost:8081/swagger-ui"
    echo "   - Document Service: http://localhost:8082/swagger-ui"
    echo "   - API Gateway: http://localhost:8085/swagger-ui"
    echo ""
    echo "💾 Bases de données MySQL :"
    echo "   - Account DB: localhost:3307 (account/account)"
    echo "   - Document DB: localhost:3308 (document/document)"
    echo ""
    echo "🧪 Test rapide :"
    echo "   TOKEN=\$(curl -s -X POST http://localhost:8080/auth/token -H 'Content-Type: application/json' -d '{\"username\":\"alice\"}' | jq -r .access_token)"
    echo "   curl -s http://localhost:8081/accounts -H \"Authorization: Bearer \$TOKEN\""
    echo ""
    echo "📋 Logs :"
    echo "   Config: tail -f microservices/config-server.log"
    echo "   Auth: tail -f microservices/auth-service.log"
    echo "   Account: tail -f microservices/account-service.log"
    echo "   Document: tail -f microservices/document-service.log"
    echo "   Gateway: tail -f microservices/api-gateway.log"
    echo "   Frontend: tail -f frontend.log"
    echo ""
    echo "🛑 Pour arrêter l'application :"
    echo "   ./stop-microservices.sh"
    echo ""
}

# Fonction de nettoyage
cleanup() {
    echo ""
    print_step "Arrêt des services..."
    ./stop-microservices.sh 2>/dev/null || true
    exit 0
}

# Gérer l'interruption
trap cleanup INT TERM

# Script principal
main() {
    # Vérifier qu'on est dans le bon répertoire
    if [ ! -f "microservices/pom.xml" ]; then
        print_error "Exécutez ce script depuis la racine du projet"
        exit 1
    fi
    
    print_step "Vérification des prérequis..."
    
    if ! check_docker; then
        exit 1
    fi
    
    if ! start_databases; then
        exit 1
    fi
    
    if ! build_services; then
        exit 1
    fi
    
    print_step "Démarrage des services dans l'ordre..."
    
    # Démarrer Config Server en premier (si nécessaire)
    # start_service "config-server" "8888"
    
    # Démarrer les services principaux (démarrent en arrière-plan automatiquement)
    start_service "auth-service" "8080" || true
    sleep 5
    
    start_service "account-service" "8081" || true
    sleep 5
    
    start_service "document-service" "8082" || true
    sleep 5
    
    start_service "api-gateway" "8085" || true
    sleep 5
    
    # Attendre que tous les services soient démarrés
    print_step "Attente que tous les services soient prêts..."
    sleep 15
    
    # Démarrer le frontend
    start_frontend
    
    show_info
    
    # Garder le script en vie
    echo ""
    echo "Appuyez sur Ctrl+C pour arrêter l'application..."
    
    while true; do
        sleep 1
    done
}

# Lancer le script principal
main

