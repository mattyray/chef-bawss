#!/usr/bin/env python3
"""
Export Chef Bawss codebase to a single Markdown file.
Includes all relevant source code, excluding:
- Virtual environments
- Node modules
- Cache files
- Migrations (optional)
- Environment files
- Lock files
- Build artifacts
"""

import os
from pathlib import Path
from datetime import datetime

# Base directory
BASE_DIR = Path(__file__).parent

# Files to include (relative to BASE_DIR)
BACKEND_FILES = [
    # Config
    "backend/manage.py",
    "backend/config/__init__.py",
    "backend/config/urls.py",
    "backend/config/wsgi.py",
    "backend/config/celery.py",
    "backend/config/settings/__init__.py",
    "backend/config/settings/base.py",
    "backend/config/settings/development.py",
    "backend/config/settings/production.py",

    # Core utilities
    "backend/core/__init__.py",
    "backend/core/email.py",
    "backend/core/middleware.py",
    "backend/core/mixins.py",
    "backend/core/permissions.py",
    "backend/core/throttling.py",

    # Users app
    "backend/apps/users/__init__.py",
    "backend/apps/users/models.py",
    "backend/apps/users/serializers.py",
    "backend/apps/users/views.py",
    "backend/apps/users/urls.py",
    "backend/apps/users/admin.py",

    # Organizations app
    "backend/apps/organizations/__init__.py",
    "backend/apps/organizations/models.py",
    "backend/apps/organizations/serializers.py",
    "backend/apps/organizations/views.py",
    "backend/apps/organizations/urls.py",
    "backend/apps/organizations/admin.py",

    # Chefs app
    "backend/apps/chefs/__init__.py",
    "backend/apps/chefs/models.py",
    "backend/apps/chefs/serializers.py",
    "backend/apps/chefs/views.py",
    "backend/apps/chefs/urls.py",
    "backend/apps/chefs/admin.py",

    # Clients app
    "backend/apps/clients/__init__.py",
    "backend/apps/clients/models.py",
    "backend/apps/clients/serializers.py",
    "backend/apps/clients/views.py",
    "backend/apps/clients/urls.py",
    "backend/apps/clients/admin.py",

    # Events app
    "backend/apps/events/__init__.py",
    "backend/apps/events/models.py",
    "backend/apps/events/serializers.py",
    "backend/apps/events/views.py",
    "backend/apps/events/urls.py",
    "backend/apps/events/admin.py",

    # Notifications app
    "backend/apps/notifications/__init__.py",
    "backend/apps/notifications/models.py",
]

FRONTEND_FILES = [
    # Config files
    "frontend/package.json",
    "frontend/tsconfig.json",
    "frontend/next.config.ts",
    "frontend/tailwind.config.ts",
    "frontend/postcss.config.mjs",

    # App core
    "frontend/src/app/layout.tsx",
    "frontend/src/app/page.tsx",
    "frontend/src/app/globals.css",

    # Auth pages
    "frontend/src/app/login/page.tsx",
    "frontend/src/app/register/page.tsx",
    "frontend/src/app/forgot-password/page.tsx",
    "frontend/src/app/reset-password/page.tsx",
    "frontend/src/app/accept-invite/page.tsx",

    # Dashboard layout
    "frontend/src/app/(dashboard)/layout.tsx",
    "frontend/src/app/(dashboard)/dashboard/page.tsx",
    "frontend/src/app/(dashboard)/calendar/page.tsx",
    "frontend/src/app/(dashboard)/finances/page.tsx",

    # Clients pages
    "frontend/src/app/(dashboard)/clients/page.tsx",
    "frontend/src/app/(dashboard)/clients/new/page.tsx",
    "frontend/src/app/(dashboard)/clients/[id]/page.tsx",
    "frontend/src/app/(dashboard)/clients/[id]/edit/page.tsx",

    # Chefs pages
    "frontend/src/app/(dashboard)/chefs/page.tsx",

    # Events pages
    "frontend/src/app/(dashboard)/events/page.tsx",
    "frontend/src/app/(dashboard)/events/new/page.tsx",
    "frontend/src/app/(dashboard)/events/[id]/page.tsx",
    "frontend/src/app/(dashboard)/events/[id]/edit/page.tsx",
    "frontend/src/app/(dashboard)/events/[id]/chef-view/page.tsx",

    # Components
    "frontend/src/components/Sidebar.tsx",
    "frontend/src/components/ProtectedRoute.tsx",
    "frontend/src/components/AddClientModal.tsx",
    "frontend/src/components/SearchableSelect.tsx",

    # Lib
    "frontend/src/lib/api.ts",
    "frontend/src/lib/utils.ts",

    # Contexts
    "frontend/src/contexts/AuthContext.tsx",

    # Types
    "frontend/src/types/index.ts",
]

