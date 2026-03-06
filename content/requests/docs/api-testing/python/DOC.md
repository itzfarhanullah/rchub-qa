---
name: api-testing
description: "Python API testing with requests and httpx - HTTP methods, authentication, response validation, session management, and async testing"
metadata:
  languages: "python"
  versions: "2.32.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "requests,httpx,api,testing,http,rest,python"
---

# Python API Testing Guidelines (requests + httpx)

## Installation

```bash
pip install requests httpx pytest responses    # responses for mocking
pip install pytest-httpx                       # httpx mock fixture
```

## Quick Start

```python
import requests
import pytest

BASE_URL = "http://localhost:8000/api"

def test_get_users():
    res = requests.get(f"{BASE_URL}/users")
    assert res.status_code == 200
    assert res.headers["Content-Type"] == "application/json"
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_create_user():
    payload = {"name": "Alice", "email": "alice@test.com"}
    res = requests.post(f"{BASE_URL}/users", json=payload)
    assert res.status_code == 201
    user = res.json()
    assert user["name"] == "Alice"
    assert "id" in user
```

## HTTP Methods

```python
# GET
res = requests.get(f"{BASE_URL}/users")

# GET with query params
res = requests.get(f"{BASE_URL}/users", params={"page": 1, "limit": 10, "sort": "name"})

# POST with JSON
res = requests.post(f"{BASE_URL}/users", json={"name": "Alice"})

# PUT
res = requests.put(f"{BASE_URL}/users/1", json={"name": "Updated"})

# PATCH
res = requests.patch(f"{BASE_URL}/users/1", json={"name": "Patched"})

# DELETE
res = requests.delete(f"{BASE_URL}/users/1")
```

## Headers and Authentication

```python
# Custom headers
res = requests.get(
    f"{BASE_URL}/protected",
    headers={
        "Authorization": "Bearer token123",
        "X-Custom-Header": "value",
        "Accept": "application/json",
    }
)

# Basic auth
res = requests.get(f"{BASE_URL}/protected", auth=("username", "password"))

# Bearer token helper
def auth_header(token):
    return {"Authorization": f"Bearer {token}"}

res = requests.get(f"{BASE_URL}/data", headers=auth_header("token123"))

# API key auth
res = requests.get(f"{BASE_URL}/data", headers={"X-API-Key": "key123"})
```

## Response Assertions

```python
res = requests.get(f"{BASE_URL}/users/1")

# Status
assert res.status_code == 200
assert res.ok  # True for 2xx

# Headers
assert "application/json" in res.headers["Content-Type"]

# JSON body
data = res.json()
assert data["name"] == "Alice"
assert data["id"] == 1

# Structure validation
assert set(data.keys()) >= {"id", "name", "email"}

# List assertions
users = requests.get(f"{BASE_URL}/users").json()
assert any(u["name"] == "Alice" for u in users)
assert all("id" in u for u in users)

# Response time
assert res.elapsed.total_seconds() < 0.5

# Text/HTML response
res = requests.get(f"{BASE_URL}/health")
assert res.text == "ok"
```

## Session (Persistent Cookies)

```python
session = requests.Session()

# Login — session stores cookies automatically
session.post(f"{BASE_URL}/login", json={"email": "alice@test.com", "password": "secret"})

# Subsequent requests carry cookies
res = session.get(f"{BASE_URL}/profile")
assert res.status_code == 200
assert res.json()["email"] == "alice@test.com"

# Session-level headers
session.headers.update({"Authorization": "Bearer token123"})
res = session.get(f"{BASE_URL}/data")  # header applied automatically
```

## File Upload

```python
# Single file
with open("test/fixtures/sample.pdf", "rb") as f:
    res = requests.post(f"{BASE_URL}/upload", files={"file": f})
assert res.status_code == 200

# Multiple files
files = [
    ("photos", open("photo1.jpg", "rb")),
    ("photos", open("photo2.jpg", "rb")),
]
res = requests.post(f"{BASE_URL}/upload", files=files, data={"description": "Test"})

# File with custom filename and content type
files = {"file": ("report.pdf", open("test.pdf", "rb"), "application/pdf")}
res = requests.post(f"{BASE_URL}/upload", files=files)
```

## Form Data

```python
# URL-encoded form
res = requests.post(
    f"{BASE_URL}/login",
    data={"username": "alice", "password": "secret"}
)

# Multipart form with file
res = requests.post(
    f"{BASE_URL}/submit",
    data={"name": "Alice"},
    files={"avatar": open("avatar.png", "rb")}
)
```

## Error Response Testing

```python
def test_validation_error():
    res = requests.post(f"{BASE_URL}/users", json={"name": ""})
    assert res.status_code == 400
    errors = res.json()["errors"]
    assert any(e["field"] == "name" for e in errors)

def test_not_found():
    res = requests.get(f"{BASE_URL}/users/99999")
    assert res.status_code == 404

def test_unauthorized():
    res = requests.get(f"{BASE_URL}/protected")
    assert res.status_code == 401

def test_method_not_allowed():
    res = requests.patch(f"{BASE_URL}/readonly-resource")
    assert res.status_code == 405
```

