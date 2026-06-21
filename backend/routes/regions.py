"""
routes/regions.py

GET /v1/regions           — список всіх регіонів (всі показники 2024)
GET /v1/regions/{id}      — один регіон по id
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db.database import get_db
from db.models import Region

router = APIRouter(prefix="/v1/regions", tags=["Regions"])


@router.get("", summary="Список всіх регіонів")
async def get_regions(
    sort_by: str = Query("salary", description="salary|gdp|unemployment|population"),
    order:   str = Query("desc",   description="asc|desc"),
    year:    int = Query(None,     description="Year to filter by (e.g. 2013, 2021)"),
    db: AsyncSession = Depends(get_db),
):
    valid_sort = {"salary", "gdp", "unemployment", "population", "name"}
    if sort_by not in valid_sort:
        raise HTTPException(400, f"sort_by має бути одним із: {', '.join(valid_sort)}")

    # Determine year, default to 2024
    yr = year if year is not None else 2024
    query = select(Region).where(Region.year == yr)
    if yr > 2013:
        query = query.where(~Region.region_id.in_(["crimea", "sevastopol"]))

    result = await db.execute(query)
    regions = result.scalars().all()

    data = [
        {
            "id":           r.region_id,
            "year":         r.year,
            "name":         r.name,
            "gdp":          r.gdp,
            "unemployment": r.unemployment,
            "salary":       r.salary,
            "population":   r.population,
        }
        for r in regions
    ]

    reverse = (order == "desc")
    if sort_by == "name":
        data.sort(key=lambda x: x["name"], reverse=reverse)
    else:
        data.sort(key=lambda x: x[sort_by], reverse=reverse)

    return {
        "status": "ok",
        "total":  len(data),
        "sort_by": sort_by,
        "order":   order,
        "data":   data,
    }


@router.get("/{region_id}", summary="Один регіон по ID")
async def get_region(
    region_id: str,
    db: AsyncSession = Depends(get_db),
):
    # Retrieve the latest year (2024) or filter by year if needed. We'll default to 2024 here.
    result = await db.execute(select(Region).where(Region.region_id == region_id, Region.year == 2024))
    region = result.scalar_one_or_none()

    if not region:
        raise HTTPException(404, f"Регіон '{region_id}' не знайдено. "
                                  "Використайте GET /v1/regions для списку ID.")
    return {
        "status": "ok",
        "data": {
            "id":           region.region_id,
            "year":         region.year,
            "name":         region.name,
            "gdp":          region.gdp,
            "unemployment": region.unemployment,
            "salary":       region.salary,
            "population":   region.population,
        }
    }
