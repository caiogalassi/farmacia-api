# FarmaSystem — API REST Spring Boot + PostgreSQL

Sistema de gestao de farmacia com estoque, vendas (PDV), clientes e financeiro.

---

## Requisitos

- Java 17+
- Maven 3.8+
- PostgreSQL 14+

---

## Configuracao do banco de dados

1. Crie o banco no PostgreSQL:
```sql
CREATE DATABASE farmacia_db;
```

2. Edite o arquivo `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/farmacia_db
spring.datasource.username=SEU_USUARIO
spring.datasource.password=SUA_SENHA
```

---

## Como executar

```bash
# Clonar / entrar na pasta
cd farmacia-api

# Compilar e executar
mvn spring-boot:run

# Ou gerar o JAR e executar
mvn clean package
java -jar target/farmacia-api-1.0.0.jar
```

A API estara disponivel em: `http://localhost:8080`

---

## Endpoints da API

### Medicamentos — /api/medicamentos

| Metodo | Endpoint                         | Descricao                        |
|--------|----------------------------------|----------------------------------|
| GET    | /api/medicamentos                | Listar todos                     |
| GET    | /api/medicamentos?nome=xxx       | Buscar por nome                  |  
| GET    | /api/medicamentos?categoria=xxx  | Filtrar por categoria            |
| GET    | /api/medicamentos/{id}           | Buscar por ID                    |
| GET    | /api/medicamentos/estoque-baixo  | Listar com estoque baixo         |
| GET    | /api/medicamentos/vencendo?dias=30| Listar vencendo em X dias       |
| GET    | /api/medicamentos/vencidos       | Listar vencidos                  |
| GET    | /api/medicamentos/categorias     | Listar categorias existentes     |
| POST   | /api/medicamentos                | Cadastrar medicamento            |
| PUT    | /api/medicamentos/{id}           | Atualizar medicamento            |
| PATCH  | /api/medicamentos/{id}/estoque   | Ajustar estoque (+ ou -)         |
| DELETE | /api/medicamentos/{id}           | Remover medicamento              |

**Exemplo — cadastrar medicamento:**
```json
POST /api/medicamentos
{
  "nome": "Losartana 50mg",
  "principioAtivo": "Losartana Potassica",
  "categoria": "Anti-hipertensivo",
  "fabricante": "EMS",
  "quantidade": 40,
  "quantidadeMinima": 10,
  "preco": 15.90,
  "dataValidade": "2027-06-01",
  "requerReceita": true
}
```

**Exemplo — ajustar estoque (entrada de 20 unidades):**
```json
PATCH /api/medicamentos/1/estoque
{ "quantidade": 20 }
```

---

### Clientes — /api/clientes

| Metodo | Endpoint                     | Descricao              |
|--------|------------------------------|------------------------|
| GET    | /api/clientes                | Listar todos           |
| GET    | /api/clientes?nome=xxx       | Buscar por nome        |
| GET    | /api/clientes/{id}           | Buscar por ID          |
| GET    | /api/clientes/cpf/{cpf}      | Buscar por CPF         |
| POST   | /api/clientes                | Cadastrar cliente      |
| PUT    | /api/clientes/{id}           | Atualizar cliente      |
| DELETE | /api/clientes/{id}           | Remover cliente        |

**Exemplo — cadastrar cliente:**
```json
POST /api/clientes
{
  "nome": "Carlos Lima",
  "cpf": "111.222.333-44",
  "email": "carlos@email.com",
  "telefone": "(43) 98888-5555",
  "dataNascimento": "1985-03-20"
}
```

---

### Vendas — /api/vendas

| Metodo | Endpoint                     | Descricao                  |
|--------|------------------------------|----------------------------|
| GET    | /api/vendas                  | Listar todas               |
| GET    | /api/vendas?clienteId=1      | Vendas por cliente         |
| GET    | /api/vendas/{id}             | Buscar por ID              |
| POST   | /api/vendas                  | Registrar nova venda       |
| PATCH  | /api/vendas/{id}/cancelar    | Cancelar venda             |

**Exemplo — registrar venda:**
```json
POST /api/vendas
{
  "clienteId": 1,
  "formaPagamento": "PIX",
  "desconto": 5.00,
  "observacao": "Cliente programa fidelidade",
  "itens": [
    { "medicamentoId": 1, "quantidade": 2 },
    { "medicamentoId": 3, "quantidade": 1 }
  ]
}
```

Formas de pagamento aceitas: `DINHEIRO`, `CARTAO_CREDITO`, `CARTAO_DEBITO`, `PIX`

---

### Financeiro — /api/financeiro

| Metodo | Endpoint                                        | Descricao                     |
|--------|-------------------------------------------------|-------------------------------|
| GET    | /api/financeiro/hoje                            | Resumo do dia de hoje         |
| GET    | /api/financeiro/resumo?inicio=...&fim=...       | Resumo por periodo            |

**Exemplo:**
```
GET /api/financeiro/resumo?inicio=2026-04-01&fim=2026-04-30
```

**Resposta:**
```json
{
  "totalVendas": 12840.50,
  "quantidadeVendas": 187,
  "ticketMedio": 68.67,
  "periodo": { "inicio": "2026-04-01", "fim": "2026-04-30" }
}
```

---

## Estrutura do projeto

```
farmacia-api/
├── pom.xml
└── src/main/java/com/farmacia/
    ├── FarmaciaApplication.java
    ├── controller/
    │   ├── MedicamentoController.java
    │   ├── ClienteController.java
    │   └── VendaController.java          (inclui FinanceiroController)
    ├── service/
    │   ├── MedicamentoService.java
    │   ├── ClienteService.java
    │   └── VendaService.java
    ├── repository/
    │   ├── MedicamentoRepository.java
    │   ├── ClienteRepository.java
    │   └── VendaRepository.java
    ├── model/
    │   ├── Medicamento.java
    │   ├── Cliente.java
    │   ├── Venda.java
    │   └── ItemVenda.java
    ├── dto/
    │   └── Dtos.java
    └── exception/
        ├── ResourceNotFoundException.java
        └── GlobalExceptionHandler.java
```

---

## Proximos passos sugeridos

- Autenticacao com Spring Security + JWT
- Relatorios em PDF (iText/JasperReports)
- Controle de usuarios e permissoes por cargo
- Notificacoes de estoque baixo por e-mail
- Frontend com React ou Angular consumindo esta API
