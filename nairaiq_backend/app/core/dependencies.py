from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.db.session import get_db as get_db_session
from app.core.security import decode_token
from uuid import UUID
from app.db.repositories.user_repo import UserRepository

bearer_scheme = HTTPBearer()


async def get_db():
    async for s in get_db_session():
        yield s


async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(bearer_scheme), db=Depends(get_db)):
    token = credentials.credentials
    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id_raw = payload.get("sub")
    try:
        user_id = UUID(user_id_raw)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
