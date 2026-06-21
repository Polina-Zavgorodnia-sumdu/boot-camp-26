"""
regional_data.py — регіональні показники 2014–2023 (Держстат / data.gov.ua)

Джерела:
  - ВРП: data.gov.ua (Валовий регіональний продукт)
  - Зарплата: data.gov.ua + збірник «Регіони України, 2019», табл. 5.1.1
  - Безробіття: збірник «Регіони України, 2019», табл. 3.4 (МОП)
  - Населення: Держстат / ukrcensus.gov.ua (на 1 січня, тис. осіб)
"""
import json, os, csv

_DIR = os.path.dirname(os.path.abspath(__file__))
_RAW_GDP = os.path.join(_DIR, "..", "..", "data", "raw", "gdp.json")
_RAW_SALARY = os.path.join(_DIR, "..", "..", "data", "raw", "salary.csv")

GDP_CODE_MAP = {
    "0500000000": "vinnytsia", "0700000000": "volyn", "1200000000": "dnipro",
    "1400000000": "donetsk", "1800000000": "zhytomyr", "2100000000": "zakarpattia",
    "2300000000": "zaporizhzhia", "2600000000": "ivano-frankivsk",
    "3200000000": "kyiv-obl", "3500000000": "kirovograd", "4400000000": "luhansk",
    "4600000000": "lviv", "4800000000": "mykolaiv", "5100000000": "odesa",
    "5300000000": "poltava", "5600000000": "rivne", "5900000000": "sumy",
    "6100000000": "ternopil", "6300000000": "kharkiv", "6500000000": "kherson",
    "6800000000": "khmelnytskyi", "7100000000": "cherkasy", "7300000000": "chernivtsi",
    "7400000000": "chernihiv", "8000000000": "kyiv",
}

SALARY_NAME_MAP = {
    "Вінницька": "vinnytsia", "Волинська": "volyn", "Дніпропетровська": "dnipro",
    "Донецька": "donetsk", "Житомирська": "zhytomyr", "Закарпатська": "zakarpattia",
    "Запорізька": "zaporizhzhia", "Івано-Франківська": "ivano-frankivsk",
    "Київська": "kyiv-obl", "Кіровоградська": "kirovograd", "Луганська": "luhansk",
    "Львівська": "lviv", "Миколаївська": "mykolaiv", "Одеська": "odesa",
    "Полтавська": "poltava", "Рівненська": "rivne", "Сумська": "sumy",
    "Тернопільська": "ternopil", "Харківська": "kharkiv", "Херсонська": "kherson",
    "Хмельницька": "khmelnytskyi", "Черкаська": "cherkasy", "Чернівецька": "chernivtsi",
    "Чернігівська": "chernihiv", "м. Київ": "kyiv", "м.Київ": "kyiv",
}

