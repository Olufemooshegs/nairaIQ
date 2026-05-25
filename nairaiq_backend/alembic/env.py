from logging.config import fileConfig
import os
import sys
from pathlib import Path
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# Add the current directory to sys.path so app module can be imported
sys.path.insert(0, str(Path(__file__).parent.parent))

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
fileConfig(config.config_file_name)

# add your model's MetaData object here for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata

DATABASE_URL = os.getenv("DATABASE_URL")

def _set_sqlalchemy_url_safe(url: str):
    # ConfigParser uses '%' for interpolation which raises on raw '%' chars
    # in values. Escape '%' by doubling so ConfigParser accepts the value.
    safe = url.replace('%', '%%')
    config.set_main_option("sqlalchemy.url", safe)

if DATABASE_URL:
    # If an async DB URL is provided (asyncpg), Alembic/SQLAlchemy's
    # synchronous migration path cannot use the asyncpg driver directly.
    # Replace the asyncpg driver with a sync driver (psycopg) for migrations.
    if DATABASE_URL.startswith("postgresql+asyncpg"):
        sync_url = DATABASE_URL.replace("+asyncpg", "+psycopg")
        _set_sqlalchemy_url_safe(sync_url)
    else:
        _set_sqlalchemy_url_safe(DATABASE_URL)

from app.db.models import Base

target_metadata = Base.metadata


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    # Configure for SQL generation (offline). Some Alembic versions
    # require `as_sql=True` when `literal_binds=True`.
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        as_sql=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode (with live database connection).
    
    Falls back to offline mode if database connection is not available.
    """
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = config.get_main_option("sqlalchemy.url")
    
    try:
        connectable = engine_from_config(
            configuration,
            prefix="sqlalchemy.",
            poolclass=pool.NullPool,
        )

        with connectable.connect() as connection:
            context.configure(connection=connection, target_metadata=target_metadata)

            with context.begin_transaction():
                context.run_migrations()
    except Exception as e:
        # If connection fails, surface an explicit error instead of
        # silently falling back to offline mode. In CI we want migrations
        # to apply to a live DB and fail fast if they cannot.
        import sys
        print(f"Error: Could not connect to database for migrations: {e}", file=sys.stderr)
        raise



if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
