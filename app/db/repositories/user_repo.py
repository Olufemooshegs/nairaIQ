from app.db.models import User
from sqlalchemy import select


class UserRepository:
    def __init__(self, db):
        self.db = db

    async def create(self, user: User):
        self.db.add(user)
        await self.db.flush()
        return user

    async def get_by_email(self, email: str):
        q = select(User).where(User.email == email)
        res = await self.db.execute(q)
        return res.scalars().first()

    async def get_by_id(self, id):
        q = select(User).where(User.id == id)
        res = await self.db.execute(q)
        return res.scalars().first()