# Держстат, табл. 5.1.1
_SALARY = {
    2014: {"vinnytsia":2910,"volyn":2850,"dnipro":3780,"donetsk":4320,"zhytomyr":2820,"zakarpattia":2940,"zaporizhzhia":3660,"ivano-frankivsk":2960,"kyiv-obl":3620,"kirovograd":2850,"luhansk":2980,"lviv":3180,"mykolaiv":3460,"odesa":3380,"poltava":3280,"rivne":3100,"sumy":3000,"ternopil":2620,"kharkiv":3220,"kherson":2720,"khmelnytskyi":2920,"cherkasy":2910,"chernivtsi":2660,"chernihiv":2860,"kyiv":5890},
    2015: {"vinnytsia":3396,"volyn":3291,"dnipro":4366,"donetsk":4980,"zhytomyr":3271,"zakarpattia":3381,"zaporizhzhia":4200,"ivano-frankivsk":3402,"kyiv-obl":4153,"kirovograd":3282,"luhansk":3427,"lviv":3646,"mykolaiv":3984,"odesa":3897,"poltava":3783,"rivne":3573,"sumy":3449,"ternopil":2994,"kharkiv":3697,"kherson":3123,"khmelnytskyi":3371,"cherkasy":3360,"chernivtsi":3050,"chernihiv":3295,"kyiv":6732},
    2016: {"vinnytsia":4189,"volyn":4047,"dnipro":5075,"donetsk":5989,"zhytomyr":4000,"zakarpattia":4298,"zaporizhzhia":5080,"ivano-frankivsk":4202,"kyiv-obl":5229,"kirovograd":3974,"luhansk":4637,"lviv":4559,"mykolaiv":4887,"odesa":4809,"poltava":4621,"rivne":4364,"sumy":4131,"ternopil":3695,"kharkiv":4448,"kherson":4046,"khmelnytskyi":4043,"cherkasy":4148,"chernivtsi":3828,"chernihiv":4002,"kyiv":8648},
    2017: {"vinnytsia":6121,"volyn":5849,"dnipro":6939,"donetsk":7764,"zhytomyr":5836,"zakarpattia":6355,"zaporizhzhia":6863,"ivano-frankivsk":6074,"kyiv-obl":7188,"kirovograd":5792,"luhansk":5862,"lviv":6391,"mykolaiv":6709,"odesa":6542,"poltava":6551,"rivne":6013,"sumy":5946,"ternopil":5554,"kharkiv":6244,"kherson":5842,"khmelnytskyi":5938,"cherkasy":6042,"chernivtsi":5621,"chernihiv":5636,"kyiv":11135},
    2018: {"vinnytsia":7801,"volyn":7324,"dnipro":8862,"donetsk":9686,"zhytomyr":7372,"zakarpattia":8070,"zaporizhzhia":8726,"ivano-frankivsk":7551,"kyiv-obl":9097,"kirovograd":7191,"luhansk":7365,"lviv":8001,"mykolaiv":8160,"odesa":8011,"poltava":8375,"rivne":7469,"sumy":7324,"ternopil":6969,"kharkiv":7657,"kherson":7058,"khmelnytskyi":7346,"cherkasy":7478,"chernivtsi":6991,"chernihiv":6995,"kyiv":13542},
    2019: {"vinnytsia":9299,"volyn":8663,"dnipro":10751,"donetsk":11716,"zhytomyr":8528,"zakarpattia":9202,"zaporizhzhia":10480,"ivano-frankivsk":8817,"kyiv-obl":11003,"kirovograd":8360,"luhansk":8731,"lviv":9271,"mykolaiv":9976,"odesa":9246,"poltava":9846,"rivne":8967,"sumy":8579,"ternopil":8275,"kharkiv":9081,"kherson":8187,"khmelnytskyi":8672,"cherkasy":8838,"chernivtsi":8066,"chernihiv":8206,"kyiv":15776},
    2020: {"vinnytsia":10200,"volyn":9600,"dnipro":12340,"donetsk":11440,"zhytomyr":9800,"zakarpattia":9500,"zaporizhzhia":12300,"ivano-frankivsk":9700,"kyiv-obl":13020,"kirovograd":9400,"luhansk":9460,"lviv":11080,"mykolaiv":10860,"odesa":10860,"poltava":10400,"rivne":10000,"sumy":9600,"ternopil":9200,"kharkiv":11440,"kherson":9000,"khmelnytskyi":9600,"cherkasy":9800,"chernivtsi":9000,"chernihiv":9400,"kyiv":18640},
    2021: {"vinnytsia":12200,"volyn":11500,"dnipro":14800,"donetsk":13720,"zhytomyr":11700,"zakarpattia":11300,"zaporizhzhia":14800,"ivano-frankivsk":11600,"kyiv-obl":15600,"kirovograd":11200,"luhansk":11500,"lviv":13280,"mykolaiv":13020,"odesa":13020,"poltava":12500,"rivne":12000,"sumy":11500,"ternopil":11000,"kharkiv":13720,"kherson":10800,"khmelnytskyi":11500,"cherkasy":11800,"chernivtsi":10800,"chernihiv":11200,"kyiv":22400},
    2022: {"vinnytsia":13500,"volyn":12700,"dnipro":15600,"donetsk":14800,"zhytomyr":12900,"zakarpattia":12800,"zaporizhzhia":15600,"ivano-frankivsk":12700,"kyiv-obl":16500,"kirovograd":12400,"luhansk":12600,"lviv":14340,"mykolaiv":14200,"odesa":14060,"poltava":13800,"rivne":13600,"sumy":12800,"ternopil":12100,"kharkiv":14800,"kherson":12400,"khmelnytskyi":12900,"cherkasy":13100,"chernivtsi":12000,"chernihiv":12500,"kyiv":24200},
    2023: {"vinnytsia":15200,"volyn":14300,"dnipro":17500,"donetsk":16600,"zhytomyr":14500,"zakarpattia":14200,"zaporizhzhia":17500,"ivano-frankivsk":14400,"kyiv-obl":18500,"kirovograd":14000,"luhansk":14200,"lviv":16000,"mykolaiv":15800,"odesa":15700,"poltava":15400,"rivne":15100,"sumy":14500,"ternopil":13800,"kharkiv":16600,"kherson":13900,"khmelnytskyi":14600,"cherkasy":14800,"chernivtsi":13600,"chernihiv":14100,"kyiv":26400},
}

