/* ============================================================
   mock-data.js — Статичні дані (замінюються /data/*.json)
   ============================================================ */

const REGIONS = [
  { id:"kyiv",            name:"Київ",               gdp:98400,  unemployment:3.8,  salary:28600, population:2960.0 },
  { id:"donetsk",         name:"Донецька",            gdp:31200,  unemployment:12.4, salary:14200, population:1650.0 },
  { id:"dnipro",          name:"Дніпропетровська",    gdp:62400,  unemployment:7.2,  salary:19800, population:3100.0 },
  { id:"kharkiv",         name:"Харківська",          gdp:44100,  unemployment:6.8,  salary:18200, population:2680.0 },
  { id:"zaporizhzhia",    name:"Запорізька",          gdp:28800,  unemployment:8.9,  salary:17100, population:1520.0 },
  { id:"lviv",            name:"Львівська",           gdp:32100,  unemployment:7.4,  salary:16400, population:2560.0 },
  { id:"odesa",           name:"Одеська",             gdp:38600,  unemployment:6.2,  salary:17800, population:2380.0 },
  { id:"poltava",         name:"Полтавська",          gdp:24800,  unemployment:7.8,  salary:16200, population:1320.0 },
  { id:"mykolaiv",        name:"Миколаївська",        gdp:11200,  unemployment:9.8,  salary:14800, population:1080.0 },
  { id:"vinnytsia",       name:"Вінницька",           gdp:14800,  unemployment:8.4,  salary:15100, population:1420.0 },
  { id:"sumy",            name:"Сумська",             gdp:9800,   unemployment:9.2,  salary:14100, population:1020.0 },
  { id:"cherkasy",        name:"Черкаська",           gdp:10400,  unemployment:8.9,  salary:14400, population:1140.0 },
  { id:"kherson",         name:"Херсонська",          gdp:7200,   unemployment:11.8, salary:13200, population:980.0  },
  { id:"kyiv-obl",        name:"Київська обл.",       gdp:29800,  unemployment:5.4,  salary:21400, population:1820.0 },
  { id:"luhansk",         name:"Луганська",           gdp:8200,   unemployment:14.2, salary:11800, population:980.0  },
  { id:"ternopil",        name:"Тернопільська",       gdp:9100,   unemployment:10.2, salary:14600, population:1040.0 },
  { id:"chernivtsi",      name:"Чернівецька",         gdp:7800,   unemployment:10.8, salary:13800, population:900.0  },
  { id:"rivne",           name:"Рівненська",          gdp:10200,  unemployment:9.6,  salary:14200, population:1080.0 },
  { id:"ivano-frankivsk", name:"Івано-Франківська",   gdp:12800,  unemployment:8.8,  salary:15400, population:1380.0 },
  { id:"volyn",           name:"Волинська",           gdp:9400,   unemployment:9.8,  salary:14800, population:1040.0 },
  { id:"zakarpattia",     name:"Закарпатська",        gdp:9800,   unemployment:11.2, salary:13600, population:1240.0 },
  { id:"khmelnytskyi",    name:"Хмельницька",         gdp:11800,  unemployment:8.6,  salary:14800, population:1280.0 },
  { id:"chernihiv",       name:"Чернігівська",        gdp:10200,  unemployment:9.4,  salary:14200, population:1020.0 },
  { id:"kirovograd",      name:"Кіровоградська",      gdp:9600,   unemployment:10.4, salary:13800, population:940.0  },
  { id:"zhytomyr",        name:"Житомирська",         gdp:10400,  unemployment:10.2, salary:14100, population:1200.0 },
];

