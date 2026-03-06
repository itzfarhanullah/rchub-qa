---
name: testing
description: "Pytest testing framework for Python - fixtures, parametrize, markers, mocking, assertions, and plugin ecosystem"
metadata:
  languages: "python"
  versions: "8.3.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "pytest,testing,python,unit-test,fixtures"
---

# Pytest Testing Guidelines

## Installation

```bash
pip install pytest
pip install pytest-mock       # mocking
pip install pytest-cov        # coverage
pip install pytest-asyncio    # async tests
pip install pytest-xdist      # parallel execution
```

## Quick Start

```python
# test_example.py
def test_addition():
    assert 1 + 1 == 2

def test_string():
    assert "hello".upper() == "HELLO"
```

```bash
pytest                      # run all tests
pytest test_example.py      # specific file
pytest -v                   # verbose output
```

## Test Discovery

Pytest finds tests automatically:
- Files named `test_*.py` or `*_test.py`
- Functions named `test_*`
- Classes named `Test*` (no `__init__` method)
- Methods named `test_*` within test classes

```python
# test_math.py
def test_add():
    assert 1 + 1 == 2

class TestCalculator:
    def test_multiply(self):
        assert 2 * 3 == 6

    def test_divide(self):
        assert 10 / 2 == 5
```

## Assertions

```python
# Basic
assert result == expected
assert result != unexpected
assert result is True
assert result is None
assert result is not None

# Collections
assert item in collection
assert item not in collection
assert len(items) == 5
assert set(a) == set(b)

# Approximate (floats)
assert result == pytest.approx(3.14, rel=1e-3)
assert result == pytest.approx(3.14, abs=0.01)

# Exception testing
with pytest.raises(ValueError):
    int("not a number")

with pytest.raises(ValueError, match="invalid literal"):
    int("not a number")

with pytest.raises(ValueError) as exc_info:
    int("not a number")
assert "invalid literal" in str(exc_info.value)

# Warnings
with pytest.warns(DeprecationWarning):
    deprecated_function()

# Custom failure message
assert result > 0, f"Expected positive, got {result}"
```

## Fixtures

```python
import pytest

@pytest.fixture
def sample_user():
    return {"name": "Alice", "email": "alice@test.com"}

def test_user_name(sample_user):
    assert sample_user["name"] == "Alice"

def test_user_email(sample_user):
    assert "@" in sample_user["email"]
```

### Fixture Scope

```python
@pytest.fixture(scope="function")    # default - per test
def db_connection():
    conn = create_connection()
    yield conn
    conn.close()

@pytest.fixture(scope="class")       # shared per class
def shared_resource():
    return create_resource()

@pytest.fixture(scope="module")      # shared per module
def module_db():
    db = setup_db()
    yield db
    teardown_db(db)

@pytest.fixture(scope="session")     # shared across all tests
def app_config():
    return load_config()
```

### Yield Fixtures (Setup/Teardown)

```python
@pytest.fixture
def temp_db():
    db = create_database()
    populate_test_data(db)
    yield db                    # test runs here
    db.drop_all()
    db.close()
```

### Autouse Fixtures

```python
@pytest.fixture(autouse=True)
def reset_state():
    """Automatically runs before each test in this module."""
    reset_global_state()
    yield
    cleanup()
```

### Factory Fixtures

```python
@pytest.fixture
def make_user():
    def _make_user(name="Alice", email="alice@test.com"):
        return {"name": name, "email": email}
    return _make_user

def test_custom_user(make_user):
    user = make_user(name="Bob", email="bob@test.com")
    assert user["name"] == "Bob"
```

### conftest.py

Shared fixtures go in `conftest.py` — automatically discovered by pytest:

```python
# conftest.py (project root or test directory)
import pytest

@pytest.fixture
def api_client():
    client = create_client()
    yield client
    client.close()

@pytest.fixture
def auth_token(api_client):
    response = api_client.post("/login", json={"user": "test", "pass": "test"})
    return response.json()["token"]
```

Fixtures in `conftest.py` are available to all tests in the same directory and subdirectories. You can have multiple `conftest.py` files at different levels.