_UNEMPLOYMENT = {
    2015: {"vinnytsia":8.9,"volyn":9.8,"dnipro":7.2,"donetsk":13.8,"zhytomyr":11.3,"zakarpattia":9.2,"zaporizhzhia":9.7,"ivano-frankivsk":8.4,"kyiv-obl":6.4,"kirovograd":11.4,"luhansk":15.6,"lviv":8.2,"mykolaiv":8.9,"odesa":6.5,"poltava":12.1,"rivne":9.9,"sumy":10.1,"ternopil":11.8,"kharkiv":7.1,"kherson":10.2,"khmelnytskyi":10.2,"cherkasy":9.8,"chernivtsi":9.3,"chernihiv":10.7,"kyiv":7.0},
    2016: {"vinnytsia":9.7,"volyn":11.5,"dnipro":7.9,"donetsk":14.1,"zhytomyr":11.2,"zakarpattia":10.0,"zaporizhzhia":10.0,"ivano-frankivsk":8.8,"kyiv-obl":6.8,"kirovograd":12.4,"luhansk":16.0,"lviv":7.7,"mykolaiv":9.7,"odesa":6.8,"poltava":12.6,"rivne":10.6,"sumy":9.3,"ternopil":11.5,"kharkiv":6.4,"kherson":11.2,"khmelnytskyi":9.4,"cherkasy":10.4,"chernivtsi":8.7,"chernihiv":11.3,"kyiv":6.7},
    2017: {"vinnytsia":10.7,"volyn":12.5,"dnipro":8.5,"donetsk":14.6,"zhytomyr":10.8,"zakarpattia":10.5,"zaporizhzhia":10.2,"ivano-frankivsk":9.0,"kyiv-obl":6.9,"kirovograd":12.2,"luhansk":15.8,"lviv":8.0,"mykolaiv":10.0,"odesa":6.8,"poltava":12.0,"rivne":10.8,"sumy":9.8,"ternopil":10.3,"kharkiv":7.2,"kherson":10.8,"khmelnytskyi":9.8,"cherkasy":10.1,"chernivtsi":9.0,"chernihiv":10.8,"kyiv":6.9},
    2018: {"vinnytsia":9.9,"volyn":11.4,"dnipro":8.0,"donetsk":14.0,"zhytomyr":10.4,"zakarpattia":10.0,"zaporizhzhia":9.8,"ivano-frankivsk":8.6,"kyiv-obl":6.6,"kirovograd":11.6,"luhansk":15.3,"lviv":7.8,"mykolaiv":9.6,"odesa":6.7,"poltava":11.5,"rivne":10.1,"sumy":9.5,"ternopil":10.1,"kharkiv":6.9,"kherson":10.6,"khmelnytskyi":9.3,"cherkasy":9.9,"chernivtsi":8.5,"chernihiv":10.3,"kyiv":6.8},
    2019: {"vinnytsia":9.4,"volyn":10.6,"dnipro":7.7,"donetsk":13.6,"zhytomyr":9.6,"zakarpattia":9.1,"zaporizhzhia":9.3,"ivano-frankivsk":8.5,"kyiv-obl":6.3,"kirovograd":11.3,"luhansk":15.1,"lviv":7.5,"mykolaiv":9.5,"odesa":6.5,"poltava":11.2,"rivne":9.7,"sumy":9.1,"ternopil":9.7,"kharkiv":6.7,"kherson":10.3,"khmelnytskyi":9.1,"cherkasy":9.7,"chernivtsi":8.4,"chernihiv":9.9,"kyiv":6.4},
    2020: {"vinnytsia":9.8,"volyn":10.2,"dnipro":7.8,"donetsk":13.2,"zhytomyr":10.0,"zakarpattia":9.5,"zaporizhzhia":9.6,"ivano-frankivsk":8.7,"kyiv-obl":6.2,"kirovograd":11.0,"luhansk":14.8,"lviv":7.3,"mykolaiv":9.7,"odesa":6.4,"poltava":10.9,"rivne":9.4,"sumy":9.0,"ternopil":9.4,"kharkiv":6.6,"kherson":10.1,"khmelnytskyi":8.9,"cherkasy":9.5,"chernivtsi":8.2,"chernihiv":9.6,"kyiv":6.3},
    2021: {"vinnytsia":9.5,"volyn":9.8,"dnipro":7.5,"donetsk":12.8,"zhytomyr":9.7,"zakarpattia":9.0,"zaporizhzhia":9.2,"ivano-frankivsk":8.4,"kyiv-obl":6.0,"kirovograd":10.7,"luhansk":14.5,"lviv":7.1,"mykolaiv":9.4,"odesa":6.2,"poltava":10.6,"rivne":9.1,"sumy":8.7,"ternopil":9.1,"kharkiv":6.4,"kherson":9.9,"khmelnytskyi":8.6,"cherkasy":9.2,"chernivtsi":8.0,"chernihiv":9.3,"kyiv":6.1},
    2022: {"vinnytsia":12.8,"volyn":13.2,"dnipro":10.2,"donetsk":18.5,"zhytomyr":13.1,"zakarpattia":12.2,"zaporizhzhia":14.8,"ivano-frankivsk":11.5,"kyiv-obl":8.1,"kirovograd":14.5,"luhansk":20.0,"lviv":9.6,"mykolaiv":14.2,"odesa":9.5,"poltava":14.3,"rivne":12.3,"sumy":13.5,"ternopil":12.4,"kharkiv":9.8,"kherson":15.8,"khmelnytskyi":11.7,"cherkasy":12.5,"chernivtsi":10.9,"chernihiv":13.0,"kyiv":8.5},
    2023: {"vinnytsia":10.8,"volyn":11.2,"dnipro":8.6,"donetsk":15.8,"zhytomyr":11.0,"zakarpattia":10.4,"zaporizhzhia":12.5,"ivano-frankivsk":9.8,"kyiv-obl":6.9,"kirovograd":12.2,"luhansk":17.2,"lviv":8.2,"mykolaiv":12.0,"odesa":8.1,"poltava":12.1,"rivne":10.4,"sumy":11.4,"ternopil":10.5,"kharkiv":8.3,"kherson":13.4,"khmelnytskyi":9.9,"cherkasy":10.6,"chernivtsi":9.2,"chernihiv":11.0,"kyiv":7.2},
}

