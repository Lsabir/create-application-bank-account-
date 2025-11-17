# Configuration Docker pour Jenkins

## Problème : Docker non trouvé dans Jenkins

Si vous voyez l'erreur `❌ Docker n'est pas installé ou non disponible`, voici comment résoudre le problème.

## Solutions

### Solution 1 : Configurer le PATH dans Jenkins (Recommandé)

1. **Allez dans Jenkins** → **Manage Jenkins** → **Configure System**
2. Faites défiler jusqu'à **Global properties**
3. Cochez **Environment variables**
4. Cliquez sur **Add**
5. Ajoutez :
   - **Name**: `PATH`
   - **Value**: `/usr/bin:/usr/local/bin:/opt/homebrew/bin:$PATH`
   - (Sur macOS avec Homebrew, ajoutez `/opt/homebrew/bin`)
6. **Save**

### Solution 2 : Vérifier l'installation de Docker

#### Sur Linux :
```bash
# Vérifier que Docker est installé
which docker
docker --version

# Si Docker n'est pas installé
sudo apt-get update
sudo apt-get install docker.io
# ou
sudo yum install docker
```

#### Sur macOS :
```bash
# Vérifier Docker Desktop
ls /Applications/Docker.app

# Si Docker Desktop n'est pas installé
# Téléchargez depuis: https://www.docker.com/products/docker-desktop
```

### Solution 3 : Permissions Docker (Linux)

Si Docker est installé mais non accessible :

```bash
# Ajouter l'utilisateur Jenkins au groupe docker
sudo usermod -aG docker jenkins

# Redémarrer Jenkins
sudo systemctl restart jenkins
# ou
sudo service jenkins restart
```

### Solution 4 : Démarrer Docker Daemon

#### Sur Linux :
```bash
# Démarrer le service Docker
sudo systemctl start docker
sudo systemctl enable docker  # Pour démarrer au boot
```

#### Sur macOS :
- Ouvrez **Docker Desktop** depuis Applications
- Attendez que l'icône Docker dans la barre de menu soit verte

### Solution 5 : Utiliser un Agent Jenkins avec Docker

Si vous utilisez des agents Jenkins :

1. **Configurez un agent** avec Docker pré-installé
2. Dans la configuration de l'agent, ajoutez Docker au PATH
3. Utilisez cet agent pour les builds nécessitant Docker

### Solution 6 : Variables d'environnement dans le Job

Dans votre job Jenkins :

1. Allez dans **Configure** du job
2. Dans **Build Environment**, cochez **Use specific environment variables**
3. Ajoutez :
   - `PATH=/usr/bin:/usr/local/bin:$PATH`
   - `DOCKER_HOST=unix:///var/run/docker.sock` (si nécessaire)

## Vérification

Après configuration, testez avec un build simple qui exécute :

```bash
docker --version
docker ps
```

## Diagnostic dans le Jenkinsfile

Le Jenkinsfile amélioré essaie maintenant plusieurs méthodes pour trouver Docker :

1. ✅ Recherche dans le PATH standard
2. ✅ Recherche dans `/usr/bin/docker`
3. ✅ Recherche dans `/usr/local/bin/docker`
4. ✅ Recherche avec `which docker`
5. ✅ Recherche Docker Desktop sur macOS (`/Applications/Docker.app`)

Si Docker est trouvé, le script affichera :
```
✅ Docker trouvé dans [emplacement]
✅ Docker fonctionne: [version]
```

## Problèmes courants

### "Permission denied" lors de l'exécution de Docker
```bash
# Solution: Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### "Cannot connect to the Docker daemon"
- **Linux**: `sudo systemctl start docker`
- **macOS**: Ouvrez Docker Desktop

### Docker trouvé mais ne répond pas
- Vérifiez que le daemon Docker est démarré
- Vérifiez les logs : `sudo journalctl -u docker` (Linux)

## Alternative : Utiliser Docker-in-Docker (DinD)

Si vous utilisez Kubernetes ou des conteneurs pour Jenkins :

```yaml
# Exemple pour Kubernetes
containers:
- name: docker
  image: docker:dind
  securityContext:
    privileged: true
```

## Support

Si le problème persiste après avoir essayé ces solutions :

1. Vérifiez les logs Jenkins : `sudo tail -f /var/log/jenkins/jenkins.log`
2. Vérifiez les logs Docker : `sudo journalctl -u docker`
3. Testez Docker manuellement depuis le serveur Jenkins
4. Consultez la documentation Jenkins pour votre système d'exploitation


