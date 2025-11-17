# Solution Rapide : Résoudre le Problème Docker dans Jenkins

## 🚨 Problème : Docker non trouvé dans Jenkins

Si vous voyez toujours l'erreur `❌ Docker n'est pas installé ou non disponible`, voici **3 solutions** :

## ✅ Solution 1 : Continuer SANS Docker (RAPIDE)

Cette solution permet au pipeline de continuer sans Docker en utilisant H2 en mémoire.

### Étape 1 : Configurer la variable d'environnement

**Option A - Dans le Job Jenkins :**
1. Allez dans votre job → **Configure**
2. Faites défiler jusqu'à **Build Environment**
3. Cochez **Use specific environment variables**
4. Cliquez sur **Add**
5. Ajoutez :
   - **Name**: `SKIP_DOCKER`
   - **Value**: `true`
6. **Save**

**Option B - Globalement dans Jenkins :**
1. **Manage Jenkins** → **Configure System**
2. Faites défiler jusqu'à **Global properties**
3. Cochez **Environment variables**
4. Cliquez sur **Add**
5. Ajoutez :
   - **Name**: `SKIP_DOCKER`
   - **Value**: `true`
6. **Save**

### Résultat
- ✅ Le pipeline continuera sans Docker
- ✅ Les microservices utiliseront H2 en mémoire
- ⚠️ Les tests d'intégration avec MySQL seront ignorés
- ✅ Les tests unitaires fonctionneront normalement

---

## ✅ Solution 2 : Configurer Docker dans Jenkins (RECOMMANDÉ)

### Sur macOS (Docker Desktop)

1. **Installer Docker Desktop** (si pas déjà fait)
   - Téléchargez depuis : https://www.docker.com/products/docker-desktop
   - Installez et démarrez Docker Desktop

2. **Configurer le PATH dans Jenkins**
   - **Manage Jenkins** → **Configure System**
   - **Global properties** → **Environment variables**
   - Ajoutez :
     ```
     Name: PATH
     Value: /usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH
     ```

3. **Vérifier que Docker fonctionne**
   - Ouvrez un terminal
   - Exécutez : `docker --version`
   - Si ça fonctionne, Docker est prêt

### Sur Linux

1. **Installer Docker**
   ```bash
   sudo apt-get update
   sudo apt-get install docker.io
   ```

2. **Démarrer Docker**
   ```bash
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

3. **Ajouter Jenkins au groupe docker**
   ```bash
   sudo usermod -aG docker jenkins
   sudo systemctl restart jenkins
   ```

4. **Configurer le PATH dans Jenkins**
   - **Manage Jenkins** → **Configure System**
   - **Global properties** → **Environment variables**
   - Ajoutez :
     ```
     Name: PATH
     Value: /usr/bin:/usr/local/bin:/bin:$PATH
     ```

---

## ✅ Solution 3 : Utiliser un Agent Jenkins avec Docker

Si vous utilisez des agents Jenkins :

1. **Configurez un agent** avec Docker pré-installé
2. Dans la configuration de l'agent, ajoutez Docker au PATH
3. Utilisez cet agent spécifiquement pour les builds nécessitant Docker

---

## 🔍 Diagnostic Avancé

Si Docker est toujours introuvable après configuration :

### Vérifier manuellement depuis Jenkins

1. Créez un job de test simple avec ce script :
   ```groovy
   pipeline {
       agent any
       stages {
           stage('Test Docker') {
               steps {
                   sh '''
                       echo "PATH: $PATH"
                       echo "USER: $USER"
                       which docker || echo "docker non trouvé"
                       docker --version || echo "docker ne fonctionne pas"
                   '''
               }
           }
       }
   }
   ```

2. Exécutez ce job et vérifiez les logs

### Vérifier les permissions

Sur Linux :
```bash
# Vérifier que Jenkins peut accéder à Docker
sudo -u jenkins docker ps

# Si erreur "permission denied"
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Vérifier que Docker est démarré

```bash
# Linux
sudo systemctl status docker

# macOS
# Vérifiez que Docker Desktop est ouvert (icône dans la barre de menu)
```

---

## 📝 Checklist de Configuration

- [ ] Docker est installé sur la machine Jenkins
- [ ] Docker est démarré (Docker Desktop ouvert sur macOS)
- [ ] PATH est configuré dans Jenkins (Global properties)
- [ ] Jenkins a les permissions Docker (Linux: groupe docker)
- [ ] Jenkins a été redémarré après configuration
- [ ] Test manuel de Docker fonctionne

---

## 🎯 Solution Immédiate

**Pour continuer MAINTENANT sans attendre la configuration Docker :**

1. Dans votre job Jenkins → **Configure**
2. **Build Environment** → **Use specific environment variables**
3. Ajoutez : `SKIP_DOCKER=true`
4. **Save** et relancez le build

Le pipeline continuera avec H2 en mémoire. Vous pourrez configurer Docker plus tard.

---

## 💡 Pourquoi Docker n'est pas trouvé ?

Les raisons courantes :
1. **Docker n'est pas dans le PATH** de l'utilisateur Jenkins
2. **Docker n'est pas démarré** (Docker Desktop fermé)
3. **Permissions insuffisantes** (Jenkins n'est pas dans le groupe docker)
4. **Jenkins n'a pas été redémarré** après configuration

La solution 1 (SKIP_DOCKER=true) permet de contourner temporairement le problème.


