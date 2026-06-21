"""
routes/datasets.py

GET /v1/datasets              — каталог датасетів (з фільтрами)
GET /v1/datasets/{id}         — один датасет
GET /v1/categories            — список категорій
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from db.database import get_db
from db.models import Dataset, Category

router = APIRouter(tags=["Datasets & Categories"])


# ── CATEGORIES ────────────────────────────────────────────────

@router.get("/v1/categories", summary="Список категорій")
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category))
    cats = result.scalars().all()
    return {
        "status": "ok",
        "total":  len(cats),
        "data": [
            {"id": c.id, "icon": c.icon, "title": c.title,
             "desc": c.desc, "count": c.count}
            for c in cats
        ]
    }


# ── DATASETS ──────────────────────────────────────────────────

@router.get("/v1/datasets", summary="Каталог датасетів")
async def get_datasets(
    cat:    Optional[str] = Query(None, description="Фільтр по категорії: economy|labor|demography|inflation|regional|budget"),
    search: Optional[str] = Query(None, description="Пошук по назві"),
    page:   int           = Query(1, ge=1),
    per_page: int         = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Dataset)
    if cat:
        stmt = stmt.where(Dataset.cat == cat)

    result = await db.execute(stmt)
    datasets = result.scalars().all()

    data = [
        {
            "id":      d.id,
            "title":   d.title,
            "cat":     d.cat,
            "year":    d.year,
            "source":  d.source,
            "records": d.records,
            "updated": d.updated,
            "metric":  d.metric,
        }
        for d in datasets
    ]

    # Пошук по назві (in-memory, датасетів небагато)
    if search:
        q = search.lower()
        data = [d for d in data if q in d["title"].lower()]

    total = len(data)
    start = (page - 1) * per_page
    data_page = data[start: start + per_page]

    return {
        "status":   "ok",
        "total":    total,
        "page":     page,
        "per_page": per_page,
        "data":     data_page,
    }


@router.get("/v1/datasets/{dataset_id}", summary="Один датасет по ID")
async def get_dataset(
    dataset_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    d = result.scalar_one_or_none()
    if not d:
        raise HTTPException(404, f"Датасет #{dataset_id} не знайдено")

    return {
        "status": "ok",
        "data": {
            "id":      d.id,
            "title":   d.title,
            "cat":     d.cat,
            "year":    d.year,
            "source":  d.source,
            "records": d.records,
            "updated": d.updated,
            "metric":  d.metric,
        }
    }
