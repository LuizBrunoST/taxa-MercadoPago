'use strict';
const $ = id => document.getElementById(id);
const currency = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const decimal = value => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const storage = { get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }, set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* The calculator works without storage. */ } } };
function parseNumber(raw) {
  let value = String(raw).trim();
  if (!value) return NaN;
  if (value.includes(',')) {
    if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+),\d{1,2}$/.test(value)) return NaN;
    value = value.replaceAll('.', '').replace(',', '.');
  } else if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return NaN;
  return Number(value);
}
const cents = value => Math.round((value + Number.EPSILON) * 100);
function simulate(amount, rate, fixed, mode) {
  const target = cents(amount), fixedCents = cents(fixed);
  let gross = mode === 'net' ? Math.ceil((target + fixedCents) / (1 - rate / 100)) : target;
  let percent = Math.round(gross * rate / 100);
  // Find the lowest whole-cent charge that covers the desired net after rounded fees.
  if (mode === 'net') {
    while (gross - percent - fixedCents < target) { gross++; percent = Math.round(gross * rate / 100); }
    while (gross > 0 && gross - 1 - Math.round((gross - 1) * rate / 100) - fixedCents >= target) gross--;
    percent = Math.round(gross * rate / 100);
  }
  return { gross: gross / 100, percent: percent / 100, fees: (percent + fixedCents) / 100, net: (gross - percent - fixedCents) / 100 };
}
let mode = 'sale';
let latest = null;
let history = storage.get('taxaclara-history', []);
if (!Array.isArray(history)) history = [];
history = history.filter(item => item && ['sale', 'net'].includes(item.mode) && Number.isFinite(item.amount) && item.amount > 0 && item.amount <= 1e9 && Number.isFinite(item.rate) && item.rate >= 0 && item.rate < 100 && Number.isFinite(item.fixed) && item.fixed >= 0 && item.fixed <= 1e9).slice(0, 5);
function setMode(value) {
  mode = value;
  document.querySelectorAll('[data-mode]').forEach(button => { const active = button.dataset.mode === mode; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
  $('amount-label').textContent = mode === 'sale' ? 'Quanto você vai cobrar?' : 'Quanto você quer receber líquido?';
}
function calculate(save = false) {
  const amount = parseNumber($('amount').value), rate = parseNumber($('rate').value), fixed = $('fixed').value.trim() === '' ? 0 : parseNumber($('fixed').value);
  let error = '';
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1e9) error = 'Informe um valor maior que zero e de até R$ 1 bilhão.';
  else if (!Number.isFinite(rate) || rate < 0 || rate >= 100) error = 'Informe uma taxa de 0% a menos de 100%.';
  else if (!Number.isFinite(fixed) || fixed < 0 || fixed > 1e9) error = 'Informe uma tarifa fixa válida, de zero a R$ 1 bilhão.';
  else if (mode === 'sale' && simulate(amount, rate, fixed, mode).net < 0) error = 'As taxas ultrapassam o valor da venda. Ajuste os valores.';
  $('error').textContent = error;
  if (error) { latest = null; $('result').style.opacity = '.4'; $('copy-result').disabled = true; $('comparison').replaceChildren(); return false; }
  $('result').style.opacity = '1'; $('copy-result').disabled = false;
  latest = { amount, rate, fixed, mode, ...simulate(amount, rate, fixed, mode) };
  $('result-title').textContent = mode === 'sale' ? 'Valor líquido' : 'Você precisa cobrar';
  $('net-result').textContent = currency(mode === 'sale' ? latest.net : latest.gross);
  $('result-caption').textContent = mode === 'sale' ? 'depois de descontar as taxas' : `para receber ${currency(latest.net)} líquidos`;
  for (const [id, value] of [['gross', latest.gross], ['percent', latest.percent], ['fixed', fixed], ['fees', latest.fees]]) $(`${id}-result`).textContent = currency(value);
  $('rate-label').textContent = `(${decimal(rate)}%)`;
  $('net-bar').style.width = `${Math.max(0, Math.min(100, latest.net / latest.gross * 100))}%`;
  const compensated = simulate(amount, rate, fixed, 'net');
  $('insight').textContent = mode === 'sale' ? `Quer receber ${currency(amount)} líquidos? Simule uma cobrança de ${currency(compensated.gross)} com essas taxas.` : `Nesta simulação, ${currency(latest.fees)} da cobrança cobrem as taxas informadas.`;
  renderComparison(amount, fixed);
  $('copy-status').textContent = '';
  if (save) { history.unshift({ amount, rate, fixed, mode }); history = history.slice(0, 5); storage.set('taxaclara-history', history); renderHistory(); }
  return true;
}
function renderComparison(amount, fixed) {
  $('comparison').replaceChildren();
  [0, .99, 3.99, 4.99].forEach(rate => {
    const result = simulate(amount, rate, fixed, mode);
    const button = document.createElement('button'); button.type = 'button'; button.className = `scenario${latest.rate === rate ? ' selected' : ''}`;
    const label = document.createElement('small'); label.textContent = 'Taxa de exemplo';
    const title = document.createElement('strong'); title.textContent = `${decimal(rate)}%`;
    const value = document.createElement('b'); value.textContent = currency(mode === 'sale' ? result.net : result.gross);
    const caption = document.createElement('span'); caption.textContent = mode === 'sale' ? 'líquidos para você' : 'valor para cobrar';
    button.append(label, title, value, caption); button.addEventListener('click', () => { $('rate').value = decimal(rate); calculate(); }); $('comparison').append(button);
  });
}
function renderHistory() {
  $('history-list').replaceChildren(); $('clear-history').hidden = !history.length;
  if (!history.length) { const p = document.createElement('p'); p.className = 'history-empty'; p.textContent = 'As simulações que você calcular aparecerão aqui. Tudo fica no seu dispositivo.'; $('history-list').append(p); }
  history.forEach(item => {
    const result = simulate(item.amount, item.rate, item.fixed, item.mode);
    const row = document.createElement('div'); row.className = 'history-row';
    const details = document.createElement('div'); details.textContent = currency(item.amount);
    const subtitle = document.createElement('small'); subtitle.textContent = `${item.mode === 'sale' ? 'Venda' : 'Líquido desejado'} · ${decimal(item.rate)}% + ${currency(item.fixed)}`; details.append(subtitle);
    const total = document.createElement('strong'); total.textContent = `${currency(item.mode === 'sale' ? result.net : result.gross)} ${item.mode === 'sale' ? 'líquidos' : 'a cobrar'}`;
    const reuse = document.createElement('button'); reuse.type = 'button'; reuse.textContent = 'Reutilizar'; reuse.setAttribute('aria-label', `Reutilizar simulação de ${currency(item.amount)}`); reuse.addEventListener('click', () => { setMode(item.mode); $('amount').value = item.amount.toFixed(2).replace('.', ','); $('rate').value = decimal(item.rate); $('fixed').value = item.fixed.toFixed(2).replace('.', ','); calculate(); $('amount').focus(); });
    row.append(details, total, reuse); $('history-list').append(row);
  });
}
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
const savedTheme = storage.get('taxaclara-theme', null);
function applyTheme(theme) { document.documentElement.dataset.theme = theme; $('theme-toggle').setAttribute('aria-label', `Ativar tema ${theme === 'dark' ? 'claro' : 'escuro'}`); $('theme-toggle').querySelector('span').textContent = theme === 'dark' ? 'Tema claro' : 'Tema escuro'; }
applyTheme(['light', 'dark'].includes(savedTheme) ? savedTheme : systemTheme.matches ? 'dark' : 'light');
$('theme-toggle').addEventListener('click', () => { const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; storage.set('taxaclara-theme', theme); applyTheme(theme); });
systemTheme.addEventListener('change', event => { if (!storage.get('taxaclara-theme', null)) applyTheme(event.matches ? 'dark' : 'light'); });
$('calculator').addEventListener('submit', event => { event.preventDefault(); calculate(true); });
['amount', 'rate', 'fixed'].forEach(id => $(id).addEventListener('input', () => calculate()));
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => { setMode(button.dataset.mode); calculate(); }));
document.querySelectorAll('[data-rate]').forEach(button => button.addEventListener('click', () => { $('rate').value = decimal(Number(button.dataset.rate)); calculate(); }));
$('clear-history').addEventListener('click', () => { history = []; storage.set('taxaclara-history', history); renderHistory(); });
$('copy-result').addEventListener('click', async () => {
  if (!latest) return;
  const text = `Simulação Taxa Clara\nValor cobrado: ${currency(latest.gross)}\nTaxa: ${decimal(latest.rate)}% + ${currency(latest.fixed)}\nTotal em taxas: ${currency(latest.fees)}\nValor líquido: ${currency(latest.net)}\nEstimativa; confira as condições na sua conta do Mercado Pago.`;
  try { await navigator.clipboard.writeText(text); $('copy-status').textContent = 'Resumo copiado!'; } catch { $('copy-status').textContent = 'Não foi possível copiar. Selecione os resultados para copiar manualmente.'; }
});
renderHistory(); calculate();
