/* ============================================================
   pages/about.js — Про проєкт + зворотний зв'язок
   ============================================================ */

function switchAboutTab(tab, btn) {
  document.querySelectorAll('[id^="about-tab-"]').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('about-tab-' + tab);
  if (el) el.classList.add('active');
  btn.closest('.tab-row').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

async function submitContact() {
  const name   = document.getElementById('contact-name')?.value.trim()  || '';
  const email  = document.getElementById('contact-email')?.value.trim() || '';
  const msg    = document.getElementById('contact-msg')?.value.trim()   || '';
  const status = document.getElementById('contact-status');

  if (!name || !email || !msg)                    { if (status) status.innerHTML = '<span style="color:var(--red)"><img src="assets/test.png" width="16" height="16" alt="Помилка" style="image-rendering:smooth;vertical-align:middle;"> Заповніть усі поля</span>'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { if (status) status.innerHTML = '<span style="color:var(--red)"><img src="assets/test.png" width="16" height="16" alt="Помилка" style="image-rendering:smooth;vertical-align:middle;"> Некоректний email</span>'; return; }
  if (msg.length < 10)                            { if (status) status.innerHTML = '<span style="color:var(--red)"><img src="assets/test.png" width="16" height="16" alt="Помилка" style="image-rendering:smooth;vertical-align:middle;"> Повідомлення занадто коротке</span>'; return; }

  if (status) status.innerHTML = '<span style="color:var(--text-muted)"><img src="assets/hourglass.png" width="16" height="16" alt="Очікування" style="image-rendering:smooth;vertical-align:middle;"> Відправляється…</span>';

  try {
    await UkrApi.sendContact(name, email, msg);
    if (status) status.innerHTML = '<span style="color:var(--green)"><img src="assets/flag_ua.png" width="16" height="16" alt="Успіх" style="image-rendering:smooth;vertical-align:middle;"> Повідомлення надіслано. Дякуємо!</span>';
    clearContact();
  } catch(err) {
    if (status) status.innerHTML = `<span style="color:var(--red)"><img src="assets/bin.png" width="16" height="16" alt="Помилка" style="image-rendering:smooth;vertical-align:middle;"> Помилка: ${err.message}</span>`;
  }
}

function clearContact() {
  ['contact-name','contact-email','contact-msg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  setTimeout(() => {
    const st = document.getElementById('contact-status');
    if (st && st.innerHTML.includes('Повідомлення надіслано')) st.innerHTML = '';
  }, 3000);
}
