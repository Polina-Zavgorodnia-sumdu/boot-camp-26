"""
scripts/seed.py — Єдиний скрипт наповнення всієї БД УкрДані

Запуск (з папки backend/):
    python scripts/seed.py

Ідемпотентний: очищає таблиці і вставляє заново.
"""

import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from db.database import engine, init_db
from db.models import (
    Region, SalaryHistory, UnemploymentHistory, InflationHistory, PopulationHistory,
    Category, Dataset, Source,
    BudgetHistory, TradeHistory, EmploymentSector,
    RealSalaryIndex, ProducerPriceIndex, GdpStructure, NaturalMovement
)
from sqlalchemy.ext.asyncio import AsyncSession
from scripts.regional_data import YEARS_EXTENDED, get_regional_record

# ═══════════════════════════════════════════════════════
# БАЗОВІ ДАНІ (регіони, зарплати, категорії, датасети)
# ═══════════════════════════════════════════════════════

# ВРП регіонів, млн грн, Держстат (СНР-2008), 2005–2013
REGIONAL_GDP = {
    "crimea":          {2005:12848, 2006:16044, 2007:20874, 2008:27365, 2009:27396, 2010:32426, 2011:38220, 2012:44536, 2013:46393},
    "vinnytsia":       {2005:10207, 2006:12414, 2007:15381, 2008:20094, 2009:20104, 2010:23589, 2011:29099, 2012:33024, 2013:36191},
    "volyn":           {2005:6553,  2006:7687,  2007:10072, 2008:12784, 2009:12225, 2010:14429, 2011:17637, 2012:20005, 2013:20622},
    "dnipro":          {2005:41227, 2006:52347, 2007:71173, 2008:104687,2009:93331, 2010:116136,2011:140020,2012:147970,2013:152905},
    "donetsk":         {2005:58044, 2006:72361, 2007:92093, 2008:117646,2009:103739,2010:128986,2011:161021,2012:170775,2013:164926},
    "zhytomyr":        {2005:7430,  2006:8784,  2007:11127, 2008:15008, 2009:14731, 2010:18743, 2011:21928, 2012:24849, 2013:25676},
    "zakarpattia":     {2005:6700,  2006:8185,  2007:10508, 2008:13208, 2009:12542, 2010:15299, 2011:18054, 2012:21404, 2013:21400},
    "zaporizhzhia":    {2005:19968, 2006:24787, 2007:33158, 2008:42445, 2009:37446, 2010:42736, 2011:49525, 2012:54828, 2013:54352},
    "ivano-frankivsk": {2005:9622,  2006:11316, 2007:13916, 2008:17883, 2009:12741, 2010:20446, 2011:26752, 2012:32286, 2013:33196},
    "kyiv-obl":        {2005:15362, 2006:19188, 2007:26221, 2008:35687, 2009:37548, 2010:44953, 2011:59154, 2012:69663, 2013:68931},
    "kirovograd":      {2005:6877,  2006:8187,  2007:9989,  2008:13961, 2009:13389, 2010:15749, 2011:20041, 2012:22056, 2013:25313},
    "luhansk":         {2005:19716, 2006:24159, 2007:32280, 2008:42985, 2009:38451, 2010:45541, 2011:57202, 2012:58767, 2013:55108},
    "lviv":            {2005:17192, 2006:21486, 2007:27987, 2008:35534, 2009:35955, 2010:41655, 2011:52103, 2012:61962, 2013:63329},
    "mykolaiv":        {2005:9553,  2006:11876, 2007:14767, 2008:19410, 2009:20336, 2010:24055, 2011:27633, 2012:29205, 2013:32030},
    "odesa":           {2005:20762, 2006:24898, 2007:33116, 2008:46994, 2009:48647, 2010:53878, 2011:61499, 2012:64743, 2013:69760},
    "poltava":         {2005:18099, 2006:22179, 2007:28355, 2008:34118, 2009:33629, 2010:44291, 2011:52252, 2012:56580, 2013:58464},
    "rivne":           {2005:7263,  2006:8924,  2007:11180, 2008:14074, 2009:13469, 2010:15882, 2011:19302, 2012:21795, 2013:22004},
    "sumy":            {2005:8025,  2006:9566,  2007:12341, 2008:16210, 2009:16060, 2010:18333, 2011:22907, 2012:24933, 2013:26765},
    "ternopil":        {2005:5137,  2006:6452,  2007:8276,  2008:10618, 2009:11173, 2010:12726, 2011:16294, 2012:17957, 2013:18085},
    "kharkiv":         {2005:25618, 2006:32023, 2007:43868, 2008:59389, 2009:58923, 2010:65293, 2011:76866, 2012:82223, 2013:85315},
    "kherson":         {2005:6469,  2006:7565,  2007:9034,  2008:13174, 2009:13436, 2010:15649, 2011:18448, 2012:13357, 2013:20767},
    "khmelnytskyi":    {2005:7958,  2006:9603,  2007:12339, 2008:16061, 2009:15758, 2010:18096, 2011:22843, 2012:26237, 2013:26426},
    "cherkasy":        {2005:9014,  2006:10957, 2007:13656, 2008:19101, 2009:18707, 2010:22354, 2011:27012, 2012:31265, 2013:33087},
    "chernivtsi":      {2005:4234,  2006:5126,  2007:6672,  2008:8833,  2009:8484,  2010:9892,  2011:11969, 2012:13166, 2013:13757},
    "chernihiv":       {2005:7627,  2006:8950,  2007:11152, 2008:14918, 2009:14636, 2010:17008, 2011:21165, 2012:23934, 2013:24237},
    "kyiv":            {2005:77124, 2006:95267, 2007:135900,2008:169564,2009:169537,2010:196639,2011:223774,2012:275685,2013:312552},
    "sevastopol":      {2005:2823,  2006:3822,  2007:4916,  2008:6305,  2009:6452,  2010:7785,  2011:9359,  2012:9891,  2013:11066},
}

