"""
routes/sources.py

GET /v1/sources   — список джерел даних (з фільтром по типу)
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from db.database import get_db
from db.models import Source

router = APIRouter(prefix="/v1/sources", tags=["Sources"])


@router.get("", summary="Джерела даних")
async def get_sources(
    type: Optional[str] = Query(None, description="Фільтр по типу джерела"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Source)
    if type:
        stmt = stmt.where(Source.type == type)

    result = await db.execute(stmt)
    sources = result.scalars().all()

    return {
        "status": "ok",
        "total":  len(sources),
        "data": [
            {
                "id":      s.id,
                "name":    s.name,
                "type":    s.type,
                "org":     s.org,
                "updated": s.updated,
                "license": s.license,
                "url":     s.url,
            }
            for s in sources
        ]
    }