INFRA_FILES = [
    "docker-compose.yml",
    "railway.json",
    "backend/Dockerfile",
    "backend/Procfile",
    "backend/start.sh",
    "backend/requirements.txt",
    ".gitignore",
]

def get_language(filepath: str) -> str:
    """Get the language identifier for syntax highlighting."""
    ext_map = {
        ".py": "python",
        ".tsx": "tsx",
        ".ts": "typescript",
        ".js": "javascript",
        ".jsx": "jsx",
        ".css": "css",
        ".json": "json",
        ".yml": "yaml",
        ".yaml": "yaml",
        ".sh": "bash",
        ".md": "markdown",
        ".txt": "text",
        ".dockerfile": "dockerfile",
    }

    _, ext = os.path.splitext(filepath.lower())

    # Special cases
    if "Dockerfile" in filepath:
        return "dockerfile"
    if "Procfile" in filepath:
        return "text"

    return ext_map.get(ext, "text")

def read_file_content(filepath: Path) -> str | None:
    """Read file content, return None if file doesn't exist."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return None
    except Exception as e:
        return f"# Error reading file: {e}"

def export_to_markdown(output_path: Path, include_infra: bool = True):
    """Export all code files to a single Markdown file."""

    lines = []

    # Header
    lines.append("# Chef Bawss - Complete Source Code Export")
    lines.append("")
    lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append("")
    lines.append("## Project Overview")
    lines.append("")
    lines.append("Chef Bawss is a full-stack web application for managing private chef businesses.")
    lines.append("")
    lines.append("**Tech Stack:**")
    lines.append("- Backend: Django 5.2 + Django REST Framework")
    lines.append("- Frontend: Next.js 16 + React 19 + TypeScript + Tailwind CSS")
    lines.append("- Database: PostgreSQL")
    lines.append("- Queue: Redis + Celery")
    lines.append("")
    lines.append("---")
    lines.append("")

    # Table of Contents
    lines.append("## Table of Contents")
    lines.append("")
    lines.append("1. [Backend Code](#backend-code)")
    lines.append("2. [Frontend Code](#frontend-code)")
    if include_infra:
        lines.append("3. [Infrastructure](#infrastructure)")
    lines.append("")
    lines.append("---")
    lines.append("")

    # Backend Section
    lines.append("# Backend Code")
    lines.append("")

    for filepath in BACKEND_FILES:
        full_path = BASE_DIR / filepath
        content = read_file_content(full_path)

        if content is None:
            continue

        # Skip empty __init__.py files
        if filepath.endswith("__init__.py") and not content.strip():
            continue

        lang = get_language(filepath)
        lines.append(f"## `{filepath}`")
        lines.append("")
        lines.append(f"```{lang}")
        lines.append(content.rstrip())
        lines.append("```")
        lines.append("")

    lines.append("---")
    lines.append("")

    # Frontend Section
    lines.append("# Frontend Code")
    lines.append("")

    for filepath in FRONTEND_FILES:
        full_path = BASE_DIR / filepath
        content = read_file_content(full_path)

        if content is None:
            continue

        lang = get_language(filepath)
        lines.append(f"## `{filepath}`")
        lines.append("")
        lines.append(f"```{lang}")
        lines.append(content.rstrip())
        lines.append("```")
        lines.append("")

    # Infrastructure Section
    if include_infra:
        lines.append("---")
        lines.append("")
        lines.append("# Infrastructure")
        lines.append("")

        for filepath in INFRA_FILES:
            full_path = BASE_DIR / filepath
            content = read_file_content(full_path)

            if content is None:
                continue

            lang = get_language(filepath)
            lines.append(f"## `{filepath}`")
            lines.append("")
            lines.append(f"```{lang}")
            lines.append(content.rstrip())
            lines.append("```")
            lines.append("")

    # Write to file
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Exported to: {output_path}")
    print(f"Total files included: {len(BACKEND_FILES) + len(FRONTEND_FILES) + (len(INFRA_FILES) if include_infra else 0)}")

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Export Chef Bawss codebase to Markdown")
    parser.add_argument(
        "-o", "--output",
        default="CODEBASE_EXPORT.md",
        help="Output filename (default: CODEBASE_EXPORT.md)"
    )
    parser.add_argument(
        "--no-infra",
        action="store_true",
        help="Exclude infrastructure files (Docker, etc.)"
    )
    parser.add_argument(
        "--copy",
        action="store_true",
        help="Copy output to clipboard (macOS only)"
    )

    args = parser.parse_args()

    output_path = BASE_DIR / args.output
    export_to_markdown(output_path, include_infra=not args.no_infra)

    if args.copy:
        import subprocess
        try:
            with open(output_path, "r") as f:
                subprocess.run(["pbcopy"], input=f.read().encode(), check=True)
            print("Content copied to clipboard!")
        except Exception as e:
            print(f"Could not copy to clipboard: {e}")
