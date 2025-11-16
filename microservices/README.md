Bank Microservices

Build

```
mvn -q -f pom.xml -T 1C clean package
```

Databases

```
docker compose up -d
```

- account MySQL on 3307 (db: account_db / account:account)
- document MySQL on 3308 (db: document_db / document:document)

Run services

- Auth: `mvn -q -pl auth-service -am spring-boot:run`
- Account: `mvn -q -pl account-service -am spring-boot:run`
- Document: `mvn -q -pl document-service -am spring-boot:run`
- Gateway: `mvn -q -pl api-gateway -am spring-boot:run`
- Config: `mvn -q -pl config-server -am spring-boot:run`

Swagger UIs

- Auth: http://localhost:8080/swagger-ui
- Account: http://localhost:8081/swagger-ui
- Document: http://localhost:8082/swagger-ui
- Gateway: http://localhost:8085/swagger-ui

Token then call

```
TOKEN=$(curl -s -X POST http://localhost:8080/auth/token -H 'Content-Type: application/json' -d '{"username":"alice"}' | jq -r .access_token)

curl -s http://localhost:8081/accounts -H "Authorization: Bearer $TOKEN"
```






