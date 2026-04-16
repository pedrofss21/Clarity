const COMMISSION = {
  Higienização: { Novo: 7, "Semi-novo": 7 },
  Polimento:    { Novo: 5, "Semi-novo": 10 },
};

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const state = {
  svc:   null,
  vtp:   null,
  recs:  JSON.parse(localStorage.getItem("hig_v4")) || [],
  yr:    new Date().getFullYear(),
  mo:    new Date().getMonth(),
  theme: localStorage.getItem("theme") || "dark",
};

const fmt    = v => v.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
const mkKey  = (y,m) => `${y}-${String(m+1).padStart(2,"0")}`;
const save   = () => localStorage.setItem("hig_v4", JSON.stringify(state.recs));

function applyTheme() {
  document.body.classList.toggle("dark", state.theme === "dark");
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", state.theme);
  applyTheme();
  render();
}

function toast(msg, ok = false) {
  const t = document.getElementById("toast");
  t.className = ok ? "toast-ok" : "toast-warn";
  t.innerText = msg;
  t.style.display = "block";
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.style.display = "none", 2200);
}

function prevMonth() {
  if (state.mo === 0) { state.mo = 11; state.yr--; }
  else state.mo--;
  render();
}

function nextMonth() {
  if (state.mo === 11) { state.mo = 0; state.yr++; }
  else state.mo++;
  render();
}

function addRec() {
  const plate     = document.getElementById("plateInput").value.trim().toUpperCase();
  const dateInput = document.getElementById("dateInput").value;

  if (!state.svc)  return toast("⚠️  Selecione o serviço");
  if (!state.vtp)  return toast("⚠️  Selecione o tipo");
  if (!plate)      return toast("⚠️  Digite a placa ou chassi");

  const date = dateInput
    ? new Date(dateInput + "T12:00:00").toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");

  state.recs.unshift({
    id:         Date.now(),
    plate,
    svc:        state.svc,
    vtp:        state.vtp,
    commission: COMMISSION[state.svc][state.vtp],
    date,
    mk:         mkKey(state.yr, state.mo),
  });

  save();
  toast("✓  Serviço adicionado", true);
  render();
}

function delRec(id) {
  state.recs = state.recs.filter(r => r.id != id);
  save();
  render();
}

function generateReport() {
  const mk   = mkKey(state.yr, state.mo);
  const list = state.recs.filter(r => r.mk === mk);
  const total = list.reduce((s, r) => s + r.commission, 0);

  const rows = list.map(r =>
    `<tr>
      <td>${r.date}</td>
      <td>${r.plate}</td>
      <td>${r.svc}</td>
      <td>${r.vtp}</td>
      <td>${fmt(r.commission)}</td>
    </tr>`
  ).join("");

  const html = `
  <html>
  <head><title>Relatório</title></head>
  <body>
    <h1>${MONTHS[state.mo]} ${state.yr}</h1>
    <table border="1">
      <tr>
        <th>Data</th>
        <th>Placa</th>
        <th>Serviço</th>
        <th>Tipo</th>
        <th>Comissão</th>
      </tr>
      ${rows}
    </table>
    <h2>Total: ${fmt(total)}</h2>
  </body>
  </html>`;

  const w = window.open("");
  w.document.write(html);
  w.print();
}

function render() {
  const mk = mkKey(state.yr, state.mo);
  const list = state.recs.filter(r => r.mk === mk);
  const total = list.reduce((s, r) => s + r.commission, 0);

  document.getElementById("app").innerHTML = `
    <div class="container">
      <div class="header">
        <div>
          <div class="app-label">Detailing Pro</div>
          <div class="title">Comissões</div>
        </div>
        <button class="theme-btn" onclick="toggleTheme()">
          ${state.theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      <input type="date" id="dateInput">
      <input type="text" id="plateInput" placeholder="Placa">

      <button onclick="addRec()">Adicionar</button>

      <button onclick="generateReport()">Gerar Relatório</button>

      ${list.map(r => `
        <div>
          ${r.date} - ${r.plate} - ${r.svc} - ${fmt(r.commission)}
          <button onclick="delRec('${r.id}')">X</button>
        </div>
      `).join("")}

      <h3>Total: ${fmt(total)}</h3>
    </div>
  `;

  applyTheme();
}

applyTheme();
render();