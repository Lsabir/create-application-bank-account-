# Guide de Dépannage Jenkins

## Problème : Échec au stage "Checkout"

### Symptômes
- Le pipeline échoue à l'étape "Checkout"
- Message d'erreur : `checkout scm` échoue
- Toutes les étapes suivantes sont ignorées

### Causes possibles

1. **Job Jenkins mal configuré** (cause la plus fréquente)
2. **URL du dépôt incorrecte**
3. **Credentials Git manquants**
4. **Branche inexistante**

## Solutions

### Solution 1 : Configurer le Job Jenkins correctement

1. **Allez dans votre job Jenkins** → Cliquez sur **"Configure"**

2. **Dans la section "Pipeline"**, vous devez avoir :
   - **Definition**: `Pipeline script from SCM` (⚠️ PAS "Pipeline script")
   - **SCM**: `Git`
   - **Repository URL**: `https://github.com/Lsabir/create-application-bank-account-.git`
   - **Credentials**: (Laissez vide pour dépôt public, ou ajoutez vos credentials)
   - **Branches to build**: `*/main` ou `*/master`
   - **Script Path**: `Jenkinsfile`

3. **Sauvegardez** et relancez le build

### Solution 2 : Vérifier l'URL du dépôt

Assurez-vous que l'URL du dépôt est correcte :
```
https://github.com/Lsabir/create-application-bank-account-.git
```

Testez l'accès :
```bash
git ls-remote https://github.com/Lsabir/create-application-bank-account-.git
```

### Solution 3 : Configurer les Credentials (si dépôt privé)

Si votre dépôt est privé :

1. **Jenkins** → **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. Cliquez sur **"Add Credentials"**
3. Sélectionnez :
   - **Kind**: `Username with password` ou `SSH Username with private key`
   - **Username**: Votre nom d'utilisateur GitHub
   - **Password/Private Key**: Votre token d'accès GitHub ou clé SSH
4. **ID**: `github-credentials` (ou un nom de votre choix)
5. Dans la configuration du job, sélectionnez ces credentials

### Solution 4 : Vérifier la branche

Assurez-vous que la branche existe :
- `main` (branche par défaut moderne)
- `master` (ancienne branche par défaut)

Vérifiez sur GitHub quelle est votre branche par défaut.

### Solution 5 : Alternative - Checkout manuel

Si le problème persiste, le Jenkinsfile a été modifié pour tenter un checkout manuel en cas d'échec. Vérifiez les logs pour voir si cette alternative fonctionne.

## Vérification de la Configuration

### Checklist de configuration du job

- [ ] **Definition** = `Pipeline script from SCM`
- [ ] **SCM** = `Git`
- [ ] **Repository URL** = URL correcte du dépôt
- [ ] **Branches** = `*/main` ou `*/master`
- [ ] **Script Path** = `Jenkinsfile`
- [ ] **Credentials** = Configurés si nécessaire

### Vérifier les outils Jenkins

Dans **Manage Jenkins** → **Global Tool Configuration**, vérifiez :

- [ ] **JDK 17** est configuré (nom exact: `JDK 17`)
- [ ] **Maven** est configuré (nom exact: `Maven`)
- [ ] **NodeJS** est configuré (nom exact: `NodeJS`)

### Vérifier les plugins

Dans **Manage Jenkins** → **Plugins**, vérifiez que ces plugins sont installés :

- [ ] **Pipeline**
- [ ] **Git**
- [ ] **Docker Pipeline**
- [ ] **HTML Publisher**
- [ ] **JUnit**

## Test rapide

Pour tester si le checkout fonctionne, créez un pipeline minimal :

```groovy
pipeline {
    agent any
    stages {
        stage('Test Checkout') {
            steps {
                checkout scm
                sh 'ls -la'
            }
        }
    }
}
```

Si ce pipeline minimal fonctionne, le problème est ailleurs dans le Jenkinsfile.

## Logs à consulter

En cas d'échec, consultez :
1. **Console Output** du build Jenkins
2. Cherchez les lignes contenant "Checkout" ou "checkout scm"
3. Notez le message d'erreur exact

## Erreurs courantes

### "No such file: Jenkinsfile"
- **Cause**: Le Jenkinsfile n'est pas à la racine du dépôt
- **Solution**: Vérifiez que le Jenkinsfile est bien commité et poussé sur GitHub

### "Branch not found"
- **Cause**: La branche spécifiée n'existe pas
- **Solution**: Vérifiez le nom de la branche sur GitHub

### "Permission denied"
- **Cause**: Pas d'accès au dépôt ou credentials incorrects
- **Solution**: Vérifiez les credentials ou rendez le dépôt public

### "Connection timeout"
- **Cause**: Problème réseau ou firewall
- **Solution**: Vérifiez la connectivité réseau de Jenkins

## Support

Si le problème persiste après avoir suivi ces étapes :
1. Consultez les logs complets du build
2. Vérifiez la configuration du job
3. Testez avec un pipeline minimal
4. Vérifiez les permissions Git