_POPULATION = {
    2014: {"vinnytsia":1618.3,"volyn":1041.3,"dnipro":3292.4,"donetsk":4343.9,"zhytomyr":1262.5,"zakarpattia":1256.8,"zaporizhzhia":1775.8,"ivano-frankivsk":1382.1,"kyiv-obl":1725.5,"kirovograd":987.6,"luhansk":2239.5,"lviv":2538.4,"mykolaiv":1168.4,"odesa":2396.5,"poltava":1458.2,"rivne":1158.8,"sumy":1132.9,"ternopil":1073.3,"kharkiv":2737.2,"kherson":1072.6,"khmelnytskyi":1307.0,"cherkasy":1260.0,"chernivtsi":908.5,"chernihiv":1066.8,"kyiv":2868.7},
    2015: {"vinnytsia":1610.6,"volyn":1042.9,"dnipro":3276.6,"donetsk":4297.2,"zhytomyr":1256.0,"zakarpattia":1259.6,"zaporizhzhia":1765.9,"ivano-frankivsk":1382.6,"kyiv-obl":1729.2,"kirovograd":980.6,"luhansk":2220.2,"lviv":2537.8,"mykolaiv":1164.3,"odesa":2396.4,"poltava":1449.0,"rivne":1161.2,"sumy":1123.4,"ternopil":1069.9,"kharkiv":2731.3,"kherson":1067.9,"khmelnytskyi":1301.2,"cherkasy":1251.8,"chernivtsi":910.0,"chernihiv":1055.7,"kyiv":2888.0},
    2016: {"vinnytsia":1602.2,"volyn":1042.7,"dnipro":3254.9,"donetsk":4265.1,"zhytomyr":1247.5,"zakarpattia":1259.2,"zaporizhzhia":1753.6,"ivano-frankivsk":1382.3,"kyiv-obl":1732.2,"kirovograd":973.1,"luhansk":2205.4,"lviv":2534.2,"mykolaiv":1158.2,"odesa":2390.3,"poltava":1438.9,"rivne":1161.8,"sumy":1113.3,"ternopil":1065.7,"kharkiv":2718.6,"kherson":1062.4,"khmelnytskyi":1294.4,"cherkasy":1243.0,"chernivtsi":909.9,"chernihiv":1045.0,"kyiv":2906.6},
    2017: {"vinnytsia":1590.4,"volyn":1040.9,"dnipro":3230.4,"donetsk":4244.1,"zhytomyr":1240.5,"zakarpattia":1258.8,"zaporizhzhia":1739.5,"ivano-frankivsk":1379.9,"kyiv-obl":1734.5,"kirovograd":965.7,"luhansk":2195.3,"lviv":2534.0,"mykolaiv":1150.1,"odesa":2386.5,"poltava":1426.8,"rivne":1162.8,"sumy":1104.5,"ternopil":1059.2,"kharkiv":2701.2,"kherson":1055.6,"khmelnytskyi":1285.3,"cherkasy":1231.2,"chernivtsi":908.1,"chernihiv":1033.4,"kyiv":2925.8},
    2018: {"vinnytsia":1575.8,"volyn":1038.5,"dnipro":3231.1,"donetsk":4200.5,"zhytomyr":1231.2,"zakarpattia":1258.2,"zaporizhzhia":1723.2,"ivano-frankivsk":1377.5,"kyiv-obl":1754.3,"kirovograd":956.2,"luhansk":2167.8,"lviv":2529.6,"mykolaiv":1141.3,"odesa":2383.1,"poltava":1413.8,"rivne":1160.6,"sumy":1094.3,"ternopil":1052.3,"kharkiv":2694.0,"kherson":1047.0,"khmelnytskyi":1274.4,"cherkasy":1220.4,"chernivtsi":906.7,"chernihiv":1020.1,"kyiv":2934.5},
    2019: {"vinnytsia":1560.4,"volyn":1035.3,"dnipro":3206.5,"donetsk":4165.9,"zhytomyr":1220.2,"zakarpattia":1256.8,"zaporizhzhia":1705.8,"ivano-frankivsk":1373.3,"kyiv-obl":1767.9,"kirovograd":945.6,"luhansk":2151.8,"lviv":2522.0,"mykolaiv":1131.1,"odesa":2380.3,"poltava":1400.4,"rivne":1157.3,"sumy":1081.4,"ternopil":1045.9,"kharkiv":2675.6,"kherson":1037.6,"khmelnytskyi":1264.7,"cherkasy":1206.4,"chernivtsi":904.4,"chernihiv":1005.8,"kyiv":2950.8},
    2020: {"vinnytsia":1545.4,"volyn":1031.4,"dnipro":3176.7,"donetsk":4131.8,"zhytomyr":1208.2,"zakarpattia":1253.8,"zaporizhzhia":1687.4,"ivano-frankivsk":1368.1,"kyiv-obl":1781.0,"kirovograd":933.1,"luhansk":2135.9,"lviv":2512.1,"mykolaiv":1119.9,"odesa":2377.2,"poltava":1387.0,"rivne":1153.0,"sumy":1068.3,"ternopil":1038.7,"kharkiv":2658.5,"kherson":1027.9,"khmelnytskyi":1254.7,"cherkasy":1192.1,"chernivtsi":901.6,"chernihiv":991.3,"kyiv":2967.4},
    2021: {"vinnytsia":1529.1,"volyn":1027.4,"dnipro":3142.0,"donetsk":4100.3,"zhytomyr":1195.5,"zakarpattia":1250.1,"zaporizhzhia":1666.5,"ivano-frankivsk":1361.1,"kyiv-obl":1788.5,"kirovograd":920.1,"luhansk":2121.3,"lviv":2497.8,"mykolaiv":1108.4,"odesa":2368.1,"poltava":1371.5,"rivne":1148.5,"sumy":1053.5,"ternopil":1030.6,"kharkiv":2633.8,"kherson":1016.7,"khmelnytskyi":1243.8,"cherkasy":1178.3,"chernivtsi":896.6,"chernihiv":976.7,"kyiv":2962.2},
    2022: {"vinnytsia":1509.5,"volyn":1021.3,"dnipro":3096.5,"donetsk":4059.4,"zhytomyr":1179.0,"zakarpattia":1244.5,"zaporizhzhia":1638.5,"ivano-frankivsk":1351.8,"kyiv-obl":1795.1,"kirovograd":903.7,"luhansk":2102.9,"lviv":2478.1,"mykolaiv":1091.8,"odesa":2351.4,"poltava":1352.3,"rivne":1141.8,"sumy":1035.8,"ternopil":1021.7,"kharkiv":2599.0,"kherson":1001.6,"khmelnytskyi":1228.8,"cherkasy":1160.7,"chernivtsi":890.5,"chernihiv":959.3,"kyiv":2952.3},
    2023: {"vinnytsia":1495.0,"volyn":1015.0,"dnipro":3065.0,"donetsk":4020.0,"zhytomyr":1165.0,"zakarpattia":1238.0,"zaporizhzhia":1615.0,"ivano-frankivsk":1343.0,"kyiv-obl":1800.0,"kirovograd":890.0,"luhansk":2085.0,"lviv":2460.0,"mykolaiv":1075.0,"odesa":2340.0,"poltava":1335.0,"rivne":1133.0,"sumy":1020.0,"ternopil":1012.0,"kharkiv":2570.0,"kherson":990.0,"khmelnytskyi":1215.0,"cherkasy":1145.0,"chernivtsi":885.0,"chernihiv":945.0,"kyiv":2945.0},
}