REGION_NAMES = {
    "kyiv": "Київ", "donetsk": "Донецька", "dnipro": "Дніпропетровська",
    "kharkiv": "Харківська", "zaporizhzhia": "Запорізька", "lviv": "Львівська",
    "odesa": "Одеська", "poltava": "Полтавська", "mykolaiv": "Миколаївська",
    "vinnytsia": "Вінницька", "sumy": "Сумська", "cherkasy": "Черкаська",
    "kherson": "Херсонська", "kyiv-obl": "Київська обл.", "luhansk": "Луганська",
    "ternopil": "Тернопільська", "chernivtsi": "Чернівецька", "rivne": "Рівненська",
    "ivano-frankivsk": "Івано-Франківська", "volyn": "Волинська",
    "zakarpattia": "Закарпатська", "khmelnytskyi": "Хмельницька",
    "chernihiv": "Чернігівська", "kirovograd": "Кіровоградська", "zhytomyr": "Житомирська",
    "crimea": "АР Крим", "sevastopol": "Севастополь",
}

# Показники 2024 (ВРП розраховується окремо)
REGIONS_META = [
    {"id":"kyiv",            "unemployment":3.8,  "salary":28600, "population":2960.0},
    {"id":"donetsk",         "unemployment":12.4, "salary":16329, "population":1650.0},
    {"id":"dnipro",          "unemployment":7.2,  "salary":22000, "population":3100.0},
    {"id":"kharkiv",         "unemployment":6.8,  "salary":18200, "population":2680.0},
    {"id":"zaporizhzhia",    "unemployment":8.9,  "salary":19665, "population":1520.0},
    {"id":"lviv",            "unemployment":7.4,  "salary":21000, "population":2560.0},
    {"id":"odesa",           "unemployment":6.2,  "salary":20500, "population":2380.0},
    {"id":"poltava",         "unemployment":7.8,  "salary":18630, "population":1320.0},
    {"id":"mykolaiv",        "unemployment":9.8,  "salary":17020, "population":1080.0},
    {"id":"vinnytsia",       "unemployment":8.4,  "salary":17365, "population":1420.0},
    {"id":"sumy",            "unemployment":9.2,  "salary":16214, "population":1020.0},
    {"id":"cherkasy",        "unemployment":8.9,  "salary":16560, "population":1140.0},
    {"id":"kherson",         "unemployment":11.8, "salary":15179, "population":980.0},
    {"id":"kyiv-obl",        "unemployment":5.4,  "salary":24609, "population":1820.0},
    {"id":"luhansk",         "unemployment":14.2, "salary":13569, "population":980.0},
    {"id":"ternopil",        "unemployment":10.2, "salary":16790, "population":1040.0},
    {"id":"chernivtsi",      "unemployment":10.8, "salary":15869, "population":900.0},
    {"id":"rivne",           "unemployment":9.6,  "salary":16329, "population":1080.0},
    {"id":"ivano-frankivsk", "unemployment":8.8,  "salary":17710, "population":1380.0},
    {"id":"volyn",           "unemployment":9.8,  "salary":17020, "population":1040.0},
    {"id":"zakarpattia",     "unemployment":11.2, "salary":15639, "population":1240.0},
    {"id":"khmelnytskyi",    "unemployment":8.6,  "salary":17020, "population":1280.0},
    {"id":"chernihiv",       "unemployment":9.4,  "salary":16329, "population":1020.0},
    {"id":"kirovograd",      "unemployment":10.4, "salary":15869, "population":940.0},
    {"id":"zhytomyr",        "unemployment":10.2, "salary":16214, "population":1200.0},
]

