---
name: contract-testing
description: "Pact consumer-driven contract testing in Python - provider/consumer contracts, HTTP interactions, state handlers, and verification"
metadata:
  languages: "python"
  versions: "2.2.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "pact,contract-testing,api,consumer-driven,microservices,python"
---

# Pact Contract Testing Guidelines (Python)

## Installation

```bash
pip install pact-python
```

## Core Concepts

- **Consumer** — service that calls an API
- **Provider** — service that serves the API
- **Pact** — a contract JSON recording expected interactions
- **Flow**: Consumer writes tests → generates pact → Provider verifies pact

## Consumer Side: Writing Pact Tests

### Basic consumer test

```python
import pytest
import requests
from pact import Consumer, Provider

PACT_DIR = "./pacts"

@pytest.fixture(scope="session")
def pact():
    pact = Consumer("UserUI").has_pact_with(
        Provider("UserService"),
        pact_dir=PACT_DIR,
    )
    pact.start_service()
    yield pact
    pact.stop_service()
    pact.finalize()

def test_get_user(pact):
    expected = {"id": 1, "name": "Alice", "email": "alice@test.com"}

    (pact
     .given("user 1 exists")
     .upon_receiving("a request for user 1")
     .with_request("GET", "/api/users/1")
     .will_respond_with(200, body=expected))

    with pact:
        # Call your actual API client pointing to pact mock
        res = requests.get(f"{pact.uri}/api/users/1")
        assert res.status_code == 200
        user = res.json()
        assert user["name"] == "Alice"
```

### POST interaction

```python
def test_create_user(pact):
    request_body = {"name": "Bob", "email": "bob@test.com"}
    response_body = {"id": 2, "name": "Bob", "email": "bob@test.com"}

    (pact
     .upon_receiving("a request to create a user")
     .with_request("POST", "/api/users",
                   headers={"Content-Type": "application/json"},
                   body=request_body)
     .will_respond_with(201, body=response_body))

    with pact:
        res = requests.post(
            f"{pact.uri}/api/users",
            json=request_body,
            headers={"Content-Type": "application/json"}
        )
        assert res.status_code == 201
        assert res.json()["name"] == "Bob"
```

### Matchers (flexible matching)

```python
from pact import Like, EachLike, Regex, Term

# Like — matches type, not exact value
response_body = Like({
    "id": 1,                  # matches any integer
    "name": "Alice",          # matches any string
    "active": True,           # matches any boolean
})

# EachLike — array where each element matches shape
response_body = EachLike({
    "id": 1,
    "name": "Alice",
})

# Regex — matches pattern
response_body = {
    "email": Regex("alice@test.com", r"^[\w.]+@[\w.]+$"),
    "status": Term(consumer="active", regex=r"^(active|inactive)$"),
}

# Nested structure
response_body = Like({
    "data": EachLike({"id": 1, "name": "Alice"}),
    "total": 10,
    "page": 1,
})
```

### Query parameters

```python
(pact
 .upon_receiving("a paginated request")
 .with_request("GET", "/api/users",
               query={"page": ["1"], "limit": ["10"]})
 .will_respond_with(200, body=EachLike({"id": 1})))
```

### Error responses

```python
def test_user_not_found(pact):
    (pact
     .given("user 999 does not exist")
     .upon_receiving("a request for non-existent user")
     .with_request("GET", "/api/users/999")
     .will_respond_with(404, body={"error": "User not found"}))

    with pact:
        res = requests.get(f"{pact.uri}/api/users/999")
        assert res.status_code == 404
```

### Headers

```python
(pact
 .upon_receiving("an authenticated request")
 .with_request("GET", "/api/protected",
               headers={"Authorization": "Bearer token123"})
 .will_respond_with(200,
                    headers={"Content-Type": "application/json"},
                    body={"data": "secret"}))
```

## Provider Side: Verification

```python
from pact import Verifier

def test_provider_honors_pact():
    verifier = Verifier(
        provider="UserService",
        provider_base_url="http://localhost:3000",
    )

    output, logs = verifier.verify_pacts(
        "./pacts/UserUI-UserService.json",
        provider_states_setup_url="http://localhost:3000/_pact/provider-states",
    )
    assert output == 0
```

