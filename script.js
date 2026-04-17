/* ── DATA ── */
const COMMISSION = {
  Higienização: { Novo: 7, "Semi-novo": 7 },
  Polimento:    { Novo: 5, "Semi-novo": 10 },
};

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

/* ── STATE ── */
const state = {
  svc: null,
  vtp: null,
  recs: JSON.parse(localStorage.getItem("hig_v4")) || [],
  yr: new Date().getFullYear(),
  mo: new Date().getMonth(),
  theme: localStorage.getItem("theme") || "dark",
};

/* ── HELPERS ── */
const fmt = v => v.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });

const mkKey = (y,m) => `${y}-${String(m+1).padStart(2,"0")}`;

const save = () => localStorage.setItem("hig_v4", JSON.stringify(state.recs));

/* ── THEME ── */
function applyTheme() {
  document.body.classList.toggle("dark", state.theme === "dark");
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", state.theme);
  applyTheme();
  render(false);
}

/* ── TOAST ── */
function toast(msg, ok = false) {
  const t = document.getElementById("toast");
  t.className = ok ? "toast-ok" : "toast-warn";
  t.innerText = msg;
  t.style.display = "block";

  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.style.display = "none", 2000);
}

/* ── NAV ── */
function prevMonth() {
  if (state.mo === 0) { state.mo = 11; state.yr--; }
  else state.mo--;
  render(false);
}

function nextMonth() {
  if (state.mo === 11) { state.mo = 0; state.yr++; }
  else state.mo++;
  render(false);
}

/* ── ADD ── */
function addRec() {
  const plateInput = document.getElementById("plateInput");
  const dateInput  = document.getElementById("dateInput");

  const plate = plateInput.value.trim().toUpperCase();
  const dateValue = dateInput.value;

  if (!state.svc) return toast("Selecione o serviço");
  if (!state.vtp) return toast("Selecione o tipo");
  if (!plate)     return toast("Digite a placa ou chassi");

  const date = dateValue
    ? new Date(dateValue + "T12:00:00").toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");

  state.recs.unshift({
    id: Date.now(),
    plate,
    svc: state.svc,
    vtp: state.vtp,
    commission: COMMISSION[state.svc][state.vtp],
    date,
    mk: mkKey(state.yr, state.mo),
  });

  save();
  toast("Serviço adicionado", true);

  plateInput.value = "";
  dateInput.value  = "";

  render(false);
}

/* ── DELETE ── */
function delRec(id) {
  state.recs = state.recs.filter(r => r.id != id);
  save();
  render(false);
}

/* ── REPORT ── */
function generateReport() {
  const mk   = mkKey(state.yr, state.mo);
  const list = state.recs.filter(r => r.mk === mk);

  const total = list.reduce((s, r) => s + r.commission, 0);

  const text = `
RELATÓRIO - ${MONTHS[state.mo]} ${state.yr}

${list.map(r => `${r.date} - ${r.plate} - ${r.svc} - ${r.vtp} - ${fmt(r.commission)}`).join("\n")}

Total: ${fmt(total)}
`;

  const w = window.open("", "_blank");
  w.document.write(`<pre>${text}</pre>`);
  w.print();
}

/* ── RENDER ── */
function render(resetInputs = true) {

  const mk = mkKey(state.yr, state.mo);
  const list = state.recs.filter(r => r.mk === mk);
  const total = list.reduce((s, r) => s + r.commission, 0);

  const commission =
    state.svc && state.vtp
      ? COMMISSION[state.svc][state.vtp]
      : null;

  const svcBtns = ["Higienização","Polimento"].map(s =>
    `<button class="tog-btn${state.svc===s?" active":""}" onclick="state.svc='${s}';render(false)">${s}</button>`
  ).join("");

  const vtpBtns = ["Novo","Semi-novo"].map(t =>
    `<button class="tog-btn${state.vtp===t?" active":""}" onclick="state.vtp='${t}';render(false)">${t}</button>`
  ).join("");

  const recordsHtml = list.length === 0
    ? `<div class="empty">Sem serviços</div>`
    : list.map(r => `
        <div class="rec-item">
          <div>
            <div class="rec-plate">${r.plate}</div>
            <div class="rec-meta">${r.date} • ${r.svc} • ${r.vtp}</div>
          </div>
          <div style="display:flex;align-items:center;">
            <div class="rec-val">${fmt(r.commission)}</div>
            <button class="del-btn" onclick="delRec('${r.id}')">x</button>
          </div>
        </div>
      `).join("");

  document.getElementById("app").innerHTML = `
    <div class="container">

      <div class="header">
        <div class="title">Comissões</div>
        <button class="theme-btn" onclick="toggleTheme()">
          ${state.theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      <div class="card">
        <div class="toggle-group">${svcBtns}</div>
        <div class="toggle-group">${vtpBtns}</div>

        <div style="margin-bottom:10px;font-weight:600;">
          Comissão: ${commission ? fmt(commission) : "—"}
        </div>

        <input type="date" id="dateInput">
        <input type="text" id="plateInput" placeholder="Placa ou chassi">

        <button class="btn-primary" onclick="addRec()">Adicionar</button>
      </div>

      <div class="card">
        <div class="month-nav">
          <button onclick="prevMonth()">‹</button>
          <div>${MONTHS[state.mo]} ${state.yr}</div>
          <button onclick="nextMonth()">›</button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-num">${list.length}</div>
          <div>Serviços</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${fmt(total)}</div>
          <div>Total</div>
        </div>
      </div>

      <button class="btn-primary" onclick="generateReport()">Gerar Relatório</button>

      ${recordsHtml}

    </div>
  `;

  applyTheme();
}

/* ── INIT ── */
applyTheme();
render();