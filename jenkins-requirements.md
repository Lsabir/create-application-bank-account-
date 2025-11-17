# Configuration Jenkins

Ce document décrit les prérequis et la configuration nécessaires pour exécuter le pipeline Jenkins.

## Prérequis Jenkins

### Plugins Jenkins requis

Installez les plugins suivants dans Jenkins :

1. **Pipeline** (plugin de base pour Jenkinsfile)
2. **Docker Pipeline** - Pour Docker et Docker Compose
3. **HTML Publisher** - Pour publier les rapports de tests
4. **JUnit** - Pour les rapports de tests JUnit
5. **JaCoCo** - Pour la couverture de code (optionnel)
6. **Warnings Next Generation** - Pour les rapports ESLint
7. **Email Extension** - Pour les notifications par email

### Outils configurés dans Jenkins

Configurez les outils suivants dans Jenkins (`Manage Jenkins > Global Tool Configuration`) :

#### 1. JDK 17
- Nom: `JDK 17`
- Type: Install automatically
- Version: Java 17 (OpenJDK ou Oracle JDK)

#### 2. Maven
- Nom: `Maven`
- Type: Install automatically
- Version: Maven 3.8.x ou supérieur

#### 3. NodeJS
- Nom: `NodeJS`
- Type: Install automatically
- Version: Node.js 18.x LTS ou supérieur

### Configuration Docker

Assurez-vous que Docker est installé et configuré sur l'agent Jenkins :

```bash
# Vérifier Docker
docker --version
docker compose version

# Vérifier que le user Jenkins peut accéder à Docker
sudo usermod -aG docker jenkins
```

## Structure du Pipeline

Le pipeline Jenkins exécute les étapes suivantes :

1. **Checkout** - Récupération du code source
2. **Prérequis** - Vérification des outils installés
3. **Démarrer les bases de données** - Démarrage MySQL via Docker Compose
4. **Build Microservices** - Compilation parallèle de tous les microservices
5. **Tests Unitaires** - Exécution des tests unitaires Maven
6. **Couverture de Code** - Génération du rapport JaCoCo (si configuré)
7. **Build Frontend** - Installation des dépendances npm
8. **Lint Frontend** - Vérification du code avec ESLint
9. **Tests Frontend** - Exécution des tests frontend (si configurés)
10. **Build Production** - Build de production Next.js
11. **Tests d'Intégration** - Tests end-to-end des microservices
12. **Archiver les artefacts** - Archivage des JARs et builds

## Variables d'environnement

Le pipeline utilise les variables d'environnement suivantes :

- `DOCKER_COMPOSE_FILE` - Chemin vers docker-compose.yml
- `MAVEN_OPTS` - Options Maven (mémoire)
- `NODE_VERSION` - Version Node.js
- `JAVA_HOME` - Chemin vers JDK 17

## Exécution locale du Pipeline

Pour tester le pipeline localement sans Jenkins :

```bash
# Avec Jenkins CLI (si installé)
jenkins-cli build <job-name>

# Ou utiliser Jenkins en local
docker run -p 8080:8080 jenkins/jenkins:lts
```

## Personnalisation

### Modifier les ports des services

Si vous modifiez les ports dans `application.yml`, mettez à jour les URLs dans le stage "Tests d'Intégration" :

```groovy
# Exemple: si auth-service utilise le port 9090
curl -s http://localhost:9090/auth/token
```

### Ajouter des tests

Pour ajouter des tests unitaires Java, créez des classes `*Test.java` dans :
- `microservices/*/src/test/java/`

Pour ajouter des tests frontend, installez Jest ou Playwright :

```bash
npm install --save-dev jest @testing-library/react
```

Puis modifiez le script `test` dans `package.json`.

### Activer JaCoCo

Pour activer la couverture de code, ajoutez le plugin JaCoCo dans chaque `pom.xml` :

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

## Dépannage

### Erreur: "Docker daemon not running"
```bash
# Démarrer Docker
sudo systemctl start docker  # Linux
# Ou ouvrir Docker Desktop sur macOS/Windows
```

### Erreur: "Maven not found"
- Vérifiez que Maven est installé dans Jenkins
- Vérifiez le chemin dans les outils globaux

### Erreur: "Tests échouent"
- Vérifiez que les bases de données MySQL sont démarrées
- Vérifiez les logs dans `microservices/*.log`
- Augmentez les délais (`sleep`) dans les tests d'intégration

### Erreur: "Port already in use"
- Arrêtez les services en cours d'exécution
- Modifiez les ports dans `application.yml` si nécessaire

## Notifications

Le pipeline envoie des emails de notification :
- En cas de succès
- En cas d'échec
- En cas d'instabilité

Configurez l'adresse email dans la variable d'environnement `CHANGE_AUTHOR_EMAIL` ou modifiez les adresses dans la section `post`.

## Artéfacts générés

Le pipeline archive :
- Les JARs des microservices (`*.jar`)
- Le build Next.js (`.next/`)
- Les rapports de tests (HTML)

Ils sont disponibles dans l'interface Jenkins après chaque build.



