---
name: performance-testing
description: "Locust load testing in Python - user behavior, task weighting, custom shapes, distributed testing, and performance assertions"
metadata:
  languages: "python"
  versions: "2.32.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "locust,performance,load-testing,stress,python,benchmarking"
---

# Locust Performance Testing Guidelines

## Installation

```bash
pip install locust
```

## Quick Start

```python
# locustfile.py
from locust import HttpUser, task, between

class WebUser(HttpUser):
    wait_time = between(1, 3)  # random wait 1-3s between tasks

    @task
    def get_users(self):
        self.client.get("/api/users")

    @task
    def get_homepage(self):
        self.client.get("/")
```

```bash
# Web UI mode
locust -f locustfile.py --host http://localhost:3000

# Headless mode
locust -f locustfile.py --host http://localhost:3000 \
  --users 100 --spawn-rate 10 --run-time 5m --headless
```

## HTTP Requests

```python
from locust import HttpUser, task

class ApiUser(HttpUser):
    @task
    def get_users(self):
        self.client.get("/api/users")

    @task
    def create_user(self):
        self.client.post("/api/users", json={
            "name": "Alice",
            "email": "alice@test.com"
        })

    @task
    def update_user(self):
        self.client.put("/api/users/1", json={"name": "Updated"})

    @task
    def delete_user(self):
        self.client.delete("/api/users/1")

    @task
    def get_with_params(self):
        self.client.get("/api/users", params={"page": 1, "limit": 10})

    @task
    def post_form(self):
        self.client.post("/login", data={"username": "alice", "password": "secret"})

    @task
    def with_headers(self):
        self.client.get("/api/protected", headers={
            "Authorization": "Bearer token123",
            "Accept": "application/json"
        })
```

## Task Weighting

```python
class WebUser(HttpUser):
    wait_time = between(1, 3)

    @task(10)  # 10x more likely than weight-1 tasks
    def browse(self):
        self.client.get("/products")

    @task(3)
    def search(self):
        self.client.get("/search", params={"q": "test"})

    @task(1)   # least frequent
    def purchase(self):
        self.client.post("/checkout", json={"product_id": 1})
```

## Response Validation

```python
class ApiUser(HttpUser):
    @task
    def validated_request(self):
        with self.client.get("/api/users", catch_response=True) as res:
            if res.status_code != 200:
                res.failure(f"Got status {res.status_code}")
            elif len(res.json()) == 0:
                res.failure("Empty response")
            elif res.elapsed.total_seconds() > 1:
                res.failure(f"Too slow: {res.elapsed.total_seconds()}s")
            else:
                res.success()

    @task
    def check_json_structure(self):
        with self.client.get("/api/users/1", catch_response=True) as res:
            data = res.json()
            if "id" not in data or "name" not in data:
                res.failure("Missing required fields")
```

## Lifecycle Hooks

```python
class WebUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        """Runs once per user on start — login, setup"""
        res = self.client.post("/api/login", json={
            "email": "test@test.com",
            "password": "secret"
        })
        self.token = res.json()["token"]
        self.client.headers.update({"Authorization": f"Bearer {self.token}"})

    def on_stop(self):
        """Runs once per user on stop — cleanup"""
        self.client.post("/api/logout")

    @task
    def protected_action(self):
        self.client.get("/api/dashboard")
```

## TaskSets (Grouped Behaviors)

```python
from locust import HttpUser, TaskSet, task, between

class BrowsingTasks(TaskSet):
    @task(3)
    def view_products(self):
        self.client.get("/products")

    @task(1)
    def view_product_detail(self):
        self.client.get("/products/1")

    @task(1)
    def stop_browsing(self):
        self.interrupt()  # return to parent

class CheckoutTasks(TaskSet):
    @task
    def add_to_cart(self):
        self.client.post("/cart", json={"product_id": 1})

    @task
    def checkout(self):
        self.client.post("/checkout")
        self.interrupt()

class WebUser(HttpUser):
    wait_time = between(1, 3)
    tasks = {BrowsingTasks: 3, CheckoutTasks: 1}  # 75% browse, 25% checkout
```

## Sequential Tasks

```python
from locust import HttpUser, SequentialTaskSet, task

class PurchaseFlow(SequentialTaskSet):
    """Tasks run in order"""
    @task
    def browse(self):
        self.client.get("/products")

    @task
    def add_to_cart(self):
        self.client.post("/cart", json={"product_id": 1})

    @task
    def checkout(self):
        self.client.post("/checkout")

    @task
    def confirm(self):
        self.client.post("/confirm")
        self.interrupt()

class WebUser(HttpUser):
    wait_time = between(1, 3)
    tasks = [PurchaseFlow]
```

## Custom Load Shapes