# Коефіцієнти для екстраполяції 2024 з урахуванням війни та окупації
GDP_2024_WAR_FACTORS = {
    "donetsk": 0.18, "luhansk": 0.17,
    "kherson": 0.42, "zaporizhzhia": 0.48,
    "mykolaiv": 0.50, "sumy": 0.48, "chernihiv": 0.50,
    "kyiv": 1.20, "kyiv-obl": 1.05,
    "lviv": 1.10, "ivano-frankivsk": 1.10, "ternopil": 1.08,
    "volyn": 1.08, "chernivtsi": 1.07, "zakarpattia": 1.05,
}

EXTRA_REGION_META = {
    "crimea":      {"unemployment":5.8, "salary":2800, "population":1960.0},
    "sevastopol":  {"unemployment":5.5, "salary":3100, "population":380.0},
}

GDP_YEARS = list(range(2005, 2014))

def _calc_regions_2024_gdp():
    """ВРП 2024: база 2013 × зростання ВВП × регіональні коефіцієнти, нормалізація до ВВП."""
    gdp_2013_national = 1522657
    gdp_2024_national = 7658700
    nat_factor = gdp_2024_national / gdp_2013_national
    raw = {}
    for rid, years in REGIONAL_GDP.items():
        if rid in ("crimea", "sevastopol"):
            continue
        gdp_2013 = years[2013]
        factor = GDP_2024_WAR_FACTORS.get(rid, 0.95)
        raw[rid] = gdp_2013 * nat_factor * factor
    scale = gdp_2024_national / sum(raw.values())
    return {rid: round(v * scale) for rid, v in raw.items()}

def _build_regions_data():
    gdp_2024 = _calc_regions_2024_gdp()
    return [
        {
            "id": m["id"], "name": REGION_NAMES[m["id"]],
            "gdp": gdp_2024[m["id"]],
            "unemployment": m["unemployment"], "salary": m["salary"], "population": m["population"],
        }
        for m in REGIONS_META
    ]

REGIONS_DATA = _build_regions_data()

YEARS = list(range(1998, 2025))