## Timeout and Retry

```python
# Timeout (connect, read)
res = requests.get(f"{BASE_URL}/slow", timeout=(3, 10))

# Timeout assertion
import pytest
with pytest.raises(requests.exceptions.Timeout):
    requests.get(f"{BASE_URL}/very-slow", timeout=0.001)

# Retry with backoff
from urllib3.util.retry import Retry
from requests.adapters import HTTPAdapter

session = requests.Session()
retry = Retry(total=3, backoff_factor=0.5, status_forcelist=[500, 502, 503])
session.mount("http://", HTTPAdapter(max_retries=retry))
```

## Async Testing with httpx

```python
import httpx
import pytest

@pytest.mark.asyncio
async def test_async_get():
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        res = await client.get("/users")
        assert res.status_code == 200
        assert len(res.json()) > 0

@pytest.mark.asyncio
async def test_async_post():
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        res = await client.post("/users", json={"name": "Alice"})
        assert res.status_code == 201

# Concurrent requests
import asyncio

@pytest.mark.asyncio
async def test_concurrent_requests():
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        tasks = [client.get(f"/users/{i}") for i in range(1, 6)]
        responses = await asyncio.gather(*tasks)
        assert all(r.status_code == 200 for r in responses)
```

## Mocking HTTP Calls (responses library)

```python
import responses

@responses.activate
def test_external_api_call():
    responses.add(
        responses.GET,
        "https://api.external.com/data",
        json={"result": "mocked"},
        status=200,
    )

    # Code under test calls external API
    res = requests.get("https://api.external.com/data")
    assert res.json()["result"] == "mocked"
    assert len(responses.calls) == 1

@responses.activate
def test_external_api_error():
    responses.add(
        responses.GET,
        "https://api.external.com/data",
        json={"error": "server error"},
        status=500,
    )

    res = requests.get("https://api.external.com/data")
    assert res.status_code == 500
```

## Pytest Fixtures

```python
import pytest
import requests

@pytest.fixture(scope="session")
def api_url():
    return "http://localhost:8000/api"

@pytest.fixture(scope="session")
def auth_session(api_url):
    session = requests.Session()
    res = session.post(f"{api_url}/login", json={"email": "admin@test.com", "password": "admin"})
    assert res.status_code == 200
    return session

@pytest.fixture
def created_user(auth_session, api_url):
    res = auth_session.post(f"{api_url}/users", json={"name": "Test User", "email": "test@test.com"})
    user = res.json()
    yield user
    auth_session.delete(f"{api_url}/users/{user['id']}")

def test_get_created_user(auth_session, api_url, created_user):
    res = auth_session.get(f"{api_url}/users/{created_user['id']}")
    assert res.status_code == 200
    assert res.json()["name"] == "Test User"
```

## JSON Schema Validation

```python
from jsonschema import validate

user_schema = {
    "type": "object",
    "required": ["id", "name", "email"],
    "properties": {
        "id": {"type": "integer"},
        "name": {"type": "string", "minLength": 1},
        "email": {"type": "string", "format": "email"},
    },
    "additionalProperties": False,
}

def test_user_response_schema():
    res = requests.get(f"{BASE_URL}/users/1")
    validate(instance=res.json(), schema=user_schema)
```

## Common Patterns

### CRUD test suite

```python
class TestUsersCRUD:
    def test_create(self, auth_session, api_url):
        res = auth_session.post(f"{api_url}/users", json={"name": "New", "email": "new@test.com"})
        assert res.status_code == 201
        self.user_id = res.json()["id"]

    def test_read(self, auth_session, api_url):
        res = auth_session.get(f"{api_url}/users/{self.user_id}")
        assert res.status_code == 200

    def test_update(self, auth_session, api_url):
        res = auth_session.put(f"{api_url}/users/{self.user_id}", json={"name": "Updated"})
        assert res.status_code == 200

    def test_delete(self, auth_session, api_url):
        res = auth_session.delete(f"{api_url}/users/{self.user_id}")
        assert res.status_code == 204
```

### Pagination testing

```python
def test_pagination(api_url):
    page1 = requests.get(f"{api_url}/users", params={"page": 1, "limit": 5}).json()
    page2 = requests.get(f"{api_url}/users", params={"page": 2, "limit": 5}).json()
    assert len(page1["data"]) <= 5
    assert page1["data"] != page2["data"]
    assert page1["total"] == page2["total"]
```

## Tips

- Use `requests.Session()` for auth persistence and connection pooling
- Use `json=` not `data=` for JSON payloads (auto-sets Content-Type)
- Use `res.raise_for_status()` in helpers to fail fast on unexpected errors
- Use `httpx.AsyncClient` for parallel request testing
- Always validate response schema, not just status codes
- Use `responses` library to mock external API calls in unit tests