const HISTORY = {
  years:         [1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
  salary_kyiv:   [340,360,490,610,750,940,1240,1610,2080,2620,3240,3050,3620,4180,4760,4820,4880,5180,7420,9640,12280,15440,18640,22400,24200,26400,28600],
  salary_kharkiv:[210,230,310,390,480,600,800,1040,1340,1700,2100,1980,2340,2700,3080,3120,2840,3180,4560,5920,7540,9460,11440,13720,14800,16600,18200],
  salary_lviv:   [195,215,290,360,445,555,740,960,1240,1560,1940,1830,2160,2500,2840,2880,2920,3090,4430,5730,7310,9160,11080,13280,14340,16000,16400],
  salary_dnipro: [230,250,340,425,525,660,870,1130,1460,1840,2280,2150,2540,2940,3350,3400,3060,3430,4910,6380,8120,10200,12340,14800,15980,17870,19800],
  salary_odesa:  [200,220,300,375,460,580,760,990,1280,1610,1990,1880,2220,2570,2930,2980,2700,3020,4330,5620,7160,8980,10860,13020,14060,15700,17800],
  salary_ua:     [153,178,230,311,376,462,590,806,1041,1351,1806,1906,2239,2633,3025,3265,3480,4195,5183,7104,8865,10497,12264,14310,15260,16540,18600],
  gdp_ua:        [102593,130442,170070,204190,225810,267344,345113,441452,544153,720731,948056,913345,1094607,1299991,1404669,1454931,1566728,1988544,2383182,2981952,3558706,3978206,4221096,5459622,4788343,6213700,5870000],
  unemployment:  [11.3,11.6,11.7,10.9,10.1,9.1,8.6,7.2,6.8,6.4,6.4,8.8,8.1,7.9,7.5,7.2,9.3,9.1,9.3,9.5,8.8,8.2,9.5,9.8,19.8,15.2,12.4],
  inflation:     [10.6,22.7,28.2,12.0,0.8,5.2,9.0,13.5,9.1,12.8,25.2,-0.1,9.4,8.0,0.6,-0.3,24.9,43.3,12.4,13.7,9.8,4.1,2.7,10.0,26.6,12.1,5.1],
  population:    [50370,49918,49429,48923,48457,48003,47442,47100,46787,46646,46374,46143,45870,45598,45593,45246,43009,42760,42760,42386,41983,41880,41732,41418,43531,37000,36000],
};

const CATEGORIES = [
  { id:"economy",    icon:"💰", title:"Економіка",    desc:"ВРП, ВВП, інвестиції, бюджет, торгівля",         count:42  },
  { id:"demography", icon:"👥", title:"Демографія",   desc:"Населення, народжуваність, смертність, міграція", count:28  },
  { id:"labor",      icon:"👔", title:"Ринок праці",  desc:"Зайнятість, безробіття, заробітні плати",         count:35  },
  { id:"inflation",  icon:"📉", title:"Інфляція",     desc:"ІСЦ, ІЦВ, індекси цін на товари та послуги",     count:18  },
  { id:"regional",   icon:"🗺️", title:"Регіональна", desc:"Показники 25 областей та міст України",           count:156 },
  { id:"budget",     icon:"📋", title:"Бюджет",       desc:"Державний та місцеві бюджети, видатки",           count:24  },
];

const DATASETS = [
  { id:1,  title:"Середня заробітна плата по регіонах",    cat:"labor",      region:"all",      year:"1998–2024", source:"Держстат", records:650  },
  { id:2,  title:"Валовий регіональний продукт (ВРП)",     cat:"economy",    region:"all",      year:"1998–2024", source:"Держстат", records:600  },
  { id:3,  title:"Рівень безробіття (методологія МОП)",    cat:"labor",      region:"all",      year:"2000–2024", source:"Держстат", records:450  },
  { id:4,  title:"Чисельність населення по областях",      cat:"demography", region:"all",      year:"1991–2024", source:"Держстат", records:825  },
  { id:5,  title:"Індекс споживчих цін (ІСЦ)",            cat:"inflation",  region:"national", year:"1993–2024", source:"Держстат", records:360  },
  { id:6,  title:"Прямі іноземні інвестиції по регіонах", cat:"economy",    region:"all",      year:"2005–2024", source:"НБУ",      records:475  },
  { id:7,  title:"Видатки місцевих бюджетів",             cat:"budget",     region:"all",      year:"2010–2024", source:"Мінфін",   records:350  },
  { id:8,  title:"Зовнішня торгівля товарами",            cat:"economy",    region:"national", year:"2000–2024", source:"Держстат", records:200  },
  { id:9,  title:"Кількість зайнятих по секторах",        cat:"labor",      region:"all",      year:"2005–2024", source:"Держстат", records:400  },
  { id:10, title:"Реальні наявні доходи населення",       cat:"economy",    region:"all",      year:"2000–2024", source:"Держстат", records:350  },
  { id:11, title:"Природний приріст населення",           cat:"demography", region:"all",      year:"1991–2024", source:"Держстат", records:825  },
  { id:12, title:"Розподіл населення за групами доходів", cat:"demography", region:"national", year:"2010–2024", source:"Держстат", records:120  },
];

const SOURCES_DATA = [
  { name:"Держстат України — Статистичні збірники",         type:"Офіційна статистика",   org:"Держкомстат",  updated:"2024-01", license:"CC BY 4.0",     url:"https://stat.gov.ua"          },
  { name:"Національний банк України — Монетарна статистика", type:"Фінансові дані",        org:"НБУ",          updated:"2024-01", license:"Відкриті дані", url:"https://bank.gov.ua"          },
  { name:"Мінфін України — Бюджетна звітність",              type:"Фінансові дані",        org:"Мінфін",       updated:"2024-01", license:"CC BY 4.0",     url:"https://minfin.gov.ua"        },
  { name:"Мінекономіки — Макроекономічні показники",         type:"Офіційна статистика",   org:"Мінекономіки", updated:"2024-01", license:"Відкриті дані", url:"https://me.gov.ua"            },
  { name:"data.gov.ua — Єдиний портал відкритих даних",      type:"Агрегований портал",    org:"МЦТД",         updated:"2024-01", license:"CC BY 4.0",     url:"https://data.gov.ua"          },
  { name:"ООН — UN Data для України",                        type:"Міжнародна статистика", org:"ООН",          updated:"2024",    license:"CC BY",         url:"https://data.un.org"          },
  { name:"МВФ — World Economic Outlook",                      type:"Міжнародна статистика", org:"МВФ",          updated:"2024",    license:"Fair Use",      url:"https://imf.org"              },
  { name:"Світовий банк — DataBank Ukraine",                  type:"Міжнародна статистика", org:"СБ",           updated:"2024",    license:"CC BY 4.0",     url:"https://data.worldbank.org"   },
];

const API_ENDPOINTS = [
  {
    method:"GET", path:"/v1/statistics",
    desc:"Статистичні дані по регіонах та роках",
    params:[
      { name:"region",   type:"string",  req:false, desc:"Код регіону (kyiv, kharkiv...) або 'all'" },
      { name:"year",     type:"integer", req:false, desc:"Рік від 1998 до 2024" },
      { name:"metric",   type:"string",  req:true,  desc:"salary | gdp | unemployment | population" },
      { name:"format",   type:"string",  req:false, desc:"json | csv | xlsx (за замовч. json)" },
      { name:"page",     type:"integer", req:false, desc:"Номер сторінки (за замовч. 1)" },
      { name:"per_page", type:"integer", req:false, desc:"Записів на сторінці (макс. 100)" },
    ]
  },
  {
    method:"GET", path:"/v1/regions",
    desc:"Список усіх регіонів з метаданими",
    params:[ { name:"lang", type:"string", req:false, desc:"uk | en (за замовч. uk)" } ]
  },
  {
    method:"GET", path:"/v1/categories",
    desc:"Список категорій статистики",
    params:[ { name:"lang", type:"string", req:false, desc:"uk | en" } ]
  },
  {
    method:"GET", path:"/v1/datasets",
    desc:"Список доступних датасетів",
    params:[
      { name:"category", type:"string", req:false, desc:"Фільтр по категорії" },
      { name:"search",   type:"string", req:false, desc:"Пошук по назві датасету" },
    ]
  },
  {
    method:"POST", path:"/v1/import",
    desc:"Ручний імпорт даних (MVP заглушка)",
    params:[
      { name:"file",     type:"file",   req:true, desc:"CSV або XLSX файл" },
      { name:"category", type:"string", req:true, desc:"Категорія даних" },
    ]
  },
];