import os
from pathlib import Path


def load_local_env() -> None:
    root_dir = Path(__file__).resolve().parent.parent
    env_paths = [root_dir / ".env", root_dir / "backend" / ".env"]

    for env_path in env_paths:
        if not env_path.exists():
            continue

        for line in env_path.read_text(encoding="utf-8").splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("#") or "=" not in stripped:
                continue

            key, value = stripped.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")

            if key and key not in os.environ:
                os.environ[key] = value