SALARY_UA      = [153,178,230,311,376,462,590,806,1041,1351,1806,1906,2239,2633,3025,3265,3480,4195,5183,7104,8865,10497,12264,14310,15260,16540,18600]
SALARY_KYIV    = [340,360,490,610,750,940,1240,1610,2080,2620,3240,3050,3620,4180,4760,4820,4880,5180,7420,9640,12280,15440,18640,22400,24200,26400,28600]
SALARY_KHARKIV = [210,230,310,390,480,600,800,1040,1340,1700,2100,1980,2340,2700,3080,3120,2840,3180,4560,5920,7540,9460,11440,13720,14800,16600,18200]
SALARY_LVIV    = [195,215,290,360,445,555,740,960,1240,1560,1940,1830,2160,2500,2840,2880,2920,3090,4430,5730,7310,9160,11080,13280,14340,16000,16400]
SALARY_DNIPRO  = [230,250,340,425,525,660,870,1130,1460,1840,2280,2150,2540,2940,3350,3400,3060,3430,4910,6380,8120,10200,12340,14800,15980,17870,19800]
SALARY_ODESA   = [200,220,300,375,460,580,760,990,1280,1610,1990,1880,2220,2570,2930,2980,2700,3020,4330,5620,7160,8980,10860,13020,14060,15700,17800]
UNEMPLOYMENT_UA = [11.3,11.6,11.7,10.9,10.1,9.1,8.6,7.2,6.8,6.4,6.4,8.8,8.1,7.9,7.5,7.2,9.3,9.1,9.3,9.5,8.8,8.2,9.5,9.8,19.8,15.2,12.4]
INFLATION_CPI  = [10.6,22.7,28.2,12.0,0.8,5.2,9.0,13.5,9.1,12.8,25.2,-0.1,9.4,8.0,0.6,-0.3,24.9,43.3,12.4,13.7,9.8,4.1,2.7,10.0,26.6,12.1,5.1]
GDP_NOMINAL    = [102593,130442,170070,204190,225810,267344,345113,441452,544153,720731,948056,913345,
                  1082569,1302097,1459096,1522657,1566728,1988544,2383182,2981952,3558706,3978206,
                  4221096,5459622,5191000,6537800,7658700]
POPULATION_UA  = [50370,49918,49429,48923,48457,48003,47442,47100,46787,46646,46374,46143,
                  45870,45598,45593,45246,43009,42760,42760,42386,41983,41880,41732,41418,43531,37000,36000]

CATEGORIES_DATA = [
    {"id":"economy",    "icon":"<img src=\"assets/economics.png\" width=\"32\" height=\"32\" alt=\"Економіка\" style=\"image-rendering:smooth;vertical-align:middle;\">", "title":"Економіка",      "desc":"ВВП, ВРП регіонів, структура економіки",         "count":8},
    {"id":"labor",      "icon":"<img src=\"assets/briefcase.png\" width=\"32\" height=\"32\" alt=\"Ринок праці\" style=\"image-rendering:smooth;vertical-align:middle;\">", "title":"Ринок праці",    "desc":"Зарплати, зайнятість, безробіття по регіонах",    "count":6},
    {"id":"demography", "icon":"<img src=\"assets/people.png\" width=\"32\" height=\"32\" alt=\"Демографія\" style=\"image-rendering:smooth;vertical-align:middle;\">", "title":"Демографія",     "desc":"Населення, народжуваність, смертність, міграція", "count":5},
    {"id":"inflation",  "icon":"<img src=\"assets/inflation.png\" width=\"32\" height=\"32\" alt=\"Інфляція\" style=\"image-rendering:smooth;vertical-align:middle;\">", "title":"Інфляція",       "desc":"ІСЦ, індекс цін виробників, дефлятор ВВП",       "count":4},
    {"id":"regional",   "icon":"<img src=\"assets/map.png\" width=\"32\" height=\"32\" alt=\"Регіональна\" style=\"image-rendering:smooth;vertical-align:middle;\">", "title":"Регіональна",   "desc":"Порівняльні дані по 25 регіонах України",         "count":7},
    {"id":"budget",     "icon":"<img src=\"assets/building.png\" width=\"32\" height=\"32\" alt=\"Бюджет\" style=\"image-rendering:smooth;vertical-align:middle;\">", "title":"Бюджет",         "desc":"Доходи, видатки, дефіцит держбюджету",            "count":3},
]

