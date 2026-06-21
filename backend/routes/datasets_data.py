"""
routes/datasets_data.py

GET /v1/dataset-data/{dataset_id}
  Повертає реальні дані для конкретного датасету.
  Кожен датасет має свою структуру відповіді.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db.database import get_db
from typing import Optional
from db.models import (
    SalaryHistory, Region, InflationHistory, UnemploymentHistory,
    PopulationHistory, BudgetHistory, TradeHistory, EmploymentSector,
    RealSalaryIndex, ProducerPriceIndex, GdpStructure, NaturalMovement
)

router = APIRouter(prefix="/v1/dataset-data", tags=["Dataset Data"])


@router.get("/{dataset_id}", summary="Дані конкретного датасету")
async def get_dataset_data(dataset_id: int, year: Optional[int] = Query(None, description="Year filter for region data"), db: AsyncSession = Depends(get_db)):

    # ── 1. Середня заробітна плата по регіонах ──────────────────
    if dataset_id == 1:
        r = await db.execute(select(SalaryHistory).order_by(SalaryHistory.year))
        rows = r.scalars().all()
        return {
            "id": 1, "title": "Середня заробітна плата по регіонах України",
            "type": "multi_line",
            "y_label": "грн/міс",
            "series": [
                {"label": "Україна",  "color": "#007070", "data": [{"year": r.year, "value": r.ukraine}  for r in rows]},
                {"label": "Київ",     "color": "#000080", "data": [{"year": r.year, "value": r.kyiv}     for r in rows]},
                {"label": "Харків",   "color": "#c00000", "data": [{"year": r.year, "value": r.kharkiv}  for r in rows]},
                {"label": "Дніпро",   "color": "#008000", "data": [{"year": r.year, "value": r.dnipro}   for r in rows]},
                {"label": "Львів",    "color": "#804000", "data": [{"year": r.year, "value": r.lviv}     for r in rows]},
                {"label": "Одеса",    "color": "#500080", "data": [{"year": r.year, "value": r.odesa}    for r in rows]},
            ]
        }

    # ── 2. ВРП регіонів України ──────────────────────────────────
    elif dataset_id == 2:
        # Determine year, default to 2024
        yr = year if year is not None else 2024
        stmt = select(Region).where(Region.year == yr)
        if yr > 2013:
            stmt = stmt.where(~Region.region_id.in_(["crimea", "sevastopol"]))
        stmt = stmt.order_by(Region.gdp.desc())
        r = await db.execute(stmt)
        regions = r.scalars().all()
        return {
            "id": 2,
            "title": "ВРП регіонів України у поточних цінах",
            "type": "bar_regions",
            "y_label": "млн грн",
            "year": yr,
            "data": [{"region": reg.name, "value": reg.gdp} for reg in regions]
        }

    # ── 3. Рівень безробіття ─────────────────────────────────────
    elif dataset_id == 3:
        r = await db.execute(select(UnemploymentHistory).order_by(UnemploymentHistory.year))
        rows = r.scalars().all()
        return {
            "id": 3, "title": "Рівень безробіття (методологія МОП)",
            "type": "bar_line",
            "y_label": "%",
            "data": [{"year": r.year, "value": r.ukraine} for r in rows]
        }

    # ── 4. Чисельність населення ─────────────────────────────────
    elif dataset_id == 4:
        r = await db.execute(select(PopulationHistory).order_by(PopulationHistory.year))
        rows = r.scalars().all()
        return {
            "id": 4, "title": "Чисельність наявного населення",
            "type": "area_line",
            "y_label": "тис. осіб",
            "data": [{"year": r.year, "value": r.ukraine_thousands} for r in rows]
        }

    # ── 5. ІСЦ та ВВП ───────────────────────────────────────────
    elif dataset_id == 5:
        r = await db.execute(select(InflationHistory).order_by(InflationHistory.year))
        rows = r.scalars().all()
        return {
            "id": 5, "title": "Індекс споживчих цін (ІСЦ) та ВВП",
            "type": "dual_axis",
            "series": [
                {"label": "ІСЦ, %",          "y_label": "%",       "color": "#cc0000", "data": [{"year": r.year, "value": r.cpi}         for r in rows]},
                {"label": "ВВП, млрд грн",   "y_label": "млн грн", "color": "#000080", "data": [{"year": r.year, "value": r.gdp_nominal}  for r in rows]},
            ]
        }

    # ── 6. Зайнятість за видами діяльності ──────────────────────
    elif dataset_id == 6:
        r = await db.execute(select(EmploymentSector).order_by(EmploymentSector.year))
        rows = r.scalars().all()
        return {
            "id": 6, "title": "Зайнятість населення за видами діяльності",
            "type": "stacked_bar",
            "y_label": "тис. осіб",
            "series": [
                {"label": "Сільське господарство", "color": "#408040", "data": [{"year": r.year, "value": r.agriculture} for r in rows]},
                {"label": "Промисловість",          "color": "#204080", "data": [{"year": r.year, "value": r.industry}    for r in rows]},
                {"label": "Послуги",                "color": "#804020", "data": [{"year": r.year, "value": r.services}    for r in rows]},
            ]
        }

    # ── 7. Бюджет України ────────────────────────────────────────
    elif dataset_id == 7:
        r = await db.execute(select(BudgetHistory).order_by(BudgetHistory.year))
        rows = r.scalars().all()
        return {
            "id": 7, "title": "Бюджет України: доходи та видатки",
            "type": "budget",
            "y_label": "млрд грн",
            "series": [
                {"label": "Доходи",  "color": "#000080", "data": [{"year": r.year, "value": r.revenue}      for r in rows]},
                {"label": "Видатки", "color": "#c00000", "data": [{"year": r.year, "value": r.expenditure}  for r in rows]},
                {"label": "Баланс",  "color": "#008000", "data": [{"year": r.year, "value": r.deficit}      for r in rows]},
            ]
        }

    # ── 8. Реальна заробітна плата ───────────────────────────────
    elif dataset_id == 8:
        r = await db.execute(select(RealSalaryIndex).order_by(RealSalaryIndex.year))
        rows = r.scalars().all()
        return {
            "id": 8, "title": "Реальна заробітна плата (2010=100)",
            "type": "dual_axis",
            "series": [
                {"label": "Реальна зарплата (2010=100)", "y_label": "індекс", "color": "#000080", "data": [{"year": r.year, "value": r.index}   for r in rows]},
                {"label": "Номінальна, грн",             "y_label": "грн",    "color": "#c00000", "data": [{"year": r.year, "value": r.nominal}  for r in rows]},
            ]
        }

    # ── 9. Природний рух населення ───────────────────────────────
    elif dataset_id == 9:
        r = await db.execute(select(NaturalMovement).order_by(NaturalMovement.year))
        rows = r.scalars().all()
        return {
            "id": 9, "title": "Природний рух населення",
            "type": "natural_movement",
            "y_label": "тис. осіб",
            "series": [
                {"label": "Народження",      "color": "#000080", "data": [{"year": r.year, "value": r.births}     for r in rows]},
                {"label": "Смерті",          "color": "#c00000", "data": [{"year": r.year, "value": r.deaths}     for r in rows]},
                {"label": "Природний приріст","color": "#008000", "data": [{"year": r.year, "value": r.nat_growth} for r in rows]},
            ]
        }

    # ── 10. Індекс цін виробників ────────────────────────────────
    elif dataset_id == 10:
        r = await db.execute(select(ProducerPriceIndex).order_by(ProducerPriceIndex.year))
        rows = r.scalars().all()
        return {
            "id": 10, "title": "Індекс цін виробників промислової продукції",
            "type": "bar_line",
            "y_label": "% зміна",
            "data": [{"year": r.year, "value": r.ppi} for r in rows]
        }

    # ── 11. Структура ВВП за категоріями доходів ─────────────────
    elif dataset_id == 11:
        r = await db.execute(select(GdpStructure).order_by(GdpStructure.year))
        rows = r.scalars().all()
        return {
            "id": 11, "title": "Структура ВВП за категоріями доходів",
            "type": "stacked_bar",
            "y_label": "%",
            "series": [
                {"label": "Оплата праці",   "color": "#000080", "data": [{"year": r.year, "value": r.compensation}  for r in rows]},
                {"label": "Валовий прибуток","color": "#c00000", "data": [{"year": r.year, "value": r.gross_profit}  for r in rows]},
                {"label": "Податки",         "color": "#408040", "data": [{"year": r.year, "value": r.taxes}         for r in rows]},
            ]
        }

    # ── 12. Зовнішня торгівля ─────────────────────────────────────
    elif dataset_id == 12:
        r = await db.execute(select(TradeHistory).order_by(TradeHistory.year))
        rows = r.scalars().all()
        return {
            "id": 12, "title": "Зовнішня торгівля товарами та послугами",
            "type": "trade",
            "y_label": "млрд USD",
            "series": [
                {"label": "Експорт",  "color": "#000080", "data": [{"year": r.year, "value": r.exports} for r in rows]},
                {"label": "Імпорт",   "color": "#c00000", "data": [{"year": r.year, "value": r.imports} for r in rows]},
                {"label": "Баланс",   "color": "#008000", "data": [{"year": r.year, "value": r.balance} for r in rows]},
            ]
        }

    else:
        raise HTTPException(404, f"Датасет #{dataset_id} не знайдено")
