/* ============================================================
   core/api.js — HTTP-клієнт бекенду + завантаження глобальних даних
   ============================================================ */

const API_BASE = 'http://localhost:8000';

/* ── Низькорівневий fetch ──────────────────────────────────── */

async function apiFetch(path, params = {}) {
  const url = new URL(API_BASE + path);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) url.searchParams.set(k, v);
  });
  const resp = await fetch(url.toString());
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(err.detail || `HTTP ${resp.status}`);
  }
  return resp.json();
}

/* ── Публічний API-клієнт ─────────────────────────────────── */

const UkrApi = {
  async regions(sortBy = 'salary', order = 'desc', year = null) {
    const d = await apiFetch('/v1/regions', { sort_by: sortBy, order, year });
    return d.data;
  },
  async region(id) {
    const d = await apiFetch(`/v1/regions/${id}`);
    return d.data;
  },
  async statistics(metric = 'salary', region = 'all', year = null, format = 'json') {
    return apiFetch('/v1/statistics', { metric, region, year, format });
  },
  async history(metric = 'salary', region = 'ukraine') {
    const d = await apiFetch('/v1/statistics/history', { metric, region });
    return d.data;
  },
  async datasetData(id) {
    return apiFetch(`/v1/dataset-data/${id}`);
  },
  async datasets(cat = '', search = '') {
    const d = await apiFetch('/v1/datasets', { cat, search, per_page: 100 });
    return d.data;
  },
  async categories() {
    const d = await apiFetch('/v1/categories');
    return d.data;
  },
  async sources(type = '') {
    const d = await apiFetch('/v1/sources', { type });
    return d.data;
  },
  async sendContact(name, email, message) {
    const resp = await fetch(`${API_BASE}/v1/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.detail || 'Помилка відправки');
    return data;
  },
};

/* ── Кеш ──────────────────────────────────────────────────── */

const _cache = {};
async function cachedFetch(key, fn) {
  if (_cache[key]) return _cache[key];
  _cache[key] = await fn();
  return _cache[key];
}

/* ── Завантаження всіх глобальних даних при старті ─────────── */

async function loadGlobalData() {
  try {
    const [regions, categories, datasets, sources] = await Promise.all([
      cachedFetch('regions',    () => UkrApi.regions()),
      cachedFetch('categories', () => UkrApi.categories()),
      cachedFetch('datasets',   () => UkrApi.datasets()),
      cachedFetch('sources',    () => UkrApi.sources()),
    ]);

    const [salaryUA, salaryKyiv, salaryKharkiv, salaryLviv, salaryDnipro, salaryOdesa,
           unemp, inflation, population, gdp] = await Promise.all([
      cachedFetch('hist_salary_ukraine', () => UkrApi.history('salary',       'ukraine')),
      cachedFetch('hist_salary_kyiv',    () => UkrApi.history('salary',       'kyiv')),
      cachedFetch('hist_salary_kharkiv', () => UkrApi.history('salary',       'kharkiv')),
      cachedFetch('hist_salary_lviv',    () => UkrApi.history('salary',       'lviv')),
      cachedFetch('hist_salary_dnipro',  () => UkrApi.history('salary',       'dnipro')),
      cachedFetch('hist_salary_odesa',   () => UkrApi.history('salary',       'odesa')),
      cachedFetch('hist_unemployment',   () => UkrApi.history('unemployment')),
      cachedFetch('hist_inflation',      () => UkrApi.history('inflation')),
      cachedFetch('hist_population',     () => UkrApi.history('population')),
      cachedFetch('hist_gdp',            () => UkrApi.history('gdp')),
    ]);

    // Глобальні змінні — доступні з будь-якого модуля
    window.REGIONS      = regions;
    window.CATEGORIES   = categories;
    window.DATASETS     = datasets;
    window.SOURCES_DATA = sources;

    const years = salaryUA.map(r => r.year);
    window.HISTORY = {
      years,
      salary_ua:      salaryUA.map(r => r.value),
      salary_kyiv:    salaryKyiv.map(r => r.value),
      salary_kharkiv: salaryKharkiv.map(r => r.value),
      salary_lviv:    salaryLviv.map(r => r.value),
      salary_dnipro:  salaryDnipro.map(r => r.value),
      salary_odesa:   salaryOdesa.map(r => r.value),
      unemployment:   unemp.map(r => r.value),
      inflation:      inflation.map(r => r.value),
      population:     population.map(r => r.value),
      gdp_ua:         gdp.map(r => r.value),
    };

    console.log(`УкрДані: ${regions.length} регіонів, ${datasets.length} датасетів`);
    return true;
  } catch(err) {
    console.error('API недоступний:', err.message);
    return false;
  }
}