DATASETS_DATA = [
    {"id":1,  "title":"Середня заробітна плата по регіонах України",   "cat":"labor",      "year":"1998–2024","source":"Держстат","records":675,  "updated":"01.2024","metric":"salary"},
    {"id":2,  "title":"ВРП регіонів України у поточних цінах",          "cat":"economy",    "year":"2005–2024","source":"Держстат","records":268,  "updated":"06.2025","metric":"gdp"},
    {"id":3,  "title":"Рівень безробіття (методологія МОП)",            "cat":"labor",      "year":"1998–2024","source":"Держстат","records":27,   "updated":"11.2023","metric":"unemployment"},
    {"id":4,  "title":"Чисельність наявного населення",                 "cat":"demography", "year":"1998–2024","source":"Держстат","records":27,   "updated":"01.2024","metric":"population"},
    {"id":5,  "title":"Індекс споживчих цін (ІСЦ) та ВВП",             "cat":"inflation",  "year":"1998–2024","source":"Держстат","records":27,   "updated":"01.2024","metric":"gdp"},
    {"id":6,  "title":"Зайнятість населення за видами діяльності",       "cat":"labor",      "year":"2010–2024","source":"Держстат","records":45,   "updated":"10.2023","metric":"salary"},
    {"id":7,  "title":"Бюджет України: доходи та видатки",              "cat":"budget",     "year":"2000–2024","source":"Мінфін",  "records":75,   "updated":"01.2024","metric":"gdp"},
    {"id":8,  "title":"Реальна заробітна плата (2010=100)",             "cat":"labor",      "year":"1998–2024","source":"Держстат","records":27,   "updated":"01.2024","metric":"salary"},
    {"id":9,  "title":"Природний рух населення",                        "cat":"demography", "year":"2000–2024","source":"Держстат","records":75,   "updated":"09.2023","metric":"population"},
    {"id":10, "title":"Індекс цін виробників промислової продукції",     "cat":"inflation",  "year":"2005–2024","source":"Держстат","records":20,   "updated":"12.2023","metric":"gdp"},
    {"id":11, "title":"Структура ВВП за категоріями доходів",           "cat":"economy",    "year":"2010–2024","source":"Держстат","records":45,   "updated":"12.2023","metric":"gdp"},
    {"id":12, "title":"Зовнішня торгівля товарами та послугами",        "cat":"economy",    "year":"2000–2024","source":"Держстат","records":75,   "updated":"11.2023","metric":"gdp"},
]

SOURCES_DATA = [
    {"id":1,"name":"Держстат України",                   "type":"Офіційна статистика",  "org":"Державна служба статистики","updated":"2024","license":"CC BY 4.0","url":"https://stat.gov.ua"},
    {"id":2,"name":"Національний банк України",          "type":"Фінансові дані",        "org":"НБУ",                       "updated":"2024","license":"CC BY 4.0","url":"https://bank.gov.ua"},
    {"id":3,"name":"Міністерство фінансів України",      "type":"Фінансові дані",        "org":"Мінфін",                    "updated":"2024","license":"CC BY 4.0","url":"https://minfin.gov.ua"},
    {"id":4,"name":"Світовий банк — Україна",            "type":"Міжнародна статистика", "org":"World Bank",                "updated":"2024","license":"CC BY 4.0","url":"https://data.worldbank.org/country/UA"},
    {"id":5,"name":"МВФ — Ukraine Data",                 "type":"Міжнародна статистика", "org":"IMF",                       "updated":"2024","license":"Public",   "url":"https://www.imf.org/en/countries/UKR"},
    {"id":6,"name":"data.gov.ua — Портал відкритих даних","type":"Агрегований портал",   "org":"Мін. цифрової трансформації","updated":"2024","license":"CC BY 4.0","url":"https://data.gov.ua"},
]