```python
from locust import LoadTestShape

class StepLoadShape(LoadTestShape):
    """Step pattern: add 10 users every 30 seconds"""
    step_time = 30
    step_load = 10
    time_limit = 300  # 5 minutes total

    def tick(self):
        run_time = self.get_run_time()
        if run_time > self.time_limit:
            return None  # stop test
        current_step = run_time // self.step_time + 1
        return (current_step * self.step_load, self.step_load)  # (users, spawn_rate)

class SpikeShape(LoadTestShape):
    """Spike: normal → spike → normal"""
    stages = [
        {"duration": 60, "users": 10, "spawn_rate": 10},
        {"duration": 30, "users": 200, "spawn_rate": 50},  # spike
        {"duration": 60, "users": 200, "spawn_rate": 50},
        {"duration": 30, "users": 10, "spawn_rate": 50},   # recovery
        {"duration": 120, "users": 10, "spawn_rate": 10},
    ]

    def tick(self):
        run_time = self.get_run_time()
        for stage in self.stages:
            if run_time < stage["duration"]:
                return (stage["users"], stage["spawn_rate"])
            run_time -= stage["duration"]
        return None
```

## Request Grouping (Dynamic URLs)

```python
class ApiUser(HttpUser):
    @task
    def get_user(self):
        user_id = random.randint(1, 1000)
        # Group all /api/users/<id> under one metric name
        self.client.get(f"/api/users/{user_id}", name="/api/users/[id]")

    @task
    def search(self):
        query = random.choice(["laptop", "phone", "tablet"])
        self.client.get(f"/search?q={query}", name="/search?q=[query]")
```

## File Upload

```python
class UploadUser(HttpUser):
    @task
    def upload_file(self):
        with open("test-data/sample.pdf", "rb") as f:
            self.client.post("/api/upload", files={"file": f})
```

## Distributed Testing

```bash
# Master
locust -f locustfile.py --master --host http://localhost:3000

# Workers (on different machines or terminals)
locust -f locustfile.py --worker --master-host 192.168.1.100

# Docker Compose
# docker-compose.yml
# master:
#   image: locustio/locust
#   command: -f /mnt/locust/locustfile.py --master
# worker:
#   image: locustio/locust
#   command: -f /mnt/locust/locustfile.py --worker --master-host master
#   deploy:
#     replicas: 4
```

## Events and Listeners

```python
from locust import events
import time

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print("Load test starting...")

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    print("Load test complete!")

@events.request.add_listener
def on_request(request_type, name, response_time, response_length, exception, **kwargs):
    if response_time > 1000:
        print(f"SLOW: {name} took {response_time}ms")
```

## Headless with Assertions (CI/CD)

```python
# conftest.py or test_performance.py
import subprocess
import json

def test_api_performance():
    result = subprocess.run([
        "locust", "-f", "locustfile.py",
        "--host", "http://localhost:3000",
        "--users", "50",
        "--spawn-rate", "10",
        "--run-time", "2m",
        "--headless",
        "--csv", "results",
    ], capture_output=True, text=True)

    # Parse CSV results
    import csv
    with open("results_stats.csv") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["Name"] == "Aggregated":
                p95 = float(row["95%"])
                fail_ratio = float(row["Failure Count"]) / max(float(row["Request Count"]), 1)
                assert p95 < 500, f"p95 response time {p95}ms exceeds 500ms"
                assert fail_ratio < 0.01, f"Failure rate {fail_ratio:.2%} exceeds 1%"
```

## Common Patterns

### Auth token reuse

```python
class AuthUser(HttpUser):
    token = None

    def on_start(self):
        if not AuthUser.token:
            res = self.client.post("/api/login", json={"email": "test@test.com", "password": "secret"})
            AuthUser.token = res.json()["token"]
        self.client.headers["Authorization"] = f"Bearer {AuthUser.token}"
```

### Data-driven testing

```python
import csv

class DataDrivenUser(HttpUser):
    users_data = []

    def on_start(self):
        if not DataDrivenUser.users_data:
            with open("test-data/users.csv") as f:
                DataDrivenUser.users_data = list(csv.DictReader(f))
        self.user_data = random.choice(DataDrivenUser.users_data)

    @task
    def login(self):
        self.client.post("/login", json={
            "email": self.user_data["email"],
            "password": self.user_data["password"]
        })
```

## CLI Reference

```bash
locust -f locustfile.py --host http://localhost:3000  # Web UI at :8089
locust --headless -u 100 -r 10 -t 5m                 # headless: 100 users, spawn 10/s, 5 min
locust --csv results                                  # export CSV stats
locust --html report.html                             # HTML report
locust --master                                       # distributed master
locust --worker --master-host IP                      # distributed worker
```

## Tips

- Use `catch_response=True` with `res.failure()` / `res.success()` for custom pass/fail logic
- Use `name=` parameter to group dynamic URLs under a single metric
- Use `on_start()` for per-user setup (login), not `@task` (avoids measuring setup as a task)
- Use `SequentialTaskSet` for ordered flows (browse → cart → checkout)
- Use `LoadTestShape` for custom ramp patterns instead of CLI flags
- For CI/CD, use `--headless --csv results` and parse CSV for assertions
- Use `self.interrupt()` in `TaskSet` to return control to parent