## Parametrize

```python
@pytest.mark.parametrize("input,expected", [
    (1, 1),
    (2, 4),
    (3, 9),
    (4, 16),
])
def test_square(input, expected):
    assert input ** 2 == expected

# Multiple parameters
@pytest.mark.parametrize("x", [1, 2])
@pytest.mark.parametrize("y", [10, 20])
def test_multiply(x, y):
    assert x * y > 0  # runs 4 combinations

# With IDs for readable output
@pytest.mark.parametrize("input,expected", [
    pytest.param("hello", 5, id="simple"),
    pytest.param("", 0, id="empty"),
    pytest.param("hi there", 8, id="with-space"),
])
def test_length(input, expected):
    assert len(input) == expected

# Indirect parametrize (pass to fixture)
@pytest.fixture
def db_with_data(request):
    db = create_db()
    db.insert(request.param)
    yield db
    db.close()

@pytest.mark.parametrize("db_with_data", [
    {"name": "Alice"},
    {"name": "Bob"},
], indirect=True)
def test_db_query(db_with_data):
    assert db_with_data.count() == 1
```

## Markers

```python
# Skip
@pytest.mark.skip(reason="Not implemented yet")
def test_future_feature():
    pass

# Skip conditionally
import sys
@pytest.mark.skipif(sys.platform == "win32", reason="Unix only")
def test_unix_feature():
    pass

# Expected failure
@pytest.mark.xfail(reason="Known bug #123")
def test_known_bug():
    assert broken_function() == expected

@pytest.mark.xfail(strict=True)  # must fail, otherwise test fails
def test_must_fail():
    pass

# Custom markers
@pytest.mark.slow
def test_heavy_computation():
    pass

@pytest.mark.integration
def test_api_call():
    pass
```

Register custom markers in `pyproject.toml`:
```toml
[tool.pytest.ini_options]
markers = [
    "slow: marks tests as slow",
    "integration: integration tests",
]
```

## Mocking (pytest-mock)

```python
# mocker fixture from pytest-mock
def test_api_call(mocker):
    mock_get = mocker.patch("requests.get")
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {"name": "Alice"}

    result = fetch_user("alice")
    assert result["name"] == "Alice"
    mock_get.assert_called_once_with("https://api.example.com/users/alice")

# Mock object method
def test_save(mocker):
    mock_save = mocker.patch.object(Database, "save")
    mock_save.return_value = True

    db = Database()
    assert db.save({"key": "value"}) is True

# Mock return values
def test_sequence(mocker):
    mock = mocker.patch("module.function")
    mock.side_effect = [1, 2, 3]       # sequential returns
    assert module.function() == 1
    assert module.function() == 2

# Mock raising exception
def test_error(mocker):
    mocker.patch("module.function", side_effect=ValueError("bad"))
    with pytest.raises(ValueError):
        module.function()

# Spy (call real function but track calls)
def test_spy(mocker):
    spy = mocker.spy(module, "function")
    module.function("arg")
    spy.assert_called_once_with("arg")
```

### Using unittest.mock directly

```python
from unittest.mock import MagicMock, patch, AsyncMock

def test_with_patch():
    with patch("module.dependency") as mock_dep:
        mock_dep.return_value = "mocked"
        result = function_under_test()
        assert result == "mocked"

@patch("module.dependency")
def test_with_decorator(mock_dep):
    mock_dep.return_value = "mocked"
    result = function_under_test()
    assert result == "mocked"
```

## Temporary Files and Directories

```python
def test_with_temp_dir(tmp_path):
    file = tmp_path / "test.txt"
    file.write_text("hello")
    assert file.read_text() == "hello"

def test_with_temp_file(tmp_path):
    config = tmp_path / "config.json"
    config.write_text('{"key": "value"}')
    result = load_config(str(config))
    assert result["key"] == "value"

# Session-scoped temp directory
def test_shared_temp(tmp_path_factory):
    base = tmp_path_factory.mktemp("data")
    file = base / "test.txt"
    file.write_text("shared")
```