# ═══════════════════════════════════════════════════════
# РОЗШИРЕНІ ДАНІ (бюджет, торгівля, зайнятість, ін.)
# ═══════════════════════════════════════════════════════

YEARS_BUDGET = list(range(2000, 2025))
BUDGET_REVENUE      = [49.1,54.9,61.9,75.3,91.5,134.2,171.8,219.9,290.0,377.8,458.5,209.7,314.5,398.3,446.0,534.7,652.0,652.1,782.9,1016.8,1184.3,1311.8,1875.3,2164.9,3121.0]
BUDGET_EXPENDITURE  = [48.1,55.5,60.3,75.8,102.5,141.9,175.5,227.6,309.2,417.0,505.8,307.4,377.8,416.9,492.5,576.8,830.6,699.8,839.0,1072.6,1250.5,1374.0,2786.0,2843.4,4065.0]

YEARS_TRADE = list(range(2000, 2025))
TRADE_EXPORTS = [15.7,17.1,21.9,23.3,32.7,34.3,38.4,49.8,60.4,71.0,78.7,47.4,63.2,82.2,85.7,63.6,49.4,43.3,43.3,47.3,60.8,81.3,57.4,52.4,41.6]
TRADE_IMPORTS = [14.9,15.8,17.9,23.0,29.7,36.1,45.0,60.6,71.0,85.5,94.6,50.6,74.9,99.3,104.4,79.6,60.4,57.0,57.0,57.2,60.5,84.2,55.0,63.5,70.7]

YEARS_EMPLOY = list(range(2010, 2025))
EMPLOY_AGRI  = [3090,3052,3021,2975,2939,2866,2835,2800,2760,2721,2693,2100,2050,1980,1890]
EMPLOY_INDUS = [3985,3920,3870,3790,3720,3480,3320,3250,3180,3100,2950,2200,2100,2050,1980]
EMPLOY_SERV  = [12490,12480,12450,12300,12150,11860,11540,11310,11050,10790,10380,8250,8100,7950,7630]

# Реальна зарплата: розраховується на базі 2010=100
def calc_real_salary():
    base_idx = 12  # 2010 — рядок 12 у YEARS (1998+12)
    base_nom = SALARY_UA[base_idx]
    cpi = 1.0
    result = []
    for i, inf in enumerate(INFLATION_CPI):
        if i <= base_idx:
            cpi = 1.0
        else:
            cpi *= (1 + inf / 100)
        result.append(round(SALARY_UA[i] / cpi / base_nom * 100, 1))
    return result

REAL_SALARY_INDEX = calc_real_salary()

YEARS_PPI = list(range(2005, 2025))
PPI_VALUES = [16.7,14.1,19.5,35.5,-14.7,20.9,18.7,14.2,-0.5,0.5,19.0,38.3,16.5,26.8,16.8,5.0,1.8,18.0,32.1,11.5]

YEARS_GDP_STRUCT = list(range(2010, 2025))
GDP_COMPENSATION = [49.2,50.4,51.0,51.8,52.0,53.1,45.2,44.1,44.8,46.3,47.2,48.1,37.4,42.1,44.5]
GDP_GROSS_PROFIT = [36.8,35.6,35.0,34.2,33.5,31.5,38.3,39.5,38.9,37.4,36.6,35.7,44.9,38.2,36.8]
GDP_TAXES        = [14.0,14.0,14.0,14.0,14.5,15.4,16.5,16.4,16.3,16.3,16.2,16.2,17.7,19.7,18.7]