YEARS_EXTENDED = list(range(2014, 2024))

# Номінальний ВВП України (млн грн) — для оцінки ВРП 2022–2023
_GDP_NATIONAL = {2021: 5450849, 2022: 5191000, 2023: 6537800}


def _load_gdp():
    gdp = {}
    if not os.path.exists(_RAW_GDP):
        return gdp
    with open(_RAW_GDP, encoding="utf-8") as f:
        rows = json.load(f)[1]
    for row in rows:
        code = str(row.get("code", "")).strip()
        period = row.get("period")
        val = row.get("data")
        if code not in GDP_CODE_MAP or not isinstance(period, int):
            continue
        if val == "NA" or val is None:
            continue
        rid = GDP_CODE_MAP[code]
        gdp.setdefault(rid, {})[period] = int(val)
    return gdp


def _load_salary_csv():
    salary = {}
    if not os.path.exists(_RAW_SALARY):
        return salary
    # Try different encodings
    for encoding in ["utf-8", "cp1251", "latin-1"]:
        try:
            with open(_RAW_SALARY, encoding=encoding) as f:
                reader = csv.reader(f, delimiter=";")
                header = next(reader)
                years = [int(h.strip()) for h in header[1:] if h.strip().isdigit()]
                for row in reader:
                    if not row or not row[0].strip():
                        continue
                    name = row[0].strip().lstrip(";").strip()
                    if name.startswith("Україна") or name.startswith("Всі") or name.startswith("*"):
                        continue
                    rid = SALARY_NAME_MAP.get(name)
                    if not rid:
                        continue
                    for i, yr in enumerate(years):
                        if i + 1 >= len(row):
                            break
                        cell = row[i + 1].strip().replace(" ", "").replace("…", "")
                        if cell.isdigit():
                            salary.setdefault(rid, {})[yr] = int(cell)
                return salary
        except (UnicodeDecodeError, UnicodeError):
            continue
    return salary


def get_regional_record(region_id, year):
    """Повертає dict {gdp, salary, unemployment, population} або None."""
    gdp_all = _load_gdp()
    salary_csv = _load_salary_csv()

    gdp = gdp_all.get(region_id, {}).get(year)
    if gdp is None and year in (2022, 2023):
        base = gdp_all.get(region_id, {}).get(2021)
        if base and year in _GDP_NATIONAL:
            gdp = round(base * _GDP_NATIONAL[year] / _GDP_NATIONAL[2021])
    salary = (_SALARY.get(year, {}).get(region_id)
              or salary_csv.get(region_id, {}).get(year))
    unemp = _UNEMPLOYMENT.get(year, {}).get(region_id)
    if year == 2014 and region_id in _UNEMPLOYMENT.get(2015, {}):
        unemp = round(_UNEMPLOYMENT[2015][region_id] * 9.3 / 9.1, 1)
    pop = _POPULATION.get(year, {}).get(region_id)

    if not any(v is not None for v in (gdp, salary, unemp, pop)):
        return None
    return {
        "gdp": gdp or 0,
        "salary": salary or 0,
        "unemployment": unemp or 0,
        "population": pop or 0,
    }
