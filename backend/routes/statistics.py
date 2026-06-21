"""
routes/statistics.py

GET /v1/statistics
  ?metric=salary|gdp|unemployment|population
  ?region=all|kyiv|lviv|...
  ?year=2024          (конкретний рік, або порожньо = всі)
  ?format=json|csv
  ?page=1
  ?per_page=25

GET /v1/statistics/history
  ?metric=salary|unemployment|inflation|population|gdp
  ?region=ukraine|kyiv|kharkiv|lviv|dnipro|odesa  (тільки для salary)
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import csv
import io

from db.database import get_db
from db.models import Region, SalaryHistory, UnemploymentHistory, InflationHistory, PopulationHistory

router = APIRouter(prefix="/v1/statistics", tags=["Statistics"])

VALID_METRICS = {"salary", "gdp", "unemployment", "population"}
VALID_FORMATS = {"json", "csv"}

METRIC_UNITS = {
    "salary":       "грн",
    "gdp":          "млн грн",
    "unemployment": "%",
    "population":   "тис. осіб",
}

METRIC_LABELS = {
    "salary":       "Середня зарплата",
    "gdp":          "ВРП",
    "unemployment": "Безробіття",
    "population":   "Населення",
}


@router.get("", summary="Статистика по регіонах")
async def get_statistics(
    metric:   str           = Query("salary", description="salary|gdp|unemployment|population"),
    region:   Optional[str] = Query(None,     description="Код регіону або 'all'"),
    year:     Optional[int] = Query(None,     description="Рік (1998–2024)"),
    format:   str           = Query("json",   description="json|csv"),
    page:     int           = Query(1,        ge=1),
    per_page: int           = Query(25,       ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    if metric not in VALID_METRICS:
        raise HTTPException(400, f"metric має бути одним із: {', '.join(VALID_METRICS)}")
    if format not in VALID_FORMATS:
        raise HTTPException(400, f"format має бути одним із: {', '.join(VALID_FORMATS)}")

    # --- Формуємо запит до регіонів ---
    stmt = select(Region)
    if region and region != "all":
        stmt = stmt.where(Region.region_id == region)
    if year is not None:
        stmt = stmt.where(Region.year == year)

    result = await db.execute(stmt)
    regions = result.scalars().all()

    if region and region != "all" and not regions:
        check = await db.execute(
            select(Region).where(Region.region_id == region).limit(1)
        )
        if not check.scalar_one_or_none():
            raise HTTPException(404, f"Регіон '{region}' не знайдено")

    # --- Будуємо рядки ---
    unit = METRIC_UNITS[metric]
    rows = []
    for r in regions:
        value = getattr(r, metric)
        rows.append({
            "year":   r.year,
            "region": r.name,
            "region_id": r.region_id,
            "metric": metric,
            "label":  METRIC_LABELS[metric],
            "value":  value,
            "unit":   unit,
        })

    # Сортуємо за спаданням значення
    rows.sort(key=lambda x: x["value"], reverse=True)

    total = len(rows)
    start = (page - 1) * per_page
    rows_page = rows[start: start + per_page]

    # --- CSV ---
    if format == "csv":
        buf = io.StringIO()
        writer = csv.DictWriter(buf, fieldnames=["year","region","metric","value","unit"])
        writer.writeheader()
        for row in rows_page:
            writer.writerow({k: row[k] for k in ["year","region","metric","value","unit"]})
        buf.seek(0)
        return StreamingResponse(
            iter([buf.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=ukrdata_{metric}_{year if year else 'all'}.csv"}
        )

    return {
        "status":   "ok",
        "metric":   metric,
        "unit":     unit,
        "year":     year,
        "page":     page,
        "per_page": per_page,
        "total":    total,
        "data":     rows_page,
    }


@router.get("/history", summary="Динаміка показника по роках")
async def get_history(
    metric: str           = Query("salary",   description="salary|unemployment|inflation|population|gdp"),
    region: Optional[str] = Query("ukraine",  description="ukraine|kyiv|kharkiv|lviv|dnipro|odesa (тільки для salary)"),
    format: str           = Query("json",     description="json|csv"),
    db: AsyncSession = Depends(get_db),
):
    valid = {"salary","unemployment","inflation","population","gdp"}
    if metric not in valid:
        raise HTTPException(400, f"metric має бути одним із: {', '.join(valid)}")

    rows = []

    if metric == "salary":
        result = await db.execute(select(SalaryHistory).order_by(SalaryHistory.year))
        records = result.scalars().all()
        col_map = {
            "ukraine": "ukraine", "kyiv": "kyiv", "kharkiv": "kharkiv",
            "lviv": "lviv", "dnipro": "dnipro", "odesa": "odesa",
        }
        col = col_map.get(region or "ukraine", "ukraine")
        rows = [{"year": r.year, "value": getattr(r, col), "unit": "грн"} for r in records]

    elif metric == "unemployment":
        result = await db.execute(select(UnemploymentHistory).order_by(UnemploymentHistory.year))
        records = result.scalars().all()
        rows = [{"year": r.year, "value": r.ukraine, "unit": "%"} for r in records]

    elif metric == "inflation":
        result = await db.execute(select(InflationHistory).order_by(InflationHistory.year))
        records = result.scalars().all()
        rows = [{"year": r.year, "value": r.cpi, "unit": "%"} for r in records]

    elif metric == "population":
        result = await db.execute(select(PopulationHistory).order_by(PopulationHistory.year))
        records = result.scalars().all()
        rows = [{"year": r.year, "value": r.ukraine_thousands, "unit": "тис. осіб"} for r in records]

    elif metric == "gdp":
        result = await db.execute(select(InflationHistory).order_by(InflationHistory.year))
        records = result.scalars().all()
        rows = [{"year": r.year, "value": r.gdp_nominal, "unit": "млн грн"} for r in records]

    if format == "csv":
        buf = io.StringIO()
        writer = csv.DictWriter(buf, fieldnames=["year","value","unit"])
        writer.writeheader()
        writer.writerows(rows)
        buf.seek(0)
        return StreamingResponse(
            iter([buf.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=ukrdata_{metric}_history.csv"}
        )

    return {
        "status": "ok",
        "metric": metric,
        "region": region or "ukraine",
        "total":  len(rows),
        "data":   rows,
    }