## Capturing Output

```python
# Capture stdout/stderr
def test_output(capsys):
    print("hello")
    captured = capsys.readouterr()
    assert captured.out == "hello\n"
    assert captured.err == ""

# Capture logging
def test_logging(caplog):
    import logging
    logger = logging.getLogger(__name__)

    with caplog.at_level(logging.WARNING):
        logger.warning("test warning")

    assert "test warning" in caplog.text
    assert len(caplog.records) == 1
    assert caplog.records[0].levelname == "WARNING"
```

## Configuration (pyproject.toml)

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_functions = ["test_*"]
addopts = "-v --tb=short --strict-markers"
markers = [
    "slow: slow tests",
    "integration: integration tests",
]
filterwarnings = [
    "ignore::DeprecationWarning",
]
```

## Running Tests

```bash
pytest                                    # all tests
pytest tests/test_login.py                # specific file
pytest tests/test_login.py::test_valid    # specific test
pytest tests/test_login.py::TestClass     # specific class
pytest -k "login and not slow"            # filter by name
pytest -m slow                            # filter by marker
pytest -m "not integration"               # exclude marker
pytest -x                                 # stop on first failure
pytest --maxfail=3                        # stop after 3 failures
pytest -v                                 # verbose
pytest -q                                 # quiet
pytest --tb=short                         # short tracebacks
pytest --tb=long                          # full tracebacks
pytest --lf                               # rerun last failures
pytest --ff                               # failures first
pytest -s                                 # show print output
pytest --co                               # collect only (list tests)
```

## Coverage

```bash
pip install pytest-cov
pytest --cov=mypackage                    # coverage for package
pytest --cov=mypackage --cov-report=html  # HTML report
pytest --cov=mypackage --cov-report=term-missing  # show missing lines
pytest --cov=mypackage --cov-fail-under=80        # fail if under 80%
```

## Async Testing

```bash
pip install pytest-asyncio
```

```python
import pytest

@pytest.mark.asyncio
async def test_async_function():
    result = await async_fetch_data()
    assert result is not None

@pytest.mark.asyncio
async def test_async_client():
    async with AsyncClient() as client:
        response = await client.get("/api/users")
        assert response.status_code == 200
```

Configure mode in `pyproject.toml`:
```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"    # auto-detect async tests
```

## Parallel Execution

```bash
pip install pytest-xdist
pytest -n auto              # use all CPU cores
pytest -n 4                 # 4 workers
pytest -n auto --dist=loadscope   # group by module
```

## Common Patterns

### Fixture composition

```python
@pytest.fixture
def db():
    return create_database()

@pytest.fixture
def user(db):
    return db.create_user("Alice")

@pytest.fixture
def authenticated_client(user):
    client = create_client()
    client.login(user)
    return client

def test_dashboard(authenticated_client):
    response = authenticated_client.get("/dashboard")
    assert response.status_code == 200
```

### Testing CLI commands (click)

```python
from click.testing import CliRunner
from myapp.cli import main

def test_cli():
    runner = CliRunner()
    result = runner.invoke(main, ["--verbose", "run"])
    assert result.exit_code == 0
    assert "Success" in result.output
```

### Monkeypatching

```python
def test_env_var(monkeypatch):
    monkeypatch.setenv("API_KEY", "test-key")
    assert os.environ["API_KEY"] == "test-key"

def test_override_attr(monkeypatch):
    monkeypatch.setattr("module.CONSTANT", 42)
    assert module.CONSTANT == 42
```

## Tips

- Use `pytest.raises` for exception testing — cleaner than try/except
- Put shared fixtures in `conftest.py` — they're auto-discovered
- Use `@pytest.mark.parametrize` to avoid duplicate test functions
- Use `tmp_path` for file-based tests — auto-cleaned after each test
- Use `-x` flag during development to stop on first failure
- Use `--lf` to rerun only failed tests
- Prefer `pytest-mock`'s `mocker` fixture over `unittest.mock.patch` decorators
- Use `scope="session"` fixtures for expensive setup (DB connections, etc.)
