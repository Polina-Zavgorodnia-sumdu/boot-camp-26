"""
models.py — ORM-моделі SQLAlchemy

Таблиці:
  regions          — статичні дані регіонів (2024)
  salary_history   — динаміка зарплат по роках (Україна + 5 міст)
  unemployment_history — динаміка безробіття по роках
  inflation_history    — інфляція ІСЦ + номінальний ВВП по роках
  population_history   — населення України по роках
  datasets         — каталог датасетів
  categories       — категорії датасетів
  sources          — джерела даних
  contacts         — повідомлення з форми зворотного зв'язку
"""

from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime,
    ForeignKey, Boolean
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from db.database import Base


class Region(Base):
    __tablename__ = "regions"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    region_id   = Column(String(50), nullable=False)   # "kyiv", "lviv", ...
    year        = Column(Integer, nullable=False, index=True)
    name        = Column(String(100), nullable=False)
    gdp         = Column(Float, nullable=False)          # млн грн
    unemployment = Column(Float, nullable=False)         # %
    salary      = Column(Float, nullable=False)          # грн/міс
    population  = Column(Float, nullable=False)          # тис. осіб


class SalaryHistory(Base):
    __tablename__ = "salary_history"

    id      = Column(Integer, primary_key=True, autoincrement=True)
    year    = Column(Integer, nullable=False, index=True)
    ukraine = Column(Float)
    kyiv    = Column(Float)
    kharkiv = Column(Float)
    lviv    = Column(Float)
    dnipro  = Column(Float)
    odesa   = Column(Float)


class UnemploymentHistory(Base):
    __tablename__ = "unemployment_history"

    id      = Column(Integer, primary_key=True, autoincrement=True)
    year    = Column(Integer, nullable=False, index=True)
    ukraine = Column(Float)


class InflationHistory(Base):
    __tablename__ = "inflation_history"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    year        = Column(Integer, nullable=False, index=True)
    cpi         = Column(Float)    # Індекс споживчих цін, %
    gdp_nominal = Column(Float)    # Номінальний ВВП, млн грн


class PopulationHistory(Base):
    __tablename__ = "population_history"

    id                 = Column(Integer, primary_key=True, autoincrement=True)
    year               = Column(Integer, nullable=False, index=True)
    ukraine_thousands  = Column(Float)   # тис. осіб


class Category(Base):
    __tablename__ = "categories"

    id    = Column(String(50), primary_key=True)   # "economy", "labor", ...
    icon  = Column(String(10))
    title = Column(String(100), nullable=False)
    desc  = Column(String(255))
    count = Column(Integer, default=0)

    datasets = relationship("Dataset", back_populates="category_obj")


class Dataset(Base):
    __tablename__ = "datasets"

    id       = Column(Integer, primary_key=True, autoincrement=True)
    title    = Column(String(200), nullable=False)
    cat      = Column(String(50), ForeignKey("categories.id"), nullable=False)
    year     = Column(String(20))      # "1998–2024"
    source   = Column(String(100))
    records  = Column(Integer, default=0)
    updated  = Column(String(20))      # "01.2024"
    metric   = Column(String(50))      # "salary", "gdp", ...

    category_obj = relationship("Category", back_populates="datasets")


class Source(Base):
    __tablename__ = "sources"

    id      = Column(Integer, primary_key=True, autoincrement=True)
    name    = Column(String(200), nullable=False)
    type    = Column(String(100))
    org     = Column(String(100))
    updated = Column(String(20))
    license = Column(String(50))
    url     = Column(String(255))


class Contact(Base):
    __tablename__ = "contacts"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    name       = Column(String(100), nullable=False)
    email      = Column(String(200), nullable=False)
    message    = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_read    = Column(Boolean, default=False)


class BudgetHistory(Base):
    __tablename__ = "budget_history"
    id       = Column(Integer, primary_key=True, autoincrement=True)
    year     = Column(Integer, nullable=False, index=True)
    revenue  = Column(Float)   # млрд грн
    expenditure = Column(Float) # млрд грн
    deficit  = Column(Float)   # млрд грн (від'ємне = дефіцит)


class TradeHistory(Base):
    __tablename__ = "trade_history"
    id      = Column(Integer, primary_key=True, autoincrement=True)
    year    = Column(Integer, nullable=False, index=True)
    exports = Column(Float)   # млрд USD
    imports = Column(Float)   # млрд USD
    balance = Column(Float)   # млрд USD


class EmploymentSector(Base):
    __tablename__ = "employment_sector"
    id          = Column(Integer, primary_key=True, autoincrement=True)
    year        = Column(Integer, nullable=False, index=True)
    agriculture = Column(Float)  # тис. осіб
    industry    = Column(Float)
    services    = Column(Float)
    total       = Column(Float)


class RealSalaryIndex(Base):
    __tablename__ = "real_salary_index"
    id    = Column(Integer, primary_key=True, autoincrement=True)
    year  = Column(Integer, nullable=False, index=True)
    index = Column(Float)   # 2010=100
    nominal = Column(Float) # грн


class ProducerPriceIndex(Base):
    __tablename__ = "producer_price_index"
    id    = Column(Integer, primary_key=True, autoincrement=True)
    year  = Column(Integer, nullable=False, index=True)
    ppi   = Column(Float)   # % зміна


class GdpStructure(Base):
    __tablename__ = "gdp_structure"
    id           = Column(Integer, primary_key=True, autoincrement=True)
    year         = Column(Integer, nullable=False, index=True)
    compensation = Column(Float)  # % — оплата праці
    gross_profit = Column(Float)  # % — валовий прибуток
    taxes        = Column(Float)  # % — податки


class NaturalMovement(Base):
    __tablename__ = "natural_movement"
    id         = Column(Integer, primary_key=True, autoincrement=True)
    year       = Column(Integer, nullable=False, index=True)
    births     = Column(Float)  # тис. осіб
    deaths     = Column(Float)  # тис. осіб
    nat_growth = Column(Float)  # тис. осіб (від'ємне = убуток)
