"""
main.py — УкрДані API (FastAPI + SQLite)

Запуск:
    uvicorn main:app --reload --port 8000

Документація (Swagger):
    http://localhost:8000/docs

ReDoc:
    http://localhost:8000/redoc
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from db.database import init_db
from routes.statistics import router as stats_router
from routes.regions    import router as regions_router
from routes.datasets   import router as datasets_router
from routes.sources    import router as sources_router
from routes.contact       import router as contact_router
from routes.datasets_data import router as datasets_data_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Виконується при старті: створює таблиці якщо їх немає."""
    await init_db()
    yield


app = FastAPI(
    title="УкрДані API",
    description="""
## 🇺🇦 Відкритий API економічної статистики України

Надає доступ до офіційних статистичних даних регіонів України (1998–2024).

### Ендпоінти

| Метод | Шлях | Опис |
|-------|------|------|
| GET | `/v1/statistics` | Показники по регіонах |
| GET | `/v1/statistics/history` | Динаміка по роках |
| GET | `/v1/regions` | Список регіонів |
| GET | `/v1/regions/{id}` | Один регіон |
| GET | `/v1/datasets` | Каталог датасетів |
| GET | `/v1/categories` | Категорії |
| GET | `/v1/sources` | Джерела даних |
| POST | `/v1/contact` | Зворотний зв'язок |

### Джерела даних
- [Держстат України](https://stat.gov.ua)
- [НБУ](https://bank.gov.ua)
- [Мінфін](https://minfin.gov.ua)

Ліцензія: **CC BY 4.0**
    """,
    version="1.0.0",
    contact={
        "name": "УкрДані",
        "url": "https://ukrdata.gov.ua",
    },
    license_info={
        "name": "CC BY 4.0",
        "url": "https://creativecommons.org/licenses/by/4.0/",
    },
    lifespan=lifespan,
)

# ── CORS — дозволяємо фронтенду (будь-який origin для розробки) ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # В продакшні замінити на конкретний домен
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Підключаємо роутери ──
app.include_router(stats_router)
app.include_router(regions_router)
app.include_router(datasets_router)
app.include_router(sources_router)
app.include_router(contact_router)
app.include_router(datasets_data_router)


# ── Коренева сторінка ──
@app.get("/", tags=["Info"], summary="Інформація про API")
async def root():
    return {
        "name":        "УкрДані API",
        "version":     "1.0.0",
        "description": "Відкритий API економічної статистики України",
        "docs":        "/docs",
        "redoc":       "/redoc",
        "endpoints": {
            "statistics":       "/v1/statistics",
            "history":          "/v1/statistics/history",
            "regions":          "/v1/regions",
            "datasets":         "/v1/datasets",
            "categories":       "/v1/categories",
            "sources":          "/v1/sources",
            "contact":          "/v1/contact",
        }
    }


# ── Healthcheck ──
@app.get("/health", tags=["Info"], summary="Перевірка стану сервера")
async def health():
    return {"status": "ok", "service": "ukrdata-api"}
