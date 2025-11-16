#!/bin/bash

# 🏦 Script de démarrage pour l'Application Bancaire
# Compatible macOS et Linux

set -e

echo "🏦 ========================================"
echo "   APPLICATION BANCAIRE - DÉMARRAGE"
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

# Vérifier si MySQL est installé
check_mysql() {
    if command -v mysql >/dev/null 2>&1; then
        print_success "MySQL est installé"
        return 0
    else
        print_warning "MySQL n'est pas installé"
        echo "Pour installer MySQL sur macOS :"
        echo "  brew install mysql"
        echo "  brew services start mysql"
        echo ""
        echo "Voulez-vous continuer avec H2 (base de données en mémoire) ? [y/N]"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            return 1
        else
            exit 1
        fi
    fi
}

# Vérifier si le JAR existe
check_backend_jar() {
    if [ -f "backend/target/bank-account-api-1.0.0.jar" ]; then
        print_success "Backend JAR trouvé"
        return 0
    else
        print_error "Backend JAR non trouvé"
        print_step "Compilation du backend..."
        
        cd backend
        if command -v mvn >/dev/null 2>&1; then
            mvn clean package -DskipTests
        elif command -v ./mvnw >/dev/null 2>&1; then
            ./mvnw clean package -DskipTests
        else
            print_error "Maven non trouvé. Installez Maven ou utilisez mvnw"
            exit 1
        fi
        cd ..
        
        if [ -f "backend/target/bank-account-api-1.0.0.jar" ]; then
            print_success "Compilation réussie"
        else
            print_error "Échec de la compilation"
            exit 1
        fi
    fi
}

# Démarrer MySQL si nécessaire
start_mysql() {
    print_step "Vérification de MySQL..."
    
    if check_mysql; then
        # Vérifier si MySQL fonctionne
        if mysql -u root -e "SELECT 1;" >/dev/null 2>&1; then
            print_success "MySQL est actif"
        else
            print_step "Démarrage de MySQL..."
            if command -v brew >/dev/null 2>&1; then
                brew services start mysql
                sleep 3
            else
                print_warning "Démarrez MySQL manuellement"
            fi
        fi
        
        # Créer la base de données
        print_step "Création de la base de données..."
        mysql -u root -e "CREATE DATABASE IF NOT EXISTS bank_account_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
        print_success "Base de données prête"
        return 0
    else
        # Utiliser H2
        print_warning "Utilisation de H2 au lieu de MySQL"
        export SPRING_PROFILES_ACTIVE=h2
        return 1
    fi
}

# Démarrer le backend
start_backend() {
    print_step "Démarrage du backend Spring Boot..."
    
    cd backend
    
    # Créer le répertoire uploads
    mkdir -p uploads/{cin_front,cin_back,proof_of_address,proof_of_income,photo,signature}
    
    # Variables d'environnement
    export SERVER_PORT=8080
    
    if [ "$USE_H2" = "true" ]; then
        print_step "Configuration H2..."
        java -jar target/bank-account-api-1.0.0.jar \
            --spring.profiles.active=h2 \
            --spring.datasource.url=jdbc:h2:file:./bankdb \
            --spring.datasource.username=sa \
            --spring.datasource.password=password \
            --spring.h2.console.enabled=true \
            --logging.level.com.bank=INFO \
            > backend.log 2>&1 &
    else
        print_step "Configuration MySQL..."
        java -jar target/bank-account-api-1.0.0.jar \
            --logging.level.com.bank=INFO \
            > backend.log 2>&1 &
    fi
    
    BACKEND_PID=$!
    echo $BACKEND_PID > backend.pid
    
    cd ..
    
    # Attendre que le backend démarre
    print_step "Attente du démarrage du backend..."
    for i in {1..30}; do
        if curl -s http://localhost:8080/api/accounts/test >/dev/null 2>&1; then
            print_success "Backend démarré sur http://localhost:8080"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    print_error "Le backend n'a pas démarré dans les temps"
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
            exit 1
        fi
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
    
    print_error "Le frontend n'a pas démarré dans les temps"
    return 1
}

# Afficher les informations finales
show_info() {
    echo ""
    print_success "🎉 APPLICATION DÉMARRÉE AVEC SUCCÈS !"
    echo ""
    echo "📱 Frontend (Interface utilisateur) :"
    echo "   👉 http://localhost:3000"
    echo ""
    echo "🔧 Backend (API) :"
    echo "   👉 http://localhost:8080"
    echo "   📊 Test API : http://localhost:8080/api/accounts/test"
    echo ""
    
    if [ "$USE_H2" = "true" ]; then
        echo "💾 Base de données H2 :"
        echo "   👉 http://localhost:8080/h2-console"
        echo "   📝 JDBC URL: jdbc:h2:file:./bankdb"
        echo "   👤 Username: sa"
        echo "   🔑 Password: password"
    else
        echo "💾 Base de données MySQL :"
        echo "   📝 Database: bank_account_db"
        echo "   👤 Username: root"
        echo "   🔗 Connection: localhost:3306"
    fi
    
    echo ""
    echo "🧪 Test de l'application :"
    echo "   1. Ouvrez http://localhost:3000"
    echo "   2. Créez un nouveau compte bancaire"
    echo "   3. Utilisez le code OTP : 123456"
    echo "   4. Notez vos identifiants générés"
    echo "   5. Connectez-vous avec vos identifiants"
    echo ""
    echo "🛑 Pour arrêter l'application :"
    echo "   ./stop-app.sh"
    echo ""
    echo "📋 Logs :"
    echo "   Backend: tail -f backend/backend.log"
    echo "   Frontend: tail -f frontend.log"
}

# Script principal
main() {
    print_step "Vérification des prérequis..."
    
    USE_H2=false
    if ! start_mysql; then
        USE_H2=true
    fi
    
    check_backend_jar
    
    print_step "Démarrage des services..."
    
    if start_backend && start_frontend; then
        show_info
        
        # Garder le script en vie
        echo ""
        echo "Appuyez sur Ctrl+C pour arrêter l'application..."
        trap 'print_step "Arrêt de l application..."; ./stop-app.sh; exit 0' INT
        
        while true; do
            sleep 1
        done
    else
        print_error "Échec du démarrage"
        ./stop-app.sh
        exit 1
    fi
}

# Vérifier si on est dans le bon répertoire
if [ ! -f "app/page.tsx" ] || [ ! -f "backend/pom.xml" ]; then
    print_error "Exécutez ce script depuis la racine du projet"
    exit 1
fi

# Lancer le script principal
main
