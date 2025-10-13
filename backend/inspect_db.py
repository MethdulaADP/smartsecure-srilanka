"""Quick inspection utility for the SmartSecure SQLite database.

Usage (PowerShell examples):
  # Show all default tables (users, files, activity_logs)
  python backend/inspect_db.py

  # Show only users table
  python backend/inspect_db.py users

  # Show schema for all tables
  python backend/inspect_db.py --schema

  # Use a custom DB path (if SMARTSECURE_DB was set when running the app)
  $env:SMARTSECURE_DB="C:/path/to/other.db"; python backend/inspect_db.py

Notes:
- This script ONLY reads; it performs no writes.
- Output is JSON per table for easy readability / piping.
"""
from __future__ import annotations
import os
import sys
import json
import sqlite3
from pathlib import Path
from typing import List

APP_ROOT = Path(__file__).resolve().parent
DB_PATH = Path(os.environ.get("SMARTSECURE_DB", APP_ROOT / "smartsecure.db"))
DEFAULT_TABLES = ["users", "files", "activity_logs"]


def connect():
    if not DB_PATH.exists():
        print(f"[!] Database not found at {DB_PATH}")
        sys.exit(1)
    return sqlite3.connect(DB_PATH)


def list_tables(conn) -> List[str]:
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    return [r[0] for r in cur.fetchall()]


def dump_table(conn, table: str):
    cur = conn.cursor()
    try:
        cur.execute(f"SELECT * FROM {table}")
    except sqlite3.Error as e:
        return {"table": table, "error": str(e)}
    cols = [d[0] for d in cur.description]
    rows = [dict(zip(cols, r)) for r in cur.fetchall()]
    return {"table": table, "row_count": len(rows), "rows": rows}


def show_schema(conn, table: str):
    cur = conn.cursor()
    cur.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name=?", (table,))
    row = cur.fetchone()
    return {"table": table, "schema": row[0] if row else None}


def main():
    args = sys.argv[1:]
    want_schema = False
    if "--schema" in args:
        want_schema = True
        args = [a for a in args if a != "--schema"]

    conn = connect()
    available = set(list_tables(conn))

    tables = args or DEFAULT_TABLES
    # Filter out any that don't exist
    tables = [t for t in tables if t in available]
    if not tables:
        print("No matching tables to display.")
        return

    output = {"db_path": str(DB_PATH), "tables": []}
    for t in tables:
        if want_schema:
            output["tables"].append(show_schema(conn, t))
        else:
            output["tables"].append(dump_table(conn, t))

    print(json.dumps(output, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
