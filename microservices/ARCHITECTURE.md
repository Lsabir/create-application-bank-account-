Architecture des microservices

Vue d'ensemble

- api-gateway (8085): point d'entrée HTTP, route vers services.
- auth-service (8080): émission JWT (HS256), endpoint /auth/token.
- account-service (8081): gestion des comptes bancaires.
- document-service (8082): gestion des documents KYC.
- config-server (8888): configuration externalisée (placeholder natif).

Hexagonale (Ports & Adapters)

- domain: entités et ports (interfaces RepositoryPort).
- application: services applicatifs (use-cases), DTOs, mappers MapStruct.
- infrastructure: adapters REST (controllers), JPA repositories, config sécurité.

Communication inter-services

- API REST. Découverte via Swagger (springdoc) par service.
- Gateway route:
  - /accounts/** -> account-service:8081
  - /documents/** -> document-service:8082

Persistance

- Base par service (MySQL):
  - account_db (port host 3307)
  - document_db (port host 3308)

DTOs & Mapping

- Request DTOs avec validation Jakarta (ex: BankAccountRequest).
- Response DTOs (ex: BankAccountResponse).
- MapStruct pour le mapping entre DTOs et entités.

Sécurité

- auth-service: génère JWT en HS256 (clé partagée). Endpoint POST /auth/token.
- account/document: Resource Server JWT (secret partagé via application.yml pour demo).
- Swagger et /v3/api-docs en accès public.

Configuration externalisée

- config-server prêt à l'emploi (profil natif). Les services peuvent être branchés ultérieurement.

Démarrage

1) Démarrer Docker Desktop, puis:
```
cd microservices
docker compose up -d
```
2) Lancer les services:
```
mvn -q -pl auth-service -am spring-boot:run
mvn -q -pl account-service -am spring-boot:run
mvn -q -pl document-service -am spring-boot:run
mvn -q -pl api-gateway -am spring-boot:run
```

Tests rapides

```
TOKEN=$(curl -s -X POST http://localhost:8080/auth/token -H 'Content-Type: application/json' -d '{"username":"alice"}' | jq -r .access_token)
curl -s http://localhost:8081/accounts -H "Authorization: Bearer $TOKEN"
```

Swagger UIs

- Auth: http://localhost:8080/swagger-ui
- Account: http://localhost:8081/swagger-ui
- Document: http://localhost:8082/swagger-ui
- Gateway: http://localhost:8085/swagger-ui

Migration depuis le monolithe

- Étape 1: Rediriger front vers gateway.
- Étape 2: Déplacer logique comptes -> account-service.
- Étape 3: Déplacer fichiers/document -> document-service.
- Étape 4: Activer auth-service et sécuriser routes.
- Étape 5: Supprimer le backend monolithique une fois validé.






