from logging.config import fileConfig
import os
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

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
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
