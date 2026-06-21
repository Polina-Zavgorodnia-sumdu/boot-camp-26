"""
routes/contact.py

POST /v1/contact   — зберегти повідомлення з форми зворотного зв'язку
GET  /v1/contact   — переглянути всі повідомлення (для адміна)
"""

import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from db.database import get_db
from db.models import Contact

router = APIRouter(prefix="/v1/contact", tags=["Contact"])

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class ContactIn(BaseModel):
    name:    str
    email:   str
    message: str


@router.post("", summary="Надіслати повідомлення", status_code=201)
async def create_contact(
    body: ContactIn,
    db: AsyncSession = Depends(get_db),
):
    # Валідація
    if not body.name.strip():
        raise HTTPException(422, "Поле 'name' не може бути порожнім")
    if not EMAIL_RE.match(body.email):
        raise HTTPException(422, "Некоректний email")
    if len(body.message.strip()) < 10:
        raise HTTPException(422, "Повідомлення занадто коротке (мінімум 10 символів)")

    contact = Contact(
        name=body.name.strip(),
        email=body.email.strip().lower(),
        message=body.message.strip(),
    )
    db.add(contact)
    await db.commit()
    await db.refresh(contact)

    return {
        "status":  "ok",
        "message": "Повідомлення збережено. Дякуємо!",
        "id":      contact.id,
    }


@router.get("", summary="Всі повідомлення (адмін)")
async def get_contacts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Contact).order_by(Contact.created_at.desc())
    )
    contacts = result.scalars().all()
    return {
        "status": "ok",
        "total":  len(contacts),
        "data": [
            {
                "id":         c.id,
                "name":       c.name,
                "email":      c.email,
                "message":    c.message,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "is_read":    c.is_read,
            }
            for c in contacts
        ]
    }
