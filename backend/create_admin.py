"""
create_admin.py
---------------
Secure CLI script to bootstrap the first BatteryTwin administrator account.

Usage (run from the backend/ directory with the venv activated):
    python create_admin.py

The script reads credentials interactively so they never appear in shell
history, process lists, or log files.

Environment:
    Requires a working database connection (.env must be configured).
    The same DB_* variables used by the main application are used here.

Security:
    - Never hardcodes credentials.
    - Password is entered via getpass (no terminal echo).
    - Role is always set to admin by this script; the public API can never
      create admin accounts.
    - If an account with the given email already exists and is already an
      admin, the script reports it without revealing the password hash.
    - Aborts rather than overwriting an existing admin silently.
"""

import sys
import getpass

# ── Minimal path setup ─────────────────────────────────────────────
# Allow running from the backend/ directory directly.
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import settings  # noqa: E402 – must come after path setup


def _print_banner():
    print()
    print("=" * 60)
    print("  BatteryTwin — Create Administrator Account")
    print("=" * 60)
    print(f"  Database : {settings.db_host}:{settings.db_port}/{settings.db_name}")
    print(f"  Env      : {settings.app_env}")
    print()


def _prompt_non_empty(prompt: str) -> str:
    while True:
        value = input(prompt).strip()
        if value:
            return value
        print("  [!] This field cannot be empty.")


def main():
    _print_banner()

    # ── Import DB after path is set ────────────────────────────────
    from database.connection import SessionLocal, create_tables
    from database.crud import get_user_by_email, create_user, email_exists
    from database.models import UserRole
    from auth.security import hash_password, validate_password_strength

    # Ensure tables exist (safe to call if they already do)
    try:
        create_tables()
    except Exception as exc:
        print(f"\n[ERROR] Could not connect to the database: {exc}")
        print("  Verify DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD in .env")
        sys.exit(1)

    db = SessionLocal()
    try:
        # ── Gather input ───────────────────────────────────────────
        print("Enter the details for the new administrator account.")
        print()

        full_name = _prompt_non_empty("  Full name  : ")
        email     = _prompt_non_empty("  Email      : ").lower()

        # Check for existing account
        existing = get_user_by_email(db, email)
        if existing is not None:
            if existing.role == UserRole.admin:
                print(f"\n[INFO] An administrator with email '{email}' already exists.")
                print("  No changes were made.")
            else:
                print(f"\n[WARN] A non-admin account with email '{email}' already exists.")
                confirm = input("  Promote this account to admin? [y/N]: ").strip().lower()
                if confirm == "y":
                    existing.role = UserRole.admin
                    db.commit()
                    print(f"\n[OK] Account '{email}' has been promoted to admin.")
                else:
                    print("  Aborted.")
            return

        # ── Password with policy check ─────────────────────────────
        while True:
            password = getpass.getpass("  Password   : ")
            if not password:
                print("  [!] Password cannot be empty.")
                continue
            violations = validate_password_strength(password)
            if violations:
                print("  [!] Password does not meet the policy:")
                for v in violations:
                    print(f"      • {v}")
                continue
            confirm = getpass.getpass("  Confirm    : ")
            if password != confirm:
                print("  [!] Passwords do not match. Try again.")
                continue
            break

        # ── Create account ─────────────────────────────────────────
        user = create_user(
            db=db,
            full_name=full_name,
            email=email,
            hashed_password=hash_password(password),
            role=UserRole.admin,
            is_active=True,
            is_verified=True,   # admin created via CLI is pre-verified
        )
        db.commit()
        db.refresh(user)

        print()
        print("=" * 60)
        print(f"  [OK] Administrator account created successfully.")
        print(f"  Name  : {user.full_name}")
        print(f"  Email : {user.email}")
        print(f"  Role  : {user.role.value}")
        print(f"  ID    : {user.id}")
        print("=" * 60)
        print()
        print("  Login at: POST /api/auth/admin/login")
        print()

    finally:
        db.close()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n  Aborted by user.")
        sys.exit(0)