YEARS_NAT = list(range(2000, 2025))
NAT_BIRTHS = [385.1,376.5,390.7,408.6,427.3,426.1,460.4,472.7,510.6,514.7,510.6,512.5,520.8,503.7,465.9,411.8,397.0,363.9,335.9,315.2,293.2,273.2,219.1,193.0,178.1]
NAT_DEATHS = [758.1,745.9,754.9,765.4,761.3,782.0,758.1,762.9,762.2,754.5,754.5,706.7,698.2,664.5,632.4,594.8,594.8,574.0,574.1,573.4,620.8,734.3,700.8,590.0,560.0]

# ═══════════════════════════════════════════════════════
# SEED
# ═══════════════════════════════════════════════════════

ALL_TABLES = [
    "contacts","datasets","categories","sources",
    "salary_history","unemployment_history","inflation_history","population_history","regions",
    "budget_history","trade_history","employment_sector",
    "real_salary_index","producer_price_index","gdp_structure","natural_movement",
]

async def seed():
    print("⏳ Ініціалізація БД…")
    await init_db()

    async with engine.begin() as conn:
        for table in ALL_TABLES:
            try:
                await conn.execute(text(f"DELETE FROM {table}"))
            except Exception:
                pass
    print("   Всі таблиці очищено")

    async with AsyncSession(engine) as s:

        # ── Регіони
        idx_2013 = YEARS.index(2013)
        idx_2024 = YEARS.index(2024)

        def _scale_metrics(meta, year_idx):
            sal = meta["salary"] * SALARY_UA[year_idx] / SALARY_UA[idx_2024]
            unemp = meta["unemployment"] * UNEMPLOYMENT_UA[year_idx] / UNEMPLOYMENT_UA[idx_2024]
            pop = meta["population"] * POPULATION_UA[year_idx] / POPULATION_UA[idx_2024]
            return round(sal, 1), round(unemp, 1), round(pop, 1)

        # 2024
        for r in REGIONS_DATA:
            s.add(Region(region_id=r["id"], year=2024, name=r["name"],
                         gdp=r["gdp"], unemployment=r["unemployment"],
                         salary=r["salary"], population=r["population"]))

        # 2005–2013: офіційний ВРП + масштабовані інші показники
        meta_by_id = {m["id"]: m for m in REGIONS_META}
        meta_by_id.update(EXTRA_REGION_META)

        for year in GDP_YEARS:
            year_idx = YEARS.index(year)
            for rid, gdp_by_year in REGIONAL_GDP.items():
                meta = meta_by_id.get(rid, EXTRA_REGION_META.get(rid))
                sal, unemp, pop = _scale_metrics(meta, year_idx)
                s.add(Region(
                    region_id=rid, year=year, name=REGION_NAMES[rid],
                    gdp=gdp_by_year[year],
                    unemployment=unemp, salary=sal, population=pop,
                ))

        # 2014–2023: офіційні дані Держстату (data.gov.ua)
        for year in YEARS_EXTENDED:
            for rid in REGION_NAMES:
                if rid in ("crimea", "sevastopol"):
                    continue
                rec = get_regional_record(rid, year)
                if not rec or not rec["gdp"]:
                    continue
                s.add(Region(
                    region_id=rid, year=year, name=REGION_NAMES[rid],
                    gdp=rec["gdp"],
                    unemployment=rec["unemployment"],
                    salary=rec["salary"],
                    population=rec["population"],
                ))

        # ── Динаміка зарплат
        for i, y in enumerate(YEARS):
            s.add(SalaryHistory(year=y,ukraine=SALARY_UA[i],kyiv=SALARY_KYIV[i],
                                kharkiv=SALARY_KHARKIV[i],lviv=SALARY_LVIV[i],
                                dnipro=SALARY_DNIPRO[i],odesa=SALARY_ODESA[i]))

        # ── Безробіття
        for i, y in enumerate(YEARS):
            s.add(UnemploymentHistory(year=y, ukraine=UNEMPLOYMENT_UA[i]))

        # ── Інфляція + ВВП
        for i, y in enumerate(YEARS):
            s.add(InflationHistory(year=y, cpi=INFLATION_CPI[i], gdp_nominal=GDP_NOMINAL[i]))

        # ── Населення
        for i, y in enumerate(YEARS):
            s.add(PopulationHistory(year=y, ukraine_thousands=POPULATION_UA[i]))

        # ── Категорії, датасети, джерела
        for c in CATEGORIES_DATA: s.add(Category(**c))
        for d in DATASETS_DATA:   s.add(Dataset(**d))
        for src in SOURCES_DATA:  s.add(Source(**src))

        # ── Бюджет
        for i, y in enumerate(YEARS_BUDGET):
            rev, exp = BUDGET_REVENUE[i], BUDGET_EXPENDITURE[i]
            s.add(BudgetHistory(year=y, revenue=rev, expenditure=exp, deficit=round(rev-exp,1)))

        # ── Торгівля
        for i, y in enumerate(YEARS_TRADE):
            exp_v, imp_v = TRADE_EXPORTS[i], TRADE_IMPORTS[i]
            s.add(TradeHistory(year=y, exports=exp_v, imports=imp_v, balance=round(exp_v-imp_v,2)))

        # ── Зайнятість
        for i, y in enumerate(YEARS_EMPLOY):
            total = EMPLOY_AGRI[i]+EMPLOY_INDUS[i]+EMPLOY_SERV[i]
            s.add(EmploymentSector(year=y,agriculture=EMPLOY_AGRI[i],industry=EMPLOY_INDUS[i],services=EMPLOY_SERV[i],total=total))

        # ── Реальна зарплата
        for i, y in enumerate(YEARS):
            s.add(RealSalaryIndex(year=y, index=REAL_SALARY_INDEX[i], nominal=SALARY_UA[i]))

        # ── ІЦВ
        for i, y in enumerate(YEARS_PPI):
            s.add(ProducerPriceIndex(year=y, ppi=PPI_VALUES[i]))

        # ── Структура ВВП
        for i, y in enumerate(YEARS_GDP_STRUCT):
            s.add(GdpStructure(year=y,compensation=GDP_COMPENSATION[i],gross_profit=GDP_GROSS_PROFIT[i],taxes=GDP_TAXES[i]))

        # ── Природний рух
        for i, y in enumerate(YEARS_NAT):
            s.add(NaturalMovement(year=y,births=NAT_BIRTHS[i],deaths=NAT_DEATHS[i],nat_growth=round(NAT_BIRTHS[i]-NAT_DEATHS[i],1)))

        await s.commit()

    print(f"   ✅ Регіони:           {len(REGIONS_DATA)} (2024) + {len(GDP_YEARS)} років (2005–2013) + {len(YEARS_EXTENDED)} років (2014–2023)")
    print(f"   ✅ Зарплати:          {len(YEARS)} років")
    print(f"   ✅ Безробіття:        {len(YEARS)} років")
    print(f"   ✅ Інфляція/ВВП:      {len(YEARS)} років")
    print(f"   ✅ Населення:         {len(YEARS)} років")
    print(f"   ✅ Категорії:         {len(CATEGORIES_DATA)}")
    print(f"   ✅ Датасети:          {len(DATASETS_DATA)}")
    print(f"   ✅ Джерела:           {len(SOURCES_DATA)}")
    print(f"   ✅ Бюджет:            {len(YEARS_BUDGET)} років")
    print(f"   ✅ Торгівля:          {len(YEARS_TRADE)} років")
    print(f"   ✅ Зайнятість:        {len(YEARS_EMPLOY)} років")
    print(f"   ✅ Реальна зарплата:  {len(YEARS)} років")
    print(f"   ✅ ІЦВ:               {len(YEARS_PPI)} років")
    print(f"   ✅ Структура ВВП:     {len(YEARS_GDP_STRUCT)} років")
    print(f"   ✅ Природний рух:     {len(YEARS_NAT)} років")
    print("\n🎉 База даних повністю заповнена!")

if __name__ == "__main__":
    asyncio.run(seed())
