from app.db.repositories.user_repo import UserRepository
from app.core import security
from app.db.models import User
import uuid


async def register_user(db, user_create):
    repo = UserRepository(db)
    existing = await repo.get_by_email(user_create.email)
    if existing:
        return None
    hashed = security.hash_password(user_create.password)
    # accept optional profile fields if provided
    user = User(
        id=str(uuid.uuid4()),
        email=user_create.email,
        hashed_password=hashed,
        first_name=getattr(user_create, "first_name", None),
        last_name=getattr(user_create, "last_name", None),
        phone_number=getattr(user_create, "phone_number", None),
    )
    await repo.create(user)
    await db.commit()
    return user


async def authenticate_user(db, email: str, password: str):
    repo = UserRepository(db)
    user = await repo.get_by_email(email)
    if not user:
        return None
    if not security.verify_password(password, user.hashed_password):
        return None
    return user


async def create_access_token_for_user(user: User):
    token = security.create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer"}


async def get_or_create_user_by_email(db, email: str, first_name: str | None = None, last_name: str | None = None):
    repo = UserRepository(db)
    user = await repo.get_by_email(email)
    if user:
        return user
    # create a random password for OAuth users
    hashed = security.hash_password(uuid.uuid4().hex)
    user = User(id=str(uuid.uuid4()), email=email, hashed_password=hashed, first_name=first_name, last_name=last_name)
    await repo.create(user)
    await db.commit()
    return user
