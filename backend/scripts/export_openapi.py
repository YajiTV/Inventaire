"""
Exports the OpenAPI specification to openapi.json at the repository root.

The frontend derives its TypeScript types and its mocks from that file, so it
must be regenerated and committed whenever a schema or a route changes:

    .venv/bin/python -m scripts.export_openapi
"""

import json
from pathlib import Path

from app.main import app

OPENAPI_PATH = Path(__file__).resolve().parents[2] / "openapi.json"


def export() -> Path:
    OPENAPI_PATH.write_text(json.dumps(app.openapi(), indent=2, sort_keys=True) + "\n")
    return OPENAPI_PATH


if __name__ == "__main__":
    print(f"OpenAPI written to {export()}")