### Provider state handler (in your app)

```python
# Add a state setup endpoint to your provider app (test only)
from flask import Flask, request

app = Flask(__name__)

@app.route("/_pact/provider-states", methods=["POST"])
def provider_states():
    state = request.json
    if state["state"] == "user 1 exists":
        db.users.create(id=1, name="Alice", email="alice@test.com")
    elif state["state"] == "user 999 does not exist":
        db.users.delete_all()
    return {"status": "ok"}
```

### Verify from Pact Broker

```python
verifier = Verifier(
    provider="UserService",
    provider_base_url="http://localhost:3000",
)

output, logs = verifier.verify_with_broker(
    broker_url="https://your-broker.pactflow.io",
    broker_token=os.environ["PACT_BROKER_TOKEN"],
    publish_version=os.environ["GIT_SHA"],
    publish_verification_results=True,
    provider_states_setup_url="http://localhost:3000/_pact/provider-states",
)
```

## Pact Broker CLI

```bash
# Publish pact
pact-broker publish ./pacts \
  --consumer-app-version $GIT_SHA \
  --broker-base-url https://your-broker.pactflow.io \
  --broker-token $PACT_BROKER_TOKEN

# Can-I-Deploy check
pact-broker can-i-deploy \
  --pacticipant UserUI \
  --version $GIT_SHA \
  --to-environment production
```

## Pytest Fixtures

```python
import pytest
from pact import Consumer, Provider

@pytest.fixture(scope="session")
def pact():
    pact = Consumer("MyConsumer").has_pact_with(
        Provider("MyProvider"),
        pact_dir="./pacts",
        log_dir="./logs",
    )
    pact.start_service()
    yield pact
    pact.stop_service()
    pact.finalize()

@pytest.fixture(scope="session")
def pact_url(pact):
    return pact.uri
```

## Multiple Interactions in One Test

```python
def test_full_user_flow(pact):
    # Create user
    (pact
     .upon_receiving("create user request")
     .with_request("POST", "/api/users", body={"name": "Alice"})
     .will_respond_with(201, body=Like({"id": 1, "name": "Alice"})))

    # Get user
    (pact
     .given("user 1 exists")
     .upon_receiving("get user request")
     .with_request("GET", "/api/users/1")
     .will_respond_with(200, body=Like({"id": 1, "name": "Alice"})))

    with pact:
        # All interactions verified in order
        create_res = requests.post(f"{pact.uri}/api/users", json={"name": "Alice"})
        assert create_res.status_code == 201

        get_res = requests.get(f"{pact.uri}/api/users/1")
        assert get_res.status_code == 200
```

## CI/CD Integration

```yaml
# GitHub Actions
consumer-test:
  steps:
    - run: pytest tests/pact/ -v
    - run: pact-broker publish ./pacts --consumer-app-version $GITHUB_SHA

provider-verify:
  steps:
    - run: python -m flask run &
    - run: pytest tests/pact_provider/ -v
    - run: pact-broker can-i-deploy --pacticipant UserService --version $GITHUB_SHA --to-environment production
```

## Common Patterns

### API client testing

```python
# Test your actual API client, not raw requests
class UserClient:
    def __init__(self, base_url):
        self.base_url = base_url

    def get_user(self, user_id):
        res = requests.get(f"{self.base_url}/api/users/{user_id}")
        res.raise_for_status()
        return res.json()

def test_user_client(pact):
    (pact
     .given("user 1 exists")
     .upon_receiving("get user via client")
     .with_request("GET", "/api/users/1")
     .will_respond_with(200, body=Like({"id": 1, "name": "Alice"})))

    with pact:
        client = UserClient(pact.uri)
        user = client.get_user(1)
        assert user["name"] == "Alice"
```

## Tips

- Write consumer tests FIRST — they define the contract
- Use matchers (`Like`, `EachLike`, `Regex`) — don't hardcode exact values
- Provider state strings must match exactly between consumer and provider
- Keep pact tests minimal — test API shape, not business logic
- Each consumer-provider pair generates one pact file
- Use `pact-broker can-i-deploy` in CI before deploying
- Run provider verification against REAL provider code, not mocks
- Commit pact JSON to version control OR use Pact Broker (not both)
